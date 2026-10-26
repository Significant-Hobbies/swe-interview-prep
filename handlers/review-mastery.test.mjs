import { describe, expect, it } from 'vitest';

import { saveReview } from './review-mastery.mjs';

const priorDue = '2026-10-26 11:00:00';
const now = new Date('2026-10-26T12:00:00.000Z');
const intervention = {
  id: 'feynman-1',
  concept_ids: '["inference-engines"]',
  created_at: '2026-10-24 12:00:00',
};

function dbFor({
  feynman = intervention,
  failInterventionLookup = false,
  failReceiptStorage = false,
  questionMissing = false,
  conceptDue = priorDue,
} = {}) {
  const operations = [];
  const receipts = [];
  const db = {
    operations,
    receipts,
    async execute({ sql, args }) {
      if (sql.includes('SELECT * FROM review_question_mastery')) {
        operations.push('read-review');
        return {
          rows: questionMissing ? [] : [{ question_id: 'review-1', due: priorDue }],
        };
      }
      if (sql.includes('FROM concept_mastery')) {
        operations.push('read-concept-due');
        return { rows: conceptDue ? [{ due: conceptDue }] : [] };
      }
      if (sql.includes('FROM feynman_logs')) {
        operations.push('validate-intervention');
        if (failInterventionLookup) throw new Error('optional lookup failed');
        return { rows: feynman ? [feynman] : [] };
      }
      if (sql.includes('SELECT due FROM review_question_mastery')) {
        throw new Error('pre-update due snapshot should be used');
      }
      if (sql.includes('INSERT INTO review_question_mastery')) {
        operations.push('save-review');
        return { rows: [] };
      }
      if (sql.includes('INSERT INTO activity_log')) {
        operations.push('store-receipt');
        if (failReceiptStorage) throw new Error('optional receipt storage failed');
        receipts.push(JSON.parse(args[6]));
        return { rows: [] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
  return db;
}

const delayedTransfer = {
  conceptId: 'inference-engines',
  payload: {
    schemaVersion: 1,
    interventionId: 'feynman-1',
    outcome: 'not-demonstrated',
    score: 20,
    critiqueSource: 'heuristic',
    answer: 'must never be persisted',
  },
};

describe('review with optional delayed-transfer measurement', () => {
  it('validates against pre-update due state and stores the receipt after the FSRS save', async () => {
    const db = dbFor();

    const result = await saveReview({
      db,
      userId: 'owner-1',
      questionId: 'review-1',
      rating: 'good',
      delayedTransfer,
      now,
    });

    expect(result).toMatchObject({ reps: 1 });
    expect(db.operations).toEqual([
      'read-review',
      'validate-intervention',
      'save-review',
      'store-receipt',
    ]);
    expect(db.receipts[0]).toMatchObject({
      conceptId: 'inference-engines',
      outcome: 'not-demonstrated',
      reviewDueAt: '2026-10-26T11:00:00.000Z',
      dueSource: 'question',
    });
    expect(db.receipts[0]).not.toHaveProperty('answer');
  });

  it('saves the FSRS review when intervention validation is unavailable', async () => {
    const db = dbFor({ failInterventionLookup: true });

    await expect(
      saveReview({
        db,
        userId: 'owner-1',
        questionId: 'review-1',
        rating: 'good',
        delayedTransfer,
        now,
      })
    ).resolves.toMatchObject({ reps: 1 });

    expect(db.operations).toEqual(['read-review', 'validate-intervention', 'save-review']);
    expect(db.receipts).toEqual([]);
  });

  it('rejects an unrelated intervention receipt without rejecting the review', async () => {
    const db = dbFor({ feynman: { ...intervention, concept_ids: '["other-concept"]' } });

    await expect(
      saveReview({
        db,
        userId: 'owner-1',
        questionId: 'review-1',
        rating: 'good',
        delayedTransfer,
        now,
      })
    ).resolves.toMatchObject({ reps: 1 });

    expect(db.operations).toEqual(['read-review', 'validate-intervention', 'save-review']);
    expect(db.receipts).toEqual([]);
  });

  it('keeps the saved review when optional receipt storage fails', async () => {
    const db = dbFor({ failReceiptStorage: true });

    await expect(
      saveReview({
        db,
        userId: 'owner-1',
        questionId: 'review-1',
        rating: 'good',
        delayedTransfer,
        now,
      })
    ).resolves.toMatchObject({ reps: 1 });

    expect(db.operations).toEqual([
      'read-review',
      'validate-intervention',
      'save-review',
      'store-receipt',
    ]);
    expect(db.receipts).toEqual([]);
  });

  it('uses authenticated pre-update concept due metadata when no question schedule exists', async () => {
    const db = dbFor({ questionMissing: true });

    await saveReview({
      db,
      userId: 'owner-1',
      questionId: 'review-1',
      rating: 'good',
      delayedTransfer,
      now,
    });

    expect(db.operations).toEqual([
      'read-review',
      'read-concept-due',
      'validate-intervention',
      'save-review',
      'store-receipt',
    ]);
    expect(db.receipts[0]).toMatchObject({
      dueSource: 'concept',
      reviewDueAt: '2026-10-26T11:00:00.000Z',
    });
  });
});
