import { aiAnswers, aiOpponents } from './ai-opponents.mjs';
import { blitzQuestions } from './authored-banks.mjs';
import { tradeoffProblems } from './tradeoff-problems.mjs';
import {
  buildWarsCurriculumManifest,
  findCanonicalConcept,
  resolveWarsQueueConceptIds,
} from './curriculum.mjs';

export {
  aiAnswers,
  aiOpponents,
  blitzQuestions,
  buildWarsCurriculumManifest,
  resolveWarsQueueConceptIds,
  tradeoffProblems,
};

export function loadSoftwareWarsContent() {
  return Object.freeze({
    blitzQuestions,
    tradeoffProblems,
    aiOpponents,
    aiAnswers,
  });
}

export function loadActiveBlitzQuestions() {
  return blitzQuestions.filter((question) => question.status === 'active');
}

export function loadActiveTradeoffProblems() {
  return tradeoffProblems.filter((problem) => problem.status === 'active');
}

export function findBlitzQuestion(contentVersionId) {
  return blitzQuestions.find((question) => question.id === contentVersionId) ?? null;
}

export function findTradeoffProblem(contentVersionId) {
  return tradeoffProblems.find((problem) => problem.id === contentVersionId) ?? null;
}

export function safeBlitzQuestion(question, position) {
  const concept = findCanonicalConcept(question.primaryConceptId);
  return {
    id: question.id,
    position,
    stem: question.stem,
    options: question.options.map(({ id, label }) => ({ id, label })),
    topic: question.topic,
    difficulty: question.difficulty,
    primaryConcept: {
      id: question.primaryConceptId,
      name: concept?.name ?? question.primaryConceptId,
      learnPath: `/concepts/${encodeURIComponent(question.primaryConceptId)}`,
    },
  };
}
