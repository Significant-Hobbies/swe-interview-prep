// Contract tests for POST /api/ai/chat (functions/api/[[path]].js → handleAiChat).
//
// The route had never been exercised: it is the only streaming endpoint in the
// Pages Function, and the failure mode that matters most is the one that needs
// no provider at all — a deployment with no AI_ENDPOINT_URL / AI_API_KEY /
// AI_MODEL and a user who has not filled in BYOK settings. That must answer a
// readable 503, because `useCompanion.streamRemote` reads `body.error` off a
// non-ok response and `CompanionPanel` renders that string verbatim.
//
// No provider is ever contacted here: `generateStream` is stubbed for the
// success/mid-stream-failure cases and left real for the config cases.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@libsql/client/web', () => ({
  createClient: () => ({
    execute: async () => ({
      rows: [
        {
          id: 'user-1',
          google_id: 'g-1',
          email: 'owner@example.com',
          name: 'Owner',
          picture: null,
          created_at: '2026-01-01',
        },
      ],
    }),
  }),
}));

vi.mock('../lib/ai.mjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateStream: vi.fn((...args) => actual.generateStream(...args)),
  };
});

const { AI_CONFIG_MISSING_MESSAGE, generateStream } = await import('../lib/ai.mjs');
const { onRequest } = await import('../../functions/api/[[path]].js');

const JWT_SECRET = 'test-secret-for-ai-chat-route';
const ENV_NO_AI = {
  JWT_SECRET,
  TURSO_DATABASE_URL: 'libsql://test.invalid',
  TURSO_AUTH_TOKEN: 'test-token',
};

function base64Url(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Mint a token the route's own `verifyJwt` accepts (HS256, same scheme). */
async function authToken(secret = JWT_SECRET) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${base64Url(
    JSON.stringify({ userId: 'user-1', iat: now, exp: now + 3600 })
  )}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${base64Url(new Uint8Array(sig))}`;
}

async function post(body, { env = ENV_NO_AI, token } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return onRequest({
    request: new Request('https://learn.significanthobbies.com/api/ai/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
    env,
    params: { path: ['ai', 'chat'] },
    next: vi.fn(),
  });
}

/** Collect an SSE body into the `data:` payloads `useCompanion.pumpSSE` parses. */
async function readSse(response) {
  const text = await response.text();
  return text
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => line.slice(6));
}

const MESSAGES = [{ role: 'user', content: 'why did I choose a map here?' }];

describe('POST /api/ai/chat — no credentials', () => {
  beforeEach(() => {
    generateStream.mockClear();
  });

  it('answers 503 with the actionable setup message, not 404 and not a stack', async () => {
    const response = await post({ messages: MESSAGES }, { token: await authToken() });

    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toContain('application/json');
    const body = await response.json();
    expect(body).toEqual({ error: AI_CONFIG_MISSING_MESSAGE });
    // The string the user actually reads in CompanionPanel.
    expect(body.error).toContain('Settings');
    expect(body.error).toContain('AI_ENDPOINT_URL');
    expect(body.error).not.toMatch(/at .*\(/); // no stack frames
  });

  it('refuses a half-filled BYOK config rather than borrowing deployment credentials', async () => {
    const response = await post(
      { endpointUrl: 'https://attacker.example/v1', messages: MESSAGES },
      {
        token: await authToken(),
        env: { ...ENV_NO_AI, AI_ENDPOINT_URL: 'https://real/v1', AI_API_KEY: 'k', AI_MODEL: 'm' },
      }
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: AI_CONFIG_MISSING_MESSAGE });
  });

  it('rejects an unauthenticated caller before reading any configuration', async () => {
    const response = await post({ messages: MESSAGES });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(generateStream).not.toHaveBeenCalled();
  });

  it('rejects an empty conversation with 400', async () => {
    const response = await post({ messages: [] }, { token: await authToken() });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'messages array required' });
  });

  it('rejects a non-POST method', async () => {
    const response = await onRequest({
      request: new Request('https://learn.significanthobbies.com/api/ai/chat'),
      env: ENV_NO_AI,
      params: { path: ['ai', 'chat'] },
      next: vi.fn(),
    });

    expect(response.status).toBe(405);
  });
});

describe('POST /api/ai/chat — SSE contract', () => {
  beforeEach(() => {
    generateStream.mockReset();
  });

  it('emits the `data: {"text":…}` frames + `[DONE]` that pumpSSE expects', async () => {
    generateStream.mockImplementation(async function* () {
      yield 'Why a ';
      yield '';
      yield 'map?';
    });

    const response = await post(
      { endpointUrl: 'https://p.example/v1', apiKey: 'k', model: 'm', messages: MESSAGES },
      { token: await authToken() }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    const frames = await readSse(response);
    expect(frames).toEqual(['{"text":"Why a "}', '{"text":"map?"}', '[DONE]']);
    // Client-side reassembly (pumpSSE) yields the full reply.
    const joined = frames
      .filter((f) => f !== '[DONE]')
      .map((f) => JSON.parse(f).text)
      .join('');
    expect(joined).toBe('Why a map?');
  });

  it('forwards the system prompt and conversation to the provider layer', async () => {
    generateStream.mockImplementation(async function* () {
      yield 'ok';
    });

    await post(
      {
        endpointUrl: 'https://p.example/v1',
        apiKey: 'k',
        model: 'm',
        messages: MESSAGES,
        systemPrompt: 'You are a Socratic programming companion',
      },
      { token: await authToken() }
    );

    expect(generateStream).toHaveBeenCalledWith(
      expect.objectContaining({
        endpointUrl: 'https://p.example/v1',
        apiKey: 'k',
        model: 'm',
        messages: MESSAGES,
        system: 'You are a Socratic programming companion',
      })
    );
  });

  it('reports a mid-stream provider failure in-band without leaking the cause', async () => {
    generateStream.mockImplementation(async function* () {
      yield 'partial';
      throw new Error('ECONNRESET from https://p.example/v1 with key sk-live-123');
    });

    const response = await post(
      { endpointUrl: 'https://p.example/v1', apiKey: 'k', model: 'm', messages: MESSAGES },
      { token: await authToken() }
    );

    // Headers are already flushed by then, so the status stays 200.
    expect(response.status).toBe(200);
    const frames = await readSse(response);
    expect(frames).toEqual([
      '{"text":"partial"}',
      '{"error":"The AI provider stopped responding. Try again."}',
      '[DONE]',
    ]);
    // pumpSSE rethrows `json.error`; the message must not contain the key.
    expect(frames.join('')).not.toContain('sk-live-123');
  });
});
