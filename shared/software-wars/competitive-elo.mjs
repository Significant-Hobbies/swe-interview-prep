import { ELO_ALGORITHM_VERSION } from './contracts.mjs';

export const COMPETITIVE_ELO_START = 1500;
export const PROVISIONAL_MATCHES = 10;
export const PROVISIONAL_K = 48;
export const ESTABLISHED_K = 24;

export function competitiveExpectedScore(playerRating, opponentRating) {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

export function competitiveKFactor(rankedMatchesBefore) {
  if (!Number.isInteger(rankedMatchesBefore) || rankedMatchesBefore < 0) {
    throw new RangeError('rankedMatchesBefore must be a non-negative integer');
  }
  return rankedMatchesBefore < PROVISIONAL_MATCHES ? PROVISIONAL_K : ESTABLISHED_K;
}

export function isCompetitiveRatingProvisional(rankedMatches) {
  return rankedMatches <= PROVISIONAL_MATCHES;
}

export function rateCompetitivePlayer({
  rating = COMPETITIVE_ELO_START,
  opponentRating,
  score,
  rankedMatchesBefore = 0,
}) {
  if (![0, 0.5, 1].includes(score)) {
    throw new RangeError('score must be 0, 0.5, or 1');
  }
  if (
    !Number.isFinite(rating) ||
    rating <= 0 ||
    !Number.isFinite(opponentRating) ||
    opponentRating <= 0
  ) {
    throw new RangeError('ratings must be positive finite numbers');
  }

  const expected = competitiveExpectedScore(rating, opponentRating);
  const kFactor = competitiveKFactor(rankedMatchesBefore);
  const afterRating = Math.round(rating + kFactor * (score - expected));
  const rankedMatchesAfter = rankedMatchesBefore + 1;

  return {
    beforeRating: rating,
    afterRating,
    delta: afterRating - rating,
    expected,
    score,
    kFactor,
    rankedMatchesBefore,
    rankedMatchesAfter,
    provisional: isCompetitiveRatingProvisional(rankedMatchesAfter),
    algorithmVersion: ELO_ALGORITHM_VERSION,
  };
}

export function rateHumanMatch({ sideA, sideB, result }) {
  const sideAScore = result === 'side_a' ? 1 : result === 'side_b' ? 0 : 0.5;
  const sideBScore = 1 - sideAScore;

  return {
    sideA: rateCompetitivePlayer({
      rating: sideA.rating,
      opponentRating: sideB.rating,
      score: sideAScore,
      rankedMatchesBefore: sideA.rankedMatches,
    }),
    sideB: rateCompetitivePlayer({
      rating: sideB.rating,
      opponentRating: sideA.rating,
      score: sideBScore,
      rankedMatchesBefore: sideB.rankedMatches,
    }),
  };
}

export function rateAiMatch({ human, aiRating, result }) {
  const score = result === 'human' ? 1 : result === 'ai' ? 0 : 0.5;
  return {
    human: rateCompetitivePlayer({
      rating: human.rating,
      opponentRating: aiRating,
      score,
      rankedMatchesBefore: human.rankedMatches,
    }),
    ai: { beforeRating: aiRating, afterRating: aiRating, delta: 0, fixed: true },
  };
}

export function buildRatingEvent({
  id,
  userId,
  matchId,
  mode,
  opponentType,
  opponentRating,
  calculation,
  createdAt,
}) {
  return Object.freeze({
    id,
    userId,
    matchId,
    mode,
    eventType: 'result',
    beforeRating: calculation.beforeRating,
    afterRating: calculation.afterRating,
    score: calculation.score,
    opponentType,
    opponentRatingSnapshot: opponentRating,
    algorithmVersion: calculation.algorithmVersion,
    operationId: `${matchId}:${userId}:result`,
    createdAt,
  });
}
