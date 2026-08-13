import { describe, expect, it } from 'vitest';
import { compileAuthoredQuestion } from './authored-question.mjs';

describe('authored Software Wars questions', () => {
  it('keeps option reasoning server-side and derives the summary from the keyed option', () => {
    const question = compileAuthoredQuestion({
      contentKey: 'transaction-retry-boundary',
      topic: 'databases',
      difficulty: 'intermediate',
      primaryConceptId: 'transaction-processing',
      conceptIds: ['transaction-processing'],
      sources: [
        {
          title: 'PostgreSQL transaction isolation',
          url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
          kind: 'authoritative',
        },
      ],
      stem: 'Which retry boundary preserves the whole transaction?',
      options: [
        {
          id: 'a',
          label: 'One statement',
          explanation: 'A statement retry loses transaction context.',
        },
        { id: 'b', label: 'The whole transaction', explanation: 'Retry the complete transaction.' },
        {
          id: 'c',
          label: 'One network write',
          explanation: 'A network write is not the transaction boundary.',
        },
        {
          id: 'd',
          label: 'No retry',
          explanation: 'Serializable failures are explicitly retryable.',
        },
      ],
      correctOptionId: 'b',
    });

    expect(question.id).toBe('transaction-retry-boundary@1');
    expect(question.variantKey).toBeUndefined();
    expect(question.primaryConceptId).toBe('transaction-processing');
    expect(question.explanation).toBe('Retry the complete transaction.');
    expect(question.options.every(({ explanation }) => explanation.length > 0)).toBe(true);
  });

  it('requires authors to choose a canonical primary concept explicitly', () => {
    expect(() =>
      compileAuthoredQuestion({
        contentKey: 'missing-primary-concept',
        conceptIds: ['transaction-processing'],
        options: [],
      })
    ).toThrow(/requires an explicit primaryConceptId/);
  });
});
