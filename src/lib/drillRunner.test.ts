import { describe, expect, it } from 'vitest';

import { DRILLS } from '../data/learning-os';
import { drillVerification } from './contentQuality';
import { runDrillTests, type DrillTestCase } from './drillRunner';

describe('runDrillTests', () => {
  it('passes when stdout contains all expected substrings', () => {
    const tests: DrillTestCase[] = [
      {
        setup: 'function add(a, b) { return a + b; }',
        run: 'console.log(add(2, 3));',
        expect: '5',
      },
    ];
    const result = runDrillTests('', tests);
    expect(result.passed).toBe(true);
    expect(result.message).toBe('All tests passed.');
  });

  it('fails when output misses an expected substring', () => {
    const tests: DrillTestCase[] = [
      {
        setup: 'function add(a, b) { return a + b; }',
        run: 'console.log(add(2, 3));',
        expect: '6',
      },
    ];
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
    const tests: DrillTestCase[] = [
      {
        setup: 'function double(n) { return n; }',
        run: 'console.log(double(4));',
        expect: '8',
      },
    ];
    const userCode = 'function double(n) { return n * 2; }';
    const result = runDrillTests(userCode, tests);
    expect(result.passed).toBe(true);
    expect(result.output).toBe('8');
  });

  it('grades only what `run` prints, not what the editor printed', () => {
    const tests: DrillTestCase[] = [{ run: 'console.log(solve());', expect: '42' }];
    // Printing the expected answer at the top level used to be enough.
    const spoof = 'console.log("42");\nfunction solve() { return 0; }';
    expect(runDrillTests(spoof, tests).passed).toBe(false);
    expect(runDrillTests('function solve() { return 42; }', tests).passed).toBe(true);
  });

  it('lets user code redeclare a setup const instead of throwing', () => {
    const tests: DrillTestCase[] = [
      { setup: 'const LIMIT = 1;', run: 'console.log(LIMIT);', expect: '9' },
    ];
    const result = runDrillTests('const LIMIT = 9;', tests);
    expect(result.errors).toBe('');
    expect(result.passed).toBe(true);
  });

  it('returns runtime errors without throwing', () => {
    const tests: DrillTestCase[] = [
      {
        run: 'throw new Error("boom");',
        expect: 'never',
      },
    ];
    const result = runDrillTests('', tests);
    expect(result.passed).toBe(false);
    expect(result.message).toBe('boom');
    expect(result.errors).toBe('boom');
  });
});

// Regression guard for the whole catalog: setups used to carry the reference
// implementation, so 116 drills passed with a completely empty editor.
describe('drill catalog integrity', () => {
  const tested = DRILLS.filter((d) => d.testCases?.length);

  it('has drills with automated checks', () => {
    expect(tested.length).toBeGreaterThan(200);
  });

  it('no drill can be passed with an empty editor', () => {
    const gamed = tested
      .filter((d) => runDrillTests('', d.testCases ?? []).passed)
      .map((d) => d.id);
    expect(gamed).toEqual([]);
  });

  // A validator that only measures `String(value).length` is satisfied by a
  // Proxy that answers every property read with one long string. Ten `star-*`
  // drills shipped that way. Graders must read OWN properties and cross-check
  // values, not just measure them.
  it('no drill can be passed with a junk stub', () => {
    const stubs = [
      'function designOutline(){return new Proxy({},{get:()=>"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"})}',
      'function starStory(){return new Proxy({},{get:()=>"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1"})}',
      // Own keys, but every field is the same padded filler.
      `const F="lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore 42";
       const R=new Proxy({},{get:()=>F,ownKeys:()=>[],getOwnPropertyDescriptor:()=>undefined});
       function designOutline(){return R}
       function starStory(){return R}`,
    ];
    const gamed = tested
      .filter((d) => stubs.some((s) => runDrillTests(s, d.testCases ?? []).passed))
      .map((d) => d.id);
    expect(gamed).toEqual([]);
  });

  it('every reference solution actually passes its own tests', () => {
    const broken = tested
      .filter((d) => d.referenceSolution)
      .filter((d) => !runDrillTests(d.referenceSolution ?? '', d.testCases ?? []).passed)
      .map((d) => d.id);
    expect(broken).toEqual([]);
  });

  it('no reference solution leaks back into a test setup', () => {
    const leaked = tested
      .filter((d) => d.referenceSolution)
      .filter((d) => (d.testCases ?? []).some((t) => t.setup?.includes(d.referenceSolution ?? '')))
      .map((d) => d.id);
    expect(leaked).toEqual([]);
  });

  it('drills without automated checks are labelled self-reported', () => {
    const unchecked = DRILLS.filter((d) => !d.testCases?.length);
    expect(unchecked.length).toBeGreaterThan(0);
    expect(unchecked.every((d) => drillVerification(d) === 'self-reported')).toBe(true);
  });
});
