import { emitEvidence, sequenceTransitions } from '../../lib/simulation/primitives';
import type {
  ActorDefinition,
  ScenarioDefinition,
  SystemsLabDefinition,
} from '../../lib/simulation/types';
import { metricsConfigurationChallenge } from './configuration-challenges';

const actors: ActorDefinition[] = [
  {
    id: 'process',
    label: 'Application metrics endpoint',
    kind: 'process',
    truthPlane: 'process',
    description: 'Serves Prometheus text exposition from the application process.',
    initialStatus: 'idle',
    initialDetail: 'No scrape request has arrived.',
    initialMetrics: { path: '/metrics', port: 9464 },
  },
  {
    id: 'pod',
    label: 'Kubernetes Pod',
    kind: 'resource',
    truthPlane: 'resource',
    description: 'Owns labels and named ports used by discovery.',
    initialStatus: 'healthy',
    initialDetail: 'The application Pod is Ready.',
    initialMetrics: { label: 'app=checkout', namedPort: 'metrics:9464' },
  },
  {
    id: 'podmonitoring',
    label: 'PodMonitoring',
    kind: 'resource',
    truthPlane: 'source',
    description: 'Declares the label selector, endpoint port, path, and interval.',
    initialStatus: 'idle',
    initialDetail: 'The monitoring custom resource has not been evaluated.',
  },
  {
    id: 'discovery',
    label: 'Managed collector discovery',
    kind: 'controller',
    truthPlane: 'controller',
    description: 'Matches Pods and resolves the declared scrape endpoint.',
    initialStatus: 'idle',
    initialDetail: 'No targets have been selected.',
    initialMetrics: { selectedTargets: 0 },
  },
  {
    id: 'scraper',
    label: 'Prometheus scraper',
    kind: 'collector',
    truthPlane: 'operation',
    description: 'Issues HTTP requests to resolved targets and parses exposition data.',
    initialStatus: 'idle',
    initialDetail: 'No scrape has run.',
    initialMetrics: { lastStatus: null },
  },
  {
    id: 'storage',
    label: 'Managed Prometheus storage',
    kind: 'storage',
    truthPlane: 'storage',
    description: 'Stores accepted time series independently of endpoint and discovery state.',
    initialStatus: 'idle',
    initialDetail: 'No new sample is stored.',
    initialMetrics: { storedSeries: 0 },
  },
  {
    id: 'query',
    label: 'PromQL query',
    kind: 'query',
    truthPlane: 'query',
    description: 'Shows what a learner or alert can retrieve from stored series.',
    initialStatus: 'idle',
    initialDetail: 'The query has not run.',
    initialMetrics: { resultSeries: 0 },
  },
];

interface MetricsScenarioInput {
  id: string;
  title: string;
  summary: string;
  selector: 'matches' | 'misses';
  port: 'resolves' | 'missing-name';
  response: '200' | '500' | 'not-requested';
  expected: 'series-visible' | 'no-targets' | 'target-invalid' | 'scrape-failed';
}

