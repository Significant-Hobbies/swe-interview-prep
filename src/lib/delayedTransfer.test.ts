import { describe, expect, it } from 'vitest';

import {
  classifyDelayedTransfer,
  dueDelayedTransferDecision,
  parseDelayedTransferEvents,
  type DelayedTransferEvent,
  unresolvedDelayedTransfers,
} from './delayedTransfer';

describe('delayed transfer evidence', () => {
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
    expect(unresolvedDelayedTransfers([event], interventions)[0]).toMatchObject({
      conceptId: 'inference-engines',
      interventionId: 'new-intervention',
      outcome: 'pending',
      reviewQuestionId: null,
    });
    expect(
      unresolvedDelayedTransfers(
        [
          {
            ...event,
            interventionId: 'new-intervention',
            interventionAt: '2026-10-25T10:00:00.000Z',
          },
        ],
        interventions
      )
    ).toEqual([]);
  });

  it('selects the strongest unresolved result among due concepts without a pending intervention masking it', () => {
    const failed: DelayedTransferEvent = {
      id: 'event-a',
      conceptId: 'inference-engines',
      reviewQuestionId: 'review-a',
      interventionId: 'intervention-a',
      interventionAt: '2026-10-20T10:00:00.000Z',
      reviewDueAt: '2026-10-21T10:00:00.000Z',
      elapsedMs: 86400000,
      outcome: 'not-demonstrated',
      score: 20,
      critiqueSource: 'heuristic',
      createdAt: '2026-10-21T10:00:00.000Z',
    };
    const interventions = [
      {
        id: 'feynman-a',
        conceptIds: ['inference-engines'],
        interventionId: 'intervention-a',
        createdAt: '2026-10-20T10:00:00.000Z',
      },
      {
        id: 'feynman-b',
        conceptIds: ['resource-allocation'],
        interventionId: 'intervention-b',
        createdAt: '2026-10-22T10:00:00.000Z',
      },
    ];
    const decisions = unresolvedDelayedTransfers([failed], interventions);

    expect(decisions).toHaveLength(2);
    expect(
      dueDelayedTransferDecision(decisions, [
        { id: 'review-a', conceptId: 'inference-engines' },
        { id: 'review-b', conceptId: 'resource-allocation' },
      ])
    ).toMatchObject({ conceptId: 'inference-engines', outcome: 'not-demonstrated' });
    expect(
      dueDelayedTransferDecision(decisions, [{ id: 'review-b', conceptId: 'resource-allocation' }])
    ).toBeNull();
  });
});
