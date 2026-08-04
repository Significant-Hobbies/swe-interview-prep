import { describe, expect, it } from 'vitest';

import { SYSTEM_DESIGN_CASE_BY_ID } from '../data/system-design-cases';
import {
  SYSTEM_DESIGN_SESSION_SCHEMA_VERSION,
  canRevealSystemDesignAnswers,
  createSystemDesignAttempt,
  loadSystemDesignAttempt,
  parseSystemDesignAttempt,
  saveSystemDesignAttempt,
  transitionSystemDesignAttempt,
  visibleInterviewerPrompt,
} from './systemDesignSession';

const caseDefinition = SYSTEM_DESIGN_CASE_BY_ID['llm-inference-10k-rps'];

function submitCurrent(answer = 'A benchmarked bounded queue with capacity and headroom.') {
  let attempt = createSystemDesignAttempt(caseDefinition, '2026-08-04T00:00:00.000Z');
  attempt = transitionSystemDesignAttempt(caseDefinition, attempt, {
    type: 'submit-stage',
    stageId: attempt.currentStageId,
    answer,
    now: '2026-08-04T00:01:00.000Z',
  });
  return attempt;
}

describe('system-design session reducer', () => {
  it('starts at scoping and hides reference material', () => {
    const attempt = createSystemDesignAttempt(caseDefinition, '2026-08-04T00:00:00.000Z');
    expect(attempt.currentStageId).toBe('scoping');
    expect(canRevealSystemDesignAnswers(attempt)).toBe(false);
    expect(visibleInterviewerPrompt(caseDefinition, attempt)).toContain('What must you learn');
  });

  it('does not skip stages or accept empty answers', () => {
    const attempt = createSystemDesignAttempt(caseDefinition);
    const skipped = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'submit-stage',
      stageId: 'estimation',
      answer: 'Skip ahead',
    });
    const empty = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'submit-stage',
      stageId: 'scoping',
      answer: '   ',
    });
    expect(skipped).toBe(attempt);
    expect(empty).toBe(attempt);
  });

  it('selects a declared follow-up and failure deterministically', () => {
    let attempt = submitCurrent('Ask about input and output tokens, streaming, and availability.');
    attempt = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'submit-stage',
      stageId: 'estimation',
      answer: 'Compute token throughput, concurrency, benchmark capacity, and headroom.',
    });
    attempt = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'submit-stage',
      stageId: 'high-level-design',
      answer: 'Use a router, bounded queues, continuous batching, and prefix cache.',
    });
    expect(attempt.currentStageId).toBe('deep-dive');
    expect(attempt.selectedFollowUpId).toBe('shared-prefixes');
    expect(visibleInterviewerPrompt(caseDefinition, attempt)).toContain('key, invalidate');

    attempt = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'submit-stage',
      stageId: 'deep-dive',
      answer: 'Key cache by model and tenant and measure hits.',
    });
    expect(attempt.currentStageId).toBe('failure');
    expect(attempt.selectedFailureId).toBe('burst-and-zone-loss');
    expect(visibleInterviewerPrompt(caseDefinition, attempt)).toContain('doubles');
  });

  it('reveals answers only after submission or explicit abandonment', () => {
    let attempt = createSystemDesignAttempt(caseDefinition);
    attempt = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'abandon-to-review',
      now: '2026-08-04T00:02:00.000Z',
    });
    expect(attempt.status).toBe('review');
    expect(attempt.reviewReason).toBe('abandoned');
    expect(canRevealSystemDesignAnswers(attempt)).toBe(true);
  });

  it('completes the required stage order', () => {
    let attempt = createSystemDesignAttempt(caseDefinition);
    for (const stageId of [
      'scoping',
      'estimation',
      'high-level-design',
      'deep-dive',
      'failure',
    ] as const) {
      expect(attempt.currentStageId).toBe(stageId);
      attempt = transitionSystemDesignAttempt(caseDefinition, attempt, {
        type: 'submit-stage',
        stageId,
        answer: `Evidence for ${stageId}`,
      });
    }
    expect(attempt.currentStageId).toBe('review');
    expect(attempt.status).toBe('review');
    expect(attempt.reviewReason).toBe('submitted');
  });
});

describe('system-design attempt persistence', () => {
  it('round-trips a compatible attempt', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => void values.set(key, value),
    };
    const attempt = submitCurrent();
    expect(saveSystemDesignAttempt(storage, attempt)).toBe(true);
    expect(loadSystemDesignAttempt(storage, caseDefinition)).toEqual({ status: 'ok', attempt });
  });

  it('preserves unsupported and invalid raw saves', () => {
    const unsupported = JSON.stringify({
      schemaVersion: SYSTEM_DESIGN_SESSION_SCHEMA_VERSION + 1,
      attempt: {},
    });
    expect(parseSystemDesignAttempt(unsupported, caseDefinition)).toEqual(
      expect.objectContaining({ status: 'unsupported', raw: unsupported })
    );
    expect(parseSystemDesignAttempt('{broken', caseDefinition)).toEqual(
      expect.objectContaining({ status: 'invalid', raw: '{broken' })
    );
  });

  it('treats a different case version as read-only unsupported data', () => {
    const attempt = createSystemDesignAttempt(caseDefinition);
    const raw = JSON.stringify({
      schemaVersion: SYSTEM_DESIGN_SESSION_SCHEMA_VERSION,
      attempt: { ...attempt, caseVersion: '0.9.0' },
    });
    expect(parseSystemDesignAttempt(raw, caseDefinition)).toEqual(
      expect.objectContaining({ status: 'unsupported', raw })
    );
  });
});
