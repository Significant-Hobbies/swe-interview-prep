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

describe('optional sanitized role focus', () => {
  it('keeps legacy profiles valid without re-triggering onboarding', () => {
    const legacy: LearnerProfile = { ...DEFAULT_PROFILE };
    expect(legacy.roleFocus).toBeUndefined();
    expect(legacy.onboardingVersion).toBe(PROFILE_VERSION);
  });

  it('round-trips canonical role metadata without a raw job description field', () => {
    const profile: LearnerProfile = {
      ...DEFAULT_PROFILE,
      roleFocus: {
        roleTitle: 'Backend Engineer',
        targetConceptIds: ['idempotency'],
        supportingConceptIds: ['http-lifecycle'],
        roadmapWeights: { 'distributed-systems-12w': 1 },
        trackIds: ['backend'],
        sourceFingerprint: 'rf-deadbeef',
        createdAt: '2026-08-26T00:00:00.000Z',
        updatedAt: '2026-08-26T00:00:00.000Z',
      },
    };
    expect(JSON.parse(JSON.stringify(profile)).roleFocus.targetConceptIds).toEqual(['idempotency']);
    expect(JSON.stringify(profile)).not.toContain('jobDescription');
  });
});
