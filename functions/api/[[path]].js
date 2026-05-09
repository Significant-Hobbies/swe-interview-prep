import { createClient } from "@libsql/client/web";

const AUTH_COOKIE_NAME = "dsa_prep_auth";
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

let db;

function getDb(env) {
  if (!db) {
    if (!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) {
      throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    }
    db = createClient({
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

async function initDatabase(env) {
  const client = getDb(env);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      picture TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      status TEXT DEFAULT 'unseen',
      code TEXT,
      language TEXT DEFAULT 'typescript',
      bookmarked INTEGER DEFAULT 0,
      last_attempted TEXT,
      ease REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TEXT,
      last_review TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, problem_id)
    )
  `);
}

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function base64UrlEncode(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signJwt(payload, secret) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, iat: now, exp: now + AUTH_COOKIE_MAX_AGE };
  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(body))}`;
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyJwt(token, secret) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const unsigned = `${header}.${payload}`;
  const ok = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    base64UrlDecode(signature),
    new TextEncoder().encode(unsigned),
  );
  if (!ok) return null;
  const parsed = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null;
  return parsed;
}

function readCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1) || null;
}

function authCookie(token) {
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}`;
}

function clearAuthCookie() {
  return `${AUTH_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

async function currentUser(request, env) {
  const token =
    readCookie(request, AUTH_COOKIE_NAME) ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const decoded = await verifyJwt(token, env.JWT_SECRET);
  if (!decoded?.userId) return null;
  const result = await getDb(env).execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [decoded.userId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    googleId: row.google_id,
    email: row.email,
    name: row.name,
    picture: row.picture,
    createdAt: row.created_at,
  };
}

async function findOrCreateUser(env, profile) {
  const client = getDb(env);
  const existing = await client.execute({
    sql: "SELECT * FROM users WHERE google_id = ?",
    args: [profile.googleId],
  });
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    return {
      id: row.id,
      googleId: row.google_id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      createdAt: row.created_at,
    };
  }
  const id = crypto.randomUUID();
  await client.execute({
    sql: "INSERT INTO users (id, google_id, email, name, picture) VALUES (?, ?, ?, ?, ?)",
    args: [id, profile.googleId, profile.email, profile.name, profile.picture || null],
  });
  return { id, ...profile, createdAt: new Date().toISOString() };
}

async function handleGoogle(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  if (!env.JWT_SECRET || !env.GOOGLE_CLIENT_ID) {
    return json({ error: "Authentication is not configured" }, { status: 500 });
  }
  await initDatabase(env);
  const { credential } = await request.json();
  if (!credential) return json({ error: "credential required" }, { status: 400 });

  const tokenInfo = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!tokenInfo.ok) return json({ error: "Authentication failed" }, { status: 401 });
  const payload = await tokenInfo.json();
  if (payload.aud !== env.GOOGLE_CLIENT_ID || !payload.sub || !payload.email) {
    return json({ error: "Authentication failed" }, { status: 401 });
  }

  const user = await findOrCreateUser(env, {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
    picture: payload.picture || null,
  });
  const token = await signJwt(
    { userId: user.id, email: user.email, name: user.name, picture: user.picture },
    env.JWT_SECRET,
  );
  return json(
    { user, token },
    { headers: { "set-cookie": authCookie(token) } },
  );
}

async function handleVerify(request, env) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, { status: 405 });
  const token =
    readCookie(request, AUTH_COOKIE_NAME) ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Unauthorized" }, { status: 401 });
  if (!env.JWT_SECRET) return json({ error: "Authentication is not configured" }, { status: 500 });
  await initDatabase(env);
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });
  return json({ user });
}

async function handleLogout(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  return json({ ok: true }, { headers: { "set-cookie": clearAuthCookie() } });
}

async function handleProgress(request, env) {
  await initDatabase(env);
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });
  const client = getDb(env);
  if (request.method === "GET") {
    const result = await client.execute({
      sql: "SELECT * FROM user_progress WHERE user_id = ?",
      args: [user.id],
    });
    const progress = {};
    for (const row of result.rows) {
      progress[row.problem_id] = {
        status: row.status || "unseen",
        code: row.code || undefined,
        language: row.language || "typescript",
        bookmarked: Boolean(row.bookmarked),
        lastAttempted: row.last_attempted || undefined,
        ease: row.ease ?? 2.5,
        interval: row.interval ?? 0,
        repetitions: row.repetitions ?? 0,
        nextReview: row.next_review || undefined,
        lastReview: row.last_review || undefined,
      };
    }
    return json({ progress });
  }
  if (request.method === "PUT") {
    const { problemId, data } = await request.json();
    if (!problemId || !data) return json({ error: "problemId and data required" }, { status: 400 });
    await client.execute({
      sql: `INSERT INTO user_progress (
        id, user_id, problem_id, status, code, language, bookmarked, last_attempted,
        ease, interval, repetitions, next_review, last_review
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, problem_id) DO UPDATE SET
        status = excluded.status,
        code = excluded.code,
        language = excluded.language,
        bookmarked = excluded.bookmarked,
        last_attempted = excluded.last_attempted,
        ease = excluded.ease,
        interval = excluded.interval,
        repetitions = excluded.repetitions,
        next_review = excluded.next_review,
        last_review = excluded.last_review,
        updated_at = datetime('now')`,
      args: [
        crypto.randomUUID(),
        user.id,
        problemId,
        data.status || "unseen",
        data.code || null,
        data.language || "typescript",
        data.bookmarked ? 1 : 0,
        data.lastAttempted || null,
        data.ease ?? 2.5,
        data.interval ?? 0,
        data.repetitions ?? 0,
        data.nextReview || null,
        data.lastReview || null,
      ],
    });
    return json({ success: true });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

export async function onRequest({ request, env, params }) {
  const path = (params.path || []).join("/");
  try {
    if (path === "auth/google") return handleGoogle(request, env);
    if (path === "auth/logout") return handleLogout(request);
    if (path === "auth/verify") return handleVerify(request, env);
    if (path === "progress") return handleProgress(request, env);
    return json({ error: "API route not found" }, { status: 404 });
  } catch (error) {
    console.error("Pages API route failed", path, error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
