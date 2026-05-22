import { randomBytes } from 'crypto';

import { requireAuth } from '../api/auth/verify.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT * FROM user_projects WHERE user_id = ?',
      args: [user.id],
    });
    const projects = {};
    for (const row of r.rows) {
      projects[row.project_id] = {
        status: row.status,
        nextAction: row.next_action || '',
        milestones: row.milestones_json ? JSON.parse(row.milestones_json) : {},
        updatedAt: row.updated_at,
      };
    }
    return res.status(200).json({ projects });
  }

  if (req.method === 'POST') {
    const { projectId, status, nextAction, milestones } = req.body || {};
    if (!projectId) return res.status(400).json({ error: 'projectId required' });
    await db.execute({
      sql: `INSERT INTO user_projects (id, user_id, project_id, status, next_action, milestones_json)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, project_id) DO UPDATE SET
              status = excluded.status,
              next_action = excluded.next_action,
              milestones_json = excluded.milestones_json,
              updated_at = datetime('now')`,
      args: [
        randomBytes(16).toString('hex'), user.id, projectId,
        status || 'planned', nextAction || null,
        milestones ? JSON.stringify(milestones) : null,
      ],
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
