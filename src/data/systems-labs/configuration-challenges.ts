import type { ConfigurationChallenge } from '../../lib/simulation/types';

export const gitopsConfigurationChallenge: ConfigurationChallenge = {
  id: 'gitops-production-rollout',
  title: 'Build a gated GitOps rollout',
  summary:
    'Repair a production Application, ExternalSecret, and migration Job so revision selection, controller ordering, secret ownership, and retry limits agree.',
  objective:
    'Produce a tracked migration configuration that waits for ESO, consumes the generated Secret, and does not let a mutable branch auto-promote itself.',
  requirements: [
    'Production follows the approved tag refs/tags/production-approved and requires an explicit Argo sync.',
    'Apply the ExternalSecret in wave -2, a tracked migration Job in wave -1, and the Deployment in wave 0.',
    'ESO produces database-url and the migration reads the url key from that same Secret.',
    'The Job allows two failed Pods, has a 600-second overall deadline, and uses restartPolicy Never.',
  ],
  files: [
    {
      id: 'rollout',
      label: 'Production rollout',
      path: 'infra/production/rollout.yaml',
      language: 'yaml',
      starter: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: checkout-production
spec:
  source:
    repoURL: https://example.invalid/platform.git
    # @slot production-revision
    targetRevision: main
    path: clusters/production
  # @slot production-sync-policy
  syncPolicy: { automated: {} }
---
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: checkout-database
  annotations:
    # @slot external-secret-wave
    argocd.argoproj.io/sync-wave: "0"
spec:
  secretStoreRef:
    name: production-secrets
    kind: ClusterSecretStore
  target:
    # @slot generated-secret-name
    name: checkout-secret
  data:
    - secretKey: url
      remoteRef:
        key: checkout/database-url
---
apiVersion: batch/v1
kind: Job
metadata:
  name: checkout-migration
  annotations:
    # @slot migration-wave
    argocd.argoproj.io/sync-wave: "0"
spec:
  # @slot migration-backoff
  backoffLimit: 6
  # @slot migration-deadline
  activeDeadlineSeconds: 0
  template:
    spec:
      # @slot migration-restart
      restartPolicy: Always
      containers:
        - name: migrate
          image: example.invalid/checkout-migrate:42
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  # @slot consumed-secret-name
                  name: checkout-secret
                  key: url
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout
  annotations:
    argocd.argoproj.io/sync-wave: "0"
spec:
  replicas: 3
`,
    },
  ],
  slots: [
    {
      id: 'production-revision',
      fileId: 'rollout',
      marker: '# @slot production-revision',
      expectedLine: 'targetRevision: refs/tags/production-approved',
      label: 'Production revision is promotion-controlled',
      hint: 'A mutable branch moves after approval. Use the protected production release reference.',
      evidence: 'Argo resolves the approved release tag instead of following main.',
    },
    {
      id: 'production-sync-policy',
      fileId: 'rollout',
      marker: '# @slot production-sync-policy',
      expectedLine: 'syncPolicy: {}',
      label: 'Production promotion has a gate',
      hint: 'Remove the policy that automatically applies every newly resolved revision.',
      evidence: 'The production Application requires an explicit sync after revision promotion.',
    },
    {
      id: 'external-secret-wave',
      fileId: 'rollout',
      marker: '# @slot external-secret-wave',
      expectedLine: 'argocd.argoproj.io/sync-wave: "-2"',
      label: 'ExternalSecret precedes consumers',
      hint: 'The custom resource must be applied before the migration wave.',
      evidence: 'Argo applies the ExternalSecret in wave -2.',
    },
    {
      id: 'generated-secret-name',
      fileId: 'rollout',
      marker: '# @slot generated-secret-name',
      expectedLine: 'name: database-url',
      label: 'ESO target has a stable name',
      hint: 'Choose the Secret name the migration container is supposed to consume.',
      evidence: 'ESO owns a target Secret named database-url.',
    },
    {
      id: 'migration-wave',
      fileId: 'rollout',
      marker: '# @slot migration-wave',
      expectedLine: 'argocd.argoproj.io/sync-wave: "-1"',
      label: 'Migration runs before workloads',
      hint: 'Place the tracked Job after the secret prerequisite and before wave 0.',
      evidence: 'The migration Job is an ordinary tracked resource in wave -1.',
    },
    {
      id: 'migration-backoff',
      fileId: 'rollout',
      marker: '# @slot migration-backoff',
      expectedLine: 'backoffLimit: 2',
      label: 'Retry budget is bounded',
      hint: 'Use the reviewed failed-pod retry budget from the rollout design.',
      evidence: 'The Job becomes terminal after the bounded failed-pod budget.',
    },
    {
      id: 'migration-deadline',
      fileId: 'rollout',
      marker: '# @slot migration-deadline',
      expectedLine: 'activeDeadlineSeconds: 600',
      label: 'Wall-clock execution is bounded',
      hint: 'Give the migration a finite ten-minute overall deadline.',
      evidence: 'The Job cannot retry or run indefinitely.',
    },
    {
      id: 'migration-restart',
      fileId: 'rollout',
      marker: '# @slot migration-restart',
      expectedLine: 'restartPolicy: Never',
      label: 'Pod restart semantics match a Job',
      hint: 'Let the Job controller account for failed Pods instead of restarting forever in-place.',
      evidence: 'Failed containers produce failed Pods that the Job controller can count.',
    },
    {
      id: 'consumed-secret-name',
      fileId: 'rollout',
      marker: '# @slot consumed-secret-name',
      expectedLine: 'name: database-url',
      label: 'Migration consumes the ESO target',
      hint: 'The secretKeyRef must join to the target name declared by the ExternalSecret.',
      evidence: 'The migration reads the Secret produced asynchronously by ESO.',
    },
  ],
};

export const tracingConfigurationChallenge: ConfigurationChallenge = {
  id: 'otel-trace-pipeline',
  title: 'Build an end-to-end trace path',
  summary:
    'Repair application SDK settings and a Collector pipeline so W3C context reaches ParentBased sampling and sampled spans have a complete export path.',
  objective:
    'Configure propagation, sampling, OTLP export, Collector reception, batching, and the Google Cloud exporter without bypassing the Collector.',
  requirements: [
    'Extract W3C tracecontext plus baggage and use ParentBased with a ten-percent TraceIdRatioBased root sampler.',
    'Export application spans over OTLP/gRPC to http://otel-collector:4317.',
    'The Collector declares an OTLP gRPC receiver, batch processor, and googlecloud exporter.',
    'The traces pipeline references all three declared components in receive → process → export order.',
  ],
  files: [
    {
      id: 'telemetry',
      label: 'Application and Collector',
      path: 'observability/telemetry.yaml',
      language: 'yaml',
      starter: `application:
  env:
    # @slot propagators
    OTEL_PROPAGATORS: b3
    # @slot sampler
    OTEL_TRACES_SAMPLER: traceidratio
    # @slot sampler-ratio
    OTEL_TRACES_SAMPLER_ARG: "1.0"
    # @slot trace-exporter
    OTEL_TRACES_EXPORTER: none
    # @slot otlp-endpoint
    OTEL_EXPORTER_OTLP_ENDPOINT: https://cloudtrace.googleapis.com

collector:
  # @slot otlp-receiver
  receivers: {}
  processors:
    batch: {}
  # @slot cloud-exporter
  exporters: {}
  service:
    pipelines:
      # @slot trace-pipeline
      traces: { receivers: [], processors: [], exporters: [] }
`,
    },
  ],
  slots: [
    {
      id: 'propagators',
      fileId: 'telemetry',
      marker: '# @slot propagators',
      expectedLine: 'OTEL_PROPAGATORS: tracecontext,baggage',
      label: 'W3C context is extracted',
      hint: 'Use the propagator that understands traceparent and retain baggage support.',
      evidence: 'Incoming traceparent flags can create a valid remote parent.',
    },
    {
      id: 'sampler',
      fileId: 'telemetry',
      marker: '# @slot sampler',
      expectedLine: 'OTEL_TRACES_SAMPLER: parentbased_traceidratio',
      label: 'Sampling respects the parent',
      hint: 'Wrap the root ratio in the sampler that selects a delegate from parent state.',
      evidence: 'Remote-parent flags select ParentBased branches before the root ratio.',
    },
    {
      id: 'sampler-ratio',
      fileId: 'telemetry',
      marker: '# @slot sampler-ratio',
      expectedLine: 'OTEL_TRACES_SAMPLER_ARG: "0.10"',
      label: 'Root sampling budget is explicit',
      hint: 'Set the reviewed ten-percent root ratio rather than sampling every root.',
      evidence: 'Root spans receive a deterministic ten-percent TraceIdRatioBased decision.',
    },
    {
      id: 'trace-exporter',
      fileId: 'telemetry',
      marker: '# @slot trace-exporter',
      expectedLine: 'OTEL_TRACES_EXPORTER: otlp',
      label: 'Sampled spans leave the SDK',
      hint: 'Select the protocol exporter consumed by the Collector receiver.',
      evidence: 'Ended sampled spans are handed to an OTLP exporter.',
    },
    {
      id: 'otlp-endpoint',
      fileId: 'telemetry',
      marker: '# @slot otlp-endpoint',
      expectedLine: 'OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317',
      label: 'The SDK targets the Collector',
      hint: 'Send OTLP to the in-environment Collector service and its gRPC port.',
      evidence: 'The application exports to the Collector rather than directly to a backend API.',
    },
    {
      id: 'otlp-receiver',
      fileId: 'telemetry',
      marker: '# @slot otlp-receiver',
      expectedLine: 'receivers: { otlp: { protocols: { grpc: {} } } }',
      label: 'Collector accepts OTLP/gRPC',
      hint: 'Declare an OTLP receiver with the protocol used by the application endpoint.',
      evidence: 'The Collector has an OTLP gRPC ingress.',
    },
    {
      id: 'cloud-exporter',
      fileId: 'telemetry',
      marker: '# @slot cloud-exporter',
      expectedLine: 'exporters: { googlecloud: {} }',
      label: 'Collector has a Cloud exporter',
      hint: 'Declare the exporter that translates Collector telemetry for Google Cloud.',
      evidence: 'The Collector can forward accepted spans to Google Cloud.',
    },
    {
      id: 'trace-pipeline',
      fileId: 'telemetry',
      marker: '# @slot trace-pipeline',
      expectedLine: 'traces: { receivers: [otlp], processors: [batch], exporters: [googlecloud] }',
      label: 'Trace components are wired into one pipeline',
      hint: 'A declared component does nothing until the traces pipeline references it.',
      evidence: 'OTLP receipt, batching, and Google Cloud export form a connected trace pipeline.',
    },
  ],
};

export const metricsConfigurationChallenge: ConfigurationChallenge = {
  id: 'managed-prometheus-target',
  title: 'Build a discoverable metrics target',
  summary:
    'Repair workload labels, the named metrics port, PodMonitoring selection, scrape settings, and the first PromQL query.',
  objective:
    'Make one checkout workload discoverable and scrapeable without confusing a valid endpoint, selected target, stored series, and query result.',
  requirements: [
    'The Pod and PodMonitoring join on app=checkout.',
    'The container exposes port 9090 as the named port metrics; PodMonitoring references that name.',
    'Scrape /metrics every 30 seconds.',
    'Verify ingestion with the five-minute rate of checkout_requests_total, summed across series.',
  ],
  files: [
    {
      id: 'monitoring',
      label: 'Workload and PodMonitoring',
      path: 'observability/checkout-metrics.yaml',
      language: 'yaml',
      starter: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout
spec:
  template:
    metadata:
      labels:
        # @slot pod-label
        app: checkuot
    spec:
      containers:
        - name: checkout
          image: example.invalid/checkout:42
          ports:
            - # @slot metrics-port-name
              name: http
              containerPort: 9090
---
apiVersion: monitoring.googleapis.com/v1
kind: PodMonitoring
metadata:
  name: checkout
spec:
  selector:
    matchLabels:
      # @slot monitor-selector
      app: api
  endpoints:
    - # @slot monitor-port
      port: http
      # @slot monitor-path
      path: /healthz
      # @slot monitor-interval
      interval: 5m
`,
    },
    {
      id: 'query',
      label: 'PromQL verification',
      path: 'observability/checkout.promql',
      language: 'promql',
      starter: `# @slot verification-query
up
`,
    },
  ],
  slots: [
    {
      id: 'pod-label',
      fileId: 'monitoring',
      marker: '# @slot pod-label',
      expectedLine: 'app: checkout',
      label: 'Pod publishes the selected label',
      hint: 'Use one stable workload identity that the PodMonitoring selector can join.',
      evidence: 'The running Pod has app=checkout.',
    },
    {
      id: 'metrics-port-name',
      fileId: 'monitoring',
      marker: '- # @slot metrics-port-name',
      expectedLine: 'name: metrics',
      label: 'Container exposes a named metrics port',
      hint: 'Name the port for its scrape purpose rather than its application traffic.',
      evidence: 'The selected Pod defines a port named metrics.',
    },
    {
      id: 'monitor-selector',
      fileId: 'monitoring',
      marker: '# @slot monitor-selector',
      expectedLine: 'app: checkout',
      label: 'PodMonitoring selects the workload',
      hint: 'Join the selector to the exact label published by the Pod template.',
      evidence: 'Discovery selects one checkout Pod.',
    },
    {
      id: 'monitor-port',
      fileId: 'monitoring',
      marker: '- # @slot monitor-port',
      expectedLine: 'port: metrics',
      label: 'Endpoint resolves the named port',
      hint: 'Reference the container port name, not an unrelated service port.',
      evidence: 'The selected target resolves port metrics to 9090.',
    },
    {
      id: 'monitor-path',
      fileId: 'monitoring',
      marker: '# @slot monitor-path',
      expectedLine: 'path: /metrics',
      label: 'Scraper requests the exposition endpoint',
      hint: 'Use the endpoint that returns Prometheus exposition rather than health status.',
      evidence: 'The collector requests GET /metrics.',
    },
    {
      id: 'monitor-interval',
      fileId: 'monitoring',
      marker: '# @slot monitor-interval',
      expectedLine: 'interval: 30s',
      label: 'Scrape cadence is operationally useful',
      hint: 'Use the reviewed thirty-second collection interval.',
      evidence: 'The target is scheduled for collection every thirty seconds.',
    },
    {
      id: 'verification-query',
      fileId: 'query',
      marker: '# @slot verification-query',
      expectedLine: 'sum(rate(checkout_requests_total[5m]))',
      label: 'PromQL verifies the application series',
      hint: 'Query the checkout counter as a five-minute per-second rate and aggregate it.',
      evidence: 'The verification query returns the stored checkout request series.',
    },
  ],
};
