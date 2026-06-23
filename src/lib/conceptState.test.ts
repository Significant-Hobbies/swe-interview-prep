import { describe, expect, it } from 'vitest';

import type { MasteryEntry } from '../hooks/useConcepts';
import {
  confidence1to5,
  confidencePct,
  deriveConceptStatus,
  isDue,
  rollupMastery,
} from './conceptState';

function entry(partial: Partial<MasteryEntry>): MasteryEntry {
  return {
    stability: 1,
    difficulty: 5,
    reps: 0,
    lapses: 0,
    state: 0,
    confidence: 0,
    ...partial,
  };
}

describe('deriveConceptStatus', () => {
  it('returns not-started without mastery', () => {
    expect(deriveConceptStatus(undefined)).toBe('not-started');
  });

  it('returns mastered at high confidence with reps', () => {
    expect(deriveConceptStatus(entry({ confidence: 0.9, reps: 3 }))).toBe('mastered');
  });

  it('returns review when due', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(deriveConceptStatus(entry({ confidence: 0.5, reps: 1, due: past }))).toBe('review');
  });

  it('returns drilling after several reps', () => {
    expect(deriveConceptStatus(entry({ confidence: 0.5, reps: 4 }))).toBe('drilling');
  });
});

describe('isDue', () => {
  it('is false without due date', () => {
    expect(isDue(entry({ confidence: 0.5 }))).toBe(false);
  });

  it('is true when due is in the past', () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(isDue(entry({ due: past }))).toBe(true);
  });
});

describe('confidence helpers', () => {
  it('maps confidence to percent and 1-5 scale', () => {
    expect(confidencePct(entry({ confidence: 0.42 }))).toBe(42);
    expect(confidence1to5(entry({ confidence: 0.95 }))).toBe(5);
    expect(confidence1to5(undefined)).toBe(1);
  });
});

describe('rollupMastery', () => {
  it('aggregates statuses across concept ids', () => {
    const roll = rollupMastery(['a', 'b', 'c'], {
      a: entry({ confidence: 0.9, reps: 3 }),
      b: entry({ confidence: 0.4, reps: 1 }),
    });
    expect(roll.total).toBe(3);
    expect(roll.mastered).toBe(1);
    expect(roll.untouched).toBe(1);
  });
});