function metricsScenario(input: MetricsScenarioInput): ScenarioDefinition {
  const prefix = input.id;
  const selectedTargets = input.selector === 'matches' ? 1 : 0;
  const portResolved = selectedTargets === 1 && input.port === 'resolves';
  const scrapeAttempted = portResolved;
  const scrapeSucceeded = scrapeAttempted && input.response === '200';
  const resultSeries = scrapeSucceeded ? 1 : 0;

  const transitions = sequenceTransitions([
    {
      id: `${prefix}-endpoint-state`,
      at: 1,
      actorId: 'process',
      title: 'Endpoint is instrumented',
      description:
        input.response === '500'
          ? 'The process exposes /metrics but currently returns an HTTP 500 response.'
          : 'The process can return Prometheus exposition at :9464/metrics.',
      patch: {
        status: input.response === '500' ? 'degraded' : 'healthy',
        detail:
          input.response === '500'
            ? '/metrics exists but returns HTTP 500.'
            : '/metrics returns valid Prometheus text.',
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-endpoint-evidence`,
          actorId: 'process',
          truthPlane: 'process',
          kind: 'state',
          label: 'Endpoint capability',
          value: input.response === '500' ? 'exists / HTTP 500' : 'exists / HTTP 200',
          detail: 'Endpoint capability is independent of whether discovery selects the Pod.',
          decisive: input.expected === 'scrape-failed',
        }),
      ],
    },
    {
      id: `${prefix}-pod-state`,
      at: 2,
      actorId: 'pod',
      title: 'Pod metadata observed',
      description:
        input.selector === 'matches'
          ? 'The Pod has app=checkout and a metrics named port.'
          : 'The Pod has app=checkout while the selector asks for app=payments.',
      patch: {
        status: 'healthy',
        detail:
          input.port === 'missing-name'
            ? 'Pod is Ready, but it defines http:8080 rather than a metrics named port.'
            : 'Pod is Ready with app=checkout and metrics:9464.',
        metrics: {
          label: 'app=checkout',
          namedPort: input.port === 'missing-name' ? 'http:8080' : 'metrics:9464',
        },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-pod-metadata`,
          actorId: 'pod',
          truthPlane: 'resource',
          kind: 'state',
          label: 'Pod metadata',
          value:
            input.port === 'missing-name'
              ? 'app=checkout, http:8080'
              : 'app=checkout, metrics:9464',
          detail: 'Discovery evaluates Pod labels and named ports, not application intent.',
        }),
      ],
    },
    {
      id: `${prefix}-monitoring-applied`,
      at: 3,
      actorId: 'podmonitoring',
      title: 'PodMonitoring accepted',
      description:
        input.selector === 'misses'
          ? 'The resource is structurally valid with selector app=payments.'
          : 'The resource is structurally valid with selector app=checkout.',
      patch: {
        status: 'healthy',
        detail: `selector app=${input.selector === 'misses' ? 'payments' : 'checkout'}, port=metrics, path=/metrics.`,
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-manifest-valid`,
          actorId: 'podmonitoring',
          truthPlane: 'source',
          kind: 'state',
          label: 'Manifest validity',
          value: true,
          detail: 'A valid custom resource can still select zero usable targets.',
        }),
      ],
      checkpoint: 'decision',
    },
    {
      id: `${prefix}-discovery-selects`,
      at: 4,
      actorId: 'discovery',
      title: selectedTargets === 1 ? 'One Pod selected' : 'Selector matches no Pods',
      description:
        selectedTargets === 1
          ? 'The collector finds one Pod matching the namespace-local selector.'
          : 'The collector finds zero Pods matching app=payments.',
      patch: {
        status: selectedTargets === 1 ? 'complete' : 'degraded',
        detail:
          selectedTargets === 1
            ? 'Selected targets: 1.'
            : 'Selected targets: 0; no HTTP request can be scheduled.',
        metrics: { selectedTargets },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-target-count`,
          actorId: 'discovery',
          truthPlane: 'controller',
          kind: 'metric',
          label: 'Selected targets',
          value: selectedTargets,
          detail:
            selectedTargets === 0
              ? 'The endpoint and manifest can both exist while label selection yields no targets.'
              : 'Label selection found one candidate Pod.',
          decisive: input.expected === 'no-targets',
        }),
      ],
    },
    {
      id: `${prefix}-port-resolution`,
      at: 5,
      actorId: 'discovery',
      title: portResolved ? 'Named port resolved' : 'No usable endpoint resolved',
      description: portResolved
        ? 'The Pod port named metrics resolves to container port 9464.'
        : selectedTargets === 0
          ? 'There is no selected Pod on which to resolve a port.'
          : 'The selected Pod has no port named metrics.',
      patch: {
        status: portResolved ? 'complete' : 'failed',
        detail: portResolved
          ? 'Target resolves to pod-ip:9464/metrics.'
          : selectedTargets === 0
            ? 'No selected target.'
            : 'Endpoint status: port name metrics not found.',
        metrics: { selectedTargets, resolvedEndpoints: portResolved ? 1 : 0 },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-resolved-endpoints`,
          actorId: 'discovery',
          truthPlane: 'controller',
          kind: 'metric',
          label: 'Resolved endpoints',
          value: portResolved ? 1 : 0,
          detail: portResolved
            ? 'Discovery produced a concrete HTTP target.'
            : 'A selected Pod is not yet a scrape target when its named port cannot resolve.',
          decisive: input.expected === 'target-invalid',
        }),
      ],
      checkpoint: 'decision',
    },
    {
      id: `${prefix}-scrape-result`,
      at: 6,
      actorId: 'scraper',
      title: scrapeSucceeded
        ? 'Scrape succeeds'
        : scrapeAttempted
          ? 'Scrape returns HTTP 500'
          : 'No scrape request is issued',
      description: scrapeSucceeded
        ? 'The scraper receives valid exposition and parses checkout_requests_total.'
        : scrapeAttempted
          ? 'Discovery succeeded, but the target response is unsuccessful.'
          : 'Without a resolved endpoint there is nothing to request.',
      patch: {
        status: scrapeSucceeded ? 'complete' : scrapeAttempted ? 'failed' : 'blocked',
        detail: scrapeSucceeded
          ? 'up=1; one metric family parsed.'
          : scrapeAttempted
            ? 'up=0; HTTP status 500.'
            : 'No HTTP request attempted.',
        metrics: { lastStatus: scrapeAttempted ? Number(input.response) : null },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-scrape-evidence`,
          actorId: 'scraper',
          truthPlane: 'operation',
          kind: 'request',
          label: 'Scrape result',
          value: scrapeSucceeded ? 'HTTP 200' : scrapeAttempted ? 'HTTP 500' : 'not attempted',
          detail: scrapeSucceeded
            ? 'Discovery and application response both succeeded.'
            : scrapeAttempted
              ? 'A valid discovered target can still fail at request time.'
              : 'Discovery failed before the request plane.',
          decisive: input.expected === 'scrape-failed',
        }),
      ],
    },
    {
      id: `${prefix}-storage-result`,
      at: 7,
      actorId: 'storage',
      title: scrapeSucceeded ? 'Sample stored' : 'No sample stored',
      description: scrapeSucceeded
        ? 'The accepted sample is written to managed time-series storage.'
        : 'No valid sample reaches storage.',
      patch: {
        status: scrapeSucceeded ? 'healthy' : 'idle',
        detail: scrapeSucceeded
          ? 'checkout_requests_total has a new sample.'
          : 'No new series sample.',
        metrics: { storedSeries: resultSeries },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-stored-series`,
          actorId: 'storage',
          truthPlane: 'storage',
          kind: 'record',
          label: 'Stored series',
          value: resultSeries,
          detail: 'Storage proves ingestion; endpoint and scrape evidence alone do not.',
        }),
      ],
    },
    {
      id: `${prefix}-query-result`,
      at: 8,
      actorId: 'query',
      title: scrapeSucceeded ? 'Query returns a series' : 'Query returns no series',
      description: scrapeSucceeded
        ? 'PromQL returns checkout_requests_total for the new target.'
        : 'The query has no stored series to return.',
      patch: {
        status: scrapeSucceeded ? 'healthy' : 'degraded',
        detail: scrapeSucceeded ? 'Result series: 1.' : 'Result series: 0.',
        metrics: { resultSeries },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-query-series`,
          actorId: 'query',
          truthPlane: 'query',
          kind: 'query',
          label: 'Query result series',
          value: resultSeries,
          detail: scrapeSucceeded
            ? 'The end-to-end path is visible from a user query.'
            : 'An empty query is a symptom; earlier evidence localizes the broken edge.',
          decisive: true,
        }),
      ],
    },
  ]);

  const expectedActorStates: Record<
    string,
    'healthy' | 'degraded' | 'failed' | 'blocked' | 'complete' | 'idle'
  > = {
    process: input.response === '500' ? 'degraded' : 'healthy',
    podmonitoring: 'healthy',
    discovery: portResolved ? 'complete' : input.selector === 'misses' ? 'failed' : 'failed',
    scraper: scrapeSucceeded ? 'complete' : scrapeAttempted ? 'failed' : 'blocked',
    storage: scrapeSucceeded ? 'healthy' : 'idle',
    query: scrapeSucceeded ? 'healthy' : 'degraded',
  };

  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    controls: {
      selector: input.selector,
      port: input.port,
      response: input.response,
    },
    predictionPrompt: 'What will the PromQL query return after this scrape interval?',
    predictionOptions: [
      { id: 'one-series', label: 'One checkout_requests_total series.' },
      { id: 'zero-series', label: 'Zero series; inspect the earliest broken edge.' },
    ],
    correctPredictionId: scrapeSucceeded ? 'one-series' : 'zero-series',
    entryTransitionId: transitions[0].id,
    transitions,
    expectedOutcome: {
      summary: scrapeSucceeded
        ? 'Selection, port resolution, HTTP scrape, storage, and query all succeed.'
        : `No series is queryable because the earliest broken edge is ${input.expected}.`,
      actorStates: expectedActorStates,
      evidenceIds: [
        `${prefix}-target-count`,
        `${prefix}-resolved-endpoints`,
        `${prefix}-scrape-evidence`,
        `${prefix}-query-series`,
      ],
    },
  };
}

