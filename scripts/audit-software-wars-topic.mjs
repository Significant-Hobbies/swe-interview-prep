import { readFileSync } from 'node:fs';
import {
  BLITZ_TOPICS,
  CONTENT_DIFFICULTIES,
} from '../shared/data/software-wars/authoring-schema.mjs';
import { blitzQuestions } from '../shared/data/software-wars/authored-banks.mjs';
import { validateSoftwareWarsContent } from '../shared/data/software-wars/validate-content.mjs';

const topic = process.argv[2];
if (!BLITZ_TOPICS.includes(topic)) {
  console.error(`Usage: node scripts/audit-software-wars-topic.mjs <${BLITZ_TOPICS.join('|')}>`);
  process.exitCode = 1;
} else {
  const conceptsDocument = JSON.parse(
    readFileSync(new URL('../src/data/concepts.json', import.meta.url), 'utf8')
  );
  const knownConceptIds = conceptsDocument.concepts.map(({ id }) => id);
  const questions = blitzQuestions
    .filter((question) => question.topic === topic)
    .map((question) => ({
      ...question,
      status: 'active',
      review: { reviewedBy: 'topic-editorial-audit', reviewedAt: '2026-08-13' },
    }));
  const opponent = {
    id: 'topic-audit@1',
    status: 'active',
    modelName: 'Topic audit fixture',
    modelSnapshot: '2026-08-13',
    publishedRating: 1500,
  };
  const validation = validateSoftwareWarsContent(
    {
      blitzQuestions: questions,
      tradeoffProblems: [],
      aiOpponents: [opponent],
      aiAnswers: questions.map((question) => ({
        aiOpponentId: opponent.id,
        questionId: question.id,
        selectedOptionId: question.correctOptionId,
        explanation: `Stored audit answer for ${question.contentKey}.`,
      })),
    },
    { knownConceptIds }
  );

  const difficulties = Object.fromEntries(
    CONTENT_DIFFICULTIES.map((difficulty) => [
      difficulty,
      questions.filter((question) => question.difficulty === difficulty).length,
    ])
  );
  const answerPositions = Object.fromEntries(
    ['a', 'b', 'c', 'd'].map((optionId) => [
      optionId,
      questions.filter(({ correctOptionId }) => correctOptionId === optionId).length,
    ])
  );
  const sourceUrls = new Set(questions.flatMap(({ sources }) => sources.map(({ url }) => url)));
  const expectedDifficulties = { foundation: 30, intermediate: 45, advanced: 25 };
  const auditErrors = [...validation.errors];
  if (questions.length !== 100) auditErrors.push(`${topic} requires exactly 100 questions`);
  for (const [difficulty, expected] of Object.entries(expectedDifficulties)) {
    if (difficulties[difficulty] !== expected) {
      auditErrors.push(
        `${topic}/${difficulty} requires ${expected}; found ${difficulties[difficulty]}`
      );
    }
  }
  if (Object.values(answerPositions).some((count) => count < 20 || count > 30)) {
    auditErrors.push(`${topic} has imbalanced answer positions ${JSON.stringify(answerPositions)}`);
  }
  if (sourceUrls.size < 8) {
    auditErrors.push(`${topic} requires at least 8 precise source URLs; found ${sourceUrls.size}`);
  }

  console.log(
    JSON.stringify(
      {
        topic,
        valid: auditErrors.length === 0,
        errors: auditErrors,
        report: {
          questions: questions.length,
          difficulties,
          answerPositions,
          concepts: new Set(questions.flatMap(({ conceptIds }) => conceptIds)).size,
          primaryConcepts: new Set(questions.map(({ primaryConceptId }) => primaryConceptId)).size,
          sourceUrls: sourceUrls.size,
          explainedOptions: questions
            .flatMap(({ options }) => options)
            .filter(({ explanation }) => explanation).length,
        },
      },
      null,
      2
    )
  );
  if (auditErrors.length > 0) process.exitCode = 1;
}
