import { createServer } from 'node:http';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import { AIConfigError, generateStream, parseJSON, resolveAIConfig } from './ai.mjs';

describe('resolveAIConfig', () => {
  const deployment = {
    AI_ENDPOINT_URL: 'https://deployment.example/v1',
    AI_API_KEY: 'deployment-secret',
    AI_MODEL: 'deployment-model',
  };

  it('uses a complete deployment-owned configuration as one unit', () => {
    expect(resolveAIConfig({}, deployment)).toEqual({
      endpointUrl: deployment.AI_ENDPOINT_URL,
      apiKey: deployment.AI_API_KEY,
      model: deployment.AI_MODEL,
    });
  });

  it('uses a complete BYOK configuration as one unit', () => {
    expect(
      resolveAIConfig(
        {
          endpointUrl: 'https://byok.example/v1',
          apiKey: 'byok-key',
          model: 'byok-model',
        },
        deployment
      )
    ).toEqual({
      endpointUrl: 'https://byok.example/v1',
      apiKey: 'byok-key',
      model: 'byok-model',
    });
  });

  it('never combines a client-controlled endpoint with the deployment API key', () => {
    expect(() =>
      resolveAIConfig(
        {
          endpointUrl: 'https://attacker.example/v1',
          model: 'attacker-model',
        },
        deployment
      )
    ).toThrow(AIConfigError);
  });
});

describe('parseJSON', () => {
  it('parses raw JSON', () => {
    expect(parseJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips ```json fence', () => {
    expect(parseJSON('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('strips bare ``` fence', () => {
    expect(parseJSON('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('handles surrounding whitespace', () => {
    expect(parseJSON('   {"a":1}   ')).toEqual({ a: 1 });
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJSON('not json')).toThrow();
  });

  it('parses arrays', () => {
    expect(parseJSON('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('parses nested fences', () => {
    expect(parseJSON('```json\n{"nested": {"k": "v"}}\n```')).toEqual({ nested: { k: 'v' } });
  });

  it('handles unclosed fence', () => {
    expect(parseJSON('```json\n{"a":1}')).toEqual({ a: 1 });
  });

  it('extracts JSON from surrounding prose', () => {
    expect(parseJSON('Sure! Here is the result:\n{"a":1, "b":2}\nLet me know.')).toEqual({
      a: 1,
      b: 2,
    });
  });

  it('extracts balanced object with strings containing braces', () => {
    expect(parseJSON('preamble {"msg": "hello { world }"} trailing')).toEqual({
      msg: 'hello { world }',
    });
  });

  it('extracts JSON array from prose', () => {
    expect(parseJSON('Result: [1,2,3]')).toEqual([1, 2, 3]);
  });
});

// `generateStream` is what POST /api/ai/chat turns into SSE frames. Point it at
// a throwaway OpenAI-compatible server on localhost so the whole provider path
// (createOpenAICompatible → streamText → textStream) is exercised without any
// credentials and without contacting a real provider.
describe('generateStream against a stub OpenAI-compatible provider', () => {
  /** @type {import('node:http').Server} */
  let server;
  let baseUrl;
  let lastRequest;

  beforeAll(async () => {
    server = createServer((req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        lastRequest = {
          url: req.url,
          authorization: req.headers.authorization,
          body: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'),
        };
        res.writeHead(200, { 'content-type': 'text/event-stream' });
        const frame = (delta) =>
          `data: ${JSON.stringify({
            id: 'stub',
            object: 'chat.completion.chunk',
            created: 0,
            model: 'stub-model',
            choices: [{ index: 0, delta, finish_reason: null }],
          })}\n\n`;
        res.write(frame({ role: 'assistant', content: 'What ' }));
        res.write(frame({ content: 'invariant ' }));
        res.write(frame({ content: 'holds?' }));
        res.write('data: [DONE]\n\n');
        res.end();
      });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/v1`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('yields the provider text deltas in order', async () => {
    const stream = generateStream({
      endpointUrl: baseUrl,
      apiKey: 'stub-key',
      model: 'stub-model',
      system: 'You are a Socratic programming companion',
      messages: [{ role: 'user', content: 'review my code' }],
    });

    const deltas = [];
    for await (const delta of stream) deltas.push(delta);

    expect(deltas.join('')).toBe('What invariant holds?');
    expect(lastRequest.url).toBe('/v1/chat/completions');
    expect(lastRequest.authorization).toBe('Bearer stub-key');
    expect(lastRequest.body.stream).toBe(true);
    expect(lastRequest.body.model).toBe('stub-model');
    expect(lastRequest.body.messages[0]).toEqual({
      role: 'system',
      content: 'You are a Socratic programming companion',
    });
  });

  it('throws AIConfigError before opening a connection when nothing is configured', () => {
    expect(() => generateStream({ messages: [{ role: 'user', content: 'hi' }], env: {} })).toThrow(
      AIConfigError
    );
  });
});
