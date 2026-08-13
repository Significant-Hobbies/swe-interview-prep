export const CONTENT_LIFECYCLE = Object.freeze(['draft', 'reviewed', 'active', 'retired']);
export const CONTENT_DIFFICULTIES = Object.freeze(['foundation', 'intermediate', 'advanced']);
export const BLITZ_TOPICS = Object.freeze([
  'apis',
  'caching-performance',
  'complexity-debugging',
  'concurrency',
  'databases',
  'distributed-systems',
  'infrastructure-cloud',
  'messaging-streaming',
  'networking',
  'observability-reliability',
  'operating-systems-runtime',
  'security',
]);

export const RANKED_LAUNCH_MINIMUMS = Object.freeze({
  distinctBlitzQuestions: 1_200,
  blitzQuestionsPerTopic: 100,
  blitzQuestionsPerDifficultyPerTopic: Object.freeze({
    foundation: 30,
    intermediate: 45,
    advanced: 25,
  }),
  tradeoffProblems: 20,
});

export function contentVersionId(contentKey, version, variantKey) {
  const suffix = variantKey === undefined ? '' : `:${variantKey}`;
  return `${contentKey}@${version}${suffix}`;
}

export function authoritativeSource(title, url) {
  return Object.freeze({ title, url, kind: 'authoritative' });
}

export function defineBlitzQuestion(question) {
  return Object.freeze({ type: 'blitz_question', ...question });
}

export function defineTradeoffProblem(problem) {
  return Object.freeze({ type: 'tradeoff_problem', ...problem });
}

export function defineAiOpponent(opponent) {
  return Object.freeze({ type: 'ai_opponent', ...opponent });
}

export function defineAiAnswer(answer) {
  return Object.freeze({ type: 'ai_answer', ...answer });
}
