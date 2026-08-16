import { randomBytes } from 'node:crypto';

import { readJsonBody } from '../shared/api/read-json.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { masteryConfidence, reviewConcept } from '../shared/lib/fsrs.mjs';

/**
 * Snake_case DB/FSRS row → the camelCase shape `useConcepts` expects.
 * Returning the raw row here silently dropped `lastReview`, which reset FSRS
 * history on the client the next time it wrote mastery back.
 */
function toClient(row, now = new Date()) {
  return {
    stability: row.stability,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    lastReview: row.last_review ?? null,
    due: row.due ?? null,
    confidence: masteryConfidence(row, now),
  };
}

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
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
      randomBytes(16).toString('hex'),
      userId,
      conceptId,
      row.stability,
      row.difficulty,
      row.elapsed_days,
      row.scheduled_days,
      row.reps,
      row.lapses,
      row.state,
      row.last_review,
      row.due,
      row.confidence,
    ],
  });
}

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT * FROM concept_mastery WHERE user_id = ?',
      args: [user.id],
    });
    const now = new Date();
    const mastery = {};
    for (const row of r.rows) {
      mastery[row.concept_id] = toClient(row, now);
    }
    return json({ mastery });
  }

  if (request.method === 'POST') {
    const { conceptId, rating } = await readJsonBody(request);
    if (!conceptId || !rating)
      return json({ error: 'conceptId, rating required' }, { status: 400 });
    const prev = await getMastery(db, user.id, conceptId);
    const next = reviewConcept(prev, rating);
    await upsertMastery(db, user.id, conceptId, next);
    return json({ mastery: toClient(next) });
  }

  if (request.method === 'PUT') {
    // Bulk update from tagger: [{conceptId, rating}]
    const { updates } = await readJsonBody(request);
    if (!Array.isArray(updates)) return json({ error: 'updates array required' }, { status: 400 });
    const results = [];
    for (const u of updates) {
      if (!u.conceptId || !u.rating) continue;
      const prev = await getMastery(db, user.id, u.conceptId);
      const next = reviewConcept(prev, u.rating);
      await upsertMastery(db, user.id, u.conceptId, next);
      results.push({ conceptId: u.conceptId, mastery: toClient(next) });
    }
    return json({ results });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
