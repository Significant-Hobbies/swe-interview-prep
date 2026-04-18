import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import { reviewConcept, decayConfidence } from '../shared/lib/fsrs.mjs';
import { randomBytes } from 'crypto';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

async function getMastery(db, userId, conceptId) {
  const r = await db.execute({
    sql: 'SELECT * FROM concept_mastery WHERE user_id = ? AND concept_id = ?',
    args: [userId, conceptId],
  });
  return r.rows[0] || null;
}

async function upsertMastery(db, userId, conceptId, row) {
  // Atomic upsert — avoids read-then-write race.
  await db.execute({
    sql: `INSERT INTO concept_mastery (id, user_id, concept_id,
      stability, difficulty, elapsed_days, scheduled_days, reps, lapses,
      state, last_review, due, confidence)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, concept_id) DO UPDATE SET
        stability = excluded.stability,
        difficulty = excluded.difficulty,
        elapsed_days = excluded.elapsed_days,
        scheduled_days = excluded.scheduled_days,
        reps = excluded.reps,
        lapses = excluded.lapses,
        state = excluded.state,
        last_review = excluded.last_review,
        due = excluded.due,
        confidence = excluded.confidence,
        updated_at = datetime('now')`,
    args: [
      randomBytes(16).toString('hex'), userId, conceptId,
      row.stability, row.difficulty, row.elapsed_days, row.scheduled_days,
      row.reps, row.lapses, row.state, row.last_review, row.due, row.confidence,
    ],
  });
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT * FROM concept_mastery WHERE user_id = ?',
      args: [user.id],
    });
    const now = new Date();
    const mastery = {};
    for (const row of r.rows) {
      const decayed = decayConfidence(row, now);
      mastery[row.concept_id] = {
        stability: row.stability,
        difficulty: row.difficulty,
        reps: row.reps,
        lapses: row.lapses,
        state: row.state,
        lastReview: row.last_review,
        due: row.due,
        confidence: decayed,
      };
    }
    return res.status(200).json({ mastery });
  }

  if (req.method === 'POST') {
    const { conceptId, rating } = req.body || {};
    if (!conceptId || !rating) return res.status(400).json({ error: 'conceptId, rating required' });
    const prev = await getMastery(db, user.id, conceptId);
    const next = reviewConcept(prev, rating);
    await upsertMastery(db, user.id, conceptId, next);
    return res.status(200).json({ mastery: { ...next, confidence: decayConfidence(next) } });
  }

  if (req.method === 'PUT') {
    // Bulk update from tagger: [{conceptId, rating}]
    const { updates } = req.body || {};
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates array required' });
    const results = [];
    for (const u of updates) {
      if (!u.conceptId || !u.rating) continue;
      const prev = await getMastery(db, user.id, u.conceptId);
      const next = reviewConcept(prev, u.rating);
      await upsertMastery(db, user.id, u.conceptId, next);
      results.push({ conceptId: u.conceptId, mastery: { ...next, confidence: decayConfidence(next) } });
    }
    return res.status(200).json({ results });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
