import { createServer } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import handler, { roleFitProviderAccess } from './role-fit.mjs';

const jobDescription = `We are hiring a Senior Backend Engineer.
You will design reliable APIs and build idempotent distributed workflows.
Kubernetes experience is required.`;

const providerAnalysis = {
  roleTitle: 'Senior Backend Engineer',
  summary: 'A backend role focused on reliable services and production systems.',
  requirements: [
    {
      label: 'Reliable API design',
      importance: 'must',
      sourcePhrase: 'design reliable APIs',
      conceptIds: ['api-design', 'idempotency'],
      confidence: 0.94,
      rationale: 'These concepts cover reliable request contracts and replay safety.',
    },
  ],
  unsupported: [],
};

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json' },
  });
}

function request(body) {
  return new Request('http://localhost/api/learning?action=role-fit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('role-fit provider authorization', () => {
  it('requires a complete BYOK tuple', () => {
    expect(roleFitProviderAccess({ endpointUrl: 'https://example.com' }, null)).toMatchObject({
      allowed: false,
      status: 400,
    });
  });

  it('allows complete BYOK and owner-only deployment fallback', () => {
    expect(
      roleFitProviderAccess(
        { endpointUrl: 'https://example.com', apiKey: 'key', model: 'model' },
        null
      )
    ).toEqual({ allowed: true, source: 'byok' });
    expect(roleFitProviderAccess({}, { isOwner: true })).toEqual({
      allowed: true,
      source: 'deployment',
    });
    expect(roleFitProviderAccess({}, { isOwner: false })).toMatchObject({
      allowed: false,
      status: 401,
    });
  });
});

describe('role-fit handler boundary', () => {
  let server;
  let baseUrl;
  let calls = 0;
  let responseAnalysis = providerAnalysis;

  beforeAll(async () => {
    server = createServer((req, res) => {
      calls += 1;
      req.resume();
      req.on('end', () => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify({
            id: 'stub',
            object: 'chat.completion',
            created: 0,
            model: 'stub-model',
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: JSON.stringify(responseAnalysis) },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          })
        );
      });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/v1`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(() => {
    calls = 0;
    responseAnalysis = providerAnalysis;
  });

  it('rejects short input before provider invocation', async () => {
    const response = await handler({ request: request({ jobDescription: 'short' }), json });
    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  it('rejects a guest without BYOK before deployment credentials can be used', async () => {
    const response = await handler({
      request: request({ jobDescription }),
      user: null,
      env: {
        AI_ENDPOINT_URL: baseUrl,
        AI_API_KEY: 'deployment-key',
        AI_MODEL: 'stub-model',
      },
      json,
    });
    expect(response.status).toBe(401);
    expect(calls).toBe(0);
  });

  it('returns a grounded analysis through explicit BYOK', async () => {
    const response = await handler({
      request: request({
        jobDescription,
        aiConfig: { endpointUrl: baseUrl, apiKey: 'stub-key', model: 'stub-model' },
      }),
      user: null,
      json,
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.analysis.requirements[0].conceptIds).toEqual(['api-design', 'idempotency']);
    expect(calls).toBe(1);
  });

  it('allows deployment fallback only for the authenticated owner', async () => {
    const response = await handler({
      request: request({ jobDescription }),
      user: { isOwner: true },
      env: {
        AI_ENDPOINT_URL: baseUrl,
        AI_API_KEY: 'deployment-key',
        AI_MODEL: 'stub-model',
      },
      json,
    });
    expect(response.status).toBe(200);
    expect(calls).toBe(1);
  });

  it('fails closed when the provider fabricates its supporting phrase', async () => {
    responseAnalysis = {
      ...providerAnalysis,
      requirements: [{ ...providerAnalysis.requirements[0], sourcePhrase: 'seven years of Rust' }],
    };
    const response = await handler({
      request: request({
        jobDescription,
        aiConfig: { endpointUrl: baseUrl, apiKey: 'stub-key', model: 'stub-model' },
      }),
      user: null,
      json,
    });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'The AI response could not be grounded in this job description. Try again.',
    });
  });
});
