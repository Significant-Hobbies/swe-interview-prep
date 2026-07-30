import type { SourceContractFixture } from '../../lib/simulation/types';

export const sourceContractFixtures = [
  {
    id: 'argo-hook-operation-is-independent',
    labId: 'gitops-secret-migration',
    scenarioId: 'hook-only-fails',
    provenanceId: 'argocd-gitops-engine',
    assertions: [
      {
        path: 'actorStates.argocd.metrics.syncStatus',
        expected: 'Synced',
        note: 'Ordinary resource comparison and the sync operation are separate projections.',
      },
      {
        path: 'actorStates.argocd.metrics.operationPhase',
        expected: 'Failed',
        note: 'The failed hook remains visible in operation state.',
      },
    ],
  },
  {
    id: 'eso-provider-failure-blocks-secret',
    labId: 'gitops-secret-migration',
    scenarioId: 'secret-fails',
    provenanceId: 'external-secrets-controller',
    assertions: [
      {
        path: 'actorStates.eso.status',
        expected: 'failed',
        note: 'The ExternalSecret controller owns the failed reconcile condition.',
      },
      {
        path: 'actorStates.secret.status',
        expected: 'failed',
        note: 'A successfully applied custom resource does not imply a target Secret exists.',
      },
    ],
  },
  {
    id: 'parentbased-remote-unsampled-default',
    labId: 'trace-propagation-sampling',
    scenarioId: 'remote-unsampled-default',
    provenanceId: 'opentelemetry-js-sampling',
    assertions: [
      {
        path: 'actorStates.collector.metrics.receivedSpans',
        expected: 0,
        note: 'The remoteParentNotSampled delegate drops without consulting the root sampler.',
      },
    ],
  },
  {
    id: 'parentbased-remote-sampled-default',
    labId: 'trace-propagation-sampling',
    scenarioId: 'remote-sampled-default',
    provenanceId: 'opentelemetry-js-sampling',
    assertions: [
      {
        path: 'actorStates.collector.metrics.receivedSpans',
        expected: 1,
        note: 'The remoteParentSampled delegate preserves the upstream sampled decision.',
      },
    ],
  },
  {
    id: 'podmonitoring-selector-miss',
    labId: 'metrics-discovery-ingestion',
    scenarioId: 'selector-miss',
    provenanceId: 'google-prometheus-engine',
    assertions: [
      {
        path: 'actorStates.discovery.metrics.selectedTargets',
        expected: 0,
        note: 'A valid selector that joins no Pod labels produces no scrape target.',
      },
      {
        path: 'actorStates.query.metrics.resultSeries',
        expected: 0,
        note: 'No discovered target means no stored or queryable series.',
      },
    ],
  },
  {
    id: 'podmonitoring-named-port-miss',
    labId: 'metrics-discovery-ingestion',
    scenarioId: 'named-port-miss',
    provenanceId: 'google-prometheus-engine',
    assertions: [
      {
        path: 'actorStates.discovery.metrics.selectedTargets',
        expected: 1,
        note: 'The Pod is selected before endpoint port resolution.',
      },
      {
        path: 'actorStates.discovery.metrics.resolvedEndpoints',
        expected: 0,
        note: 'A missing named port prevents a resolvable scrape endpoint.',
      },
    ],
  },
] satisfies SourceContractFixture[];
