import { describe, expect, it } from 'vitest';

import {
  finishMockInterview,
  generateReviewCards,
  startMockInterview,
  submitMockTurn,
  validateRubric,
} from './mockInterview';

describe('mock interview engine', () => {
  it('moves through timed session turns and records a replayable transcript', () => {
    const session = startMockInterview({
      role: 'Frontend platform engineer',
      minutes: 45,
      mix: ['dsa', 'hld', 'behavioral'],
    });

    const next = submitMockTurn(session, {
      answer: 'I would cover edge cases, complexity O(n), test cases, and explain tradeoffs.',
      code: 'function shortestPath(graph) { const queue = []; const seen = new Set(); return queue.length + seen.size; }',
    });

    expect(next.currentTurn).toBe(1);
    expect(next.transcript.map((entry) => entry.speaker)).toEqual([
      'interviewer',
      'candidate',
      'interviewer',
      'interviewer',
    ]);
    expect(next.turns[0]?.rubric?.overall).toBeGreaterThan(50);
  });

  it('validates rubric scores into bounded output', () => {
    const rubric = validateRubric({
      clarity: 120,
      correctness: -20,
      tradeoffs: 80.4,
      communication: 50.2,
      overall: 999,
      missedPatterns: ['edge cases'],
    });

    expect(rubric).toMatchObject({
      clarity: 100,
      correctness: 0,
      tradeoffs: 80,
      communication: 50,
      overall: 58,
    });
  });

  it('generates review cards from missed patterns after completion', () => {
    const session = startMockInterview({
      role: 'Backend engineer',
      minutes: 30,
      mix: ['hld'],
    });
    const answered = submitMockTurn(session, {
      answer: 'I would use a service and database.',
      diagramText: 'API -> database',
    });
    const complete = finishMockInterview(answered);

    expect(complete.status).toBe('complete');
    expect(complete.reviewCards.length).toBeGreaterThan(0);
    expect(complete.reviewCards[0]).toEqual(
      expect.objectContaining({
        sourceTurnId: 'turn-1',
        rating: expect.stringMatching(/again|hard|good/),
      }),
    );
  });

  it('can generate cards directly from scored turns', () => {
    const cards = generateReviewCards([
      {
        id: 'turn-1',
        type: 'behavioral',
        prompt: 'Tell me about conflict.',
        rubric: {
          clarity: 30,
          correctness: 35,
          tradeoffs: 20,
          communication: 40,
          overall: 31,
          missedPatterns: ['measured result'],
        },
      },
    ]);

    expect(cards[0]?.front).toContain('measured result');
    expect(cards[0]?.rating).toBe('again');
  });
});
