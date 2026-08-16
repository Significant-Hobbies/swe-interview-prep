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

  if (request.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT * FROM user_drills WHERE user_id = ?',
      args: [user.id],
    });
    const drills = {};
    for (const row of r.rows) {
      drills[row.drill_id] = {
        status: row.status,
        attempts: row.attempts,
        lastCode: row.last_code || '',
        lastAttempt: row.last_attempt,
        updatedAt: row.updated_at,
      };
    }
    return json({ drills });
  }

  if (request.method === 'POST') {
    const { drillId, status, lastCode } = await readJsonBody(request);
    if (!drillId) return json({ error: 'drillId required' }, { status: 400 });
    const now = new Date().toISOString();
    // attempts increments on every save; status reflects the latest outcome.
    await db.execute({
      sql: `INSERT INTO user_drills (id, user_id, drill_id, status, attempts, last_code, last_attempt)
            VALUES (?, ?, ?, ?, 1, ?, ?)
            ON CONFLICT(user_id, drill_id) DO UPDATE SET
              status = excluded.status,
              attempts = user_drills.attempts + 1,
              last_code = excluded.last_code,
              last_attempt = excluded.last_attempt,
              updated_at = datetime('now')`,
      args: [
        randomBytes(16).toString('hex'),
        user.id,
        drillId,
        status || 'attempted',
        lastCode || null,
        now,
      ],
    });
    // Mirror the attempt into the activity log for personalization.
    await db.execute({
      sql: `INSERT INTO activity_log (id, user_id, kind, payload)
            VALUES (?, ?, 'drill', ?)`,
      args: [
        randomBytes(16).toString('hex'),
        user.id,
        JSON.stringify({ drillId, status: status || 'attempted' }),
      ],
    });
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
