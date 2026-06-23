import { randomBytes } from 'node:crypto';

export async function listImportedReviews(db, userId) {
  const r = await db.execute({
    sql: `SELECT id, external_id, deck_name, concept_id, question, answer, tags, created_at
          FROM user_imported_reviews WHERE user_id = ? ORDER BY created_at DESC`,
    args: [userId],
  });
  return r.rows.map((row) => ({
    id: row.id,
    externalId: row.external_id,
    deckName: row.deck_name,
    conceptId: row.concept_id,
    type: 'recall',
    difficulty: 'core',
    question: row.question,
    answer: row.answer,
    source: 'anki',
    ankiRef: {
      deckName: row.deck_name,
      externalId: row.external_id,
      tags: row.tags ? JSON.parse(row.tags) : [],
    },
    createdAt: row.created_at,
  }));
}

export async function upsertImportedReviews(db, userId, { deckName, cards }) {
  if (!Array.isArray(cards) || !cards.length) {
    return { imported: 0, skipped: 0 };
  }

  let imported = 0;
  let skipped = 0;

  for (const card of cards) {
    if (!card.question || !card.answer || !card.conceptId) {
      skipped += 1;
      continue;
    }
    const externalId = card.externalId || card.id;
    const id = card.id || `rq-anki-${externalId}`;
    try {
      await db.execute({
        sql: `INSERT INTO user_imported_reviews
          (id, user_id, external_id, deck_name, concept_id, question, answer, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(user_id, external_id) DO UPDATE SET
            deck_name = excluded.deck_name,
            concept_id = excluded.concept_id,
            question = excluded.question,
            answer = excluded.answer,
            tags = excluded.tags`,
        args: [
          id,
          userId,
          String(externalId),
          deckName || card.deckName || 'imported',
          card.conceptId,
          card.question.slice(0, 4000),
          card.answer.slice(0, 8000),
          card.tags ? JSON.stringify(card.tags) : null,
        ],
      });
      imported += 1;
    } catch {
      skipped += 1;
    }
  }

  return { imported, skipped };
}

export async function deleteImportedDeck(db, userId, deckName) {
  if (!deckName) return { deleted: 0 };
  const r = await db.execute({
    sql: 'DELETE FROM user_imported_reviews WHERE user_id = ? AND deck_name = ?',
    args: [userId, deckName],
  });
  return { deleted: r.rowsAffected ?? 0 };
}

export function newRowId() {
  return randomBytes(16).toString('hex');
}
