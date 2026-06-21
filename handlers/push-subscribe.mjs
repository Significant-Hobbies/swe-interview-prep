import { randomBytes } from 'crypto';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';

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
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'endpoint and keys (p256dh, auth) required' });
    }
    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO user_push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth`,
      args: [id, user.id, endpoint, keys.p256dh, keys.auth],
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const endpoint = req.body?.endpoint || req.query.endpoint;
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
    await db.execute({
      sql: 'DELETE FROM user_push_subscriptions WHERE user_id = ? AND endpoint = ?',
      args: [user.id, endpoint],
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}