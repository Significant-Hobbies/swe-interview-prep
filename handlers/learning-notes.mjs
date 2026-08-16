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

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  const query = new URL(request.url).searchParams;

  if (request.method === 'GET') {
    const scope = query.get('scope');
    const refId = query.get('refId');
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
    return json({ notes: r.rows.map(toNote) });
  }

  if (request.method === 'POST') {
    const { id, scope, refId, title, body } = await readJsonBody(request);
    if (!scope || !body) return json({ error: 'scope, body required' }, { status: 400 });
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
    return json({ id: noteId });
  }

  if (request.method === 'DELETE') {
    const body = await readJsonBody(request);
    const id = query.get('id') || body?.id;
    if (!id) return json({ error: 'id required' }, { status: 400 });
    await db.execute({
      sql: 'DELETE FROM user_learning_notes WHERE id = ? AND user_id = ?',
      args: [id, user.id],
    });
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
