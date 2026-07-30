import { beforeEach, describe, expect, it } from 'vitest';

import { comparePrediction, createSimulation, reduceSimulation } from './simulation/engine';
import type { SystemsLabDefinition } from './simulation/types';
import {
  completeSystemsLabAttempt,
  createSystemsLabAttempt,
  freezeSystemsLabPrediction,
  hasStaleSystemsLabAttempt,
  latestCompatibleAttempt,
  loadSystemsLabAttempts,
  reuseVerifiedSystemsLabConfiguration,
  saveSystemsLabAttempt,
  updateSystemsLabConfiguration,
  updateSystemsLabExplanation,
} from './systemsLabAttempts';
import { tracingLab } from '../data/systems-labs';

describe('systems lab attempts', () => {
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

  it('freezes a prediction, records decisive evidence, and keeps guest mastery pending', () => {
    const now = new Date('2026-07-30T10:00:00.000Z');
    const scenario = tracingLab.scenarios.find(
      (candidate) => candidate.id === 'remote-unsampled-default'
    )!;
    const snapshot = reduceSimulation(tracingLab, createSimulation(tracingLab, scenario.id), {
      type: 'finish',
    });
    let attempt = createSystemsLabAttempt('guest', tracingLab, scenario.id, now);
    attempt = freezeSystemsLabPrediction(attempt, 'collector-empty', now);
    attempt = completeSystemsLabAttempt(
      attempt,
      comparePrediction(scenario, snapshot, attempt.predictionId!),
      now
    );
    attempt = updateSystemsLabExplanation(
      attempt,
      'The remote unsampled branch selects AlwaysOff before export.',
      null,
      false,
      now
    );

    saveSystemsLabAttempt(attempt);
    expect(loadSystemsLabAttempts('guest')).toEqual([attempt]);
    expect(attempt).toMatchObject({
      status: 'completed',
      predictionCorrect: true,
      masteryStatus: 'pending',
    });
    expect(attempt.decisiveEvidenceIds).toContain('remote-unsampled-default-sampling-decision');
  });

  it('rejects mutable predictions and tracks incompatible definition versions', () => {
    const attempt = freezeSystemsLabPrediction(
      createSystemsLabAttempt('owner', tracingLab, tracingLab.defaultScenarioId),
      'collector-empty'
    );
    expect(() => freezeSystemsLabPrediction(attempt, 'collector-receives')).toThrow(
      /cannot be changed/
    );

    const upgraded = { ...tracingLab, version: 2 } satisfies SystemsLabDefinition;
    expect(latestCompatibleAttempt([attempt], upgraded, attempt.scenarioId)).toBeUndefined();
    expect(hasStaleSystemsLabAttempt([attempt], upgraded, attempt.scenarioId)).toBe(true);
  });

  it('preserves applied mastery when an already graded explanation is edited', () => {
    const scenario = tracingLab.scenarios[0];
    const snapshot = reduceSimulation(tracingLab, createSimulation(tracingLab, scenario.id), {
      type: 'finish',
    });
    let attempt = freezeSystemsLabPrediction(
      createSystemsLabAttempt('owner', tracingLab, scenario.id),
      scenario.correctPredictionId
    );
    attempt = completeSystemsLabAttempt(
      attempt,
      comparePrediction(scenario, snapshot, attempt.predictionId!)
    );
    attempt = updateSystemsLabConfiguration(
      attempt,
      true,
      ['sampler'],
      { telemetry: 'valid' },
      new Date()
    );
    attempt = updateSystemsLabExplanation(attempt, 'First graded explanation.', 86, true);
    attempt = updateSystemsLabExplanation(
      attempt,
      'Edited after grading without inventing a second grade.',
      attempt.explanationGrade,
      attempt.masteryStatus === 'applied'
    );

    expect(attempt).toMatchObject({
      status: 'explained',
      explanationGrade: 86,
      masteryStatus: 'applied',
    });
  });

  it('records configuration evidence and invalidates it after an edit', () => {
    const now = new Date('2026-07-30T10:00:00.000Z');
    let attempt = createSystemsLabAttempt('owner', tracingLab, tracingLab.defaultScenarioId, now);
    attempt = updateSystemsLabConfiguration(
      attempt,
      true,
      ['sampler', 'trace-pipeline'],
      { telemetry: 'valid' },
      now
    );

    expect(attempt).toMatchObject({
      configurationPassed: true,
      configurationPassedAt: now.toISOString(),
      configurationEvidenceIds: ['sampler', 'trace-pipeline'],
      configurationFiles: { telemetry: 'valid' },
    });

    attempt = updateSystemsLabConfiguration(attempt, false, [], { telemetry: 'edited' }, now);
    expect(attempt).toMatchObject({
      configurationPassed: false,
      configurationPassedAt: null,
      configurationEvidenceIds: [],
      configurationFiles: { telemetry: 'edited' },
    });
  });

  it('rejects explanation grading until the configuration challenge passes', () => {
    const scenario = tracingLab.scenarios[0];
    const snapshot = reduceSimulation(tracingLab, createSimulation(tracingLab, scenario.id), {
      type: 'finish',
    });
    let attempt = freezeSystemsLabPrediction(
      createSystemsLabAttempt('owner', tracingLab, scenario.id),
      scenario.correctPredictionId
    );
    attempt = completeSystemsLabAttempt(
      attempt,
      comparePrediction(scenario, snapshot, attempt.predictionId!)
    );

    expect(() =>
      updateSystemsLabExplanation(attempt, 'Correct causal explanation.', 90, true)
    ).toThrow(/configuration/);
  });

  it('reuses a verified build across scenarios of the same lab version', () => {
    const verified = updateSystemsLabConfiguration(
      createSystemsLabAttempt('owner', tracingLab, 'remote-unsampled-default'),
      true,
      ['sampler'],
      { telemetry: 'verified' }
    );
    const nextScenario = createSystemsLabAttempt('owner', tracingLab, 'remote-sampled-default');

    expect(reuseVerifiedSystemsLabConfiguration(nextScenario, [verified])).toMatchObject({
      scenarioId: 'remote-sampled-default',
      configurationPassed: true,
      configurationEvidenceIds: ['sampler'],
      configurationFiles: { telemetry: 'verified' },
    });

    expect(
      reuseVerifiedSystemsLabConfiguration(
        { ...nextScenario, definitionVersion: tracingLab.version + 1 },
        [verified]
      ).configurationPassed
    ).toBe(false);
  });

  it('records a missed prediction without granting mastery and allows a separate retry', () => {
    const scenario = tracingLab.scenarios[0];
    const snapshot = reduceSimulation(tracingLab, createSimulation(tracingLab, scenario.id), {
      type: 'finish',
    });
    let missed = freezeSystemsLabPrediction(
      createSystemsLabAttempt(
        'guest',
        tracingLab,
        scenario.id,
        new Date('2026-07-30T10:00:00.000Z')
      ),
      'collector-receives'
    );
    missed = completeSystemsLabAttempt(
      missed,
      comparePrediction(scenario, snapshot, missed.predictionId!)
    );
    const retry = createSystemsLabAttempt(
      'guest',
      tracingLab,
      scenario.id,
      new Date('2026-07-30T10:01:00.000Z')
    );

    expect(missed).toMatchObject({
      predictionCorrect: false,
      masteryStatus: 'pending',
    });
    expect(retry.status).toBe('draft');
    expect(retry.id).not.toBe(missed.id);
  });
});
