import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import { randomBytes } from 'node:crypto';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'POST') {
    const { kind, problemId, conceptIds, durationMs, payload } = req.body || {};
    if (!kind) return res.status(400).json({ error: 'kind required' });
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
    return res.status(200).json({ id });
  }

  if (req.method === 'GET') {
    const days = parseInt(req.query.days || '7', 10);
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
    return res.status(200).json({ activity: rows });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
