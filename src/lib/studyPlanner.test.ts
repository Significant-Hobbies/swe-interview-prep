import { describe, expect,it } from 'vitest';

import type { Concept, MasteryEntry } from '../hooks/useConcepts';
import { buildWeaknessStudyPlan } from './studyPlanner';

const concepts: Concept[] = [
  {
    id: 'arrays',
    name: 'Arrays',
    category: 'dsa',
    prereqs: [],
    description: 'Array basics',
  },
  {
    id: 'graphs',
    name: 'Graphs',
    category: 'dsa',
    prereqs: ['arrays'],
    description: 'Traversal',
  },
  {
    id: 'caching',
    name: 'Caching',
    category: 'hld',
    prereqs: [],
    description: 'Cache tradeoffs',
  },
];

function mastery(confidence: number, due: string | null = '2026-01-01T00:00:00.000Z'): MasteryEntry {
  return {
    stability: 1,
    difficulty: 5,
    reps: 2,
    lapses: 0,
    state: 1,
    confidence,
    due,
    lastReview: '2026-01-01T00:00:00.000Z',
  };
}

describe('buildWeaknessStudyPlan', () => {
  it('prioritizes ready weak concepts over strong concepts', () => {
    const plan = buildWeaknessStudyPlan(
      concepts,
      {
        arrays: mastery(0.92, '2026-12-01T00:00:00.000Z'),
        graphs: mastery(0.18),
        caching: mastery(0.75, '2026-12-01T00:00:00.000Z'),
      },
      new Date('2026-05-08T00:00:00.000Z'),
    );

    expect(plan.focus[0].concept.id).toBe('graphs');
    expect(plan.focus[0].taskType).toBe('explain');
    expect(plan.summary.readyWeaknesses).toBeGreaterThan(0);
  });

  it('penalizes concepts whose reviewed prereqs are still weak', () => {
    const plan = buildWeaknessStudyPlan(
      concepts,
      {
        arrays: mastery(0.2),
        graphs: mastery(0.1),
        caching: mastery(0.3),
      },
      new Date('2026-05-08T00:00:00.000Z'),
    );

    expect(plan.focus[0].concept.id).toBe('arrays');
    expect(plan.focus.findIndex(item => item.concept.id === 'graphs')).toBeGreaterThan(
      plan.focus.findIndex(item => item.concept.id === 'caching'),
    );
    expect(plan.focus.find(item => item.concept.id === 'graphs')?.blockedBy).toEqual(['arrays']);
    expect(plan.summary.blockedWeaknesses).toBe(1);
  });

  it('creates a concrete short schedule from the focus set', () => {
    const plan = buildWeaknessStudyPlan(
      concepts,
      {
        arrays: mastery(0.95, '2026-12-01T00:00:00.000Z'),
      },
      new Date('2026-05-08T00:00:00.000Z'),
    );

    expect(plan.summary.untouched).toBe(2);
    expect(plan.schedule.length).toBeGreaterThan(0);
    expect(plan.schedule[0].label).toBe('Today');
    expect(plan.schedule[0].item.prompt.length).toBeGreaterThan(20);
  });
});
