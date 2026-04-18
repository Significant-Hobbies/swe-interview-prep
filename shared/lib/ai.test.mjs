import { describe, it, expect } from 'vitest';
import { parseJSON } from './ai.mjs';

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
});
