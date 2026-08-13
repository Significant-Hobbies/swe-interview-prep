import { describe, expect, it } from 'vitest';
import { validateSoftwareWarsContent } from './validate-content.mjs';

function validQuestion(overrides = {}) {
  return {
    id: 'question@1',
    contentKey: 'question',
    version: 1,
    status: 'active',
    topic: 'databases',
    difficulty: 'foundation',
    primaryConceptId: 'b-tree',
    conceptIds: ['b-tree'],
    sources: [
      {
        title: 'PostgreSQL docs',
        url: 'https://www.postgresql.org/docs/current/btree.html',
        kind: 'authoritative',
      },
    ],
    review: { reviewedBy: 'editorial-v1', reviewedAt: '2026-08-13' },
    stem: 'Which option is correct?',
    options: [
      { id: 'a', label: 'A', explanation: 'A conflicts with the documented invariant.' },
      { id: 'b', label: 'B', explanation: 'B follows from the documented invariant.' },
      { id: 'c', label: 'C', explanation: 'C describes a different mechanism.' },
    ],
    correctOptionId: 'b',
    explanation: 'B follows from the documented invariant.',
    ...overrides,
  };
}

const opponent = {
  id: 'bot@1',
  status: 'active',
  modelName: 'Deterministic Baseline',
  modelSnapshot: 'v1',
  publishedRating: 1500,
};

