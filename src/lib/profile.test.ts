import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PROFILE,
  type LearnerProfile,
  PROFILE_VERSION,
  primaryRoadmapId,
  trackFilter,
} from './profile';

describe('profile v4 track selection', () => {
  it('defaults to no track filter, i.e. every track', () => {
    expect(PROFILE_VERSION).toBe(4);
    expect(DEFAULT_PROFILE.trackIds).toEqual([]);
    expect(trackFilter(DEFAULT_PROFILE)).toBeNull();
  });

  it('migrates a v3 profile without trackIds to "all tracks"', () => {
    const v3 = { experience: 'mid', onboardingVersion: 3 } as Partial<LearnerProfile>;
    const migrated: LearnerProfile = { ...DEFAULT_PROFILE, ...v3 };
    expect(migrated.trackIds).toEqual([]);
    expect(trackFilter(migrated)).toBeNull();
  });

  it('builds a set once tracks are chosen', () => {
    const filter = trackFilter({ trackIds: ['dsa', 'backend'] });
    expect(filter?.has('dsa')).toBe(true);
    expect(filter?.has('mathematics')).toBe(false);
  });
});

describe('primaryRoadmapId', () => {
  it('picks the heaviest roadmap', () => {
    expect(primaryRoadmapId({ ...DEFAULT_PROFILE, roadmapWeights: { a: 0.2, b: 0.8 } })).toBe('b');
  });

  it('falls back when weights are empty', () => {
    expect(primaryRoadmapId({ ...DEFAULT_PROFILE, roadmapWeights: {} })).toBe(
      'ai-search-infra-90-day'
    );
  });
});
