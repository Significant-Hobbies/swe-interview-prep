import { getDb } from '../shared/db/client.mjs';
import { requireAuth } from './auth/verify.mjs';
import { randomBytes } from 'crypto';

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const db = getDb();

  // GET /api/progress - Get all progress for user
  if (req.method === 'GET') {
    const result = await db.execute({
      sql: 'SELECT * FROM user_progress WHERE user_id = ?',
      args: [user.id],
    });

    const progress = {};
    for (const row of result.rows) {
      progress[row.problem_id] = {
        status: row.status || 'unseen',
        code: row.code || undefined,
        language: row.language || 'typescript',
        bookmarked: !!row.bookmarked,
        lastAttempted: row.last_attempted || undefined,
        ease: row.ease ?? 2.5,
        interval: row.interval ?? 0,
        repetitions: row.repetitions ?? 0,
        nextReview: row.next_review || undefined,
        lastReview: row.last_review || undefined,
      };
    }

    return res.status(200).json({ progress });
  }

  // PUT /api/progress - Upsert progress for a single problem
  if (req.method === 'PUT') {
    const { problemId, data } = req.body;
    if (!problemId || !data) {
      return res.status(400).json({ error: 'problemId and data required' });
    }

    const existing = await db.execute({
      sql: 'SELECT id FROM user_progress WHERE user_id = ? AND problem_id = ?',
      args: [user.id, problemId],
    });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: `UPDATE user_progress SET
          status = ?, code = ?, language = ?, bookmarked = ?,
          last_attempted = ?, ease = ?, interval = ?, repetitions = ?,
          next_review = ?, last_review = ?, updated_at = datetime("now")
          WHERE user_id = ? AND problem_id = ?`,
        args: [
          data.status || 'unseen',
          data.code || null,
          data.language || 'typescript',
          data.bookmarked ? 1 : 0,
          data.lastAttempted || null,
          data.ease ?? 2.5,
          data.interval ?? 0,
          data.repetitions ?? 0,
          data.nextReview || null,
          data.lastReview || null,
          user.id,
          problemId,
        ],
      });
    } else {
      const id = randomBytes(16).toString('hex');
      await db.execute({
        sql: `INSERT INTO user_progress (id, user_id, problem_id, status, code, language, bookmarked, last_attempted, ease, interval, repetitions, next_review, last_review)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          user.id,
          problemId,
          data.status || 'unseen',
          data.code || null,
          data.language || 'typescript',
          data.bookmarked ? 1 : 0,
          data.lastAttempted || null,
          data.ease ?? 2.5,
          data.interval ?? 0,
          data.repetitions ?? 0,
          data.nextReview || null,
          data.lastReview || null,
        ],
      });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
