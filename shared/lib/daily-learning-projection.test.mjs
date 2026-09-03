import { describe, expect, it } from 'vitest';

import {
  buildAttemptsProjection,
  buildCurrentLearningVerification,
  buildDailyLearningProjection,
} from './daily-learning-projection.mjs';

const now = new Date('2026-08-30T06:00:00.000Z');

function reviewed(conceptId, overrides = {}) {
  return {
    concept_id: conceptId,
    stability: 30,
    reps: 2,
    lapses: 0,
    last_review: '2026-08-30T05:00:00.000Z',
    due: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('daily learning projection', () => {
  it('uses reachable progression for a new learner and reports untouched honestly', () => {
    const projection = buildDailyLearningProjection({ now });
    expect(projection.priority.reason).toBe('progression');
    expect(projection.priority.concept).not.toBeNull();
    expect(projection.priority.actionUrl).toMatch(/^https:\/\//);
    expect(projection.priority.conceptUrl).toContain(projection.priority.concept.id);
    expect(projection.progress.concepts.untouched).toBe(projection.progress.concepts.total);
    expect(projection.tracking.masteryPolicy).toContain('read-only');
  });

  it('builds an answer-free, three-part check for the current concept', () => {
    const projection = buildDailyLearningProjection({ now });
    const verification = buildCurrentLearningVerification(projection);
    expect(verification.state).toBe('verification-required');
    expect(verification.questions.map((question) => question.category)).toEqual([
      'mechanism',
      'application-tradeoff',
      'failure-counterexample',
    ]);
    expect(verification.questions.every((question) => !('answer' in question))).toBe(true);
    expect(verification.instructions.join(' ')).toMatch(/one question at a time/i);
    expect(verification.instructions.join(' ')).toMatch(/do not describe.*complete/i);
  });

  it('returns no quiz or concept link when the learner is caught up', () => {
    const verification = buildCurrentLearningVerification({
      generatedAt: now.toISOString(),
      priority: {
        concept: null,
        actionUrl: 'https://learn.significanthobbies.com/playground',
      },
      tracking: { masteryPolicy: 'Product evidence only.' },
    });
    expect(verification).toMatchObject({
      state: 'caught-up',
      concept: null,
      conceptUrl: null,
      actionUrl: 'https://learn.significanthobbies.com/playground',
      questions: [],
    });
  });

  it('puts repeated failed practice ahead of novelty', () => {
    const projection = buildDailyLearningProjection({
      now,
      drillRows: [
        {
          drill_id: 'practice-data-representation',
          status: 'attempted',
          attempts: 3,
        },
      ],
    });
    expect(projection.priority.reason).toBe('recovery');
    expect(projection.priority.action.url).toContain('/drills/practice-data-representation');
    expect(projection.priority.rationale).toContain('3 unsuccessful attempts');
  });

  it('puts a reachable due concept ahead of progression', () => {
    const projection = buildDailyLearningProjection({
      now,
      masteryRows: [
        reviewed('structured-outputs', {
          stability: 2,
          reps: 1,
          last_review: '2026-08-01T00:00:00.000Z',
          due: '2026-08-29T00:00:00.000Z',
        }),
      ],
    });
    expect(projection.priority.reason).toBe('retention');
    expect(projection.priority.concept.id).toBe('structured-outputs');
    expect(projection.progress.concepts.due).toBeGreaterThanOrEqual(1);
  });

  it('separates mastered, learning, and untouched concepts', () => {
    const projection = buildDailyLearningProjection({
      now,
      masteryRows: [
        reviewed('data-representation'),
        reviewed('program-memory-model', { stability: 3, reps: 1 }),
      ],
      activityRow: { count: 4, duration_ms: 300_000, last_at: now.toISOString() },
      feynmanRow: { count: 2, average_grade: 81.4 },
    });
    expect(projection.progress.concepts.mastered).toBe(1);
    expect(projection.progress.concepts.learning).toBe(1);
    expect(projection.progress.concepts.untouched).toBe(projection.progress.concepts.total - 2);
    expect(projection.progress.activity.activeMinutes).toBe(5);
    expect(projection.progress.explainBacks).toEqual({ count: 2, averageGrade: 81 });
  });
});

describe('attempt projection', () => {
  function attempt(drillId, overrides = {}) {
    return {
      drill_id: drillId,
      status: 'attempted',
      attempts: 1,
      last_code: 'function paginationChoice() {}',
      last_attempt: '2026-08-30T05:00:00.000Z',
      ...overrides,
    };
  }

  it('carries the code and the call the grader makes', () => {
    const { attempts } = buildAttemptsProjection({
      drillRows: [attempt('design-paginated-api')],
      now,
    });
    expect(attempts).toHaveLength(1);
    expect(attempts[0].submittedCode).toBe('function paginationChoice() {}');
    expect(attempts[0].graderCalls).toEqual(['console.log(paginationChoice(10000000));']);
    expect(attempts[0].concept).toBe('API Design');
  });

  it('ignores untouched drills and ids no longer in the catalog', () => {
    const { attempts } = buildAttemptsProjection({
      drillRows: [
        attempt('design-paginated-api', { attempts: 0, last_code: null, status: 'unsolved' }),
        attempt('deleted-drill-id'),
      ],
      now,
    });
    expect(attempts).toEqual([]);
  });

  it('keeps a solved drill even with no attempt counter', () => {
    const { attempts } = buildAttemptsProjection({
      drillRows: [attempt('design-paginated-api', { attempts: 0, status: 'solved' })],
      now,
    });
    expect(attempts.map((a) => a.status)).toEqual(['solved']);
  });

  it('returns the most recent attempts first', () => {
    const { attempts } = buildAttemptsProjection({
      drillRows: [
        attempt('design-paginated-api', { last_attempt: '2026-08-01T00:00:00.000Z' }),
        attempt('single-number-xor', { last_attempt: '2026-08-29T00:00:00.000Z' }),
      ],
      now,
    });
    expect(attempts.map((a) => a.drillId)).toEqual(['single-number-xor', 'design-paginated-api']);
  });

  // A pasted file should not become the whole response body.
  it('truncates a runaway editor buffer', () => {
    const { attempts } = buildAttemptsProjection({
      drillRows: [attempt('design-paginated-api', { last_code: 'x'.repeat(50_000) })],
      now,
    });
    expect(attempts[0].submittedCode.length).toBeLessThan(21_000);
    expect(attempts[0].submittedCode).toContain('truncated');
  });

  it('states that reading here cannot move mastery', () => {
    const projection = buildAttemptsProjection({ drillRows: [], now });
    expect(projection.schemaVersion).toBe('swe-learning-attempts.v1');
    expect(projection.tracking.masteryPolicy).toMatch(/read-only/i);
  });
});
