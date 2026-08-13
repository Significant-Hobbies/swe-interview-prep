import { contentVersionId, defineBlitzQuestion } from './authoring-schema.mjs';

export function compileAuthoredQuestion(question, lifecycle = {}) {
  if (!question.primaryConceptId) {
    throw new Error(`${question.contentKey ?? 'unknown'} requires an explicit primaryConceptId`);
  }
  const options = question.options.map((option) => Object.freeze({ ...option }));
  const correctOption = options.find(({ id }) => id === question.correctOptionId);
  return defineBlitzQuestion({
    id: contentVersionId(question.contentKey, 1),
    contentKey: question.contentKey,
    version: 1,
    status: lifecycle.status ?? 'reviewed',
    topic: question.topic,
    difficulty: question.difficulty,
    primaryConceptId: question.primaryConceptId,
    conceptIds: Object.freeze([...question.conceptIds]),
    sources: Object.freeze(question.sources.map((source) => Object.freeze({ ...source }))),
    review: Object.freeze({
      reviewedBy: lifecycle.reviewedBy ?? 'software-wars-candidate-structural-gate-v2',
      reviewedAt: '2026-08-13',
    }),
    stem: question.stem,
    options: Object.freeze(options),
    correctOptionId: question.correctOptionId,
    explanation: correctOption?.explanation ?? '',
  });
}

export function compileAuthoredBank(questions, lifecycle) {
  return Object.freeze(questions.map((question) => compileAuthoredQuestion(question, lifecycle)));
}