export const metricsLab: SystemsLabDefinition = {
  id: 'metrics-discovery-ingestion',
  version: 1,
  eyebrow: 'Systems Lab 03',
  title: 'Metrics discovery and ingestion',
  summary:
    'Trace a metric from process endpoint through Pod selection, named-port resolution, HTTP scrape, managed storage, and PromQL.',
  estimatedMinutes: 16,
  conceptIds: ['monitoring-analytics', 'containers-kubernetes'],
  learningObjectives: [
    'Separate endpoint capability, discovery, scraping, storage, and query evidence.',
    'Explain why a valid PodMonitoring can select zero targets.',
    'Distinguish selector, named-port, and response failures.',
    'Localize an empty query to the earliest broken pipeline edge.',
  ],
  actors,
  controls: [
    {
      id: 'selector',
      label: 'Pod selector',
      description: 'Whether Pod labels satisfy the PodMonitoring selector.',
      options: [
        { value: 'matches', label: 'Matches' },
        { value: 'misses', label: 'Misses' },
      ],
    },
    {
      id: 'port',
      label: 'Named port',
      description: 'Whether the selected Pod defines the endpoint port name.',
      options: [
        { value: 'resolves', label: 'Resolves' },
        { value: 'missing-name', label: 'Name missing' },
      ],
    },
    {
      id: 'response',
      label: 'Scrape response',
      description: 'The target response after successful endpoint resolution.',
      options: [
        { value: '200', label: 'HTTP 200' },
        { value: '500', label: 'HTTP 500' },
        { value: 'not-requested', label: 'No request' },
      ],
    },
  ],
  scenarios: [
    metricsScenario({
      id: 'healthy',
      title: 'Metric reaches PromQL',
      summary: 'Every pipeline edge succeeds and one series becomes queryable.',
      selector: 'matches',
      port: 'resolves',
      response: '200',
      expected: 'series-visible',
    }),
    metricsScenario({
      id: 'selector-miss',
      title: 'Valid selector matches no Pods',
      summary: 'The endpoint and PodMonitoring both exist, but their labels never join.',
      selector: 'misses',
      port: 'resolves',
      response: 'not-requested',
      expected: 'no-targets',
    }),
    metricsScenario({
      id: 'named-port-miss',
      title: 'Selected Pod lacks the named port',
      summary: 'Discovery finds the Pod but cannot resolve port: metrics.',
      selector: 'matches',
      port: 'missing-name',
      response: 'not-requested',
      expected: 'target-invalid',
    }),
    metricsScenario({
      id: 'scrape-response-fails',
      title: 'Discovered target returns HTTP 500',
      summary: 'Selection and port resolution succeed before the application response fails.',
      selector: 'matches',
      port: 'resolves',
      response: '500',
      expected: 'scrape-failed',
    }),
  ],
  defaultScenarioId: 'healthy',
  configurationChallenge: metricsConfigurationChallenge,
  fidelity: {
    level: 'source-verified',
    summary:
      'PodMonitoring selection, named-port validation, and target status are reviewed against pinned Google operator source.',
  },
  provenance: [
    {
      id: 'google-prometheus-engine',
      project: 'Google Cloud Managed Service for Prometheus',
      repository: 'https://github.com/GoogleCloudPlatform/prometheus-engine',
      revision: 'a94cbadae5b1db067f7ed1803aa55a611485d571',
      sourcePaths: [
        'charts/operator/crds/monitoring.googleapis.com_podmonitorings.yaml',
        'pkg/operator/apis/monitoring/v1/pod_types_test.go',
        'pkg/operator/collection_test.go',
        'pkg/operator/target_status_test.go',
      ],
      license: 'Apache-2.0',
      verifiedOn: '2026-07-30',
      method: 'source-review',
      note: 'CRD validation, selector joining, endpoint resolution, and target status anchor the model.',
    },
  ],
  sources: [
    {
      label: 'Google Cloud: Managed collection',
      href: 'https://cloud.google.com/stackdriver/docs/managed-prometheus/setup-managed',
      note: 'PodMonitoring selectors, endpoints, named ports, and status.',
    },
    {
      label: 'Prometheus: Exposition formats',
      href: 'https://prometheus.io/docs/instrumenting/exposition_formats/',
      note: 'The application response parsed by a Prometheus scraper.',
    },
    {
      label: 'Prometheus: Querying basics',
      href: 'https://prometheus.io/docs/prometheus/latest/querying/basics/',
      note: 'How stored time series become query results.',
    },
  ],
};
