import { emitEvidence, sequenceTransitions } from '../../lib/simulation/primitives';
import type {
  ActorDefinition,
  ScenarioDefinition,
  SystemsLabDefinition,
  TransitionDefinition,
} from '../../lib/simulation/types';
import { tracingConfigurationChallenge } from './configuration-challenges';

const actors: ActorDefinition[] = [
  {
    id: 'request',
    label: 'Incoming request',
    kind: 'request',
    truthPlane: 'source',
    description: 'Carries an optional traceparent header from the upstream process.',
    initialStatus: 'idle',
    initialDetail: 'No request has entered the service.',
  },
  {
    id: 'propagator',
    label: 'Trace Context propagator',
    kind: 'propagator',
    truthPlane: 'process',
    description: 'Extracts a remote SpanContext from supported request headers.',
    initialStatus: 'idle',
    initialDetail: 'No headers have been extracted.',
  },
  {
    id: 'parent',
    label: 'Parent SpanContext',
    kind: 'context',
    truthPlane: 'process',
    description: 'The valid, remote, and sampled flags the sampler branches on.',
    initialStatus: 'idle',
    initialDetail: 'No parent context is active.',
  },
  {
    id: 'sampler',
    label: 'ParentBased sampler',
    kind: 'decision',
    truthPlane: 'process',
    description: 'Chooses a delegate from parent presence, remoteness, and sampled flag.',
    initialStatus: 'idle',
    initialDetail: 'No sampling decision has been made.',
    initialMetrics: { rootRatio: 0.1 },
  },
  {
    id: 'span',
    label: 'Server span',
    kind: 'telemetry',
    truthPlane: 'process',
    description: 'Exists as recording/sampled or non-recording according to the SDK decision.',
    initialStatus: 'idle',
    initialDetail: 'The server span has not started.',
  },
  {
    id: 'exporter',
    label: 'OTLP exporter',
    kind: 'exporter',
    truthPlane: 'operation',
    description: 'Receives ended sampled spans from the span processor.',
    initialStatus: 'idle',
    initialDetail: 'No span batch is queued.',
  },
  {
    id: 'collector',
    label: 'OpenTelemetry Collector',
    kind: 'collector',
    truthPlane: 'user-visible',
    description: 'Receives exported telemetry; it cannot recover a span dropped in-process.',
    initialStatus: 'idle',
    initialDetail: 'No server span has arrived.',
    initialMetrics: { receivedSpans: 0 },
  },
];

interface TraceScenarioInput {
  id: string;
  title: string;
  summary: string;
  incomingContext: 'remote-unsampled' | 'remote-sampled' | 'none';
  remoteParentPolicy: 'default' | 'ratio-override';
  ratioResult: 'not-used' | 'sample' | 'drop';
  traceparent: string | null;
  parentDetail: string;
  samplerBranch: string;
  samplerDetail: string;
  sampled: boolean;
  correctPredictionId: 'collector-receives' | 'collector-empty';
}

