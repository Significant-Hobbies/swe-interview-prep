import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearDecisionLabDraft,
  loadDecisionLabDraft,
  loadFocusedStudyDraft,
  saveDecisionLabDraft,
  saveFocusedStudyDraft,
} from './learningContinuity';

describe('learning continuity', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    });
  });

  it('restores only a matching decision-lab definition version', () => {
    saveDecisionLabDraft('owner', {
      schemaVersion: 1,
      labId: 'model-routing',
      definitionVersion: 1,
      values: { requestsPerSecond: 100 },
      prediction: 'The deep pool binds.',
      derived: null,
      conclusion: '',
      mitigation: '',
      counterfactual: '',
      verificationMetric: '',
      updatedAt: '2026-08-20T10:00:00.000Z',
    });
    expect(loadDecisionLabDraft('owner', 'model-routing', 1)?.prediction).toContain('deep');
    expect(loadDecisionLabDraft('owner', 'model-routing', 2)).toBeNull();
    clearDecisionLabDraft('owner', 'model-routing');
    expect(loadDecisionLabDraft('owner', 'model-routing', 1)).toBeNull();
  });

  it('keeps study drafts account-scoped and resumable', () => {
    saveFocusedStudyDraft('owner', {
      schemaVersion: 1,
      focusKind: 'concept',
      focusId: 'inference-engines',
      stage: 'retrieve',
      retrieval: 'Prefill is compute-heavy; decode reuses KV state.',
      application: '',
      explanation: '',
      completedAt: null,
      updatedAt: '2026-08-20T10:00:00.000Z',
    });
    expect(loadFocusedStudyDraft('owner', 'concept', 'inference-engines')?.stage).toBe('retrieve');
    expect(loadFocusedStudyDraft('guest', 'concept', 'inference-engines')).toBeNull();
  });
});
