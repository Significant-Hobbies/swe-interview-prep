import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

const DEFAULT = {
  experience: 'mid',
  interviewHorizonDays: null,
  minutesPerDay: 45,
  roadmapWeights: { 'ai-search-infra-90-day': 1 },
  modalityWeights: { review: 0.22, drill: 0.42, build: 0.24, learn: 0.12 },
  skipConceptIds: [],
  digestEmail: false,
  pushEnabled: false,
  onboardingVersion: 3,
};

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT profile_json, updated_at FROM user_profile WHERE user_id = ?',
      args: [user.id],
    });
    if (!r.rows.length) return res.status(200).json({ profile: DEFAULT, updatedAt: null });
    const profile = JSON.parse(r.rows[0].profile_json);
    return res.status(200).json({ profile, updatedAt: r.rows[0].updated_at });
  }

  if (req.method === 'PUT') {
    const { profile } = req.body || {};
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'profile object required' });
    }
    const merged = { ...DEFAULT, ...profile, updatedAt: new Date().toISOString() };
    await db.execute({
      sql: `INSERT INTO user_profile (user_id, profile_json, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET profile_json = excluded.profile_json, updated_at = datetime('now')`,
      args: [user.id, JSON.stringify(merged)],
    });
    return res.status(200).json({ profile: merged });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}