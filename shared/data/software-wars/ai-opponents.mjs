import { defineAiAnswer, defineAiOpponent } from './authoring-schema.mjs';
import { blitzQuestions } from './authored-banks.mjs';

const benchmarkProfiles = [
  {
    id: 'cloudflare-backend-sparring@1',
    profileKey: 'cloudflare-backend-sparring',
    version: 1,
    displayName: 'Backend Sparring Bot',
    provider: 'fixture',
    modelName: 'Deterministic Backend Baseline',
    modelSnapshot: '2026-08-13',
    benchmarkVersion: 'software-wars-1200-v3',
    publishedRating: 1425,
    correctModulo: 5,
    correctThreshold: 3,
  },
  {
    id: 'cloudflare-systems-challenger@1',
    profileKey: 'cloudflare-systems-challenger',
    version: 1,
    displayName: 'Systems Challenger',
    provider: 'fixture',
    modelName: 'Deterministic Systems Challenger',
    modelSnapshot: '2026-08-13',
    benchmarkVersion: 'software-wars-1200-v3',
    publishedRating: 1675,
    correctModulo: 6,
    correctThreshold: 5,
  },
  {
    id: 'cloudflare-architecture-boss@1',
    profileKey: 'cloudflare-architecture-boss',
    version: 1,
    displayName: 'Architecture Boss',
    provider: 'fixture',
    modelName: 'Deterministic Architecture Benchmark',
    modelSnapshot: '2026-08-13',
    benchmarkVersion: 'software-wars-1200-v3',
    publishedRating: 1925,
    correctModulo: 10,
    correctThreshold: 9,
  },
];

function numericSeed(questionId, profileIndex) {
  let value = profileIndex + 17;
  for (const character of questionId) value = (value * 33 + character.charCodeAt(0)) >>> 0;
  return value;
}

function selectStoredAnswer(question, profile, profileIndex) {
  const seed = numericSeed(question.id, profileIndex);
  const isCorrect = seed % profile.correctModulo < profile.correctThreshold;
  const selectedOptionId = isCorrect
    ? question.correctOptionId
    : question.options.find(({ id }) => id !== question.correctOptionId).id;
  return defineAiAnswer({
    id: `${profile.id}:${question.id}`,
    aiOpponentId: profile.id,
    questionId: question.id,
    selectedOptionId,
    explanation: isCorrect
      ? `Benchmark snapshot selected the documented invariant: ${question.explanation}`
      : 'Benchmark snapshot selected a stored distractor; no model inference is performed during a match.',
    benchmarkVersion: profile.benchmarkVersion,
  });
}

export const aiAnswers = Object.freeze(
  benchmarkProfiles.flatMap((profile, profileIndex) =>
    blitzQuestions
      .filter(({ status }) => status === 'active')
      .map((question) => selectStoredAnswer(question, profile, profileIndex))
  )
);

export const aiOpponents = Object.freeze(
  benchmarkProfiles.map((profile) => {
    const answers = aiAnswers.filter(({ aiOpponentId }) => aiOpponentId === profile.id);
    const correctCount = answers.filter((answer) => {
      const question = blitzQuestions.find(
        ({ id, status }) => id === answer.questionId && status === 'active'
      );
      return question.correctOptionId === answer.selectedOptionId;
    }).length;
    return defineAiOpponent({
      id: profile.id,
      profileKey: profile.profileKey,
      version: profile.version,
      status: 'active',
      displayName: profile.displayName,
      provider: profile.provider,
      modelName: profile.modelName,
      modelSnapshot: profile.modelSnapshot,
      benchmarkVersion: profile.benchmarkVersion,
      publishedRating: profile.publishedRating,
      accuracy: correctCount / answers.length,
      answeredQuestionCount: answers.length,
      runPolicy: 'precomputed-no-match-time-inference',
    });
  })
);
