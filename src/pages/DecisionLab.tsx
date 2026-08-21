import { useParams } from 'react-router-dom';

import { DecisionLabShell, type DecisionLabDefinition } from '../components/DecisionLabShell';
import { Card, PageShell } from '../components/ui';
import {
  calculateCapacityPlan,
  calculateInferenceCapacity,
  calculateInferenceBenchmark,
  calculateModelRouting,
  calculateRagReadiness,
  compareWilsonIntervals,
  wilsonInterval,
} from '../lib/decisionLabs';

export const decisionLabDefinitions: DecisionLabDefinition[] = [
  {
    id: 'inference-capacity',
    version: 1,
    title: 'Inference capacity',
    summary:
      'Estimate model weights, raw KV cache, reserve, and headroom. Name the first declared memory constraint without pretending the estimate predicts runtime latency.',
    estimatedMinutes: 25,
    conceptIds: [
      'inference-engines',
      'kv-cache-paged-attention',
      'gpu-utilization',
      'inference-hardware',
    ],
    predictionPrompt:
      'Will weights, KV cache, or the declared reserve consume the budget first? Which input is the strongest lever?',
    predictionExample:
      'Example: Model weights will consume the budget first; parameter count is the strongest lever.',
    formulaIds: ['model-weight-bytes', 'kv-cache-bytes'],
    fields: [
      {
        id: 'gpuMemoryGiB',
        label: 'GPU memory',
        unit: 'GiB',
        initial: 24,
        min: 1,
        group: 'Hardware budget',
      },
      {
        id: 'parameterBillions',
        label: 'Parameters',
        unit: 'billions',
        initial: 7,
        min: 0.1,
        step: 0.1,
        group: 'Model shape',
      },
      {
        id: 'weightBytes',
        label: 'Weight precision',
        unit: 'bytes/value',
        initial: 2,
        min: 0.125,
        step: 0.125,
        group: 'Model shape',
      },
      {
        id: 'layers',
        label: 'Transformer layers',
        unit: 'layers',
        initial: 32,
        min: 1,
        group: 'Model shape',
      },
      {
        id: 'kvHeads',
        label: 'KV heads',
        unit: 'heads',
        initial: 8,
        min: 1,
        group: 'Model shape',
      },
      {
        id: 'headDimension',
        label: 'Head dimension',
        unit: 'values/head',
        initial: 128,
        min: 1,
        group: 'Model shape',
      },
      {
        id: 'cachedTokens',
        label: 'Cached tokens',
        unit: 'tokens/sequence',
        initial: 4096,
        min: 1,
        group: 'Workload',
      },
      {
        id: 'activeSequences',
        label: 'Active sequences',
        unit: 'sequences',
        initial: 16,
        min: 1,
        group: 'Workload',
      },
      {
        id: 'kvBytes',
        label: 'KV precision',
        unit: 'bytes/value',
        initial: 2,
        min: 0.125,
        step: 0.125,
        group: 'Model shape',
      },
      {
        id: 'reserveGiB',
        label: 'Runtime reserve',
        unit: 'GiB',
        initial: 4,
        min: 0,
        group: 'Reserve',
      },
    ],
    calculate: (values) => {
      const result = calculateInferenceCapacity(values as never);
      return {
        modelWeightsGiB: result.modelWeightsGiB,
        kvCacheGiB: result.kvCacheGiB,
        reserveGiB: result.reserveGiB,
        totalGiB: result.totalGiB,
        headroomGiB: result.headroomGiB,
        firstConstraint: result.firstConstraint,
        strongestLever: result.strongestLever,
        excludedOverhead: result.excludedOverhead.join('; '),
      };
    },
  },
  {
    id: 'capacity-planning',
    version: 1,
    title: 'Capacity planning',
    summary:
      'Turn workload assumptions into peak throughput, replica, and storage estimates—then preserve the engineering choice and the measurement that could falsify it.',
    estimatedMinutes: 20,
    conceptIds: ['capacity-estimation', 'reliability-fault-tolerance'],
    predictionPrompt:
      'At the declared peak, will throughput exceed provisioned capacity? Predict the required replica count before calculating.',
    predictionExample:
      'Example: Peak demand will exceed capacity; I expect four replicas to be required.',
    formulaIds: ['throughput'],
    fields: [
      {
        id: 'requestsPerSecond',
        label: 'Steady request rate',
        unit: 'requests/s',
        initial: 100,
        min: 0,
        group: 'Demand',
      },
      {
        id: 'peakMultiplier',
        label: 'Peak multiplier',
        unit: '× steady',
        initial: 3,
        min: 0,
        group: 'Demand',
      },
      {
        id: 'averagePayloadKiB',
        label: 'Average payload',
        unit: 'KiB/request',
        initial: 4,
        min: 0,
        group: 'Storage',
      },
      {
        id: 'retentionDays',
        label: 'Retention',
        unit: 'days',
        initial: 7,
        min: 0,
        group: 'Storage',
      },
      {
        id: 'serviceCapacityRps',
        label: 'Replica capacity',
        unit: 'requests/s',
        initial: 80,
        min: 1,
        group: 'Provisioning',
      },
      {
        id: 'replicas',
        label: 'Provisioned replicas',
        unit: 'replicas',
        initial: 3,
        min: 1,
        group: 'Provisioning',
      },
    ],
    calculate: (values) => ({ ...calculateCapacityPlan(values as never) }),
  },
  {
    id: 'evaluation-confidence',
    version: 1,
    title: 'Evaluation confidence',
    summary:
      'Compare observed pass rates with 95% Wilson intervals. The lab says “insufficient evidence” when uncertainty overlaps instead of manufacturing a win.',
    estimatedMinutes: 20,
    conceptIds: ['llm-evals', 'ml-evaluation', 'search-evals', 'quality-cost-latency-measurement'],
    predictionPrompt:
      'Does the candidate have enough evidence to support a directional improvement over baseline, or will uncertainty overlap?',
    predictionExample:
      'Example: The intervals will overlap, so the result will be insufficient evidence.',
    formulaIds: ['wilson-interval'],
    fields: [
      {
        id: 'baselinePasses',
        label: 'Baseline passes',
        unit: 'passes',
        initial: 80,
        min: 0,
        group: 'Baseline',
      },
      {
        id: 'baselineSamples',
        label: 'Baseline samples',
        unit: 'samples',
        initial: 100,
        min: 1,
        group: 'Baseline',
      },
      {
        id: 'candidatePasses',
        label: 'Candidate passes',
        unit: 'passes',
        initial: 84,
        min: 0,
        group: 'Candidate',
      },
      {
        id: 'candidateSamples',
        label: 'Candidate samples',
        unit: 'samples',
        initial: 100,
        min: 1,
        group: 'Candidate',
      },
    ],
    calculate: (values) => {
      const baseline = wilsonInterval(values.baselinePasses, values.baselineSamples);
      const candidate = wilsonInterval(values.candidatePasses, values.candidateSamples);
      return {
        baselineObservedRate: baseline.observedRate,
        baseline95PercentInterval: `${(baseline.low * 100).toFixed(1)}–${(baseline.high * 100).toFixed(1)}%`,
        candidateObservedRate: candidate.observedRate,
        candidate95PercentInterval: `${(candidate.low * 100).toFixed(1)}–${(candidate.high * 100).toFixed(1)}%`,
        interpretation: compareWilsonIntervals(baseline, candidate),
        nextMeasurement:
          compareWilsonIntervals(baseline, candidate) === 'insufficient-evidence'
            ? 'Collect more independent samples or test a predeclared high-risk slice.'
            : 'Repeat on a held-out slice before operational rollout.',
      };
    },
  },
  {
    id: 'model-routing',
    version: 1,
    title: 'Model routing',
    summary:
      'Test a declared two-model routing policy against synthetic capacity and quality constraints. This lab does not claim current provider prices, model rankings, or production behavior.',
    estimatedMinutes: 20,
    conceptIds: ['inference-engines', 'quality-cost-latency-measurement'],
    predictionPrompt:
      'Which declared constraint will fail first: fast-model capacity, deep-model capacity, or the weighted quality floor?',
    predictionExample:
      'Example: The deep-model pool will saturate first because complex traffic exceeds its declared capacity.',
    formulaIds: ['throughput'],
    presets: [
      {
        id: 'quality-pressure',
        label: 'Quality pressure',
        description: 'more complex traffic',
        values: {
          requestsPerSecond: 100,
          complexRequestShare: 0.45,
          fastModelCapacityRps: 90,
          deepModelCapacityRps: 40,
          fastModelQuality: 0.78,
          deepModelQuality: 0.94,
          qualityFloor: 0.86,
        },
      },
      {
        id: 'fast-pool-pressure',
        label: 'Fast-pool pressure',
        description: 'high simple-request volume',
        values: {
          requestsPerSecond: 180,
          complexRequestShare: 0.2,
          fastModelCapacityRps: 120,
          deepModelCapacityRps: 45,
          fastModelQuality: 0.8,
          deepModelQuality: 0.93,
          qualityFloor: 0.82,
        },
      },
    ],
    fields: [
      {
        id: 'requestsPerSecond',
        label: 'Incoming traffic',
        unit: 'requests/s',
        initial: 100,
        min: 0,
        group: 'Traffic',
      },
      {
        id: 'complexRequestShare',
        label: 'Complex request share',
        unit: 'proportion',
        initial: 0.25,
        min: 0,
        step: 0.05,
        group: 'Routing policy',
      },
      {
        id: 'fastModelCapacityRps',
        label: 'Fast-model capacity',
        unit: 'requests/s',
        initial: 90,
        min: 0,
        group: 'Declared profiles',
      },
      {
        id: 'deepModelCapacityRps',
        label: 'Deep-model capacity',
        unit: 'requests/s',
        initial: 20,
        min: 0,
        group: 'Declared profiles',
      },
      {
        id: 'fastModelQuality',
        label: 'Fast-model quality',
        unit: 'score',
        initial: 0.78,
        min: 0,
        step: 0.01,
        group: 'Declared profiles',
      },
      {
        id: 'deepModelQuality',
        label: 'Deep-model quality',
        unit: 'score',
        initial: 0.94,
        min: 0,
        step: 0.01,
        group: 'Declared profiles',
      },
      {
        id: 'qualityFloor',
        label: 'Required quality floor',
        unit: 'score',
        initial: 0.82,
        min: 0,
        step: 0.01,
        group: 'Decision gate',
      },
    ],
    calculate: (values) => calculateModelRouting(values as never),
  },
  {
    id: 'rag-readiness',
    version: 1,
    title: 'RAG readiness',
    summary:
      'Check declared extraction coverage and answer grounding before calling a corpus ready. This diagnostic uses aggregate evidence only; it does not upload or inspect private documents.',
    estimatedMinutes: 20,
    conceptIds: ['rag', 'ml-embeddings', 'search-evals'],
    predictionPrompt:
      'Will extraction coverage or grounding evidence fail its declared gate first?',
    predictionExample: 'Example: Grounding will fail even though most documents were extracted.',
    formulaIds: [],
    presets: [
      {
        id: 'extraction-gap',
        label: 'Extraction gap',
        description: 'coverage fails first',
        values: {
          sourceDocuments: 100,
          extractedDocuments: 82,
          generatedChunks: 820,
          evaluatedAnswers: 50,
          groundedAnswers: 45,
          requiredExtractionCoverage: 0.95,
          requiredGroundedRate: 0.85,
        },
      },
      {
        id: 'grounding-gap',
        label: 'Grounding gap',
        description: 'coverage passes, answers fail',
        values: {
          sourceDocuments: 100,
          extractedDocuments: 98,
          generatedChunks: 1470,
          evaluatedAnswers: 50,
          groundedAnswers: 34,
          requiredExtractionCoverage: 0.95,
          requiredGroundedRate: 0.85,
        },
      },
    ],
    fields: [
      {
        id: 'sourceDocuments',
        label: 'Source documents',
        unit: 'documents',
        initial: 100,
        min: 1,
        group: 'Corpus',
      },
      {
        id: 'extractedDocuments',
        label: 'Extracted documents',
        unit: 'documents',
        initial: 92,
        min: 0,
        group: 'Corpus',
      },
      {
        id: 'generatedChunks',
        label: 'Generated chunks',
        unit: 'chunks',
        initial: 920,
        min: 0,
        group: 'Index',
      },
      {
        id: 'evaluatedAnswers',
        label: 'Evaluated answers',
        unit: 'answers',
        initial: 50,
        min: 1,
        group: 'Grounding evidence',
      },
      {
        id: 'groundedAnswers',
        label: 'Grounded answers',
        unit: 'answers',
        initial: 39,
        min: 0,
        group: 'Grounding evidence',
      },
      {
        id: 'requiredExtractionCoverage',
        label: 'Required extraction coverage',
        unit: 'proportion',
        initial: 0.95,
        min: 0,
        step: 0.01,
        group: 'Decision gates',
      },
      {
        id: 'requiredGroundedRate',
        label: 'Required grounded rate',
        unit: 'proportion',
        initial: 0.85,
        min: 0,
        step: 0.01,
        group: 'Decision gates',
      },
    ],
    calculate: (values) => calculateRagReadiness(values as never),
  },
  {
    id: 'inference-benchmarking',
    version: 1,
    title: 'Inference benchmarking',
    summary:
      'Normalize one declared client-observed run into request throughput, token throughput, TTFT, TPOT, cost, and errors. It compares no providers and invents no live measurements.',
    estimatedMinutes: 20,
    conceptIds: ['inference-cost-latency', 'gpu-utilization', 'quality-cost-latency-measurement'],
    predictionPrompt:
      'Which normalized metric will expose the first user or capacity constraint in this run?',
    predictionExample:
      'Example: Average TTFT will be the first user-facing constraint despite acceptable token throughput.',
    formulaIds: ['throughput', 'serving-latency'],
    presets: [
      {
        id: 'queue-heavy',
        label: 'Queue-heavy run',
        description: 'slow first token',
        values: {
          completedRequests: 100,
          failedRequests: 3,
          elapsedSeconds: 20,
          inputTokens: 80000,
          outputTokens: 20000,
          summedTimeToFirstTokenMs: 90000,
          summedDecodeMs: 400000,
          totalCostDollars: 2.5,
        },
      },
      {
        id: 'decode-heavy',
        label: 'Decode-heavy run',
        description: 'slow token cadence',
        values: {
          completedRequests: 100,
          failedRequests: 8,
          elapsedSeconds: 40,
          inputTokens: 40000,
          outputTokens: 30000,
          summedTimeToFirstTokenMs: 30000,
          summedDecodeMs: 1200000,
          totalCostDollars: 3.2,
        },
      },
    ],
    fields: [
      {
        id: 'completedRequests',
        label: 'Completed requests',
        unit: 'requests',
        initial: 100,
        min: 1,
        group: 'Run totals',
      },
      {
        id: 'failedRequests',
        label: 'Failed requests',
        unit: 'requests',
        initial: 5,
        min: 0,
        group: 'Run totals',
      },
      {
        id: 'elapsedSeconds',
        label: 'Elapsed window',
        unit: 'seconds',
        initial: 20,
        min: 0.01,
        step: 0.01,
        group: 'Run totals',
      },
      {
        id: 'inputTokens',
        label: 'Input tokens',
        unit: 'tokens',
        initial: 80000,
        min: 0,
        group: 'Token totals',
      },
      {
        id: 'outputTokens',
        label: 'Output tokens',
        unit: 'tokens',
        initial: 20000,
        min: 1,
        group: 'Token totals',
      },
      {
        id: 'summedTimeToFirstTokenMs',
        label: 'Summed TTFT',
        unit: 'ms',
        initial: 40000,
        min: 0,
        group: 'Latency totals',
      },
      {
        id: 'summedDecodeMs',
        label: 'Summed decode time',
        unit: 'ms',
        initial: 500000,
        min: 0,
        group: 'Latency totals',
      },
      {
        id: 'totalCostDollars',
        label: 'Total cost',
        unit: 'USD',
        initial: 2.5,
        min: 0,
        step: 0.01,
        group: 'Cost',
      },
    ],
    calculate: (values) => calculateInferenceBenchmark(values as never),
  },
];

export default function DecisionLab() {
  const { labId } = useParams();
  const definition = decisionLabDefinitions.find((candidate) => candidate.id === labId);
  if (!definition) {
    return (
      <PageShell>
        <Card className="p-8 text-center text-sm text-white/55">Decision lab not found.</Card>
      </PageShell>
    );
  }
  return <DecisionLabShell definition={definition} />;
}
