// Leftover local dispatcher — same Fetch handlers as production.
// Production: functions/api/[[path]].js → dispatchLearningAction.
import { requireAuth } from './auth/verify.mjs';
import { AUTH_ACTIONS } from '../shared/api/learning-registry.mjs';
import { dispatchLearningAction } from '../shared/api/worker-learning.mjs';
import { getDb } from '../shared/db/client.mjs';

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data ?? {}), { ...init, headers });
}

function toFetchRequest(req) {
  const url = new URL(req.originalUrl || req.url || '/api/learning', 'http://localhost');
  for (const [key, value] of Object.entries(req.query || {})) {
    if (value == null) continue;
    url.searchParams.set(key, String(value));
  }
  const headers = new Headers();
  const incoming = req.headers || {};
  if (incoming.authorization) headers.set('authorization', incoming.authorization);
  if (incoming.cookie) headers.set('cookie', incoming.cookie);
  const method = req.method || 'GET';
  const hasBody = method !== 'GET' && method !== 'HEAD';
  if (hasBody) {
    headers.set('content-type', incoming['content-type'] || 'application/json');
  }
  return new Request(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
  });
}

export default async function handler(req, res) {
  const action = req.query?.action;
  let user = req._authenticatedUser || null;
  if (!user && AUTH_ACTIONS.includes(action)) {
    user = await requireAuth(req, res);
    if (!user) return;
  }

  let client = null;
  try {
    client = getDb();
  } catch {
    client = null;
  }

  const response = await dispatchLearningAction({
    request: toFetchRequest(req),
    client,
    user,
    json,
  });
  const payload = await response.json();
  return res.status(response.status).json(payload);
}
