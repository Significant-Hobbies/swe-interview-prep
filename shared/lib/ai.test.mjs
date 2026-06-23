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
