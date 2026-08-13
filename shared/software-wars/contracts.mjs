export const WAR_MODES = Object.freeze(['blitz', 'tradeoff']);

export const BLITZ_QUEUE_TYPES = Object.freeze([
  'ranked_mix',
  'topic',
  'track',
  'roadmap',
  'concept',
  'ai',
  'ghost',
  'challenge',
  'rematch',
]);

export const WAR_MATCH_STATUSES = Object.freeze([
  'scheduled',
  'check_in',
  'active',
  'twist',
  'revision',
  'reveal',
  'debate',
  'voting',
  'adjudicating',
  'review_required',
  'complete',
  'cancelled',
  'abandoned',
]);

export const TRADEOFF_PHASES = Object.freeze([
  'scheduled',
  'check_in',
  'initial_solution',
  'twist',
  'revision',
  'reveal',
  'debate',
  'voting',
  'adjudicating',
  'complete',
  'review_required',
  'cancelled',
]);

export const WAR_VISIBILITIES = Object.freeze(['private', 'result', 'excerpt']);
export const WAR_OUTCOMES = Object.freeze(['win', 'loss', 'draw']);
export const TRADEOFF_VOTES = Object.freeze(['win', 'loss', 'draw']);
export const ARTIFACT_TYPES = Object.freeze(['text', 'code', 'schema', 'pseudocode', 'diagram']);

export const WAR_LIMITS = Object.freeze({
  blitzMinSeconds: 60,
  blitzMaxSeconds: 120,
  blitzMinQuestions: 5,
  blitzMaxQuestions: 10,
  artifactInlineBytes: 64 * 1024,
  artifactMaximumBytes: 2 * 1024 * 1024,
  publicArtifactExcerptCharacters: 1_500,
  reportDetailsCharacters: 2_000,
  idempotencyKeyCharacters: 128,
  realtimeTokenSeconds: 5 * 60,
});

export const WAR_RULES_VERSION = 'wars-rules-v1';
export const ELO_ALGORITHM_VERSION = 'elo-v1';

export function isWarMode(value) {
  return WAR_MODES.includes(value);
}

export function isTradeoffPhase(value) {
  return TRADEOFF_PHASES.includes(value);
}

export function success(data, meta) {
  return meta === undefined ? { ok: true, data } : { ok: true, data, meta };
}

export function failure(code, message, details) {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}
