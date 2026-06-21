// Lightweight drill test runner — compares stdout to expected patterns.
export interface DrillTestCase {
  /** Optional setup code prepended before user code. */
  setup?: string;
  /** Expression or statement whose console.log output is checked. */
  run: string;
  /** Substring(s) that must appear in stdout. */
  expect: string | string[];
}

export interface DrillTestResult {
  passed: boolean;
  output: string;
  errors: string;
  message: string;
}

function normalize(s: string): string {
  return s.replace(/\r\n/g, '\n').trim();
}

/** Run drill tests in-browser via dynamic Function (TypeScript stripped by caller). */
export function runDrillTests(
  userCode: string,
  tests: DrillTestCase[],
  _language: 'typescript' | 'javascript' = 'typescript',
): DrillTestResult {
  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
  };

  try {
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      logs.length = 0;
      const body = `${t.setup ?? ''}\n${userCode}\n${t.run}`;
      // eslint-disable-next-line no-new-func
      const fn = new Function('console', body);
      fn(fakeConsole);
      const out = normalize(logs.join('\n'));
      const expected = Array.isArray(t.expect) ? t.expect : [t.expect];
      const ok = expected.every(e => out.includes(e));
      if (!ok) {
        return {
          passed: false,
          output: out,
          errors: '',
          message: `Test ${i + 1} failed: expected output containing ${expected.map(e => JSON.stringify(e)).join(' and ')}, got ${JSON.stringify(out)}`,
        };
      }
    }
    return { passed: true, output: normalize(logs.join('\n')), errors: '', message: 'All tests passed.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { passed: false, output: normalize(logs.join('\n')), errors: msg, message: msg };
  }
}