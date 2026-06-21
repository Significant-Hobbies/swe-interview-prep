import { describe, expect, it } from 'vitest';

import type { MasteryEntry } from '../hooks/useConcepts';
import type { ArtifactEntry, DrillEntry } from '../hooks/useUserStore';
import { DRILLS } from '../data/learning-os';
import { CONCEPT_BY_ID } from '../hooks/useConcepts';
import { isEditorialDrill } from './contentQuality';
import { DEFAULT_USER_ELO } from './elo';
import { type GateContext, conceptAccessible, gateStatus } from './gates';

const GATE_DRILL_CONCEPTS = [
  'hypothesis-testing',
  'sampling-and-clt',
  'estimation-confidence',
  'derivatives-and-gradients',
  'portfolio-risk-metrics',
];

function mastery(confidence: number): MasteryEntry {
  return {
    stability: 1,
    difficulty: 5,
    reps: 1,
    lapses: 0,
    state: 2,
    confidence,
  };
}

function ctx(overrides: Partial<GateContext> = {}): GateContext {
  return {
    mastery: {},
    getElo: () => DEFAULT_USER_ELO,
    artifacts: {},
    drills: {},
    ...overrides,
  };
}

const emptyArtifact: ArtifactEntry = { status: 'todo', url: '', path: '', notes: '', criteria: [] };

describe('gateStatus (proof-based)', () => {
  it('blocks search-evals without drill or artifact proof', () => {
    expect(gateStatus('search-evals', ctx()).blocked).toBe(true);
  });

  it('opens search-evals when hypothesis-testing drill solved', () => {
    const status = gateStatus('search-evals', ctx({
      drills: { 'interpret-p-value': { status: 'solved', lastCode: '', attempts: 1 } },
    }));
    expect(status.blocked).toBe(false);
  });

  it('opens search-evals via math artifact building', () => {
    const status = gateStatus('search-evals', ctx({
      artifacts: {
        'ab-test-analysis-report': { ...emptyArtifact, status: 'building' },
      },
    }));
    expect(status.blocked).toBe(false);
  });

  it('blocks llm-evals when search-evals gated', () => {
    const status = gateStatus('llm-evals', ctx());
    expect(status.blocked).toBe(true);
    expect(status.reason).toContain('Search evals');
  });

  it('opens llm-evals with shipped ab-test report', () => {
    const openSearch = ctx({
      drills: { 'interpret-p-value': { status: 'solved', lastCode: '', attempts: 1 } },
    });
    const status = gateStatus('llm-evals', {
      ...openSearch,
      artifacts: { 'ab-test-analysis-report': { ...emptyArtifact, status: 'shipped' } },
    });
    expect(status.blocked).toBe(false);
  });
});

describe('gate drill verification', () => {
  it('every gate unlock concept has an editorial drill with testCases', () => {
    for (const conceptId of GATE_DRILL_CONCEPTS) {
      const editorial = DRILLS.filter(d => d.conceptId === conceptId && isEditorialDrill(d));
      const verified = editorial.filter(d => d.testCases?.length);
      expect(verified.length, conceptId).toBeGreaterThan(0);
    }
  });

  it('every editorial coding-problem and implementation-task drill has testCases', () => {
    const missing = DRILLS.filter(
      d => isEditorialDrill(d)
        && (d.type === 'coding-problem' || d.type === 'implementation-task')
        && !d.testCases?.length,
    ).map(d => d.id);
    expect(missing).toEqual([]);
  });
});

describe('conceptAccessible', () => {
  it('requires prerequisites and proof gates', () => {
    const searchEvals = CONCEPT_BY_ID['search-evals'];
    expect(searchEvals).toBeDefined();
    expect(conceptAccessible(searchEvals!, ctx({
      mastery: {
        'ranking-metrics': mastery(0.5),
        'hypothesis-testing': mastery(0.9),
      },
    }))).toBe(false);
  });
});