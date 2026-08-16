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

const DEFAULT = {
  experience: 'mid',
  interviewHorizonDays: null,
  minutesPerDay: 45,
  roadmapWeights: { 'ai-search-infra-90-day': 1 },
  // Empty = every track, which is the pre-v4 behaviour. Mirrors
  // DEFAULT_PROFILE in src/lib/profile.ts; keep the two in sync.
  trackIds: [],
  modalityWeights: { review: 0.22, drill: 0.42, build: 0.24, learn: 0.12 },
  skipConceptIds: [],
  // Empty = nothing muted. Must exist here, not just in src/lib/profile.ts: a
  // user with no row yet gets this object back from GET, and useProfile does
  // `{ ...DEFAULT_PROFILE, ...data.profile }` — a missing key cannot win the
  // spread, so a guest who muted domains and then signed in lost every mute.
  mutedTags: [],
  digestEmail: false,
  pushEnabled: false,
  onboardingVersion: 4,
};

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT profile_json, updated_at FROM user_profile WHERE user_id = ?',
      args: [user.id],
    });
    if (!r.rows.length) return json({ profile: DEFAULT, updatedAt: null });
    const profile = JSON.parse(r.rows[0].profile_json);
    return json({ profile, updatedAt: r.rows[0].updated_at });
  }

  if (request.method === 'PUT') {
    const { profile } = await readJsonBody(request);
    if (!profile || typeof profile !== 'object') {
      return json({ error: 'profile object required' }, { status: 400 });
    }
    const merged = { ...DEFAULT, ...profile, updatedAt: new Date().toISOString() };
    await db.execute({
      sql: `INSERT INTO user_profile (user_id, profile_json, updated_at) VALUES (?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET profile_json = excluded.profile_json, updated_at = datetime('now')`,
      args: [user.id, JSON.stringify(merged)],
    });
    return json({ profile: merged });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
