import { describe, expect, it, vi } from 'vitest';

import {
  classifyDelayedTransfer,
  continueAfterOptionalMeasurement,
  latestUnresolvedDelayedTransfer,
  parseDelayedTransferEvents,
  type DelayedTransferEvent,
} from './delayedTransfer';

describe('delayed transfer evidence', () => {
  it('continues the existing review action when measurement is unavailable or rejected', async () => {
    const continueReview = vi.fn().mockResolvedValue('saved');
    const rejectedMeasurement = vi.fn().mockRejectedValue(new Error('unavailable'));
    const stalledMeasurement = vi.fn(() => new Promise(() => {}));

    await expect(continueAfterOptionalMeasurement(null, continueReview)).resolves.toBe('saved');
    await expect(
      continueAfterOptionalMeasurement(rejectedMeasurement, continueReview)
    ).resolves.toBe('saved');
    await expect(
      continueAfterOptionalMeasurement(stalledMeasurement, continueReview)
    ).resolves.toBe('saved');

    expect(rejectedMeasurement).toHaveBeenCalledOnce();
    expect(stalledMeasurement).toHaveBeenCalledOnce();
    expect(continueReview).toHaveBeenCalledTimes(3);
  });

  it('records an unknown result when no existing critique is available', () => {
    expect(classifyDelayedTransfer(null, 'unknown')).toEqual({
      outcome: 'unknown',
      score: null,
      critiqueSource: 'unknown',
    });
  });

  it('uses the existing critique bands without elevating a partial result', () => {
    const critique = (score: number) => ({
      score,
      verdict: '',
      missing: [],
      strongerAnswer: '',
      followUps: [],
    });
    expect(classifyDelayedTransfer(critique(54), 'heuristic').outcome).toBe('not-demonstrated');
    expect(classifyDelayedTransfer(critique(55), 'ai').outcome).toBe('partial');
    expect(classifyDelayedTransfer(critique(80), 'heuristic').outcome).toBe('demonstrated');
  });

  it('drops malformed rows and exposes only content-minimized fields', () => {
    const events = parseDelayedTransferEvents([
      {
        id: 'event-1',
        kind: 'delayed_transfer',
        problemId: 'review-1',
        conceptIds: ['inference-engines'],
        createdAt: '2026-10-26T10:00:00.000Z',
        payload: {
          conceptId: 'inference-engines',
          interventionId: 'intervention-1',
          interventionAt: '2026-10-25T10:00:00.000Z',
          reviewDueAt: '2026-10-26T09:00:00.000Z',
          elapsedMs: 86400000,
          outcome: 'not-demonstrated',
          score: 20,
          critiqueSource: 'heuristic',
          answer: 'must not be returned',
        },
      },
      { id: 'bad', kind: 'delayed_transfer', payload: { answer: 'unvalidated' } },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0]).not.toHaveProperty('answer');
    expect(events[0].outcome).toBe('not-demonstrated');
  });

  it('keeps the newest intervention pending until its own delayed result is demonstrated', () => {
    const event: DelayedTransferEvent = {
      id: 'event-1',
      conceptId: 'inference-engines',
      reviewQuestionId: 'review-1',
      interventionId: 'older-intervention',
      interventionAt: '2026-10-20T10:00:00.000Z',
      reviewDueAt: '2026-10-21T10:00:00.000Z',
      elapsedMs: 86400000,
      outcome: 'demonstrated',
      score: 90,
      critiqueSource: 'heuristic',
      createdAt: '2026-10-21T10:00:00.000Z',
    };
    const interventions = [
      {
        id: 'feynman-1',
        conceptIds: ['inference-engines'],
        interventionId: 'new-intervention',
        createdAt: '2026-10-25T10:00:00.000Z',
      },
    ];
    expect(latestUnresolvedDelayedTransfer([event], interventions)).toMatchObject({
      conceptId: 'inference-engines',
      interventionId: 'new-intervention',
      outcome: 'pending',
      reviewQuestionId: null,
    });
    expect(
      latestUnresolvedDelayedTransfer(
        [
          {
            ...event,
            interventionId: 'new-intervention',
            interventionAt: '2026-10-25T10:00:00.000Z',
          },
        ],
        interventions
      )
    ).toBeNull();
  });
});
