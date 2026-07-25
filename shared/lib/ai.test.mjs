import { describe, it, expect } from 'vitest';
import { AIConfigError, parseJSON, resolveAIConfig } from './ai.mjs';

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