describe('Software Wars content validator', () => {
  it('accepts a complete source-backed version with AI coverage', () => {
    const content = {
      blitzQuestions: [validQuestion()],
      tradeoffProblems: [],
      aiOpponents: [opponent],
      aiAnswers: [
        {
          aiOpponentId: opponent.id,
          questionId: 'question@1',
          selectedOptionId: 'b',
          explanation: 'Stored benchmark answer.',
        },
      ],
    };
    expect(validateSoftwareWarsContent(content, { knownConceptIds: ['b-tree'] })).toMatchObject({
      valid: true,
      report: { activeBlitzQuestions: 1, aiAnswers: 1 },
    });
  });

  it('rejects ambiguity, leaked lifecycle gaps, and incomplete AI coverage', () => {
    const question = validQuestion({
      options: [
        { id: 'a', label: 'Same', explanation: '' },
        { id: 'b', label: 'Same', explanation: 'Duplicate label.' },
        { id: 'c', label: 'Other', explanation: 'Different but not keyed.' },
      ],
      correctOptionId: 'missing',
      review: undefined,
    });
    const result = validateSoftwareWarsContent(
      { blitzQuestions: [question], tradeoffProblems: [], aiOpponents: [opponent], aiAnswers: [] },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/review evidence/);
    expect(result.errors.join(' ')).toMatch(/duplicate options/);
    expect(result.errors.join(' ')).toMatch(/defensible option key/);
    expect(result.errors.join(' ')).toMatch(/option explanation/);
    expect(result.errors.join(' ')).toMatch(/Missing AI coverage/);
  });

  it('rejects generic or repeated option reasoning', () => {
    const question = validQuestion({
      options: [
        { id: 'a', label: 'A', explanation: 'This is wrong' },
        {
          id: 'b',
          label: 'B',
          explanation: 'This answer follows the documented invariant exactly.',
        },
        {
          id: 'c',
          label: 'C',
          explanation: 'This answer follows the documented invariant exactly.',
        },
      ],
    });
    const result = validateSoftwareWarsContent(
      { blitzQuestions: [question], tradeoffProblems: [], aiOpponents: [], aiAnswers: [] },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result.errors.join(' ')).toMatch(/generic option explanation/);
    expect(result.errors.join(' ')).toMatch(/repeats an option explanation/);
  });

  it('rejects known Cartesian stems and templated distractor reasoning', () => {
    const question = validQuestion({
      stem: 'A production system requires mutual exclusion for lock-free progress. Which mechanism is direct?',
      options: [
        {
          id: 'a',
          label: 'Mutex',
          explanation:
            'Mutex is the direct mechanism for the stated production requirement in this scenario.',
        },
        {
          id: 'b',
          label: 'Atomic compare-and-swap',
          explanation:
            'This choice concerns another mechanism and does not establish the requested behavior.',
        },
        {
          id: 'c',
          label: 'Queue',
          explanation: 'A queue orders work but does not make progress lock-free.',
        },
      ],
    });
    const result = validateSoftwareWarsContent(
      { blitzQuestions: [question], tradeoffProblems: [], aiOpponents: [], aiAnswers: [] },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result.errors.join(' ')).toMatch(/rejected Cartesian question template/);
    expect(result.errors.join(' ')).toMatch(/rejected templated reasoning/);
  });

  it('requires a canonical primary concept and text-only answer choices', () => {
    const question = validQuestion({
      primaryConceptId: 'missing-concept',
      options: [
        {
          id: 'a',
          label: '```js\nreturn true;\n```',
          explanation: 'This code block is deliberately invalid as a Blitz answer choice.',
        },
        {
          id: 'b',
          label: 'Use the documented invariant',
          explanation: 'This concise text answer follows the documented invariant.',
        },
        {
          id: 'c',
          label: 'Use a different mechanism',
          explanation: 'This mechanism addresses a different documented constraint.',
        },
      ],
    });
    const result = validateSoftwareWarsContent(
      { blitzQuestions: [question], tradeoffProblems: [], aiOpponents: [], aiAnswers: [] },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result.errors.join(' ')).toMatch(/canonical primary concept/);
    expect(result.errors.join(' ')).toMatch(/code block as an answer option/);
  });

  it('counts authored questions separately from generated variants', () => {
    const base = validQuestion();
    const variant = validQuestion({
      id: 'question@1:v02',
      variantKey: 'v02',
      stem: 'Which documented choice remains correct for seed two?',
      generator: { id: 'fixture-v1', seed: 2, verification: 'bounded-fixture-v1' },
    });
    const aiAnswers = [base, variant].map((question) => ({
      aiOpponentId: opponent.id,
      questionId: question.id,
      selectedOptionId: question.correctOptionId,
      explanation: 'Stored benchmark answer.',
    }));
    const result = validateSoftwareWarsContent(
      {
        blitzQuestions: [base, variant],
        tradeoffProblems: [],
        aiOpponents: [opponent],
        aiAnswers,
      },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result).toMatchObject({
      valid: true,
      report: {
        activeBlitzQuestions: 2,
        distinctAuthoredBlitzQuestions: 1,
        generatedBlitzVariants: 1,
        optionsWithExplanations: 6,
      },
    });
  });

  it('rejects duplicate normalized stems and duplicate option sets', () => {
    const first = validQuestion();
    const second = validQuestion({
      id: 'other-question@1',
      contentKey: 'other-question',
      stem: 'Which OPTION is correct?!',
    });
    const result = validateSoftwareWarsContent(
      {
        blitzQuestions: [first, second],
        tradeoffProblems: [],
        aiOpponents: [],
        aiAnswers: [],
      },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result.errors.join(' ')).toMatch(/Duplicate normalized stem/);
    expect(result.errors.join(' ')).toMatch(/Duplicate option set/);
  });

  it('rejects reused explanations across different active questions', () => {
    const repeated =
      'This exact rationale is suspicious when it appears under two unrelated questions.';
    const first = validQuestion({
      options: [
        { id: 'a', label: 'A', explanation: repeated },
        { id: 'b', label: 'B', explanation: 'The keyed choice follows the first invariant.' },
        { id: 'c', label: 'C', explanation: 'This choice violates the first invariant.' },
      ],
    });
    const second = validQuestion({
      id: 'second-question@1',
      contentKey: 'second-question',
      stem: 'Which second option satisfies the documented behavior?',
      options: [
        { id: 'a', label: 'D', explanation: repeated },
        { id: 'b', label: 'E', explanation: 'The keyed choice follows the second invariant.' },
        { id: 'c', label: 'F', explanation: 'This choice violates the second invariant.' },
      ],
    });
    const result = validateSoftwareWarsContent(
      {
        blitzQuestions: [first, second],
        tradeoffProblems: [],
        aiOpponents: [],
        aiAnswers: [],
      },
      { knownConceptIds: ['b-tree'] }
    );
    expect(result.errors.join(' ')).toMatch(/Repeated option explanation/);
  });

  it('enforces ranked launch thresholds separately from preview validation', () => {
    const content = { blitzQuestions: [], tradeoffProblems: [], aiOpponents: [], aiAnswers: [] };
    expect(validateSoftwareWarsContent(content).valid).toBe(true);
    const ranked = validateSoftwareWarsContent(content, { enforceLaunchThresholds: true });
    expect(ranked.valid).toBe(false);
    expect(ranked.errors.join(' ')).toMatch(/1200 distinct active questions/);
    expect(ranked.errors.join(' ')).toMatch(/topic apis requires 100/);
    expect(ranked.errors.join(' ')).toMatch(/20 active problems/);
  });
});
