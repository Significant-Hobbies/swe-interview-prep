import { describe, expect, it } from 'vitest';

import { DEFAULT_PROFILE } from './profile';
import { buildHorizonCalendar } from './horizonCalendar';

describe('buildHorizonCalendar', () => {
  it('returns empty without horizon', () => {
    expect(buildHorizonCalendar({
      profile: DEFAULT_PROFILE,
      mastery: {},
      rqMastery: {},
      drillState: {},
    })).toEqual([]);
  });

  it('builds days when horizon set', () => {
    const days = buildHorizonCalendar({
      profile: { ...DEFAULT_PROFILE, interviewHorizonDays: 21 },
      mastery: {},
      rqMastery: {},
      drillState: {},
      maxDays: 5,
    });
    expect(days).toHaveLength(5);
    expect(days[0].dayOffset).toBe(0);
    expect(days[0].minutes).toBe(DEFAULT_PROFILE.minutesPerDay);
  });
});