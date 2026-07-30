import { describe, expect, it, vi } from 'vitest';

import { createSimulation, reduceSimulation, serializeSnapshot } from '../../lib/simulation/engine';
import { verifySourceContract } from '../../lib/simulation/source-contracts';
import type { ActorStatus, SystemsLabDefinition } from '../../lib/simulation/types';
import { validateLabDefinition } from '../../lib/simulation/validate';
import { gitopsLab, metricsLab, systemsLabs, tracingLab } from '.';
import { sourceContractFixtures } from './source-contract-fixtures';

function finish(lab: SystemsLabDefinition, scenarioId: string) {
  return reduceSimulation(lab, createSimulation(lab, scenarioId), { type: 'finish' });
}

describe('systems lab registry', () => {
  it('contains only valid deterministic definitions', () => {
    for (const lab of systemsLabs) {
      expect(validateLabDefinition(lab)).toEqual([]);
      for (const scenario of lab.scenarios) {
        const first = finish(lab, scenario.id);
        const second = finish(lab, scenario.id);
        expect(serializeSnapshot(first)).toBe(serializeSnapshot(second));
        expect(first.phase).toBe('complete');
        for (const [actorId, status] of Object.entries(scenario.expectedOutcome.actorStates)) {
          expect(first.actorStates[actorId]?.status).toBe(status as ActorStatus);
        }
        expect(first.evidence.map((item) => item.id)).toEqual(
          expect.arrayContaining(scenario.expectedOutcome.evidenceIds)
        );
      }
    }
  });

  it('matches every pinned upstream source contract', () => {
    for (const fixture of sourceContractFixtures) {
      const lab = systemsLabs.find((candidate) => candidate.id === fixture.labId);
      expect(lab, `Missing lab for source contract ${fixture.id}`).toBeDefined();
      expect(verifySourceContract(lab!, fixture)).toEqual([]);
    }
  });

  it('runs every scenario without making a network request', () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn(() => {
      throw new Error('Simulation attempted an external request.');
    });
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchSpy,
    });

    try {
      for (const lab of systemsLabs) {
        for (const scenario of lab.scenarios) finish(lab, scenario.id);
      }
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(globalThis, 'fetch', {
        configurable: true,
        value: originalFetch,
      });
    }
  });
});

describe('source contract mutation detection', () => {
  function fixture(id: string) {
    return sourceContractFixtures.find((candidate) => candidate.id === id)!;
  }

  it('kills a reversed ParentBased remote-unsampled decision', () => {
    const mutated = structuredClone(tracingLab);
    const scenario = mutated.scenarios.find(
      (candidate) => candidate.id === 'remote-unsampled-default'
    )!;
    const collector = scenario.transitions.find((transition) =>
      transition.id.endsWith('-collector-result')
    )!;
    collector.patch!.metrics!.receivedSpans = 1;

    expect(verifySourceContract(mutated, fixture('parentbased-remote-unsampled-default'))).toEqual([
      expect.objectContaining({
        path: 'actorStates.collector.metrics.receivedSpans',
        expected: 0,
        actual: 1,
      }),
    ]);
  });

  it('kills a collapsed Argo sync and operation projection', () => {
    const mutated = structuredClone(gitopsLab);
    const scenario = mutated.scenarios.find((candidate) => candidate.id === 'hook-only-fails')!;
    const argoProjection = scenario.transitions.find(
      (transition) => transition.id === 'argo-hook-operation-failed'
    )!;
    argoProjection.patch!.metrics!.syncStatus = 'OutOfSync';

    expect(verifySourceContract(mutated, fixture('argo-hook-operation-is-independent'))).toEqual([
      expect.objectContaining({
        path: 'actorStates.argocd.metrics.syncStatus',
        expected: 'Synced',
        actual: 'OutOfSync',
      }),
    ]);
  });

  it('kills a selector that incorrectly discovers a target', () => {
    const mutated = structuredClone(metricsLab);
    const scenario = mutated.scenarios.find((candidate) => candidate.id === 'selector-miss')!;
    const discovery = [...scenario.transitions]
      .reverse()
      .find((transition) => transition.actorId === 'discovery')!;
    discovery.patch!.metrics!.selectedTargets = 1;

    expect(verifySourceContract(mutated, fixture('podmonitoring-selector-miss'))).toEqual([
      expect.objectContaining({
        path: 'actorStates.discovery.metrics.selectedTargets',
        expected: 0,
        actual: 1,
      }),
    ]);
  });
});

describe('GitOps lab', () => {
  it('keeps operation, resource, storage, and rollout truth independent', () => {
    const failed = finish(gitopsLab, 'migration-fails');
    expect(failed.actorStates.job.status).toBe('failed');
    expect(failed.actorStates.database.metrics).toMatchObject({ revision: 41, dirty: true });
    expect(failed.actorStates.deployment.metrics.release).toBe('previous');
    expect(failed.actorStates.argocd.metrics.operationPhase).toBe('Failed');
  });

  it('can end Synced with a failed hook operation and dirty database', () => {
    const hook = finish(gitopsLab, 'hook-only-fails');
    expect(hook.actorStates.argocd.metrics).toMatchObject({
      syncStatus: 'Synced',
      healthStatus: 'Healthy',
      operationPhase: 'Failed',
    });
    expect(hook.actorStates.database.metrics.dirty).toBe(true);
    expect(hook.actorStates.deployment.status).toBe('healthy');
  });
});

describe('trace sampling lab', () => {
  it('proves exactly which ParentBased paths reach the Collector', () => {
    const receivedByScenario = Object.fromEntries(
      tracingLab.scenarios.map((scenario) => [
        scenario.id,
        finish(tracingLab, scenario.id).actorStates.collector.metrics.receivedSpans,
      ])
    );

    expect(receivedByScenario).toEqual({
      'remote-unsampled-default': 0,
      'remote-unsampled-override': 1,
      'remote-sampled-default': 1,
      'root-ratio-samples': 1,
      'root-ratio-drops': 0,
    });
  });
});

describe('metrics ingestion lab', () => {
  it('localizes each empty query to a different earlier edge', () => {
    const selectorMiss = finish(metricsLab, 'selector-miss');
    const portMiss = finish(metricsLab, 'named-port-miss');
    const responseFailure = finish(metricsLab, 'scrape-response-fails');

    expect(selectorMiss.actorStates.discovery.metrics.selectedTargets).toBe(0);
    expect(portMiss.actorStates.discovery.metrics).toMatchObject({
      selectedTargets: 1,
      resolvedEndpoints: 0,
    });
    expect(responseFailure.actorStates.scraper.metrics.lastStatus).toBe(500);
    expect(
      [selectorMiss, portMiss, responseFailure].map(
        (snapshot) => snapshot.actorStates.query.metrics.resultSeries
      )
    ).toEqual([0, 0, 0]);
  });
});
