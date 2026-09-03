import { describe, expect, it } from 'vitest';

import { handleMcpLearningRequest } from './mcp-learning.mjs';

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function clientFor(user = { id: 'user-1', email: 'owner@example.com' }, rows = {}) {
  return {
    async execute(statement) {
      if (statement.sql.includes('FROM users')) return { rows: user ? [user] : [] };
      if (statement.sql.includes('FROM concept_mastery')) return { rows: [] };
      if (statement.sql.includes('FROM user_drills')) return { rows: rows.drills ?? [] };
      if (statement.sql.includes('FROM user_profile')) return { rows: [] };
      if (statement.sql.includes('FROM activity_log')) {
        return { rows: [{ count: 0, duration_ms: 0, last_at: null }] };
      }
      if (statement.sql.includes('FROM feynman_logs')) {
        return { rows: [{ count: 0, average_grade: null }] };
      }
      throw new Error(`Unexpected SQL: ${statement.sql}`);
    },
  };
}

const authorization = { authorization: 'Bearer one.two.three' };

describe('MCP learning product boundary', () => {
  it('returns a private daily projection only for a verified linked owner', async () => {
    const response = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/daily', { headers: authorization }),
      path: 'mcp/daily',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(),
      json,
      verifySubject: async () => 'google-user-1',
      now: new Date('2026-08-30T06:00:00.000Z'),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.json();
    expect(body.priority.reason).toBe('progression');
    expect(body.priority.actionUrl).toMatch(/^https:\/\//);
    expect(body.priority.conceptUrl).toMatch(/^https:\/\//);
    expect(body).not.toHaveProperty('progress');
  });

  it('returns answer-free verification prompts under the same read scope', async () => {
    const response = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/verification', {
        headers: authorization,
      }),
      path: 'mcp/verification',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(),
      json,
      verifySubject: async () => 'google-user-1',
      now: new Date('2026-08-30T06:00:00.000Z'),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.json();
    expect(body.state).toBe('verification-required');
    expect(body.questions).toHaveLength(3);
    expect(JSON.stringify(body)).not.toContain('"answer"');
  });

  it('returns the learner code and the grader calls, never the answers', async () => {
    const attemptRow = {
      drill_id: 'design-paginated-api',
      status: 'attempted',
      attempts: 3,
      last_code: "function paginationChoice(rows: number) { return 'offset-ok'; }",
      last_attempt: '2026-09-03T05:00:00.000Z',
      updated_at: '2026-09-03T05:00:00.000Z',
    };
    const response = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/attempts', { headers: authorization }),
      path: 'mcp/attempts',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(undefined, { drills: [attemptRow] }),
      json,
      verifySubject: async () => 'google-user-1',
      now: new Date('2026-09-03T06:00:00.000Z'),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.json();
    expect(body.schemaVersion).toBe('swe-learning-attempts.v1');

    const [attempt] = body.attempts;
    expect(attempt.drillId).toBe('design-paginated-api');
    expect(attempt.attempts).toBe(3);
    expect(attempt.submittedCode).toContain('paginationChoice');
    // The contract the prompt never states, which is the point of the read.
    expect(attempt.graderCalls).toEqual(['console.log(paginationChoice(10000000));']);
    expect(attempt.url).toBe('https://learn.significanthobbies.com/drills/design-paginated-api');
  });

  // The whole reason this endpoint can exist without reversing ADR 0005: it
  // carries the learner's work and the call signature, and nothing that lets an
  // assistant read out the solution.
  it('never serializes an expected value or a reference solution', async () => {
    const response = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/attempts', { headers: authorization }),
      path: 'mcp/attempts',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(undefined, {
        drills: [
          { drill_id: 'design-paginated-api', status: 'attempted', attempts: 1, last_code: 'x' },
          { drill_id: 'single-number-xor', status: 'attempted', attempts: 2, last_code: 'y' },
        ],
      }),
      json,
      verifySubject: async () => 'google-user-1',
    });

    const body = await response.json();
    const raw = JSON.stringify(body);
    expect(raw).not.toContain('referenceSolution');
    // The XOR one-liner that solves `single-number-xor`.
    expect(raw).not.toContain('a ^ b');
    for (const attempt of body.attempts) {
      expect(attempt).not.toHaveProperty('expect');
      expect(attempt).not.toHaveProperty('referenceSolution');
      expect(attempt).not.toHaveProperty('testCases');
    }
  });

  it('skips drills the learner has never opened', async () => {
    const response = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/attempts', { headers: authorization }),
      path: 'mcp/attempts',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(undefined, {
        drills: [
          { drill_id: 'design-paginated-api', status: 'unsolved', attempts: 0, last_code: null },
          { drill_id: 'not-a-real-drill', status: 'attempted', attempts: 4, last_code: 'z' },
        ],
      }),
      json,
      verifySubject: async () => 'google-user-1',
    });

    expect((await response.json()).attempts).toEqual([]);
  });

  it('refuses attempts to anyone the other reads refuse', async () => {
    const anonymous = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/attempts'),
      path: 'mcp/attempts',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(),
      json,
    });
    expect(anonymous.status).toBe(401);

    const wrongOwner = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/attempts', { headers: authorization }),
      path: 'mcp/attempts',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor({ id: 'user-2', email: 'other@example.com' }),
      json,
      verifySubject: async () => 'google-user-2',
    });
    expect(wrongOwner.status).toBe(403);
  });

  it('rejects a write to a read-only surface', async () => {
    const response = await handleMcpLearningRequest({
      request: new Request('https://learn.example/api/mcp/attempts', {
        method: 'POST',
        headers: authorization,
      }),
      path: 'mcp/attempts',
      env: { OWNER_EMAIL: 'owner@example.com' },
      client: clientFor(),
      json,
      verifySubject: async () => 'google-user-1',
    });
    expect(response.status).toBe(405);
  });

  it('rejects missing, invalid, unmapped, and non-owner credentials', async () => {
    const base = {
      path: 'mcp/progress',
      env: { OWNER_EMAIL: 'owner@example.com' },
      json,
    };
    const missing = await handleMcpLearningRequest({
      ...base,
      request: new Request('https://learn.example/api/mcp/progress'),
      client: clientFor(),
    });
    expect(missing.status).toBe(401);

    const invalid = await handleMcpLearningRequest({
      ...base,
      request: new Request('https://learn.example/api/mcp/progress', { headers: authorization }),
      client: clientFor(),
      verifySubject: async () => null,
    });
    expect(invalid.status).toBe(401);

    const unmapped = await handleMcpLearningRequest({
      ...base,
      request: new Request('https://learn.example/api/mcp/progress', { headers: authorization }),
      client: clientFor(null),
      verifySubject: async () => 'google-user-1',
    });
    expect(unmapped.status).toBe(403);

    const wrongOwner = await handleMcpLearningRequest({
      ...base,
      request: new Request('https://learn.example/api/mcp/progress', { headers: authorization }),
      client: clientFor({ id: 'user-2', email: 'other@example.com' }),
      verifySubject: async () => 'google-user-2',
    });
    expect(wrongOwner.status).toBe(403);
  });
});
