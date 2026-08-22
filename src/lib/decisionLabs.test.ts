import { describe, expect, it } from 'vitest';

import {
  calculateCapacityPlan,
  calculateInferenceCapacity,
  calculateInferenceBenchmark,
  calculateModelRouting,
  calculateRagReadiness,
  compareWilsonIntervals,
  createDecisionReceipt,
  wilsonInterval,
} from './decisionLabs';

describe('decision labs', () => {
  it('separates weights, KV cache, reserve, headroom, and excluded overhead', () => {
    const result = calculateInferenceCapacity({
      gpuMemoryGiB: 24,
      parameterBillions: 7,
      weightBytes: 2,
      layers: 32,
      kvHeads: 8,
      headDimension: 128,
      cachedTokens: 4096,
      activeSequences: 16,
      kvBytes: 2,
      reserveGiB: 4,
    });

    expect(result.modelWeightsGiB).toBeCloseTo(13.04, 1);
    expect(result.kvCacheGiB).toBe(8);
    expect(result.totalGiB).toBeCloseTo(25.04, 1);
    expect(result.firstConstraint).toBe('memory');
    expect(result.excludedOverhead).toContain('allocator fragmentation');
  });

  it('derives peak throughput, replicas, and retained storage', () => {
    const result = calculateCapacityPlan({
      requestsPerSecond: 100,
      peakMultiplier: 3,
      averagePayloadKiB: 4,
      retentionDays: 7,
      serviceCapacityRps: 80,
      replicas: 3,
    });
    expect(result.peakRequestsPerSecond).toBe(300);
    expect(result.requiredReplicas).toBe(4);
    expect(result.firstConstraint).toBe('throughput');
    expect(result.retainedStorageGiB).toBeGreaterThan(0);
  });

  it('rejects dimensionally invalid values', () => {
    expect(() =>
      calculateCapacityPlan({
        requestsPerSecond: -1,
        peakMultiplier: 2,
        averagePayloadKiB: 1,
        retentionDays: 1,
        serviceCapacityRps: 1,
        replicas: 1,
      })
    ).toThrow(/non-negative/);
  });

  it('uses conservative Wilson interval comparison', () => {
    const baseline = wilsonInterval(80, 100);
    const overlapping = wilsonInterval(84, 100);
    const supported = wilsonInterval(98, 100);
    expect(compareWilsonIntervals(baseline, overlapping)).toBe('insufficient-evidence');
    expect(compareWilsonIntervals(baseline, supported)).toBe('candidate-supported');
  });

  it('identifies the first declared model-routing constraint', () => {
    const result = calculateModelRouting({
      requestsPerSecond: 100,
      complexRequestShare: 0.25,
      fastModelCapacityRps: 90,
      deepModelCapacityRps: 20,
      fastModelQuality: 0.78,
      deepModelQuality: 0.94,
      qualityFloor: 0.8,
    });
    expect(result.complexRequestsPerSecond).toBe(25);
    expect(result.firstConstraint).toBe('deep-model-capacity');
  });

  it('keeps RAG readiness gated by declared extraction and grounding evidence', () => {
    const result = calculateRagReadiness({
      sourceDocuments: 100,
      extractedDocuments: 98,
      generatedChunks: 980,
      evaluatedAnswers: 50,
      groundedAnswers: 35,
      requiredExtractionCoverage: 0.95,
      requiredGroundedRate: 0.85,
    });
    expect(result.extractionCoverage).toBe(0.98);
    expect(result.firstConstraint).toBe('grounding-rate');
    expect(result.readiness).toBe('not ready');
  });

  it('normalizes inference benchmark totals without provider claims', () => {
    const result = calculateInferenceBenchmark({
      completedRequests: 100,
      failedRequests: 5,
      elapsedSeconds: 20,
      inputTokens: 80000,
      outputTokens: 20000,
      summedTimeToFirstTokenMs: 40000,
      summedDecodeMs: 500000,
      totalCostDollars: 2.5,
    });
    expect(result.requestThroughput).toBe(5);
    expect(result.averageTimeToFirstTokenMs).toBe(400);
    expect(result.averageTimePerOutputTokenMs).toBe(25);
    expect(result.costPerMillionTokens).toBe(25);
  });

  it('creates a deterministic, pending receipt after a frozen decision', () => {
    const now = new Date('2026-08-20T10:00:00.000Z');
    const receipt = createDecisionReceipt({
      accountScope: 'owner',
      labId: 'capacity-planning',
      definitionVersion: 1,
      conceptIds: ['capacity-estimation'],
      inputs: { requestsPerSecond: 100 },
      derived: { firstConstraint: 'throughput' },
      prediction: 'Throughput binds first.',
      conclusion: 'Add one replica before peak.',
      mitigation: 'Scale to four replicas.',
      counterfactual: 'At 2x peak, three replicas suffice.',
      verificationMetric: 'Queue delay p95 under 50 ms.',
      now,
    });
    expect(receipt.id).toContain(now.toISOString());
    expect(receipt).toMatchObject({
      evidenceState: 'explanation-pending',
      masteryStatus: 'pending',
    });
  });
});
