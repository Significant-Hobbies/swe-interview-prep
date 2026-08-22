import { describe, expect, it } from 'vitest';

import { CONCEPT_BY_ID } from '../hooks/useConcepts';
import type { MasteryEntry } from '../hooks/useConcepts';
import type { GateContext } from './gates';
import { DEFAULT_USER_ELO } from './elo';
import { ALL_CONCEPTS } from '../hooks/useConcepts';
import {
  conceptGaps,
  dueConcepts,
  dueReviewQuestions,
  pickDrillForConcept,
  pickNextConcept,
  prereqsMet,
} from './recommend';
import { sweepOrder } from './sweep';

function mastery(confidence: number, due?: string, reps = 3): MasteryEntry {
  return {
    stability: 1,
    difficulty: 5,
    reps,
    lapses: 0,
    state: 2,
    confidence,
    due: due ?? null,
  };
}

const emptyGate: GateContext = {
  mastery: {},
  getElo: () => DEFAULT_USER_ELO,
  artifacts: {},
  drills: {},
};

describe('prereqsMet', () => {
  it('requires 40% confidence on every prerequisite', () => {
    const c = CONCEPT_BY_ID['search-evals'];
    expect(c).toBeDefined();
    expect(
      prereqsMet(c!, { 'ranking-metrics': mastery(0.5), 'hypothesis-testing': mastery(0.3) })
    ).toBe(false);
    expect(
      prereqsMet(c!, { 'ranking-metrics': mastery(0.5), 'hypothesis-testing': mastery(0.5) })
    ).toBe(true);
  });
});

describe('pickNextConcept', () => {
  it('returns null when everything is mastered', () => {
    const all: Record<string, MasteryEntry> = {};
    for (const id of Object.keys(CONCEPT_BY_ID)) {
      all[id] = mastery(0.95);
    }
    expect(pickNextConcept(all)).toBeNull();
  });

  it('skips gated concepts when gate context is provided', () => {
    const m: Record<string, MasteryEntry> = {
      'ranking-metrics': mastery(0.9),
      'hypothesis-testing': mastery(0.1),
      'search-evals': mastery(0),
    };
    const next = pickNextConcept(m, emptyGate);
    expect(next?.id).not.toBe('search-evals');
  });

  it('allows search-evals when hypothesis-testing unlocks the gate', () => {
    const m: Record<string, MasteryEntry> = {};
    for (const id of Object.keys(CONCEPT_BY_ID)) m[id] = mastery(0.95);
    m['search-evals'] = mastery(0.1);
    m['hypothesis-testing'] = mastery(0.6);
    m['ranking-metrics'] = mastery(0.9);
    const gateCtx: GateContext = {
      ...emptyGate,
      mastery: m,
      drills: { 'interpret-p-value': { status: 'solved', lastCode: '', attempts: 1 } },
    };
    expect(pickNextConcept(m, gateCtx)?.id).toBe('search-evals');
  });

  it('prefers due reviews with lowest confidence', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const m: Record<string, MasteryEntry> = {
      tokenization: mastery(0.3, past, 1),
      'inverted-index': mastery(0.6, past, 1),
    };
    expect(pickNextConcept(m)?.id).toBe('tokenization');
  });
});

describe('dashboard helpers', () => {
  it('dueConcepts returns concepts with past due dates', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const m = { tokenization: mastery(0.4, past, 1) };
    expect(dueConcepts(m).map((c) => c.id)).toContain('tokenization');
  });

  it('conceptGaps reports low-confidence started concepts as shaky', () => {
    const m = {
      bm25: mastery(0.2, undefined, 1),
      tokenization: mastery(0.9, undefined, 3),
    };
    const shaky = conceptGaps(m, 40).filter((g) => g.kind === 'shaky');
    expect(shaky.map((g) => g.concept.id)).toEqual(['bm25']);
  });

  it('pickDrillForConcept returns first mapped drill', () => {
    const drill = pickDrillForConcept('tokenization');
    expect(drill?.conceptId).toBe('tokenization');
  });

  it('dueReviewQuestions filters by due parent concept', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const m = { tokenization: mastery(0.4, past, 1) };
    expect(dueReviewQuestions(m).length).toBeGreaterThan(0);
  });
});

/**
 * The bug this suite exists for: `weakConcepts()` filtered on
 * `mastery[c.id] && …`, so a concept never opened could not be reported as a
 * gap at any surface. The old test passed a fixture where every concept had a
 * mastery row, so the blind spot was invisible to it — hence the first case
 * below, which passes an empty mastery map on purpose.
 */
describe('conceptGaps — untouched concepts count as gaps', () => {
  it('reports untouched concepts when nothing has ever been studied', () => {
    const gaps = conceptGaps({}, 5);
    expect(gaps).toHaveLength(5);
    expect(gaps.every((g) => g.kind === 'uncovered')).toBe(true);
    expect(gaps.every((g) => g.confidence === 0)).toBe(true);
  });

  it('reports an untouched concept alongside a studied-but-shaky one', () => {
    const m = { bm25: mastery(0.2, undefined, 1) };
    const gaps = conceptGaps(m, 3);
    expect(gaps).toHaveLength(3);
    // Shaky first — its confidence is decaying now; an uncovered concept has
    // been at zero since the catalogue was written and keeps until tomorrow.
    expect(gaps[0]).toMatchObject({ kind: 'shaky' });
    expect(gaps[0].concept.id).toBe('bm25');
    expect(gaps.slice(1).every((g) => g.kind === 'uncovered')).toBe(true);
    expect(gaps.some((g) => g.concept.id === 'bm25' && g.kind === 'uncovered')).toBe(false);
  });

  it('reports nothing once every concept is touched and confident', () => {
    const all: Record<string, MasteryEntry> = {};
    for (const id of Object.keys(CONCEPT_BY_ID)) all[id] = mastery(0.95);
    expect(conceptGaps(all, 6)).toEqual([]);
  });

  it('orders untouched concepts by sweepOrder — foundations before frontier', () => {
    const gaps = conceptGaps({}, 250).map((g) => g.concept);
    const expected = [...ALL_CONCEPTS].sort(sweepOrder);
    expect(gaps.map((c) => c.id)).toEqual(expected.slice(0, gaps.length).map((c) => c.id));
    expect(gaps[0].difficulty).toBe('intro');
  });

  it('honours the limit and covers the whole catalogue when asked', () => {
    expect(conceptGaps({}, 1)).toHaveLength(1);
    expect(conceptGaps({}, ALL_CONCEPTS.length)).toHaveLength(ALL_CONCEPTS.length);
  });
});
