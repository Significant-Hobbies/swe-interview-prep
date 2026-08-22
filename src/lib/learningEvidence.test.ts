import { beforeEach, describe, expect, it } from 'vitest';

import { createDecisionReceipt } from './decisionLabs';
import {
  appendDecisionReceipt,
  appendPaperAttempt,
  loadLearningEvidence,
  type PaperLearningAttemptV1,
} from './learningEvidence';

describe('learning evidence persistence', () => {
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

  it('keeps accounts isolated and rejects receipt mutation by id', () => {
    const receipt = createDecisionReceipt({
      accountScope: 'alpha',
      labId: 'inference-capacity',
      definitionVersion: 1,
      conceptIds: ['inference-engines'],
      inputs: { gpuMemoryGiB: 24 },
      derived: { headroomGiB: 2 },
      prediction: 'Memory fits.',
      conclusion: 'Proceed within the declared reserve.',
      mitigation: 'Reduce concurrency if headroom falls.',
      counterfactual: 'Twice the sequences would exceed memory.',
      verificationMetric: 'Peak allocated memory under 22 GiB.',
      now: new Date('2026-08-20T10:00:00.000Z'),
    });
    appendDecisionReceipt(receipt);
    expect(loadLearningEvidence('alpha').decisionReceipts).toEqual([receipt]);
    expect(loadLearningEvidence('beta').decisionReceipts).toEqual([]);
    expect(() => appendDecisionReceipt({ ...receipt, conclusion: 'Rewritten.' })).toThrow(
      /immutable/
    );
  });

  it('stores retrieval separately from opening and grants no mastery', () => {
    const attempt: PaperLearningAttemptV1 = {
      schemaVersion: 1,
      id: 'paper:1',
      accountScope: 'guest',
      paperId: 'pagedattention-vllm',
      definitionVersion: 1,
      conceptIds: ['kv-cache-paged-attention'],
      retrievalResponse: '',
      followUpEvidence: '',
      evidenceState: 'opened',
      masteryStatus: 'pending',
      createdAt: '2026-08-20T10:00:00.000Z',
    };
    appendPaperAttempt(attempt);
    expect(loadLearningEvidence('guest').paperAttempts[0]).toMatchObject({
      evidenceState: 'opened',
      masteryStatus: 'pending',
    });
  });
});