function traceScenario(input: TraceScenarioInput): ScenarioDefinition {
  const prefix = input.id;
  const requestHasHeader = input.traceparent !== null;
  const transitions = sequenceTransitions([
    {
      id: `${prefix}-request-enters`,
      at: 1,
      actorId: 'request',
      title: 'Request enters',
      description: requestHasHeader
        ? 'The request carries a W3C traceparent header.'
        : 'The request has no supported parent trace header.',
      patch: {
        status: 'complete',
        detail: requestHasHeader
          ? `traceparent=${input.traceparent}`
          : 'No traceparent header is present.',
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-header`,
          actorId: 'request',
          truthPlane: 'source',
          kind: 'request',
          label: 'traceparent',
          value: input.traceparent,
          detail: requestHasHeader
            ? 'The final flags byte is part of the incoming sampling context.'
            : 'The server must create a root span because extraction has no parent.',
        }),
      ],
    },
    {
      id: `${prefix}-propagator-extracts`,
      at: 2,
      actorId: 'propagator',
      title: requestHasHeader ? 'Remote context extracted' : 'No context extracted',
      description: requestHasHeader
        ? 'The configured Trace Context propagator parses the header before span creation.'
        : 'Extraction returns the empty context.',
      patch: {
        status: requestHasHeader ? 'complete' : 'degraded',
        detail: requestHasHeader
          ? 'A valid remote SpanContext is attached to the request context.'
          : 'No valid remote SpanContext is available.',
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-propagator-result`,
          actorId: 'propagator',
          truthPlane: 'process',
          kind: 'state',
          label: 'Extraction result',
          value: requestHasHeader ? 'valid remote parent' : 'no parent',
          detail: 'Sampling can only branch on parent state the propagator actually extracted.',
          decisive: true,
        }),
      ],
      checkpoint: 'decision',
    },
    {
      id: `${prefix}-parent-context`,
      at: 3,
      actorId: 'parent',
      title: requestHasHeader ? 'Parent flags resolved' : 'Root path selected',
      description: input.parentDetail,
      patch: {
        status: 'complete',
        detail: input.parentDetail,
        metrics: requestHasHeader
          ? {
              valid: true,
              remote: true,
              sampled: input.incomingContext === 'remote-sampled',
            }
          : { valid: false, remote: false, sampled: false },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-parent-flags`,
          actorId: 'parent',
          truthPlane: 'process',
          kind: 'state',
          label: 'Parent classification',
          value: input.incomingContext,
          detail: input.parentDetail,
          decisive: true,
        }),
      ],
    },
    {
      id: `${prefix}-sampler-decision`,
      at: 4,
      actorId: 'sampler',
      title: `Sampler branch: ${input.samplerBranch}`,
      description: input.samplerDetail,
      patch: {
        status: input.sampled ? 'complete' : 'degraded',
        detail: input.samplerDetail,
        metrics: {
          selectedBranch: input.samplerBranch,
          decision: input.sampled ? 'RECORD_AND_SAMPLE' : 'DROP',
        },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-sampling-decision`,
          actorId: 'sampler',
          truthPlane: 'process',
          kind: 'state',
          label: 'Sampling decision',
          value: input.sampled ? 'RECORD_AND_SAMPLE' : 'DROP',
          detail: input.samplerDetail,
          decisive: true,
        }),
      ],
      checkpoint: 'decision',
    },
    {
      id: `${prefix}-span-result`,
      at: 5,
      actorId: 'span',
      title: input.sampled ? 'Recording sampled span created' : 'Non-recording span returned',
      description: input.sampled
        ? 'The SDK records attributes and sends the ended span to its processor.'
        : 'The SDK returns a non-recording span; there is no ended sampled span to export.',
      patch: {
        status: input.sampled ? 'complete' : 'failed',
        detail: input.sampled
          ? 'IsRecording=true, Sampled=true.'
          : 'IsRecording=false, Sampled=false.',
        metrics: { isRecording: input.sampled, sampled: input.sampled },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-span-flags`,
          actorId: 'span',
          truthPlane: 'process',
          kind: 'state',
          label: 'Span flags',
          value: input.sampled ? 'recording / sampled' : 'non-recording / not sampled',
          detail: 'The in-process SDK decision determines whether any span payload exists.',
        }),
      ],
    },
    {
      id: `${prefix}-exporter-result`,
      at: 6,
      actorId: 'exporter',
      title: input.sampled ? 'Span batch exported' : 'Exporter receives nothing',
      description: input.sampled
        ? 'The processor passes the sampled span to the OTLP exporter.'
        : 'No sampled span reaches the processor or exporter.',
      patch: {
        status: input.sampled ? 'complete' : 'idle',
        detail: input.sampled ? 'One server span exported.' : 'Zero server spans queued.',
        metrics: { exportedSpans: input.sampled ? 1 : 0 },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-export-count`,
          actorId: 'exporter',
          truthPlane: 'operation',
          kind: 'metric',
          label: 'Exported spans',
          value: input.sampled ? 1 : 0,
          detail: input.sampled
            ? 'One payload is sent downstream.'
            : 'A Collector cannot receive a payload that was never created.',
        }),
      ],
    },
    {
      id: `${prefix}-collector-result`,
      at: 7,
      actorId: 'collector',
      title: input.sampled ? 'Collector receives the span' : 'Collector remains empty',
      description: input.sampled
        ? 'The OTLP receiver accepts one server span.'
        : 'The pipeline is healthy but has no span to ingest.',
      patch: {
        status: input.sampled ? 'healthy' : 'idle',
        detail: input.sampled ? 'One server span received.' : 'Zero server spans received.',
        metrics: { receivedSpans: input.sampled ? 1 : 0 },
      },
      evidence: [
        emitEvidence({
          id: `${prefix}-collector-count`,
          actorId: 'collector',
          truthPlane: 'user-visible',
          kind: 'metric',
          label: 'Received spans',
          value: input.sampled ? 1 : 0,
          detail: input.sampled
            ? 'Collector-side evidence exists because the SDK sampled and exported.'
            : 'Collector emptiness is the downstream consequence, not the sampling cause.',
          decisive: true,
        }),
      ],
    },
  ]);

  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    controls: {
      incomingContext: input.incomingContext,
      remoteParentPolicy: input.remoteParentPolicy,
      ratioResult: input.ratioResult,
    },
    predictionPrompt: 'Will this request produce a server span at the Collector?',
    predictionOptions: [
      {
        id: 'collector-receives',
        label: 'Yes. The SDK records, samples, and exports one server span.',
      },
      {
        id: 'collector-empty',
        label: 'No. The in-process sampling branch drops it before export.',
      },
    ],
    correctPredictionId: input.correctPredictionId,
    entryTransitionId: transitions[0].id,
    transitions: transitions as TransitionDefinition[],
    expectedOutcome: {
      summary: input.sampled
        ? 'The selected sampler delegate records and samples, so one span reaches the Collector.'
        : 'The selected sampler delegate drops the span, so the healthy pipeline receives nothing.',
      actorStates: {
        propagator: requestHasHeader ? 'complete' : 'degraded',
        sampler: input.sampled ? 'complete' : 'degraded',
        span: input.sampled ? 'complete' : 'failed',
        exporter: input.sampled ? 'complete' : 'idle',
        collector: input.sampled ? 'healthy' : 'idle',
      },
      evidenceIds: [
        `${prefix}-propagator-result`,
        `${prefix}-parent-flags`,
        `${prefix}-sampling-decision`,
        `${prefix}-collector-count`,
      ],
    },
  };
}

