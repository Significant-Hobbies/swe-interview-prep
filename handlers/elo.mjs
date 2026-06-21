import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

const EMPTY = { elo: {}, solves: {}, v: 2 };

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT state_json FROM user_elo_state WHERE user_id = ?',
      args: [user.id],
    });
    if (!r.rows.length) return res.status(200).json({ state: EMPTY });
    return res.status(200).json({ state: JSON.parse(r.rows[0].state_json) });
  }

  if (req.method === 'PUT') {
    const { state } = req.body || {};
    if (!state || typeof state !== 'object') return res.status(400).json({ error: 'state required' });
    await db.execute({
      sql: `INSERT INTO user_elo_state (user_id, state_json, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = datetime('now')`,
      args: [user.id, JSON.stringify({ ...EMPTY, ...state, v: 2 })],
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}