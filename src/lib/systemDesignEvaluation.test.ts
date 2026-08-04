import { describe, expect, it } from 'vitest';

import { SYSTEM_DESIGN_CASE_BY_ID } from '../data/system-design-cases';
import { createSystemDesignAttempt, type SystemDesignAttempt } from './systemDesignSession';
import {
  evaluateSystemDesignAttempt,
  evaluateSystemDesignWithOptionalAi,
  validateSystemDesignAiReview,
} from './systemDesignEvaluation';

const caseDefinition = SYSTEM_DESIGN_CASE_BY_ID['llm-inference-10k-rps'];

function reviewedAttempt(): SystemDesignAttempt {
  const attempt = createSystemDesignAttempt(caseDefinition, '2026-08-04T00:00:00.000Z');
  return {
    ...attempt,
    status: 'review',
    currentStageId: 'review',
    answers: {
      scoping: {
        answer:
          'Ask model size, input tokens, output tokens, streaming, TTFT, peak, and availability.',
        submittedAt: attempt.startedAt,
      },
      estimation: {
        answer: 'I skipped the numbers.',
        submittedAt: attempt.startedAt,
      },
      'high-level-design': {
        answer: 'Use admission, a router, bounded queue, scheduler, streaming, and model registry.',
        submittedAt: attempt.startedAt,
      },
      'deep-dive': {
        answer:
          'Continuous batching separates prefill and decode pressure, manages KV cache, deadlines, and fairness.',
        submittedAt: attempt.startedAt,
      },
      failure: {
        answer:
          'Track queue age, load shed with a retry budget, keep warm capacity, fallback model, and zone failover.',
        submittedAt: attempt.startedAt,
      },
    },
  };
}

describe('deterministic system-design evaluation', () => {
  it('cites learner evidence and names missing signals', () => {
    const review = evaluateSystemDesignAttempt(caseDefinition, reviewedAttempt());
    const requirements = review.dimensions.find(
      (dimension) => dimension.dimensionId === 'requirements'
    );
    const capacity = review.dimensions.find((dimension) => dimension.dimensionId === 'capacity');
    expect(requirements?.score).toBe(3);
    expect(requirements?.evidence[0]).toContain('model size');
    expect(capacity?.score).toBe(0);
    expect(capacity?.missing).toContain('benchmark');
  });

  it('targets only concepts and drills from missed dimensions', () => {
    const review = evaluateSystemDesignAttempt(caseDefinition, reviewedAttempt());
    expect(review.remediation.concepts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ conceptId: 'capacity-estimation', dimensionId: 'capacity' }),
      ])
    );
    expect(review.remediation.concepts).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ conceptId: 'monitoring-analytics', dimensionId: 'reliability' }),
      ])
    );
    expect(review.remediation.drillIds).toContain('practice-inference-hardware');
  });
});

describe('constrained AI system-design evaluation', () => {
  function validAiResult() {
    const attempt = reviewedAttempt();
    return {
      dimensions: caseDefinition.rubricDimensions.map((dimension) => ({
        dimensionId: dimension.id,
        score: 2,
        evidence: [attempt.answers[dimension.stageIds[0]]?.answer ?? ''],
      })),
      verdict: 'The reasoning is sound but needs more quantified evidence.',
    };
  }

  it('accepts only declared dimensions, bounded scores, and answer quotes', () => {
    const attempt = reviewedAttempt();
    expect(validateSystemDesignAiReview(validAiResult(), caseDefinition, attempt)).not.toBeNull();

    const outOfRange = validAiResult();
    outOfRange.dimensions[0].score = 4;
    expect(validateSystemDesignAiReview(outOfRange, caseDefinition, attempt)).toBeNull();

    const invented = validAiResult();
    invented.dimensions[0].evidence = ['The learner never said this.'];
    expect(validateSystemDesignAiReview(invented, caseDefinition, attempt)).toBeNull();
  });

  it('falls back without losing deterministic results when a provider fails', async () => {
    const review = await evaluateSystemDesignWithOptionalAi(
      caseDefinition,
      reviewedAttempt(),
      async () => {
        throw new Error('provider failed');
      }
    );
    expect(review.generator).toBe('deterministic');
    expect(review.warning).toContain('unavailable');
    expect(review.dimensions).toHaveLength(caseDefinition.rubricDimensions.length);
  });

  it('rejects invalid provider output and preserves local evidence', async () => {
    const review = await evaluateSystemDesignWithOptionalAi(
      caseDefinition,
      reviewedAttempt(),
      async () => ({ dimensions: [], verdict: 'invented' })
    );
    expect(review.generator).toBe('deterministic');
    expect(review.warning).toContain('invalid');
    expect(review.dimensions.find((dimension) => dimension.dimensionId === 'capacity')?.score).toBe(
      0
    );
  });
});
