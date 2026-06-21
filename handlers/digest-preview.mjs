import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import { buildDigestMessage, countDueFromMastery } from '../shared/lib/digest.mjs';

const DEFAULT_PROFILE = {
  minutesPerDay: 45,
  interviewHorizonDays: null,
};

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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const db = getDb();
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  let profile = DEFAULT_PROFILE;
  const pr = await db.execute({
    sql: 'SELECT profile_json FROM user_profile WHERE user_id = ?',
    args: [user.id],
  });
  if (pr.rows[0]?.profile_json) {
    try {
      profile = { ...DEFAULT_PROFILE, ...JSON.parse(pr.rows[0].profile_json) };
    } catch {
      // ignore
    }
  }

  const rqRes = await db.execute({
    sql: 'SELECT due FROM review_question_mastery WHERE user_id = ?',
    args: [user.id],
  });
  const cmRes = await db.execute({
    sql: 'SELECT due FROM concept_mastery WHERE user_id = ?',
    args: [user.id],
  });

  const digest = buildDigestMessage({
    name: user.name,
    dueReviews: countDueFromMastery(rqRes.rows),
    dueConcepts: countDueFromMastery(cmRes.rows),
    sessionMinutes: profile.minutesPerDay || 45,
    horizonDays: profile.interviewHorizonDays,
    appUrl,
  });

  return res.status(200).json({ digest });
}