import { describe, expect, it } from 'vitest';

import { MOCK_PROMPTS } from '../data/mock-prompts';
import { mockRatingFromRubric, mocksForConcept, recommendMockPrompts } from './mockRecommend';
import { DEFAULT_PROFILE } from './profile';

describe('mockRecommend', () => {
  it('finds mocks tagged to a concept', () => {
    const hits = mocksForConcept('array-hashing');
    expect(hits.some((p) => p.id === 'mock-two-sum-variants')).toBe(true);
  });

  it('prioritizes weak concepts', () => {
    const rec = recommendMockPrompts(
      DEFAULT_PROFILE,
      { 'array-hashing': { confidence: 0.2 } as any },
      5
    );
    expect(rec.length).toBeGreaterThan(0);
    expect(rec.some((p) => p.conceptIds?.includes('array-hashing'))).toBe(true);
  });

  it('maps rubric coverage to FSRS-style ratings', () => {
    expect(mockRatingFromRubric(4, 4)).toBe('easy');
    expect(mockRatingFromRubric(2, 4)).toBe('hard');
    expect(mockRatingFromRubric(0, 4)).toBe('again');
  });

  it('every mock with conceptIds references real prompts', () => {
    const withConcepts = MOCK_PROMPTS.filter((p) => p.conceptIds?.length);
    expect(withConcepts.length).toBeGreaterThan(3);
  });
});
