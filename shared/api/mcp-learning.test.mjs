import { describe, expect, it } from 'vitest';

import { handleMcpLearningRequest } from './mcp-learning.mjs';

function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function clientFor(user = { id: 'user-1', email: 'owner@example.com' }) {
  return {
    async execute(statement) {
      if (statement.sql.includes('FROM users')) return { rows: user ? [user] : [] };
      if (statement.sql.includes('FROM concept_mastery')) return { rows: [] };
      if (statement.sql.includes('FROM user_drills')) return { rows: [] };
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
