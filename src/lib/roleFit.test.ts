import { describe, expect, it } from 'vitest';

import type { RoleFitAnalysis } from '../../shared/lib/role-fit.mjs';
import type { MasteryEntry } from '../hooks/useConcepts';
import {
  buildActiveRolePlan,
  buildRoleFitPlan,
  buildRoleFocus,
  roleFocusMatchesPlan,
} from './roleFit';

const analysis: RoleFitAnalysis = {
  roleTitle: 'Senior Platform Engineer',
  summary: 'A platform role centered on reliable distributed workflows.',
  requirements: [
    {
      id: 'requirement-1',
      label: 'Idempotent APIs',
      importance: 'must',
      sourcePhrase: 'idempotent APIs',
      conceptIds: ['idempotency'],
      confidence: 0.95,
      rationale: 'Direct match.',
    },
    {
      id: 'requirement-2',
      label: 'Distributed consensus',
      importance: 'preferred',
      sourcePhrase: 'distributed consensus',
      conceptIds: ['consensus'],
      confidence: 0.9,
      rationale: 'Direct match.',
    },
  ],
  unsupported: [],
};

function mastery(partial: Partial<MasteryEntry>): MasteryEntry {
  return {
    stability: 30,
    difficulty: 5,
    reps: 2,
    lapses: 0,
    state: 2,
    confidence: 0.9,
    ...partial,
  };
}

describe('role-fit deterministic planning', () => {
  it('expands prerequisites without letting the model invent plan ids', () => {
    const plan = buildRoleFitPlan(analysis, {}, {});
    expect(plan.targetConceptIds).toEqual(expect.arrayContaining(['idempotency', 'consensus']));
    expect(plan.supportingConceptIds).toEqual(
      expect.arrayContaining(['http-lifecycle', 'replication'])
    );
  });

  it('separates demonstrated, weak, and unassessed concepts from local evidence', () => {
    const plan = buildRoleFitPlan(
      analysis,
      { idempotency: mastery({}) },
      { consensus: 'fuzzy' },
      new Date('2026-08-26T00:00:00.000Z')
    );
    expect(plan.demonstrated.map((item) => item.conceptId)).toContain('idempotency');
    expect(plan.learn.map((item) => item.conceptId)).toContain('consensus');
    expect(plan.verify.map((item) => item.conceptId)).toEqual(
      expect.arrayContaining(['http-lifecycle', 'replication'])
    );
  });

  it('derives a bounded roadmap and track bias from direct matches', () => {
    const plan = buildRoleFitPlan(analysis, {}, {});
    expect(Object.keys(plan.roadmapWeights).length).toBeLessThanOrEqual(4);
    expect(Object.values(plan.roadmapWeights).reduce((sum, value) => sum + value, 0)).toBeCloseTo(
      1
    );
    expect(plan.trackIds).toEqual(expect.arrayContaining(['backend', 'distributed-systems']));
  });
});

describe('sanitized role focus', () => {
  it('persists canonical ids and a fingerprint, never the submitted text', () => {
    const plan = buildRoleFitPlan(analysis, {}, {});
    const jobDescription = 'We need idempotent APIs and distributed consensus experience.';
    const focus = buildRoleFocus(
      analysis,
      plan,
      jobDescription,
      undefined,
      new Date('2026-08-26T10:00:00.000Z')
    );
    expect(focus.sourceFingerprint).toMatch(/^rf-/);
    expect(JSON.stringify(focus)).not.toContain(jobDescription);
    expect(focus.targetConceptIds).toEqual(plan.targetConceptIds);
  });

  it('reconstructs an actionable saved plan from canonical ids and current evidence', () => {
    const plan = buildRoleFitPlan(analysis, {}, {});
    const focus = buildRoleFocus(
      analysis,
      plan,
      'We need idempotent APIs and distributed consensus experience.',
      undefined,
      new Date('2026-08-26T10:00:00.000Z')
    );
    const active = buildActiveRolePlan(
      focus,
      {},
      { idempotency: 'fuzzy' },
      new Date('2026-08-26T10:00:00.000Z')
    );

    expect(active.learn.map((item) => item.conceptId)).toContain('idempotency');
    expect(active.verify.some((item) => item.source === 'active-role')).toBe(true);
    expect(active.targetConceptIds).toEqual(focus.targetConceptIds);
    expect(active.roadmapWeights).toEqual(focus.roadmapWeights);
  });

  it('drops stale ids that no longer exist in the catalog', () => {
    const plan = buildRoleFitPlan(analysis, {}, {});
    const focus = buildRoleFocus(
      analysis,
      plan,
      'We need idempotent APIs and distributed consensus experience.',
      undefined,
      new Date('2026-08-26T10:00:00.000Z')
    );
    const active = buildActiveRolePlan(
      { ...focus, targetConceptIds: [...focus.targetConceptIds, 'missing-concept'] },
      {},
      {},
      new Date('2026-08-26T10:00:00.000Z')
    );

    expect(active.targetConceptIds).not.toContain('missing-concept');
  });

  it('requires both source and canonical plan identity for active state', () => {
    const plan = buildRoleFitPlan(analysis, {}, {});
    const focus = buildRoleFocus(
      analysis,
      plan,
      'We need idempotent APIs and distributed consensus experience.',
      undefined,
      new Date('2026-08-26T10:00:00.000Z')
    );

    expect(roleFocusMatchesPlan(focus, plan, focus.sourceFingerprint)).toBe(true);
    expect(
      roleFocusMatchesPlan(
        focus,
        { ...plan, targetConceptIds: plan.targetConceptIds.slice(1) },
        focus.sourceFingerprint
      )
    ).toBe(false);
  });
});
