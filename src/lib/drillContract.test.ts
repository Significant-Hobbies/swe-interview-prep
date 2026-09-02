import { describe, expect, it } from 'vitest';

import { DRILLS } from '../data/learning-os';
import { drillContract } from './drillContract';

describe('drillContract', () => {
  it('names the function the grader calls', () => {
    const { required, calls } = drillContract([
      { run: 'console.log(paginationChoice(10000000));', expect: 'cursor' },
    ]);
    expect(required).toEqual(['paginationChoice']);
    expect(calls).toEqual(['console.log(paginationChoice(10000000));']);
  });

  it('excludes helpers the setup already provides', () => {
    const { required } = drillContract([
      {
        setup: 'function validateOutline(o, keys) { return true; }',
        run: 'console.log(validateOutline(designOutline(), ["algorithmChoice"]));',
        expect: 'true',
      },
    ]);
    expect(required).toEqual(['designOutline']);
  });

  it('ignores method calls and language builtins', () => {
    const { required } = drillContract([
      {
        run: 'const g = [[1]];\nconsole.log(chunkDoc(g).map(String).join(","), JSON.stringify(new Map()));',
        expect: '1',
      },
    ]);
    expect(required).toEqual(['chunkDoc']);
  });

  it('finds constructors reached through new', () => {
    const { required } = drillContract([
      { run: 'const b = new TokenBucket(2, 1);\nconsole.log(b.allow());', expect: 'true' },
    ]);
    expect(required).toEqual(['TokenBucket']);
  });

  it('does not treat quoted identifiers as calls', () => {
    const { required } = drillContract([
      { run: 'console.log(check("notAFunction (x)", `alsoNot(y)`));', expect: 'ok' },
    ]);
    expect(required).toEqual(['check']);
  });

  it('skips names the run statement declares itself', () => {
    const { required } = drillContract([
      { run: 'const helper = (n) => n * 2;\nconsole.log(solve(helper(2)));', expect: '4' },
    ]);
    expect(required).toEqual(['solve']);
  });

  it('never echoes an expected value', () => {
    const { calls } = drillContract([{ run: 'console.log(tfidf(3, 2, 10));', expect: '3.38' }]);
    expect(calls.join('\n')).not.toContain('3.38');
  });
});

describe('drill catalog contracts', () => {
  const tested = DRILLS.filter((d) => d.testCases?.length);

  // Every auto-graded drill demands a specific symbol. If the contract came
  // back empty the workspace would silently show nothing and the user would be
  // back to guessing.
  it('resolves a required symbol for every auto-graded drill', () => {
    const empty = tested
      .filter((d) => !drillContract(d.testCases).required.length)
      .map((d) => d.id);
    expect(empty).toEqual([]);
  });

  it('every required symbol is one the reference solution defines', () => {
    const missing = tested
      .filter((d) => d.referenceSolution)
      .filter((d) =>
        drillContract(d.testCases).required.some((name) => !d.referenceSolution?.includes(name))
      )
      .map((d) => d.id);
    expect(missing).toEqual([]);
  });
});
