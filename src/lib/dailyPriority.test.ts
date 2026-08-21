import { describe, expect, it } from 'vitest';

import { CONCEPT_BY_ID, EDITORIAL_DRILLS, REVIEW_QUESTIONS, ROADMAPS } from '../data/learning-os';
import { DEFAULT_PROFILE } from './profile';
import { buildDailyLearningPriority } from './dailyPriority';
import type { SessionPlan } from './planner';
import type { DecisionReceiptV1 } from './learningEvidence';

function plan(reason: SessionPlan['selectionReason']): SessionPlan {
  const concept = CONCEPT_BY_ID['inference-engines'];
  const drill = EDITORIAL_DRILLS.find((candidate) => candidate.conceptId === concept.id)!;
  const review = REVIEW_QUESTIONS.find((candidate) => candidate.conceptId === concept.id)!;
  return {
    roadmap: ROADMAPS.find((roadmap) =>
      roadmap.milestones.some((milestone) => milestone.concepts.includes(concept.id))
    )!,
    concept,
    headline: concept.name,
    rationale: 'test',
    totalMinutes: 45,
    blocks: [
      { kind: 'learn', minutes: 10, title: 'Learn', href: `/concepts/${concept.id}` },
      { kind: 'drill', minutes: 20, title: drill.title, href: `/drills/${drill.id}` },
    ],
    reviewsDue: reason === 'retention' ? 1 : 0,
    reviewQueue: reason === 'retention' ? [review] : [],
    drill,
    artifact: null,
    selectionReason: reason,
    selectedAt: '2026-08-20T10:00:00.000Z',
  };
}

describe('daily learning priority', () => {
  it('answers a new learner honestly without claiming observed weakness', () => {
    const priority = buildDailyLearningPriority({
      plan: plan('progression'),
      profile: DEFAULT_PROFILE,
      mastery: {},
      drillState: {},
      now: new Date('2026-08-20T10:00:00.000Z'),
    });
    expect(priority.reason).toBe('new-learner');
    expect(priority.rationale).toMatch(/no learning evidence/i);
    expect(priority.objective).toContain('Inference Engines');
    expect(priority.action).toMatchObject({
      kind: 'concept',
      href: '/study/concept/inference-engines',
    });
  });

  it('recognizes completed focused study without claiming mastery', () => {
    const priority = buildDailyLearningPriority({
      plan: plan('progression'),
      profile: DEFAULT_PROFILE,
      mastery: {},
      drillState: {},
      focusedStudyDrafts: [
        {
          schemaVersion: 1,
          focusKind: 'concept',
          focusId: 'inference-engines',
          stage: 'explain',
          retrieval: 'Prefill and decode stress different hardware paths.',
          application: 'Measure both phases separately under declared concurrency.',
          explanation: 'The bottleneck changes because arithmetic intensity changes by phase.',
          completedAt: '2026-08-20T09:30:00.000Z',
          updatedAt: '2026-08-20T09:30:00.000Z',
        },
      ],
      now: new Date('2026-08-20T10:00:00.000Z'),
    });
    expect(priority.reason).toBe('progression');
    expect(priority.conceptId).toBe('inference-engines');
    expect(priority.rationale).toMatch(/mastery explain-back remains pending/i);
    expect(priority.rationale).not.toMatch(/no learning evidence/i);
  });

  it('never lets a paper or lab displace urgent review', () => {
    const priority = buildDailyLearningPriority({
      plan: plan('retention'),
      profile: DEFAULT_PROFILE,
      mastery: {
        'inference-engines': {
          stability: 1,
          difficulty: 5,
          reps: 2,
          lapses: 0,
          state: 2,
          confidence: 0.2,
          due: '2026-08-19T10:00:00.000Z',
        },
      },
      drillState: {},
      now: new Date('2026-08-20T10:00:00.000Z'),
    });
    expect(priority.action.kind).toBe('review');
    expect(priority.reason).toBe('retention');
  });

  it('advances past a verified lab receipt with otherwise identical state', () => {
    const base = {
      plan: plan('progression'),
      profile: DEFAULT_PROFILE,
      mastery: {
        'inference-engines': {
          stability: 1,
          difficulty: 5,
          reps: 1,
          lapses: 0,
          state: 1,
          confidence: 0.5,
        },
      },
      drillState: {},
      now: new Date('2026-08-20T10:00:00.000Z'),
    };
    expect(buildDailyLearningPriority(base).action.kind).toBe('decision-lab');

    const receipt: DecisionReceiptV1 = {
      schemaVersion: 1,
      id: 'receipt-1',
      accountScope: 'owner',
      labId: 'inference-capacity',
      definitionVersion: 1,
      conceptIds: ['inference-engines'],
      inputs: {},
      derived: {},
      prediction: 'Memory binds.',
      conclusion: 'Reduce concurrency.',
      mitigation: 'Reduce concurrency.',
      counterfactual: 'Shorter context fits.',
      verificationMetric: 'Peak allocated bytes.',
      evidenceState: 'verified',
      masteryStatus: 'applied',
      createdAt: '2026-08-20T09:00:00.000Z',
    };
    expect(buildDailyLearningPriority({ ...base, decisionReceipts: [receipt] }).action.kind).toBe(
      'paper'
    );
  });

  it('is deterministic for unchanged state and injected time', () => {
    const args = {
      plan: plan('progression'),
      profile: DEFAULT_PROFILE,
      mastery: {},
      drillState: {},
      now: new Date('2026-08-20T10:00:00.000Z'),
    };
    expect(buildDailyLearningPriority(args)).toEqual(buildDailyLearningPriority(args));
  });
});
