const BLITZ_DIFFICULTY_WEIGHT = Object.freeze({
  foundation: 0,
  intermediate: 1,
  advanced: 2,
});

const TRADEOFF_NEXT_PHASE = Object.freeze({
  scheduled: 'check_in',
  check_in: 'initial_solution',
  initial_solution: 'twist',
  twist: 'revision',
  revision: 'reveal',
  reveal: 'debate',
  debate: 'voting',
  voting: 'adjudicating',
  adjudicating: 'complete',
});

export const TRADEOFF_PHASE_DURATIONS_SECONDS = Object.freeze({
  check_in: 5 * 60,
  initial_solution: 9 * 60,
  twist: 15,
  revision: 7 * 60 + 45,
  reveal: 60,
  debate: 8 * 60,
  voting: 2 * 60,
});

function parseTimestamp(value, label) {
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new TypeError(`${label} must be a valid date or ISO timestamp`);
  }
  return timestamp;
}

export function isBeforeDeadline(receivedAt, deadlineAt) {
  return parseTimestamp(receivedAt, 'receivedAt') < parseTimestamp(deadlineAt, 'deadlineAt');
}

export function compareBlitzScores(sideA, sideB) {
  if (sideA.correctCount !== sideB.correctCount) {
    return sideA.correctCount > sideB.correctCount ? 'side_a' : 'side_b';
  }

  if (sideA.excludeResponseTime || sideB.excludeResponseTime) {
    return 'draw';
  }

  if (sideA.qualifyingResponseMs === sideB.qualifyingResponseMs) {
    return 'draw';
  }

  return sideA.qualifyingResponseMs < sideB.qualifyingResponseMs ? 'side_a' : 'side_b';
}

function stableHash(value, seed) {
  let hash = 2166136261 ^ seed;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectBlitzQuestions({
  questions,
  count,
  topic,
  eligibleConceptIds,
  recentContentIds = [],
  weakConceptIds = [],
  seed = 0,
}) {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError('count must be a positive integer');
  }

  const recent = new Set(recentContentIds);
  const weak = new Set(weakConceptIds);
  const scopedConcepts = eligibleConceptIds ? new Set(eligibleConceptIds) : null;
  const eligible = questions.filter(
    (question) =>
      question.status === 'active' &&
      !recent.has(question.id) &&
      (topic === undefined || topic === null || question.topic === topic) &&
      (!scopedConcepts || scopedConcepts.has(question.primaryConceptId))
  );

  if (eligible.length < count) {
    throw new RangeError(`Question pool has ${eligible.length} eligible items; ${count} required`);
  }

  return eligible
    .map((question) => ({
      question,
      weaknessBoost: question.conceptIds.some((conceptId) => weak.has(conceptId)) ? 1 : 0,
      difficultyWeight: BLITZ_DIFFICULTY_WEIGHT[question.difficulty] ?? 0,
      tieBreaker: stableHash(question.id, seed),
    }))
    .sort(
      (left, right) =>
        right.weaknessBoost - left.weaknessBoost ||
        left.difficultyWeight - right.difficultyWeight ||
        left.tieBreaker - right.tieBreaker ||
        left.question.id.localeCompare(right.question.id)
    )
    .slice(0, count)
    .map(({ question }) => question);
}

export function resolveCompatibleVotes(sideAVote, sideBVote) {
  if (sideAVote === 'draw' && sideBVote === 'draw') return 'draw';
  if (sideAVote === 'win' && sideBVote === 'loss') return 'side_a';
  if (sideAVote === 'loss' && sideBVote === 'win') return 'side_b';
  return null;
}

export function nextTradeoffPhase(currentPhase) {
  return TRADEOFF_NEXT_PHASE[currentPhase] ?? null;
}

export function canTransitionTradeoffPhase(currentPhase, requestedPhase) {
  if (requestedPhase === 'cancelled' && ['scheduled', 'check_in'].includes(currentPhase))
    return true;
  if (requestedPhase === 'review_required' && currentPhase === 'adjudicating') return true;
  if (requestedPhase === 'complete' && currentPhase === 'voting') return true;
  return nextTradeoffPhase(currentPhase) === requestedPhase;
}

export function phaseDeadline(startedAt, phase) {
  const duration = TRADEOFF_PHASE_DURATIONS_SECONDS[phase];
  if (duration === undefined) return null;
  return new Date(parseTimestamp(startedAt, 'startedAt') + duration * 1_000).toISOString();
}

export function mapBlitzRemediation({ isCorrect, misconceptionSeverity = 'clear' }) {
  if (isCorrect) {
    return { evidenceType: 'blitz_success', fsrsRating: null };
  }
  return {
    evidenceType: 'blitz_miss',
    fsrsRating: misconceptionSeverity === 'near_miss' ? 'hard' : 'again',
  };
}

export function mapTradeoffRemediation(evidenceStrength) {
  if (evidenceStrength === 'strong') return 'good';
  if (evidenceStrength === 'partial') return 'hard';
  if (evidenceStrength === 'missing' || evidenceStrength === 'incorrect') return 'again';
  return null;
}
