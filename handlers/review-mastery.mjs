import { randomBytes } from 'node:crypto';

import { readJsonBody } from '../shared/api/read-json.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { reviewConcept } from '../shared/lib/fsrs.mjs';
import { prepareDelayedTransferReceipt } from './activity.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
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
      randomBytes(16).toString('hex'),
      userId,
      questionId,
      row.stability,
      row.difficulty,
      row.elapsed_days,
      row.scheduled_days,
      row.reps,
      row.lapses,
      row.state,
      row.last_review,
      row.due,
    ],
  });
}

async function prepareOptionalDelayedTransfer(
  db,
  userId,
  questionId,
  dueSnapshot,
  submission,
  now
) {
  if (!submission || !dueSnapshot) return null;
  const { conceptId, payload } = submission;
  try {
    const prepared = await prepareDelayedTransferReceipt({
      db,
      userId,
      problemId: questionId,
      conceptIds: [conceptId],
      payload,
      questionDueSnapshot: dueSnapshot,
      now,
    });
    return prepared.error ? null : { conceptId, payload: prepared.payload };
  } catch {
    return null;
  }
}

async function storeOptionalDelayedTransfer(db, userId, questionId, prepared) {
  if (!prepared) return;
  const { conceptId, payload } = prepared;
  try {
    await db.execute({
      sql: `INSERT INTO activity_log (id, user_id, kind, problem_id, concept_ids, duration_ms, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomBytes(16).toString('hex'),
        userId,
        'delayed_transfer',
        questionId,
        JSON.stringify([conceptId]),
        0,
        JSON.stringify(payload),
      ],
    });
  } catch {
    // Receipt storage is optional; the FSRS review is already saved.
  }
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

export async function saveReview({
  db,
  userId,
  questionId,
  rating,
  delayedTransfer,
  now = new Date(),
}) {
  const prev = await getRow(db, userId, questionId);
  const preparedTransfer = await prepareOptionalDelayedTransfer(
    db,
    userId,
    questionId,
    prev?.due,
    delayedTransfer,
    now
  );
  const next = reviewConcept(prev, rating);
  await upsert(db, userId, questionId, next);
  await storeOptionalDelayedTransfer(db, userId, questionId, preparedTransfer);
  return toClient({ ...next, question_id: questionId });
}

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT question_id, stability, difficulty, reps, lapses, state, last_review, due FROM review_question_mastery WHERE user_id = ?',
      args: [user.id],
    });
    const mastery = {};
    for (const row of r.rows) {
      mastery[row.question_id] = toClient(row);
    }
    return json({ mastery });
  }

  if (request.method === 'POST') {
    const { questionId, rating, delayedTransfer } = await readJsonBody(request);
    if (!questionId || !rating)
      return json({ error: 'questionId, rating required' }, { status: 400 });
    const mastery = await saveReview({
      db,
      userId: user.id,
      questionId,
      rating,
      delayedTransfer,
    });
    return json({ mastery });
  }

  if (request.method === 'PUT') {
    const { updates } = await readJsonBody(request);
    if (!Array.isArray(updates)) return json({ error: 'updates array required' }, { status: 400 });
    for (const u of updates) {
      if (!u.questionId || !u.rating) continue;
      const prev = await getRow(db, user.id, u.questionId);
      const next = reviewConcept(prev, u.rating);
      await upsert(db, user.id, u.questionId, next);
    }
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
