import { describe, expect, it } from 'vitest';

import { blendRoadmapWeights } from './companies';

describe('blendRoadmapWeights', () => {
  it('merges company preset into profile weights', () => {
    const merged = blendRoadmapWeights(
      { 'ai-search-infra-90-day': 1 },
      'openai',
    );
    expect(merged['ai-search-infra-90-day']).toBeGreaterThan(1);
    expect(merged['prob-stats-30d']).toBeGreaterThan(0);
  });

  it('returns profile weights when general', () => {
    const w = { 'reset-9-day': 1 };
    expect(blendRoadmapWeights(w, null)).toEqual(w);
    expect(blendRoadmapWeights(w, 'general')).toEqual(w);
  });
});