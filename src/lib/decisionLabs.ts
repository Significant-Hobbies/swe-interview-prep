import type { DecisionLabId, DecisionReceiptV1 } from './learningEvidence';

const GIB = 1024 ** 3;

export interface InferenceCapacityInputs {
  gpuMemoryGiB: number;
  parameterBillions: number;
  weightBytes: number;
  layers: number;
  kvHeads: number;
  headDimension: number;
  cachedTokens: number;
  activeSequences: number;
  kvBytes: number;
  reserveGiB: number;
}

export interface InferenceCapacityResult {
  modelWeightsGiB: number;
  kvCacheGiB: number;
  reserveGiB: number;
  totalGiB: number;
  headroomGiB: number;
  firstConstraint: 'memory' | 'none-declared';
  strongestLever: string;
  excludedOverhead: string[];
}

function requireFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite, non-negative number.`);
  }
}

export function calculateInferenceCapacity(
  inputs: InferenceCapacityInputs
): InferenceCapacityResult {
  for (const [name, value] of Object.entries(inputs)) requireFiniteNonNegative(name, value);
  if (inputs.gpuMemoryGiB <= 0) throw new Error('gpuMemoryGiB must be greater than zero.');
  if (inputs.layers <= 0 || inputs.kvHeads <= 0 || inputs.headDimension <= 0) {
    throw new Error('Model dimensions must be greater than zero.');
  }

  const modelWeightsGiB = (inputs.parameterBillions * 1_000_000_000 * inputs.weightBytes) / GIB;
  const kvCacheGiB =
    (2 *
      inputs.layers *
      inputs.kvHeads *
      inputs.headDimension *
      inputs.cachedTokens *
      inputs.activeSequences *
      inputs.kvBytes) /
    GIB;
  const totalGiB = modelWeightsGiB + kvCacheGiB + inputs.reserveGiB;
  const headroomGiB = inputs.gpuMemoryGiB - totalGiB;

  return {
    modelWeightsGiB,
    kvCacheGiB,
    reserveGiB: inputs.reserveGiB,
    totalGiB,
    headroomGiB,
    firstConstraint: headroomGiB < 0 ? 'memory' : 'none-declared',
    strongestLever:
      modelWeightsGiB >= kvCacheGiB
        ? 'Reduce parameter count or weight precision.'
        : 'Reduce cached tokens, active sequences, or KV precision.',
    excludedOverhead: [
      'activations beyond the declared reserve',
      'allocator fragmentation',
      'CUDA graphs and runtime workspaces',
      'non-model process memory',
    ],
  };
}

export interface CapacityPlanningInputs {
  requestsPerSecond: number;
  peakMultiplier: number;
  averagePayloadKiB: number;
  retentionDays: number;
  serviceCapacityRps: number;
  replicas: number;
}

export interface CapacityPlanningResult {
  peakRequestsPerSecond: number;
  requiredReplicas: number;
  dailyIngressGiB: number;
  retainedStorageGiB: number;
  provisionedRequestsPerSecond: number;
  firstConstraint: 'throughput' | 'none-declared';
}

export function calculateCapacityPlan(inputs: CapacityPlanningInputs): CapacityPlanningResult {
  for (const [name, value] of Object.entries(inputs)) requireFiniteNonNegative(name, value);
  if (inputs.serviceCapacityRps <= 0 || inputs.replicas <= 0) {
    throw new Error('Service capacity and replicas must be greater than zero.');
  }
  const peakRequestsPerSecond = inputs.requestsPerSecond * inputs.peakMultiplier;
  const requiredReplicas = Math.ceil(peakRequestsPerSecond / inputs.serviceCapacityRps);
  const dailyIngressGiB =
    (inputs.requestsPerSecond * 86_400 * inputs.averagePayloadKiB * 1024) / GIB;
  const retainedStorageGiB = dailyIngressGiB * inputs.retentionDays;
  const provisionedRequestsPerSecond = inputs.serviceCapacityRps * inputs.replicas;
  return {
    peakRequestsPerSecond,
    requiredReplicas,
    dailyIngressGiB,
    retainedStorageGiB,
    provisionedRequestsPerSecond,
    firstConstraint:
      peakRequestsPerSecond > provisionedRequestsPerSecond ? 'throughput' : 'none-declared',
  };
}

export interface WilsonInterval {
  observedRate: number;
  low: number;
  high: number;
  samples: number;
}

export function wilsonInterval(passes: number, samples: number, z = 1.96): WilsonInterval {
  requireFiniteNonNegative('passes', passes);
  requireFiniteNonNegative('samples', samples);
  if (!Number.isInteger(passes) || !Number.isInteger(samples)) {
    throw new Error('Passes and samples must be whole numbers.');
  }
  if (samples <= 0 || passes > samples) {
    throw new Error('Samples must be greater than zero and passes cannot exceed samples.');
  }
  const p = passes / samples;
  const denominator = 1 + (z * z) / samples;
  const center = p + (z * z) / (2 * samples);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * samples)) / samples);
  return {
    observedRate: p,
    low: (center - margin) / denominator,
    high: (center + margin) / denominator,
    samples,
  };
}

export function compareWilsonIntervals(
  baseline: WilsonInterval,
  candidate: WilsonInterval
): 'candidate-supported' | 'baseline-supported' | 'insufficient-evidence' {
  if (candidate.low > baseline.high) return 'candidate-supported';
  if (baseline.low > candidate.high) return 'baseline-supported';
  return 'insufficient-evidence';
}

export interface ModelRoutingInputs {
  requestsPerSecond: number;
  complexRequestShare: number;
  fastModelCapacityRps: number;
  deepModelCapacityRps: number;
  fastModelQuality: number;
  deepModelQuality: number;
  qualityFloor: number;
}

export function calculateModelRouting(inputs: ModelRoutingInputs) {
  for (const [name, value] of Object.entries(inputs)) requireFiniteNonNegative(name, value);
  if (inputs.complexRequestShare > 1) {
    throw new Error('complexRequestShare must be a proportion from zero to one.');
  }
  const simpleRequestsPerSecond = inputs.requestsPerSecond * (1 - inputs.complexRequestShare);
  const complexRequestsPerSecond = inputs.requestsPerSecond * inputs.complexRequestShare;
  const weightedQuality =
    inputs.fastModelQuality * (1 - inputs.complexRequestShare) +
    inputs.deepModelQuality * inputs.complexRequestShare;
  const constraints = [
    simpleRequestsPerSecond > inputs.fastModelCapacityRps ? 'fast-model-capacity' : null,
    complexRequestsPerSecond > inputs.deepModelCapacityRps ? 'deep-model-capacity' : null,
    weightedQuality < inputs.qualityFloor ? 'quality-floor' : null,
  ].filter(Boolean);

  return {
    simpleRequestsPerSecond,
    complexRequestsPerSecond,
    weightedQuality,
    firstConstraint: constraints[0] ?? 'none-declared',
    routingAssumption:
      'All requests marked complex use the deep model; all remaining requests use the fast model.',
  };
}

export interface RagReadinessInputs {
  sourceDocuments: number;
  extractedDocuments: number;
  generatedChunks: number;
  evaluatedAnswers: number;
  groundedAnswers: number;
  requiredExtractionCoverage: number;
  requiredGroundedRate: number;
}

export function calculateRagReadiness(inputs: RagReadinessInputs) {
  for (const [name, value] of Object.entries(inputs)) requireFiniteNonNegative(name, value);
  if (inputs.sourceDocuments <= 0 || inputs.evaluatedAnswers <= 0) {
    throw new Error('Source documents and evaluated answers must be greater than zero.');
  }
  if (inputs.extractedDocuments > inputs.sourceDocuments) {
    throw new Error('Extracted documents cannot exceed source documents.');
  }
  if (inputs.groundedAnswers > inputs.evaluatedAnswers) {
    throw new Error('Grounded answers cannot exceed evaluated answers.');
  }
  const extractionCoverage = inputs.extractedDocuments / inputs.sourceDocuments;
  const averageChunksPerExtractedDocument =
    inputs.extractedDocuments === 0 ? 0 : inputs.generatedChunks / inputs.extractedDocuments;
  const groundedRate = inputs.groundedAnswers / inputs.evaluatedAnswers;
  const extractionReady = extractionCoverage >= inputs.requiredExtractionCoverage;
  const groundingReady = groundedRate >= inputs.requiredGroundedRate;
  return {
    extractionCoverage,
    averageChunksPerExtractedDocument,
    groundedRate,
    firstConstraint: !extractionReady
      ? 'extraction-coverage'
      : !groundingReady
        ? 'grounding-rate'
        : 'none-declared',
    readiness: extractionReady && groundingReady ? 'declared gates pass' : 'not ready',
    excludedEvidence: 'retrieval latency, citation correctness, freshness, and adversarial queries',
  };
}

export interface InferenceBenchmarkInputs {
  completedRequests: number;
  elapsedSeconds: number;
  inputTokens: number;
  outputTokens: number;
  totalCostDollars: number;
  summedTimeToFirstTokenMs: number;
  summedDecodeMs: number;
  failedRequests: number;
}

export function calculateInferenceBenchmark(inputs: InferenceBenchmarkInputs) {
  for (const [name, value] of Object.entries(inputs)) requireFiniteNonNegative(name, value);
  if (inputs.completedRequests <= 0 || inputs.elapsedSeconds <= 0 || inputs.outputTokens <= 0) {
    throw new Error(
      'Completed requests, elapsed seconds, and output tokens must be greater than zero.'
    );
  }
  const attemptedRequests = inputs.completedRequests + inputs.failedRequests;
  const totalTokens = inputs.inputTokens + inputs.outputTokens;
  return {
    requestThroughput: inputs.completedRequests / inputs.elapsedSeconds,
    outputTokenThroughput: inputs.outputTokens / inputs.elapsedSeconds,
    averageTimeToFirstTokenMs: inputs.summedTimeToFirstTokenMs / inputs.completedRequests,
    averageTimePerOutputTokenMs: inputs.summedDecodeMs / inputs.outputTokens,
    costPerMillionTokens:
      totalTokens === 0 ? 0 : (inputs.totalCostDollars / totalTokens) * 1_000_000,
    errorRate: attemptedRequests === 0 ? 0 : inputs.failedRequests / attemptedRequests,
    measurementBoundary: 'Client-observed aggregate totals over the declared elapsed window.',
  };
}

type DecisionReceiptInput = Pick<
  DecisionReceiptV1,
  | 'accountScope'
  | 'labId'
  | 'definitionVersion'
  | 'conceptIds'
  | 'inputs'
  | 'derived'
  | 'prediction'
  | 'conclusion'
  | 'mitigation'
  | 'counterfactual'
  | 'verificationMetric'
> & {
  now?: Date;
};

export function createDecisionReceipt(args: DecisionReceiptInput): DecisionReceiptV1 {
  for (const [field, value] of Object.entries({
    prediction: args.prediction,
    conclusion: args.conclusion,
    mitigation: args.mitigation,
    counterfactual: args.counterfactual,
    verificationMetric: args.verificationMetric,
  })) {
    if (!value.trim()) throw new Error(`${field} is required before issuing a receipt.`);
  }
  const createdAt = (args.now ?? new Date()).toISOString();
  return {
    schemaVersion: 1,
    id: `${args.labId}:v${args.definitionVersion}:${createdAt}`,
    accountScope: args.accountScope,
    labId: args.labId,
    definitionVersion: args.definitionVersion,
    conceptIds: [...args.conceptIds],
    inputs: { ...args.inputs },
    derived: { ...args.derived },
    prediction: args.prediction,
    conclusion: args.conclusion,
    mitigation: args.mitigation,
    counterfactual: args.counterfactual,
    verificationMetric: args.verificationMetric,
    evidenceState: 'explanation-pending',
    masteryStatus: 'pending',
    createdAt,
  };
}
