import { describe, expect, it } from 'vitest';
import {
  canTransitionTradeoffPhase,
  compareBlitzScores,
  isBeforeDeadline,
  mapBlitzRemediation,
  mapTradeoffRemediation,
  nextTradeoffPhase,
  phaseDeadline,
  resolveCompatibleVotes,
  selectBlitzQuestions,
} from './logic.mjs';

describe('Blitz scoring and timing', () => {
  it('prioritizes accuracy before response time', () => {
    expect(
      compareBlitzScores(
        { correctCount: 4, qualifyingResponseMs: 60_000 },
        { correctCount: 3, qualifyingResponseMs: 1_000 }
      )
    ).toBe('side_a');
  });

  it('uses response time only for human accuracy ties', () => {
    expect(
      compareBlitzScores(
        { correctCount: 4, qualifyingResponseMs: 8_000 },
        { correctCount: 4, qualifyingResponseMs: 9_000 }
      )
    ).toBe('side_a');
    expect(
      compareBlitzScores(
        { correctCount: 4, qualifyingResponseMs: 8_000 },
        { correctCount: 4, qualifyingResponseMs: 0, excludeResponseTime: true }
      )
    ).toBe('draw');
  });

  it('accepts only receipts strictly before the deadline', () => {
    expect(isBeforeDeadline('2026-08-13T10:00:00.999Z', '2026-08-13T10:00:01.000Z')).toBe(true);
    expect(isBeforeDeadline('2026-08-13T10:00:01.000Z', '2026-08-13T10:00:01.000Z')).toBe(false);
  });
});

describe('ranked question selection', () => {
  const questions = [
    {
      id: 'q-1',
      status: 'active',
      topic: 'databases',
      difficulty: 'foundation',
      conceptIds: ['indexes'],
      primaryConceptId: 'indexes',
    },
    {
      id: 'q-2',
      status: 'active',
      topic: 'databases',
      difficulty: 'foundation',
      conceptIds: ['transactions'],
      primaryConceptId: 'transactions',
    },
    {
      id: 'q-3',
      status: 'active',
      topic: 'networking',
      difficulty: 'intermediate',
      conceptIds: ['tcp'],
      primaryConceptId: 'tcp',
    },
    {
      id: 'q-4',
      status: 'retired',
      topic: 'databases',
      difficulty: 'advanced',
      conceptIds: ['indexes'],
      primaryConceptId: 'indexes',
    },
  ];

  it('excludes recent and retired content and boosts weak concepts', () => {
    const selected = selectBlitzQuestions({
      questions,
      count: 1,
      topic: 'databases',
      recentContentIds: ['q-2'],
      weakConceptIds: ['indexes'],
      seed: 42,
    });
    expect(selected.map(({ id }) => id)).toEqual(['q-1']);
  });

  it('fails closed when the cooldown leaves too few questions', () => {
    expect(() =>
      selectBlitzQuestions({ questions, count: 2, topic: 'databases', recentContentIds: ['q-1'] })
    ).toThrow(/1 eligible/);
  });

  it('filters by canonical concept scope without relying on topic labels', () => {
    const selected = selectBlitzQuestions({
      questions,
      count: 1,
      eligibleConceptIds: new Set(['tcp']),
    });
    expect(selected.map(({ id }) => id)).toEqual(['q-3']);
  });
});

describe('Tradeoff phases and votes', () => {
  it('resolves compatible private votes without adjudication', () => {
    expect(resolveCompatibleVotes('win', 'loss')).toBe('side_a');
    expect(resolveCompatibleVotes('loss', 'win')).toBe('side_b');
    expect(resolveCompatibleVotes('draw', 'draw')).toBe('draw');
    expect(resolveCompatibleVotes('win', 'win')).toBeNull();
  });

  it('permits only explicit state-machine transitions', () => {
    expect(nextTradeoffPhase('initial_solution')).toBe('twist');
    expect(canTransitionTradeoffPhase('initial_solution', 'twist')).toBe(true);
    expect(canTransitionTradeoffPhase('initial_solution', 'reveal')).toBe(false);
    expect(canTransitionTradeoffPhase('voting', 'complete')).toBe(true);
    expect(canTransitionTradeoffPhase('adjudicating', 'review_required')).toBe(true);
  });

  it('derives absolute phase deadlines', () => {
    expect(phaseDeadline('2026-08-13T10:00:00.000Z', 'debate')).toBe('2026-08-13T10:08:00.000Z');
    expect(phaseDeadline('2026-08-13T10:00:00.000Z', 'complete')).toBeNull();
  });
});

describe('conservative remediation', () => {
  it('does not grant FSRS mastery for a correct MCQ', () => {
    expect(mapBlitzRemediation({ isCorrect: true })).toEqual({
      evidenceType: 'blitz_success',
      fsrsRating: null,
    });
  });

  it('uses only again/hard for misses and never easy for Tradeoff evidence', () => {
    expect(mapBlitzRemediation({ isCorrect: false }).fsrsRating).toBe('again');
    expect(
      mapBlitzRemediation({ isCorrect: false, misconceptionSeverity: 'near_miss' }).fsrsRating
    ).toBe('hard');
    expect(mapTradeoffRemediation('strong')).toBe('good');
    expect(mapTradeoffRemediation('partial')).toBe('hard');
    expect(mapTradeoffRemediation('incorrect')).toBe('again');
    expect(mapTradeoffRemediation('unknown')).toBeNull();
  });
});
