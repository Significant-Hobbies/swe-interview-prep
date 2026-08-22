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

const EMPTY = { elo: {}, solves: {}, v: 2 };

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT state_json FROM user_elo_state WHERE user_id = ?',
      args: [user.id],
    });
    if (!r.rows.length) return json({ state: EMPTY });
    return json({ state: JSON.parse(r.rows[0].state_json) });
  }

  if (request.method === 'PUT') {
    const { state } = await readJsonBody(request);
    if (!state || typeof state !== 'object')
      return json({ error: 'state required' }, { status: 400 });
    await db.execute({
      sql: `INSERT INTO user_elo_state (user_id, state_json, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = datetime('now')`,
      args: [user.id, JSON.stringify({ ...EMPTY, ...state, v: 2 })],
    });
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
