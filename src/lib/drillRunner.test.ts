import { describe, expect, it } from 'vitest';

import { runDrillTests, type DrillTestCase } from './drillRunner';

describe('runDrillTests', () => {
  it('passes when stdout contains all expected substrings', () => {
    const tests: DrillTestCase[] = [{
      setup: 'function add(a, b) { return a + b; }',
      run: 'console.log(add(2, 3));',
      expect: '5',
    }];
    const result = runDrillTests('', tests);
    expect(result.passed).toBe(true);
    expect(result.message).toBe('All tests passed.');
  });

  it('fails when output misses an expected substring', () => {
    const tests: DrillTestCase[] = [{
      setup: 'function add(a, b) { return a + b; }',
      run: 'console.log(add(2, 3));',
      expect: '6',
    }];
    const result = runDrillTests('', tests);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Test 1 failed');
    expect(result.output).toBe('5');
  });

  it('runs multiple cases and reports the first failure', () => {
    const tests: DrillTestCase[] = [
      { run: 'console.log("ok");', expect: 'ok' },
      { run: 'console.log("nope");', expect: 'yes' },
    ];
    const result = runDrillTests('', tests);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Test 2 failed');
  });

  it('user code can override setup-defined functions', () => {
    const tests: DrillTestCase[] = [{
      setup: 'function double(n) { return n; }',
      run: 'console.log(double(4));',
      expect: '8',
    }];
    const userCode = 'function double(n) { return n * 2; }';
    const result = runDrillTests(userCode, tests);
    expect(result.passed).toBe(true);
    expect(result.output).toBe('8');
  });

  it('returns runtime errors without throwing', () => {
    const tests: DrillTestCase[] = [{
      run: 'throw new Error("boom");',
      expect: 'never',
    }];
    const result = runDrillTests('', tests);
    expect(result.passed).toBe(false);
    expect(result.message).toBe('boom');
    expect(result.errors).toBe('boom');
  });
});