export const tracingLab: SystemsLabDefinition = {
  id: 'trace-propagation-sampling',
  version: 1,
  eyebrow: 'Systems Lab 02',
  title: 'Trace context and the sampling branch',
  summary:
    'See exactly how extraction creates a remote parent and why ParentBased can bypass the root ratio before a Collector ever enters the story.',
  estimatedMinutes: 18,
  conceptIds: ['tracing-replay', 'monitoring-analytics'],
  learningObjectives: [
    'Separate propagation, sampling, recording, exporting, and collection.',
    'Identify the ParentBased delegate selected by remote and sampled flags.',
    'Explain why a root ratio does not control requests with a valid remote parent.',
    'Prove whether a missing trace died in-process or downstream.',
  ],
  actors,
  controls: [
    {
      id: 'incomingContext',
      label: 'Incoming context',
      description: 'The parent state extracted from the request.',
      options: [
        { value: 'remote-unsampled', label: 'Remote, not sampled' },
        { value: 'remote-sampled', label: 'Remote, sampled' },
        { value: 'none', label: 'No parent' },
      ],
    },
    {
      id: 'remoteParentPolicy',
      label: 'Remote-parent delegates',
      description: 'Whether ParentBased uses its defaults or a ratio override for remote parents.',
      options: [
        { value: 'default', label: 'Default AlwaysOn / AlwaysOff' },
        { value: 'ratio-override', label: 'Ratio delegate override' },
      ],
    },
    {
      id: 'ratioResult',
      label: 'Deterministic ratio result',
      description: 'The fixed result when this scenario selects a ratio-based delegate.',
      options: [
        { value: 'not-used', label: 'Root delegate not used' },
        { value: 'sample', label: 'Trace ID falls inside ratio' },
        { value: 'drop', label: 'Trace ID falls outside ratio' },
      ],
    },
  ],
  scenarios: [
    traceScenario({
      id: 'remote-unsampled-default',
      title: 'Remote unsampled parent, default ParentBased',
      summary: 'The remoteParentNotSampled default is AlwaysOff; the root ratio never runs.',
      incomingContext: 'remote-unsampled',
      remoteParentPolicy: 'default',
      ratioResult: 'not-used',
      traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00',
      parentDetail: 'Valid=true, Remote=true, Sampled=false.',
      samplerBranch: 'remoteParentNotSampled',
      samplerDetail:
        'ParentBased invokes its default AlwaysOff delegate, not root=TraceIdRatioBased(0.1).',
      sampled: false,
      correctPredictionId: 'collector-empty',
    }),
    traceScenario({
      id: 'remote-unsampled-override',
      title: 'Remote unsampled parent, ratio override',
      summary: 'An explicit remote-parent delegate can make a new decision for edge traffic.',
      incomingContext: 'remote-unsampled',
      remoteParentPolicy: 'ratio-override',
      ratioResult: 'sample',
      traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00',
      parentDetail: 'Valid=true, Remote=true, Sampled=false.',
      samplerBranch: 'remoteParentNotSampled → ratio(1.0)',
      samplerDetail:
        'The configured remoteParentNotSampled delegate samples this deterministic trace.',
      sampled: true,
      correctPredictionId: 'collector-receives',
    }),
    traceScenario({
      id: 'remote-sampled-default',
      title: 'Trusted sampled parent',
      summary: 'The remoteParentSampled default preserves the upstream sampled flag.',
      incomingContext: 'remote-sampled',
      remoteParentPolicy: 'default',
      ratioResult: 'not-used',
      traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
      parentDetail: 'Valid=true, Remote=true, Sampled=true.',
      samplerBranch: 'remoteParentSampled',
      samplerDetail:
        'ParentBased invokes its default AlwaysOn delegate; the root ratio is bypassed.',
      sampled: true,
      correctPredictionId: 'collector-receives',
    }),
    traceScenario({
      id: 'root-ratio-samples',
      title: 'No parent, root ratio samples',
      summary: 'Only a root span delegates to root=TraceIdRatioBased.',
      incomingContext: 'none',
      remoteParentPolicy: 'default',
      ratioResult: 'sample',
      traceparent: null,
      parentDetail: 'No valid parent exists, so the new server span is a root.',
      samplerBranch: 'root',
      samplerDetail: 'The deterministic trace ID falls inside the configured 10% root ratio.',
      sampled: true,
      correctPredictionId: 'collector-receives',
    }),
    traceScenario({
      id: 'root-ratio-drops',
      title: 'No parent, root ratio drops',
      summary: 'The same root delegate can deterministically drop a different trace ID.',
      incomingContext: 'none',
      remoteParentPolicy: 'default',
      ratioResult: 'drop',
      traceparent: null,
      parentDetail: 'No valid parent exists, so the new server span is a root.',
      samplerBranch: 'root',
      samplerDetail: 'The deterministic trace ID falls outside the configured 10% root ratio.',
      sampled: false,
      correctPredictionId: 'collector-empty',
    }),
  ],
  defaultScenarioId: 'remote-unsampled-default',
  configurationChallenge: tracingConfigurationChallenge,
  fidelity: {
    level: 'source-verified',
    summary:
      'Propagation and ParentBased branch rules are checked against pinned W3C and OpenTelemetry test vectors.',
  },
  provenance: [
    {
      id: 'opentelemetry-js-sampling',
      project: 'OpenTelemetry JavaScript',
      repository: 'https://github.com/open-telemetry/opentelemetry-js',
      revision: '7b06368b7362a30ca69c178f43bd94dfbb36f85d',
      sourcePaths: [
        'packages/sdk-trace/src/sampler/ParentBasedSampler.ts',
        'packages/sdk-trace/test/common/sampler/ParentBasedSampler.test.ts',
        'packages/opentelemetry-core/test/common/trace/W3CTraceContextPropagator.test.ts',
      ],
      license: 'Apache-2.0',
      verifiedOn: '2026-07-30',
      method: 'upstream-test-vector',
      note: 'The remote sampled, remote unsampled, and root delegates come from the upstream matrix.',
    },
    {
      id: 'w3c-trace-context',
      project: 'W3C Trace Context',
      repository: 'https://github.com/w3c/trace-context',
      revision: 'acab820be9db7b3433668baa5cdd43f57f4c4be0',
      sourcePaths: ['test/tracecontext/test_traceparent.py', 'test/tracecontext/traceparent.py'],
      license: 'W3C Software and Document License',
      verifiedOn: '2026-07-30',
      method: 'upstream-test-vector',
      note: 'Traceparent validity and sampled-flag parsing use the specification test suite.',
    },
  ],
  sources: [
    {
      label: 'OpenTelemetry tracing SDK specification',
      href: 'https://opentelemetry.io/docs/specs/otel/trace/sdk/',
      note: 'ParentBased branches, default delegates, recording, sampled flags, and exporters.',
    },
    {
      label: 'OpenTelemetry trace API specification',
      href: 'https://opentelemetry.io/docs/specs/otel/trace/api/',
      note: 'Remote parent semantics and propagation requirements.',
    },
    {
      label: 'OpenTelemetry general SDK configuration',
      href: 'https://opentelemetry.io/docs/languages/sdk-configuration/general/',
      note: 'Environment names for propagators, samplers, and exporters.',
    },
  ],
};
