import { describe, expect, it } from 'vitest';

import { DEFAULT_PROFILE } from './profile';
import { buildSessionPlan, dueReviewQuestions } from './planner';
import type { MasteryEntry } from '../hooks/useConcepts';
import { DEFAULT_USER_ELO } from './elo';
import type { GateContext } from './gates';

const emptyGate: GateContext = {
  mastery: {},
  getElo: () => DEFAULT_USER_ELO,
  artifacts: {},
  drills: {},
};

function mastery(confidence: number, due?: string): MasteryEntry {
  return {
    stability: 1,
    difficulty: 5,
    reps: 2,
    lapses: 0,
    state: 2,
    confidence,
    due: due ?? new Date(Date.now() - 86400000).toISOString(),
  };
}

describe('buildSessionPlan', () => {
  it('returns a session with blocks sized to profile minutes', () => {
    const plan = buildSessionPlan({
      profile: { ...DEFAULT_PROFILE, minutesPerDay: 45 },
      mastery: {},
      rqMastery: {},
      gateCtx: emptyGate,
      drillState: {},
      getElo: () => DEFAULT_USER_ELO,
    });
    expect(plan).not.toBeNull();
    expect(plan?.totalMinutes).toBe(45);
    expect(plan?.blocks.length).toBeGreaterThan(0);
    const blockMinutes = plan?.blocks.reduce((s, b) => s + b.minutes, 0);
    expect(blockMinutes).toBeGreaterThan(0);
    expect(blockMinutes).toBeLessThanOrEqual(50);
  });

  it('prioritizes due reviews in queue', () => {
    const m: Record<string, MasteryEntry> = {
      bm25: mastery(0.3),
    };
    const due = dueReviewQuestions({}, m);
    expect(due.length).toBeGreaterThan(0);
  });
});
