import { describe, expect, it } from 'vitest';

import { decayConfidence, isDue, type MasteryRow, reviewConcept } from './fsrs';

describe('fsrs', () => {
  describe('reviewConcept', () => {
    it('initializes from null prev', () => {
      const result = reviewConcept(null, 'good');
      expect(result.reps).toBe(1);
      expect(result.stability).toBeGreaterThan(0);
      expect(result.due).toBeTruthy();
      expect(result.last_review).toBeTruthy();
    });

    it('increases stability with consecutive good ratings', () => {
      let row: MasteryRow | null = null;
      const stabs: number[] = [];
      for (let i = 0; i < 5; i++) {
        row = reviewConcept(row, 'good', new Date(Date.now() + i * 86400000));
        stabs.push(row.stability);
      }
      // Each successive good review should increase stability
      for (let i = 1; i < stabs.length; i++) {
        expect(stabs[i]).toBeGreaterThan(stabs[i - 1]);
      }
    });

    it('again rating yields lower or equal stability vs good', () => {
      // Build mature card so it's in Review state (lapses count there)
      let base: any = null;
      for (let i = 0; i < 4; i++) {
        base = reviewConcept(base, 'good', new Date(Date.now() + i * 86400000));
      }
      const t = new Date(Date.now() + 5 * 86400000);
      const goodNext = reviewConcept(base, 'good', t);
      const againNext = reviewConcept(base, 'again', t);
      expect(againNext.stability).toBeLessThan(goodNext.stability);
      expect(againNext.lapses).toBeGreaterThanOrEqual(base.lapses);
    });

    it('confidence is bounded 0..1', () => {
      let row: MasteryRow | null = null;
      for (let i = 0; i < 20; i++) {
        row = reviewConcept(row, 'easy', new Date(Date.now() + i * 86400000));
        expect(row.confidence!).toBeGreaterThanOrEqual(0);
        expect(row.confidence!).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('isDue', () => {
    it('returns true for null/undefined row', () => {
      expect(isDue(null)).toBe(true);
      expect(isDue({} as MasteryRow)).toBe(true);
    });

    it('returns true when due is in past', () => {
      expect(isDue({ due: new Date(Date.now() - 86400000).toISOString() } as MasteryRow)).toBe(
        true
      );
    });

    it('returns false when due is in future', () => {
      expect(isDue({ due: new Date(Date.now() + 86400000).toISOString() } as MasteryRow)).toBe(
        false
      );
    });
  });

  describe('decayConfidence', () => {
    it('returns 0 for never-reviewed', () => {
      expect(decayConfidence({} as MasteryRow)).toBe(0);
    });

    it('decays toward 0 as time passes', () => {
      const row: MasteryRow = {
        stability: 1,
        difficulty: 5,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 1,
        lapses: 0,
        state: 1,
        last_review: new Date(Date.now() - 30 * 86400000).toISOString(),
        due: new Date().toISOString(),
        confidence: 1,
      };
      expect(decayConfidence(row)).toBeLessThan(0.5);
    });

    it('stays high right after review', () => {
      const row: MasteryRow = {
        stability: 30,
        difficulty: 5,
        elapsed_days: 0,
        scheduled_days: 0,
        reps: 5,
        lapses: 0,
        state: 1,
        last_review: new Date().toISOString(),
        due: new Date().toISOString(),
        confidence: 1,
      };
      expect(decayConfidence(row)).toBeGreaterThan(0.95);
    });
  });
});
