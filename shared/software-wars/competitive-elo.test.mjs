import { describe, expect, it } from 'vitest';
import {
  buildRatingEvent,
  competitiveExpectedScore,
  competitiveKFactor,
  isCompetitiveRatingProvisional,
  rateAiMatch,
  rateCompetitivePlayer,
  rateHumanMatch,
} from './competitive-elo.mjs';

describe('competitive Elo v1', () => {
  it('starts even players at reciprocal 24-point provisional changes', () => {
    const result = rateHumanMatch({
      sideA: { rating: 1500, rankedMatches: 0 },
      sideB: { rating: 1500, rankedMatches: 0 },
      result: 'side_a',
    });
    expect(result.sideA.afterRating).toBe(1524);
    expect(result.sideB.afterRating).toBe(1476);
    expect(result.sideA.kFactor).toBe(48);
  });

  it('uses K=48 for matches 1–10 and K=24 from match 11', () => {
    expect(competitiveKFactor(0)).toBe(48);
    expect(competitiveKFactor(9)).toBe(48);
    expect(competitiveKFactor(10)).toBe(24);
    expect(
      rateCompetitivePlayer({
        rating: 1500,
        opponentRating: 1500,
        score: 1,
        rankedMatchesBefore: 10,
      })
    ).toMatchObject({
      afterRating: 1512,
      rankedMatchesAfter: 11,
      provisional: false,
    });
    expect(isCompetitiveRatingProvisional(10)).toBe(true);
  });

  it('rewards an upset against a stronger fixed rating', () => {
    expect(competitiveExpectedScore(1500, 1800)).toBeLessThan(0.16);
    expect(
      rateCompetitivePlayer({
        rating: 1500,
        opponentRating: 1800,
        score: 1,
        rankedMatchesBefore: 0,
      })
    ).toMatchObject({ afterRating: 1541, delta: 41, algorithmVersion: 'elo-v1' });
  });

  it('never mutates a precomputed AI profile rating', () => {
    const result = rateAiMatch({
      human: { rating: 1500, rankedMatches: 0 },
      aiRating: 1700,
      result: 'human',
    });
    expect(result.human.afterRating).toBeGreaterThan(1500);
    expect(result.ai).toEqual({ beforeRating: 1700, afterRating: 1700, delta: 0, fixed: true });
  });

  it('builds a stable idempotency operation for immutable events', () => {
    const calculation = rateCompetitivePlayer({
      rating: 1500,
      opponentRating: 1500,
      score: 0.5,
      rankedMatchesBefore: 3,
    });
    const input = {
      id: 'rating-event-1',
      userId: 'user-1',
      matchId: 'match-1',
      mode: 'blitz',
      opponentType: 'human',
      opponentRating: 1500,
      calculation,
      createdAt: '2026-08-13T00:00:00.000Z',
    };
    expect(buildRatingEvent(input)).toEqual(buildRatingEvent(input));
    expect(buildRatingEvent(input).operationId).toBe('match-1:user-1:result');
    expect(buildRatingEvent(input)).toMatchObject({
      beforeRating: 1500,
      afterRating: 1500,
      score: 0.5,
    });
  });

  it('rejects client-invalid scoring inputs', () => {
    expect(() =>
      rateCompetitivePlayer({
        rating: 1500,
        opponentRating: 1500,
        score: 0.25,
        rankedMatchesBefore: 0,
      })
    ).toThrow(/score/);
    expect(() => competitiveKFactor(-1)).toThrow(/non-negative/);
  });
});
