import { randomBytes } from 'node:crypto';

import { requireAuth } from '../api/auth/verify.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';

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

  if (req.method === 'GET') {
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
    return res.status(200).json({ drills });
  }

  if (req.method === 'POST') {
    const { drillId, status, lastCode } = req.body || {};
    if (!drillId) return res.status(400).json({ error: 'drillId required' });
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
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
