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

function toNote(row) {
  return {
    id: row.id,
    scope: row.scope,
    refId: row.ref_id || '',
    title: row.title || '',
    body: row.body,
    updatedAt: row.updated_at,
  };
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const { scope, refId } = req.query || {};
    let sql = 'SELECT * FROM user_learning_notes WHERE user_id = ?';
    const args = [user.id];
    if (scope) {
      sql += ' AND scope = ?';
      args.push(scope);
    }
    if (refId) {
      sql += ' AND ref_id = ?';
      args.push(refId);
    }
    sql += ' ORDER BY updated_at DESC';
    const r = await db.execute({ sql, args });
    return res.status(200).json({ notes: r.rows.map(toNote) });
  }

  if (req.method === 'POST') {
    const { id, scope, refId, title, body } = req.body || {};
    if (!scope || !body) return res.status(400).json({ error: 'scope, body required' });
    const noteId = id || randomBytes(16).toString('hex');
    if (id) {
      await db.execute({
        sql: `UPDATE user_learning_notes SET scope = ?, ref_id = ?, title = ?, body = ?, updated_at = datetime('now')
              WHERE id = ? AND user_id = ?`,
        args: [scope, refId || null, title || null, body, id, user.id],
      });
    } else {
      await db.execute({
        sql: `INSERT INTO user_learning_notes (id, user_id, scope, ref_id, title, body)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [noteId, user.id, scope, refId || null, title || null, body],
      });
    }
    return res.status(200).json({ id: noteId });
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    await db.execute({
      sql: 'DELETE FROM user_learning_notes WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
