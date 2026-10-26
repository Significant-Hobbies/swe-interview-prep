import { describe, expect, it, vi } from 'vitest';

const { getDbMock, initDatabaseMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  initDatabaseMock: vi.fn(),
}));

vi.mock('../shared/db/client.mjs', () => ({ getDb: getDbMock }));
vi.mock('../shared/db/schema.mjs', () => ({ initDatabase: initDatabaseMock }));

import activityHandler, { prepareDelayedTransferReceipt } from './activity.mjs';

const now = new Date('2026-10-26T12:00:00.000Z');
const intervention = {
  id: 'feynman-1',
  concept_ids: JSON.stringify(['inference-engines']),
  created_at: '2026-10-24 12:00:00',
};

function dbFor({
  feynman = intervention,
  questionDue = '2026-10-26 11:00:00',
  conceptDue = null,
} = {}) {
  return {
    async execute({ sql }) {
      if (sql.includes('FROM feynman_logs')) return { rows: feynman ? [feynman] : [] };
      if (sql.includes('FROM review_question_mastery')) {
        return { rows: questionDue === false ? [] : [{ due: questionDue }] };
      }
      if (sql.includes('FROM concept_mastery')) {
        return { rows: conceptDue ? [{ due: conceptDue }] : [] };
      }
      throw new Error(`Unexpected query: ${sql}`);
    },
  };
}

function receipt(overrides = {}) {
  return {
    db: dbFor(),
    userId: 'owner-1',
    problemId: 'review-1',
    conceptIds: ['inference-engines'],
    payload: {
      schemaVersion: 1,
      interventionId: 'feynman-1',
      outcome: 'not-demonstrated',
      score: 20,
      critiqueSource: 'heuristic',
      answer: 'must never be persisted',
    },
    now,
    ...overrides,
  };
}

describe('delayed transfer activity receipt', () => {
  it('rejects detached receipt writes on the generic activity endpoint', async () => {
    const execute = vi.fn();
    getDbMock.mockReturnValue({ execute });

    const result = await activityHandler({
      request: new Request('https://example.test/api/activity', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'delayed_transfer' }),
      }),
      user: { id: 'owner-1' },
      json: (body, status = 200) => ({ body, status }),
    });

    expect(result).toMatchObject({
      body: { error: 'Delayed transfer receipts must accompany a saved review.' },
      status: { status: 400 },
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it('stores only a linked, content-minimized result with verified elapsed and due metadata', async () => {
    const result = await prepareDelayedTransferReceipt(receipt());
    expect(result.payload).toEqual({
      schemaVersion: 1,
      interventionId: 'feynman-1',
      interventionAt: '2026-10-24T12:00:00.000Z',
      elapsedMs: 172800000,
      reviewDueAt: '2026-10-26T11:00:00.000Z',
      dueSource: 'question',
      conceptId: 'inference-engines',
      outcome: 'not-demonstrated',
      score: 20,
      critiqueSource: 'heuristic',
    });
    expect(result.payload).not.toHaveProperty('answer');
  });

  it('rejects an intervention the authenticated user cannot read', async () => {
    const result = await prepareDelayedTransferReceipt(receipt({ db: dbFor({ feynman: null }) }));
    expect(result).toMatchObject({ status: 404 });
  });

  it('rejects an intervention for a different concept', async () => {
    const result = await prepareDelayedTransferReceipt(
      receipt({ db: dbFor({ feynman: { ...intervention, concept_ids: '["other-concept"]' } }) })
    );
    expect(result).toMatchObject({ status: 409 });
  });

  it('rejects an intervention that did not precede the review', async () => {
    const result = await prepareDelayedTransferReceipt(
      receipt({
        db: dbFor({ feynman: { ...intervention, created_at: '2026-10-26 12:00:00' } }),
      })
    );
    expect(result).toMatchObject({ status: 409 });
  });

  it('rejects a question with a future due date even if the concept itself is due', async () => {
    const result = await prepareDelayedTransferReceipt(
      receipt({
        db: dbFor({ questionDue: '2026-10-27 12:00:00', conceptDue: '2026-10-25 12:00:00' }),
      })
    );
    expect(result).toMatchObject({ status: 409 });
  });

  it('uses concept due provenance only when the question has no schedule row', async () => {
    const result = await prepareDelayedTransferReceipt(
      receipt({ db: dbFor({ questionDue: false, conceptDue: '2026-10-25 12:00:00' }) })
    );
    expect(result.payload).toMatchObject({ dueSource: 'concept' });
  });

  it('rejects inconsistent score and outcome claims', async () => {
    const result = await prepareDelayedTransferReceipt(
      receipt({
        payload: {
          schemaVersion: 1,
          interventionId: 'feynman-1',
          outcome: 'demonstrated',
          score: 20,
          critiqueSource: 'heuristic',
        },
      })
    );
    expect(result).toMatchObject({ status: 400 });
  });
});
