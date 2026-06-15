import { createClient } from "@libsql/client/web";

import { decayConfidence, reviewConcept } from "../../shared/lib/fsrs.mjs";

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
  // Learning OS tables.
  await client.execute(`
    CREATE TABLE IF NOT EXISTS concept_mastery (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, concept_id TEXT NOT NULL,
      stability REAL DEFAULT 0, difficulty REAL DEFAULT 5, elapsed_days INTEGER DEFAULT 0,
      scheduled_days INTEGER DEFAULT 0, reps INTEGER DEFAULT 0, lapses INTEGER DEFAULT 0,
      state INTEGER DEFAULT 0, last_review TEXT, due TEXT, confidence REAL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, concept_id)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, kind TEXT NOT NULL,
      problem_id TEXT, concept_ids TEXT, duration_ms INTEGER DEFAULT 0, payload TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_artifacts (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, artifact_id TEXT NOT NULL,
      status TEXT DEFAULT 'todo', url TEXT, path TEXT, notes TEXT, criteria_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, artifact_id)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_drills (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, drill_id TEXT NOT NULL,
      status TEXT DEFAULT 'unsolved', attempts INTEGER DEFAULT 0, last_code TEXT, last_attempt TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, drill_id)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_projects (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, project_id TEXT NOT NULL,
      status TEXT DEFAULT 'planned', next_action TEXT, milestones_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, project_id)
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_learning_notes (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, scope TEXT NOT NULL, ref_id TEXT,
      title TEXT, body TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

// --- Learning OS API (consolidated under /api/learning?action=...) ----------

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function upsertMastery(client, userId, conceptId, row) {
  await client.execute({
    sql: `INSERT INTO concept_mastery (id, user_id, concept_id, stability, difficulty,
        elapsed_days, scheduled_days, reps, lapses, state, last_review, due, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, concept_id) DO UPDATE SET
        stability = excluded.stability, difficulty = excluded.difficulty,
        elapsed_days = excluded.elapsed_days, scheduled_days = excluded.scheduled_days,
        reps = excluded.reps, lapses = excluded.lapses, state = excluded.state,
        last_review = excluded.last_review, due = excluded.due,
        confidence = excluded.confidence, updated_at = datetime('now')`,
    args: [
      crypto.randomUUID(), userId, conceptId, row.stability, row.difficulty,
      row.elapsed_days, row.scheduled_days, row.reps, row.lapses, row.state,
      row.last_review, row.due, row.confidence,
    ],
  });
}

async function handleConcepts(request, client, user) {
  if (request.method === "GET") {
    const r = await client.execute({ sql: "SELECT * FROM concept_mastery WHERE user_id = ?", args: [user.id] });
    const now = new Date();
    const mastery = {};
    for (const row of r.rows) {
      mastery[row.concept_id] = {
        stability: row.stability, difficulty: row.difficulty, reps: row.reps,
        lapses: row.lapses, state: row.state, lastReview: row.last_review,
        due: row.due, confidence: decayConfidence(row, now),
      };
    }
    return json({ mastery });
  }
  if (request.method === "POST") {
    const { conceptId, rating } = await readJson(request);
    if (!conceptId || !rating) return json({ error: "conceptId, rating required" }, { status: 400 });
    const prev = (await client.execute({
      sql: "SELECT * FROM concept_mastery WHERE user_id = ? AND concept_id = ?",
      args: [user.id, conceptId],
    })).rows[0] || null;
    const next = reviewConcept(prev, rating);
    await upsertMastery(client, user.id, conceptId, next);
    return json({ mastery: { ...next, confidence: decayConfidence(next) } });
  }
  if (request.method === "PUT") {
    const { updates } = await readJson(request);
    if (!Array.isArray(updates)) return json({ error: "updates array required" }, { status: 400 });
    const results = [];
    for (const u of updates) {
      if (!u.conceptId || !u.rating) continue;
      const prev = (await client.execute({
        sql: "SELECT * FROM concept_mastery WHERE user_id = ? AND concept_id = ?",
        args: [user.id, u.conceptId],
      })).rows[0] || null;
      const next = reviewConcept(prev, u.rating);
      await upsertMastery(client, user.id, u.conceptId, next);
      results.push({ conceptId: u.conceptId, mastery: { ...next, confidence: decayConfidence(next) } });
    }
    return json({ results });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

async function handleArtifacts(request, client, user) {
  if (request.method === "GET") {
    const r = await client.execute({ sql: "SELECT * FROM user_artifacts WHERE user_id = ?", args: [user.id] });
    const artifacts = {};
    for (const row of r.rows) {
      artifacts[row.artifact_id] = {
        status: row.status, url: row.url || "", path: row.path || "", notes: row.notes || "",
        criteria: row.criteria_json ? JSON.parse(row.criteria_json) : [], updatedAt: row.updated_at,
      };
    }
    return json({ artifacts });
  }
  if (request.method === "POST") {
    const { artifactId, status, url, path, notes, criteria } = await readJson(request);
    if (!artifactId) return json({ error: "artifactId required" }, { status: 400 });
    await client.execute({
      sql: `INSERT INTO user_artifacts (id, user_id, artifact_id, status, url, path, notes, criteria_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, artifact_id) DO UPDATE SET
          status = excluded.status, url = excluded.url, path = excluded.path,
          notes = excluded.notes, criteria_json = excluded.criteria_json, updated_at = datetime('now')`,
      args: [
        crypto.randomUUID(), user.id, artifactId, status || "todo", url || null,
        path || null, notes || null, criteria ? JSON.stringify(criteria) : null,
      ],
    });
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

async function handleDrills(request, client, user) {
  if (request.method === "GET") {
    const r = await client.execute({ sql: "SELECT * FROM user_drills WHERE user_id = ?", args: [user.id] });
    const drills = {};
    for (const row of r.rows) {
      drills[row.drill_id] = {
        status: row.status, attempts: row.attempts, lastCode: row.last_code || "",
        lastAttempt: row.last_attempt, updatedAt: row.updated_at,
      };
    }
    return json({ drills });
  }
  if (request.method === "POST") {
    const { drillId, status, lastCode } = await readJson(request);
    if (!drillId) return json({ error: "drillId required" }, { status: 400 });
    await client.execute({
      sql: `INSERT INTO user_drills (id, user_id, drill_id, status, attempts, last_code, last_attempt)
        VALUES (?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(user_id, drill_id) DO UPDATE SET
          status = excluded.status, attempts = user_drills.attempts + 1,
          last_code = excluded.last_code, last_attempt = excluded.last_attempt, updated_at = datetime('now')`,
      args: [crypto.randomUUID(), user.id, drillId, status || "attempted", lastCode || null, new Date().toISOString()],
    });
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

async function handleProjectsState(request, client, user) {
  if (request.method === "GET") {
    const r = await client.execute({ sql: "SELECT * FROM user_projects WHERE user_id = ?", args: [user.id] });
    const projects = {};
    for (const row of r.rows) {
      projects[row.project_id] = {
        status: row.status, nextAction: row.next_action || "",
        milestones: row.milestones_json ? JSON.parse(row.milestones_json) : {}, updatedAt: row.updated_at,
      };
    }
    return json({ projects });
  }
  if (request.method === "POST") {
    const { projectId, status, nextAction, milestones } = await readJson(request);
    if (!projectId) return json({ error: "projectId required" }, { status: 400 });
    await client.execute({
      sql: `INSERT INTO user_projects (id, user_id, project_id, status, next_action, milestones_json)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, project_id) DO UPDATE SET
          status = excluded.status, next_action = excluded.next_action,
          milestones_json = excluded.milestones_json, updated_at = datetime('now')`,
      args: [
        crypto.randomUUID(), user.id, projectId, status || "planned",
        nextAction || null, milestones ? JSON.stringify(milestones) : null,
      ],
    });
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

async function handleLearningNotes(request, client, user) {
  const url = new URL(request.url);
  if (request.method === "GET") {
    let sql = "SELECT * FROM user_learning_notes WHERE user_id = ?";
    const args = [user.id];
    const scope = url.searchParams.get("scope");
    const refId = url.searchParams.get("refId");
    if (scope) { sql += " AND scope = ?"; args.push(scope); }
    if (refId) { sql += " AND ref_id = ?"; args.push(refId); }
    sql += " ORDER BY updated_at DESC";
    const r = await client.execute({ sql, args });
    return json({
      notes: r.rows.map((row) => ({
        id: row.id, scope: row.scope, refId: row.ref_id || "",
        title: row.title || "", body: row.body, updatedAt: row.updated_at,
      })),
    });
  }
  if (request.method === "POST") {
    const { id, scope, refId, title, body } = await readJson(request);
    if (!scope || !body) return json({ error: "scope, body required" }, { status: 400 });
    const noteId = id || crypto.randomUUID();
    if (id) {
      await client.execute({
        sql: `UPDATE user_learning_notes SET scope = ?, ref_id = ?, title = ?, body = ?, updated_at = datetime('now')
          WHERE id = ? AND user_id = ?`,
        args: [scope, refId || null, title || null, body, id, user.id],
      });
    } else {
      await client.execute({
        sql: "INSERT INTO user_learning_notes (id, user_id, scope, ref_id, title, body) VALUES (?, ?, ?, ?, ?, ?)",
        args: [noteId, user.id, scope, refId || null, title || null, body],
      });
    }
    return json({ id: noteId });
  }
  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) return json({ error: "id required" }, { status: 400 });
    await client.execute({ sql: "DELETE FROM user_learning_notes WHERE id = ? AND user_id = ?", args: [id, user.id] });
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

function parseAiJson(text) {
  let t = (text || "").trim();
  if (t.startsWith("```")) t = t.replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

async function callByokAI(aiConfig, system, prompt, maxTokens) {
  const endpoint = `${aiConfig.endpointUrl.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${aiConfig.apiKey}` },
    body: JSON.stringify({
      model: aiConfig.model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI provider returned ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

const GAPS_SYSTEM = `You are a learning coach for an engineer building toward AI search/infrastructure depth.
Given the learner's mastery profile, return STRICT JSON:
{"summary":"2-3 sentences","weakAreas":["..."],"nextConcepts":[{"conceptId":"...","why":"one line"}],"recommendedArtifact":{"artifactId":"...","why":"one line"}}
Only use conceptId/artifactId values from the provided catalog. nextConcepts: 3-5 items. Be concrete.`;

const CRITIQUE_SYSTEM = `You grade an engineer's recall answer against a reference answer.
Return STRICT JSON:
{"score":0-100,"verdict":"one sentence","missing":["..."],"strongerAnswer":"3-5 sentences","followUps":["..."]}
Grade on substance, not wording. missing: 0-4 items. followUps: 1-2 items. Be honest.`;

async function handleGaps(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const { aiConfig, profile, catalog } = await readJson(request);
  if (!aiConfig?.endpointUrl || !aiConfig?.apiKey || !aiConfig?.model) {
    return json({ error: "Configure an AI provider in Settings to use the Gap Analyzer." }, { status: 400 });
  }
  const prompt = `Concept catalog (id: name [track]):
${(catalog?.concepts || []).map((c) => `${c.id}: ${c.name} [${c.track}]`).join("\n")}

Artifact catalog (id: title):
${(catalog?.artifacts || []).map((a) => `${a.id}: ${a.title}`).join("\n")}

Learner profile:
${JSON.stringify(profile || {}, null, 2)}

Analyze now. JSON only.`;
  try {
    return json(parseAiJson(await callByokAI(aiConfig, GAPS_SYSTEM, prompt, 900)));
  } catch (err) {
    return json({ error: `AI request failed: ${err.message}` }, { status: 502 });
  }
}

async function handleCritique(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const { aiConfig, question, answer, expected } = await readJson(request);
  if (!aiConfig?.endpointUrl || !aiConfig?.apiKey || !aiConfig?.model) {
    return json({ error: "Configure an AI provider in Settings to use the Review Critic." }, { status: 400 });
  }
  if (!question || !answer) return json({ error: "question and answer are required" }, { status: 400 });
  const prompt = `Question:
${question}

Reference answer:
${expected || "(none provided)"}

Learner's answer:
${answer}

Grade now. JSON only.`;
  try {
    return json(parseAiJson(await callByokAI(aiConfig, CRITIQUE_SYSTEM, prompt, 800)));
  } catch (err) {
    return json({ error: `AI request failed: ${err.message}` }, { status: 502 });
  }
}

const UNDERSTANDING_QUIZ_SYSTEM = `You write open-ended comprehension questions that test whether a reader has internalised a learning doc.

Return STRICT JSON, no prose, no markdown:
{"questions":[{"q":"the question","hint":"one-line concrete grounding from the doc"}]}

Rules: Exactly 5 questions. Each targets a different section/phase. Open-ended ("explain", "compare", "why", "what tradeoff") — not yes/no, not multiple-choice. Good answer should require 2-5 sentences. "hint" cites a specific source from the doc.`;

const UNDERSTANDING_GRADE_QUIZ_SYSTEM = `You grade a reader's quiz answers against a learning doc.

Return STRICT JSON, no prose, no markdown:
{"overall":0-100,"perQuestion":[{"q":"...","a":"...","grade":0-100,"feedback":"one paragraph, blunt and specific"}],"summary":"one paragraph","gaps":["topic to re-read","..."]}

Grade on substance. 90-100: precise. 70-89: minor handwaving. 50-69: missed an invariant. 0-49: superficial/wrong. gaps: 0-5 items.`;

const UNDERSTANDING_GRADE_EXPL_SYSTEM = `You grade a free-form explain-back of a learning doc.

Return STRICT JSON, no prose, no markdown:
{"grade":0-100,"feedback":"one paragraph, blunt and specific","gaps":["topic","..."],"missedSources":["specific paper/blog/talk","..."]}

Grade on substance. 90-100: precise + correct sources. 70-89: misses one mechanism. 50-69: bluffs on a key invariant. 0-49: buzzwords. gaps: 0-5 items. missedSources: 0-3 items.`;

function uTruncate(s, n) {
  s = String(s || "");
  return s.length > n ? s.slice(0, n) + "\n…[truncated]" : s;
}

async function handleUnderstanding(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const { op, docTitle, docContent, questions, answers, explanation, aiConfig } = await readJson(request);
  if (!aiConfig?.endpointUrl || !aiConfig?.apiKey || !aiConfig?.model) {
    return json({ error: "Configure an AI provider in Settings to test your understanding." }, { status: 400 });
  }
  if (!op) return json({ error: "op required: quiz | grade-quiz | grade-explanation" }, { status: 400 });
  if (!docContent) return json({ error: "docContent required" }, { status: 400 });

  const docExcerpt = uTruncate(docContent, 8000);
  const title = docTitle || "(untitled doc)";

  let system;
  let prompt;
  let maxTokens;

  if (op === "quiz") {
    system = UNDERSTANDING_QUIZ_SYSTEM;
    prompt = `Doc title: ${title}\n\nDoc content:\n"""\n${docExcerpt}\n"""\n\nWrite 5 questions. JSON only.`;
    maxTokens = 900;
  } else if (op === "grade-quiz") {
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return json({ error: "questions and answers arrays required" }, { status: 400 });
    }
    const qa = questions
      .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${uTruncate(answers[i] || "(blank)", 1500)}`)
      .join("\n\n");
    system = UNDERSTANDING_GRADE_QUIZ_SYSTEM;
    prompt = `Doc title: ${title}\n\nDoc content:\n"""\n${docExcerpt}\n"""\n\nQuiz transcript:\n${qa}\n\nGrade now. JSON only.`;
    maxTokens = 1800;
  } else if (op === "grade-explanation") {
    if (!explanation || explanation.trim().length < 30) {
      return json({ error: "explanation required (at least 30 chars)" }, { status: 400 });
    }
    system = UNDERSTANDING_GRADE_EXPL_SYSTEM;
    prompt = `Doc title: ${title}\n\nDoc content:\n"""\n${docExcerpt}\n"""\n\nReader's explanation:\n"""\n${uTruncate(explanation, 4000)}\n"""\n\nGrade now. JSON only.`;
    maxTokens = 1200;
  } else {
    return json({ error: `unknown op: ${op}` }, { status: 400 });
  }

  try {
    return json(parseAiJson(await callByokAI(aiConfig, system, prompt, maxTokens)));
  } catch (err) {
    return json({ error: `AI request failed: ${err.message}` }, { status: 502 });
  }
}

async function handleLearning(request, env) {
  const action = new URL(request.url).searchParams.get("action");
  // gaps/critique/understanding are BYOK AI proxies — no auth or DB needed.
  if (action === "gaps") return handleGaps(request);
  if (action === "critique") return handleCritique(request);
  if (action === "understanding") return handleUnderstanding(request);

  await initDatabase(env);
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Unauthorized" }, { status: 401 });
  const client = getDb(env);
  if (action === "concepts") return handleConcepts(request, client, user);
  if (action === "artifacts") return handleArtifacts(request, client, user);
  if (action === "drills") return handleDrills(request, client, user);
  if (action === "projects") return handleProjectsState(request, client, user);
  if (action === "notes") return handleLearningNotes(request, client, user);
  return json({ error: `Unknown learning action: ${action}` }, { status: 400 });
}

export async function onRequest({ request, env, params }) {
  const path = (params.path || []).join("/");
  try {
    // NOTE: each handler is `await`ed so a rejected promise is caught here —
    // returning the promise bare would let the rejection escape this try/catch.
    if (path === "auth/google") return await handleGoogle(request, env);
    if (path === "auth/logout") return await handleLogout(request);
    if (path === "auth/verify") return await handleVerify(request, env);
    if (path === "progress") return await handleProgress(request, env);
    if (path === "learning") return await handleLearning(request, env);
    return json({ error: "API route not found" }, { status: 404 });
  } catch (error) {
    console.error("Pages API route failed", path, error);
    // Malformed JSON bodies surface as a SyntaxError — that's a client error.
    if (error instanceof SyntaxError) {
      return json({ error: "Invalid request body" }, { status: 400 });
    }
    // Never leak the raw error message to the client.
    return json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
