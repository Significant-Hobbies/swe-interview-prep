import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import { reviewConcept } from '../shared/lib/fsrs.mjs';
import { randomBytes } from 'crypto';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

async function getRow(db, userId, questionId) {
  const r = await db.execute({
    sql: 'SELECT * FROM review_question_mastery WHERE user_id = ? AND question_id = ?',
    args: [userId, questionId],
  });
  return r.rows[0] || null;
}

async function upsert(db, userId, questionId, row) {
  await db.execute({
    sql: `INSERT INTO review_question_mastery (id, user_id, question_id,
      stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, due)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, question_id) DO UPDATE SET
        stability = excluded.stability,
        difficulty = excluded.difficulty,
        elapsed_days = excluded.elapsed_days,
        scheduled_days = excluded.scheduled_days,
        reps = excluded.reps,
        lapses = excluded.lapses,
        state = excluded.state,
        last_review = excluded.last_review,
        due = excluded.due,
        updated_at = datetime('now')`,
    args: [
      randomBytes(16).toString('hex'), userId, questionId,
      row.stability, row.difficulty, row.elapsed_days, row.scheduled_days,
      row.reps, row.lapses, row.state, row.last_review, row.due,
    ],
  });
}

function toClient(row) {
  if (!row) return null;
  return {
    stability: row.stability,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    lastReview: row.last_review,
    due: row.due,
  };
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT question_id, stability, difficulty, reps, lapses, state, last_review, due FROM review_question_mastery WHERE user_id = ?',
      args: [user.id],
    });
    const mastery = {};
    for (const row of r.rows) {
      mastery[row.question_id] = toClient(row);
    }
    return res.status(200).json({ mastery });
  }

  if (req.method === 'POST') {
    const { questionId, rating } = req.body || {};
    if (!questionId || !rating) return res.status(400).json({ error: 'questionId, rating required' });
    const prev = await getRow(db, user.id, questionId);
    const next = reviewConcept(prev, rating);
    await upsert(db, user.id, questionId, next);
    return res.status(200).json({ mastery: toClient({ ...next, question_id: questionId }) });
  }

  if (req.method === 'PUT') {
    const { updates } = req.body || {};
    if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates array required' });
    for (const u of updates) {
      if (!u.questionId || !u.rating) continue;
      const prev = await getRow(db, user.id, u.questionId);
      const next = reviewConcept(prev, u.rating);
      await upsert(db, user.id, u.questionId, next);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}