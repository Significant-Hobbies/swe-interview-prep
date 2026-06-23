import { describe, expect, it } from 'vitest';

import { DEFAULT_USER_ELO, difficultyToElo, expectedScore, kFactor, updatePlayerElo } from './elo';

describe('elo', () => {
  it('maps difficulty to static problem ratings', () => {
    expect(difficultyToElo('intro')).toBeLessThan(difficultyToElo('core'));
    expect(difficultyToElo('core')).toBeLessThan(difficultyToElo('advanced'));
  });

  it('expectedScore favors higher-rated player', () => {
    expect(expectedScore(1800, 1200)).toBeGreaterThan(0.9);
    expect(expectedScore(1200, 1800)).toBeLessThan(0.1);
    expect(expectedScore(DEFAULT_USER_ELO, DEFAULT_USER_ELO)).toBeCloseTo(0.5, 1);
  });

  it('kFactor is higher during provisional window', () => {
    expect(kFactor(0)).toBeGreaterThan(kFactor(20));
  });

  it('updatePlayerElo increases rating on win vs stronger problem', () => {
    const next = updatePlayerElo(1500, 2000, 1, 0);
    expect(next).toBeGreaterThan(1500);
  });

  it('updatePlayerElo decreases rating on loss vs stronger problem', () => {
    const next = updatePlayerElo(1500, 2000, 0, 5);
    expect(next).toBeLessThan(1500);
  });
});
