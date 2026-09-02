// Lightweight drill test runner — compares stdout to expected patterns.
import { transpile } from './transpile';
import type { Language } from '../types';

export interface DrillTestCase {
  /**
   * Optional fixtures/helpers evaluated in an OUTER scope. It must never
   * contain the implementation the drill asks for — user code runs in an
   * inner scope and would then be irrelevant to the assertion. Reference
   * implementations live in `Drill.referenceSolution`, not here.
   */
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

/** Lines the wrapper inserts above the user's code, for error line mapping. */
function prefixLineCount(setup: string | undefined): number {
  // `${setup ?? ''}` + '\n' + 'return (function () {' + '\n' + userCode
  return (setup ?? '').split('\n').length + 1;
}

/**
 * Run drill tests in-browser via dynamic Function.
 *
 * TypeScript is stripped here rather than by the caller. It used to be the
 * caller's job on paper only — `BuildLab` passed the raw editor buffer, so a
 * single type annotation failed both "Run" and "Mark solved" with an
 * unlocatable `SyntaxError: Unexpected token ':'`.
 *
 * Two properties this harness deliberately guarantees:
 *  1. `setup` runs in an OUTER scope and user code in an inner one, so a user
 *     declaration shadows a same-named helper instead of colliding with it
 *     (`const` redeclaration would otherwise be a SyntaxError).
 *  2. Only output produced by `run` is graded — the log buffer is cleared
 *     after user code has been evaluated. Printing the expected string at the
 *     top level of the editor no longer passes the test.
 *
 * It still grades stdout, not the implementation, so it cannot detect a
 * solution that prints the right answer from inside the function under test.
 * Drills whose grading is structural rather than behavioural are labelled via
 * `drillVerification()` in `contentQuality.ts`.
 */
export function runDrillTests(
  userCode: string,
  tests: DrillTestCase[],
  language: Language = 'typescript'
): DrillTestResult {
  const logs: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
  };

  // Compile once, before any test runs: a syntax error is a property of the
  // editor buffer, not of test 1. Sucrase positions it against the user's own
  // source, so the message carries a line the editor gutter agrees with.
  const compiled = transpile(userCode, language);
  if (compiled.error) {
    const message = `Syntax error in your code — ${compiled.error}`;
    return { passed: false, output: '', errors: message, message };
  }
  const source = compiled.code ?? userCode;

  try {
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      logs.length = 0;
      const body = `${t.setup ?? ''}\nreturn (function () {\n${source}\nreturn function () {\n${t.run}\n};\n})();`;
      let runPhase: () => void;
      try {
        // eslint-disable-next-line no-new-func
        runPhase = new Function('console', body)(fakeConsole) as () => void;
      } catch (e) {
        // Survives the transpile but not the harness — almost always a drill
        // authoring bug in `setup`/`run`, not the user's code. Say so, and do
        // not report a line number the editor cannot map back.
        if (e instanceof SyntaxError) {
          const message = `Test ${i + 1} could not be compiled (drill harness): ${e.message}. Prefix lines: ${prefixLineCount(t.setup)}.`;
          return { passed: false, output: '', errors: message, message };
        }
        throw e;
      }
      // Grade only what `run` prints, not what the editor printed on its way there.
      logs.length = 0;
      runPhase();
      const out = normalize(logs.join('\n'));
      const expected = Array.isArray(t.expect) ? t.expect : [t.expect];
      const ok = expected.every((e) => out.includes(e));
      if (!ok) {
        return {
          passed: false,
          output: out,
          errors: '',
          message: `Test ${i + 1} failed: expected output containing ${expected.map((e) => JSON.stringify(e)).join(' and ')}, got ${JSON.stringify(out)}`,
        };
      }
    }
    return {
      passed: true,
      output: normalize(logs.join('\n')),
      errors: '',
      message: 'All tests passed.',
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { passed: false, output: normalize(logs.join('\n')), errors: msg, message: msg };
  }
}
