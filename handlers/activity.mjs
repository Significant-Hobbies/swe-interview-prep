import { randomBytes } from 'node:crypto';

import { readJsonBody } from '../shared/api/read-json.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'POST') {
    const { kind, problemId, conceptIds, durationMs, payload } = await readJsonBody(request);
    if (!kind) return json({ error: 'kind required' }, { status: 400 });
    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO activity_log (id, user_id, kind, problem_id, concept_ids, duration_ms, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        user.id,
        kind,
        problemId || null,
        conceptIds ? JSON.stringify(conceptIds) : null,
        durationMs || 0,
        payload ? JSON.stringify(payload) : null,
      ],
    });
    return json({ id });
  }

  if (request.method === 'GET') {
    const days = parseInt(new URL(request.url).searchParams.get('days') || '7', 10);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const result = await db.execute({
      sql: `SELECT id, kind, problem_id, concept_ids, duration_ms, payload, created_at
            FROM activity_log WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC LIMIT 500`,
      args: [user.id, since],
    });
    const rows = result.rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      problemId: r.problem_id,
      conceptIds: r.concept_ids ? JSON.parse(r.concept_ids) : [],
      durationMs: r.duration_ms,
      payload: r.payload ? JSON.parse(r.payload) : null,
      createdAt: r.created_at,
    }));
    return json({ activity: rows });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
