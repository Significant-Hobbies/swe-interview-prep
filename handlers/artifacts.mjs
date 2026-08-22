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

function toEntry(row) {
  return {
    status: row.status,
    url: row.url || '',
    path: row.path || '',
    notes: row.notes || '',
    criteria: row.criteria_json ? JSON.parse(row.criteria_json) : [],
    updatedAt: row.updated_at,
  };
}

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT * FROM user_artifacts WHERE user_id = ?',
      args: [user.id],
    });
    const artifacts = {};
    for (const row of r.rows) artifacts[row.artifact_id] = toEntry(row);
    return json({ artifacts });
  }

  if (request.method === 'POST') {
    const { artifactId, status, url, path, notes, criteria } = await readJsonBody(request);
    if (!artifactId) return json({ error: 'artifactId required' }, { status: 400 });
    await db.execute({
      sql: `INSERT INTO user_artifacts (id, user_id, artifact_id, status, url, path, notes, criteria_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, artifact_id) DO UPDATE SET
              status = excluded.status,
              url = excluded.url,
              path = excluded.path,
              notes = excluded.notes,
              criteria_json = excluded.criteria_json,
              updated_at = datetime('now')`,
      args: [
        randomBytes(16).toString('hex'),
        user.id,
        artifactId,
        status || 'todo',
        url || null,
        path || null,
        notes || null,
        criteria ? JSON.stringify(criteria) : null,
      ],
    });
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
