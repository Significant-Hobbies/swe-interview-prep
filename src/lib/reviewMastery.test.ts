import { describe, expect, it } from 'vitest';

import type { ReviewQuestion } from '../data/learning-os';
import { sortReviewQueue } from './reviewMastery';

const qs: ReviewQuestion[] = [
  { id: 'a', conceptId: 'c1', type: 'recall', difficulty: 'core', question: 'q1', answer: 'a1' },
  { id: 'b', conceptId: 'c1', type: 'recall', difficulty: 'core', question: 'q2', answer: 'a2' },
  { id: 'c', conceptId: 'c2', type: 'recall', difficulty: 'core', question: 'q3', answer: 'a3' },
];

describe('sortReviewQueue', () => {
  it('interleaves same-concept cards', () => {
    const sorted = sortReviewQueue(qs, {}, { c1: { confidence: 0.2 } as never, c2: { confidence: 0.8 } as never });
    expect(sorted[0].conceptId).not.toBe(sorted[1]?.conceptId);
  });

  it('prioritizes lower confidence concepts', () => {
    const sorted = sortReviewQueue(
      [{ id: 'x', conceptId: 'weak', type: 'recall', difficulty: 'core', question: 'q', answer: 'a' },
        { id: 'y', conceptId: 'strong', type: 'recall', difficulty: 'core', question: 'q', answer: 'a' }],
      {},
      { weak: { confidence: 0.1 } as never, strong: { confidence: 0.9 } as never },
    );
    expect(sorted[0].conceptId).toBe('weak');
  });
});