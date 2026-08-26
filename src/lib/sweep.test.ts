import { beforeEach, describe, expect, it } from 'vitest';

import { CONCEPTS, type Concept, type ReviewQuestion } from '../data/learning-os';
import { rankDomains } from './roi';
import type { ReviewMasteryEntry } from './reviewMastery';
import {
  buildSweepQueue,
  EMPTY_SWEEP,
  isThinConcept,
  loadSweep,
  recordSweepRating,
  saveSweep,
  shouldSeedReviews,
  SWEEP_RATING_TO_FSRS,
  sweepCoverage,
  sweepOrder,
  sweepWrites,
  THIN_MENTAL_MODEL_WORDS,
} from './sweep';

function concept(partial: Partial<Concept> & { id: string }): Concept {
  return {
    name: partial.id,
    tags: [],
    roadmaps: [],
    difficulty: 'core',
    priority: 1,
    prerequisites: [],
    related: [],
    description: '',
    ...partial,
  };
}

function rq(partial: Partial<ReviewQuestion> & { id: string; conceptId: string }): ReviewQuestion {
  return {
    type: 'recall',
    difficulty: 'core',
    question: 'q',
    answer: 'a',
    source: 'editorial',
    ...partial,
  };
}

const seen: ReviewMasteryEntry = {
  stability: 1,
  difficulty: 5,
  reps: 1,
  lapses: 0,
  state: 2,
};

describe('sweep rating → FSRS grade', () => {
  it('maps self-assessment onto the interval the claim deserves', () => {
    expect(SWEEP_RATING_TO_FSRS).toEqual({ known: 'easy', fuzzy: 'hard', new: 'again' });
  });

  it('does not seed review cards for concepts marked Known', () => {
    // The whole point of triage: a sweep must not flood the daily queue with
    // the ~150 concepts the user already knows.
    expect(shouldSeedReviews('known')).toBe(false);
    expect(shouldSeedReviews('fuzzy')).toBe(true);
    expect(shouldSeedReviews('new')).toBe(true);
  });
});

describe('sweepWrites', () => {
  const questions = [
    rq({ id: 'rq-a', conceptId: 'consensus' }),
    rq({ id: 'rq-b', conceptId: 'consensus' }),
    rq({ id: 'rq-other', conceptId: 'replication' }),
  ];

  it('records concept mastery but seeds nothing when Known', () => {
    const writes = sweepWrites('consensus', 'known', questions, {});
    expect(writes.conceptRating).toBe('easy');
    expect(writes.reviewSeeds).toEqual([]);
  });

  it('seeds every unseen card for the concept when New', () => {
    const writes = sweepWrites('consensus', 'new', questions, {});
    expect(writes.conceptRating).toBe('again');
    expect(writes.reviewSeeds).toEqual([
      { questionId: 'rq-a', rating: 'again' },
      { questionId: 'rq-b', rating: 'again' },
    ]);
  });

  it('never re-seeds a card that already has scheduling history', () => {
    const writes = sweepWrites('consensus', 'fuzzy', questions, { 'rq-a': seen });
    expect(writes.reviewSeeds).toEqual([{ questionId: 'rq-b', rating: 'hard' }]);
  });

  it('leaves imported library and anki cards alone', () => {
    const imported = [
      rq({ id: 'rq-lib', conceptId: 'consensus', source: 'library' }),
      rq({ id: 'rq-anki', conceptId: 'consensus', source: 'anki' }),
    ];
    expect(sweepWrites('consensus', 'new', imported, {}).reviewSeeds).toEqual([]);
  });
});

describe('buildSweepQueue', () => {
  const catalog = [
    concept({ id: 'adv', difficulty: 'advanced', tags: ['databases'] }),
    concept({ id: 'intro', difficulty: 'intro', tags: ['databases'] }),
    concept({ id: 'core', difficulty: 'core', tags: ['databases'] }),
    concept({ id: 'elsewhere', difficulty: 'intro', tags: ['behavioral'] }),
  ];

  it('walks foundations before frontier', () => {
    // Both intro-difficulty concepts sort ahead of core and advanced; between
    // themselves priority ties, so the name tiebreak decides.
    const ids = buildSweepQueue(catalog, { rated: {} }).map((c) => c.id);
    expect(ids).toEqual(['elsewhere', 'intro', 'core', 'adv']);
  });

  it('scopes to a single domain when a tag is given', () => {
    const ids = buildSweepQueue(catalog, { tag: 'databases', rated: {} }).map((c) => c.id);
    expect(ids).toEqual(['intro', 'core', 'adv']);
  });

  it('scopes to an explicit role concept set without putting ids in the URL', () => {
    const ids = buildSweepQueue(catalog, {
      conceptIds: new Set(['core', 'elsewhere']),
      rated: {},
    }).map((c) => c.id);
    expect(ids).toEqual(['elsewhere', 'core']);
  });

  it('is resumable — already-rated concepts drop out of the queue', () => {
    const ids = buildSweepQueue(catalog, { rated: { intro: 'known', adv: 'new' } }).map(
      (c) => c.id
    );
    expect(ids).toEqual(['elsewhere', 'core']);
  });

  it('breaks difficulty ties by editorial priority, highest first', () => {
    const low = concept({ id: 'low', priority: 1 });
    const high = concept({ id: 'high', priority: 5 });
    expect([low, high].sort(sweepOrder).map((c) => c.id)).toEqual(['high', 'low']);
  });
});

describe('isThinConcept', () => {
  it('does not punish dense writing — this is the bug it used to have', () => {
    // Real catalog entries, both under the old 25-word gate, both excellent.
    expect(
      isThinConcept({
        mentalModel:
          'Rank counts independent directions the matrix reaches. Regression lives in the column space of X; residuals are orthogonal to that subspace.',
      })
    ).toBe(false);
    expect(
      isThinConcept({
        mentalModel:
          'A container is an isolated process; Kubernetes is a reconciliation system that continuously drives observed state toward declared state.',
      })
    ).toBe(false);
  });

  it('catches a fragment', () => {
    expect(isThinConcept({ mentalModel: 'Sharding splits data.' })).toBe(true);
    expect(
      isThinConcept({
        mentalModel: Array(THIN_MENTAL_MODEL_WORDS - 1)
          .fill('w')
          .join(' '),
      })
    ).toBe(true);
  });

  it('catches generator boilerplate regardless of length', () => {
    expect(
      isThinConcept({
        mentalModel:
          'The core idea is that this matters a great deal in production systems and engineers should understand it thoroughly before proceeding further.',
      })
    ).toBe(true);
  });

  it('treats a missing or blank mental model as thin', () => {
    expect(isThinConcept({})).toBe(true);
    expect(isThinConcept({ mentalModel: '   ' })).toBe(true);
  });

  it('flags nothing in the shipped catalog', () => {
    // Regression guard on the correction: if this starts failing, either a
    // generator emitted boilerplate or the gate drifted back to measuring size.
    const flagged = CONCEPTS.filter(isThinConcept).map((c) => c.id);
    expect(flagged).toEqual([]);
  });
});

describe('sweepCoverage', () => {
  it('counts each bucket and reports percent triaged', () => {
    const catalog = [concept({ id: 'a' }), concept({ id: 'b' }), concept({ id: 'c' })];
    const coverage = sweepCoverage(catalog, { a: 'known', b: 'new' });
    expect(coverage).toEqual({ total: 3, rated: 2, known: 1, fuzzy: 0, new: 1, percent: 67 });
  });

  it('reports 0% rather than NaN for an empty scope', () => {
    expect(sweepCoverage([], {}).percent).toBe(0);
  });
});

describe('persistence', () => {
  // vitest runs `environment: 'node'`, which has no localStorage, so
  // loadLocal/saveLocal silently hit their catch blocks and every persistence
  // assertion passes vacuously. Same mock userStore.test.ts installs.
  const store = new Map<string, string>();
  beforeEach(() => {
    store.clear();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        clear: () => store.clear(),
        getItem: (k: string) => store.get(k) ?? null,
        removeItem: (k: string) => store.delete(k),
        setItem: (k: string, v: string) => store.set(k, v),
      },
    });
  });

  it('round-trips a pass', () => {
    saveSweep({ rated: { consensus: 'fuzzy' }, updatedAt: '2026-07-26' });
    expect(loadSweep()).toEqual({ rated: { consensus: 'fuzzy' }, updatedAt: '2026-07-26' });
  });

  it('returns an empty pass when nothing is stored', () => {
    expect(loadSweep()).toEqual({ rated: {}, updatedAt: '' });
  });

  it('lets a later rating overwrite an earlier one', () => {
    // Reachable today: undo deletes a rating and the user re-rates. If the
    // merge direction inverted, the retracted rating would silently win.
    let state = recordSweepRating(EMPTY_SWEEP, 'consensus', 'known');
    state = recordSweepRating(state, 'consensus', 'new');
    expect(state.rated.consensus).toBe('new');
  });

  it('keeps two accounts apart on one browser', () => {
    saveSweep({ rated: { consensus: 'known' }, updatedAt: 'x' }, 'user-a');
    expect(loadSweep('user-b').rated).toEqual({});
    expect(loadSweep('user-a').rated).toEqual({ consensus: 'known' });
  });

  it('adopts a guest pass on first sign-in, then leaves nothing to inherit', () => {
    saveSweep({ rated: { consensus: 'fuzzy' }, updatedAt: 'x' }); // guest
    expect(loadSweep('user-a').rated).toEqual({ consensus: 'fuzzy' });
    // Adopted and cleared, so the NEXT account does not inherit it.
    expect(loadSweep('user-b').rated).toEqual({});
    expect(loadSweep('user-a').rated).toEqual({ consensus: 'fuzzy' });
  });

  it('never lets a guest pass overwrite work the account already has', () => {
    saveSweep({ rated: { sharding: 'new' }, updatedAt: 'y' }, 'user-a');
    saveSweep({ rated: { consensus: 'fuzzy' }, updatedAt: 'x' }); // guest
    expect(loadSweep('user-a').rated).toEqual({ sharding: 'new' });
  });
});

describe('recordSweepRating', () => {
  it('does not mutate the previous state', () => {
    const next = recordSweepRating(EMPTY_SWEEP, 'consensus', 'fuzzy');
    expect(EMPTY_SWEEP.rated).toEqual({});
    expect(next.rated).toEqual({ consensus: 'fuzzy' });
    expect(next.updatedAt).not.toBe('');
  });
});

describe('against the real catalog', () => {
  it('can sweep every concept — none are dropped by the default queue', () => {
    expect(buildSweepQueue(CONCEPTS, { rated: {} })).toHaveLength(CONCEPTS.length);
  });

  it("offers the user's stated interest domains as sweep scopes", () => {
    // Moved off the deleted `sweepDomains`; `rankDomains` is now the single
    // place tags are grouped, so this asserts against the real consumer.
    const tags = rankDomains(CONCEPTS, { rated: {} }).map((d) => d.tag);
    for (const domain of [
      'distributed-systems',
      'databases',
      'infrastructure-platforms',
      'ai-systems',
      'system-design',
    ]) {
      expect(tags).toContain(domain);
    }
  });
});
