// What a drill's automated tests will actually call.
//
// Test cases invoke a specific identifier — `numIslands(grid)`, `tfidf(3,2,10)`,
// `designOutline()` — that the prompt frequently never names. 176 of the
// catalog's test cases are in that state, so passing them means guessing an
// exact symbol. Rather than rewrite 176 prompts by hand, derive the contract
// from the test cases themselves and show it. Derived from the data, so it
// cannot drift out of sync with what is graded.
import type { DrillTestCase } from './drillRunner';

/** Ambient names the harness or the language already provides. */
const PROVIDED = new Set([
  'Array',
  'BigInt',
  'Boolean',
  'Date',
  'Error',
  'Function',
  'Infinity',
  'JSON',
  'Map',
  'Math',
  'NaN',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'Reflect',
  'RegExp',
  'Set',
  'String',
  'Symbol',
  'TypeError',
  'WeakMap',
  'WeakSet',
  'console',
  'decodeURIComponent',
  'encodeURIComponent',
  'eval',
  'globalThis',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'structuredClone',
  'undefined',
]);

/** Keywords that can sit directly before `(` without being a call. */
const KEYWORDS = new Set([
  'catch',
  'do',
  'else',
  'for',
  'function',
  'if',
  'in',
  'new',
  'of',
  'return',
  'switch',
  'typeof',
  'void',
  'while',
  'with',
  'yield',
]);

const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[\w$]/;

/** Characters after which a `/` starts a regex literal rather than a division. */
const REGEX_ALLOWED_AFTER = new Set([
  '',
  '(',
  ',',
  '=',
  ':',
  '[',
  '!',
  '&',
  '|',
  '?',
  '{',
  '}',
  ';',
  '+',
  '-',
  '*',
  '%',
  '~',
  '^',
  '<',
  '>',
]);

/** End of the comment starting at `i` (exclusive), or -1 if none starts there. */
function commentEnd(src: string, i: number): number {
  if (src[i] !== '/') return -1;
  if (src[i + 1] === '/') {
    const newline = src.indexOf('\n', i);
    return newline === -1 ? src.length : newline;
  }
  if (src[i + 1] === '*') {
    const close = src.indexOf('*/', i + 2);
    return close === -1 ? src.length : close + 2;
  }
  return -1;
}

/** End of the regex literal at `i` (exclusive), or -1 when `/` is division. */
function regexEnd(src: string, i: number, lastCode: string): number {
  if (src[i] !== '/' || !REGEX_ALLOWED_AFTER.has(lastCode)) return -1;
  let k = i + 1;
  let inClass = false;
  while (k < src.length && src[k] !== '\n') {
    const ch = src[k];
    if (ch === '\\') {
      k += 2;
      continue;
    }
    if (ch === '[') inClass = true;
    else if (ch === ']') inClass = false;
    else if (ch === '/' && !inClass) {
      k++;
      while (k < src.length && /[a-z]/.test(src[k])) k++; // flags
      return k;
    }
    k++;
  }
  return -1;
}

/** End of the string or template literal at `i` (exclusive), or -1 if none. */
function stringEnd(src: string, i: number): number {
  const quote = src[i];
  if (quote !== '"' && quote !== "'" && quote !== '`') return -1;
  let k = i + 1;
  while (k < src.length) {
    if (src[k] === '\\') {
      k += 2;
      continue;
    }
    if (src[k] === quote) return k + 1;
    k++;
  }
  return src.length;
}

/**
 * Blank out anything that is not executable code — strings, template literals,
 * regex literals, and comments — so their contents cannot be read as calls or
 * declarations. Length is preserved so indices stay valid.
 *
 * Regex and comment handling is not incidental: a `star-*` drill's setup holds
 * a character-class regex containing an apostrophe, and further down a doc
 * comment quoting 'outline-check'. A masker that only knew about quotes
 * swallowed everything between those two apostrophes, hiding the
 * `validateStar` declaration in between and reporting a setup-provided helper
 * as something the user had to write.
 */
function maskLiterals(src: string): string {
  const out: string[] = [];
  let i = 0;
  let lastCode = '';

  const blankTo = (end: number) => {
    for (let k = i; k < end; k++) out.push(src[k] === '\n' ? '\n' : ' ');
    i = end;
  };

  while (i < src.length) {
    const comment = commentEnd(src, i);
    if (comment !== -1) {
      blankTo(comment);
      continue;
    }
    const regex = regexEnd(src, i, lastCode);
    if (regex !== -1) {
      blankTo(regex);
      lastCode = 'x'; // a literal, so a following `/` is division
      continue;
    }
    const str = stringEnd(src, i);
    if (str !== -1) {
      blankTo(str);
      lastCode = 'x';
      continue;
    }
    const ch = src[i];
    out.push(ch);
    if (!/\s/.test(ch)) lastCode = ch;
    i++;
  }
  return out.join('');
}

/** Top-level bindings a snippet declares — `function f`, `class C`, `const x`. */
function declaredNames(src: string): Set<string> {
  const names = new Set<string>();
  const patterns = [
    /\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)/g,
    /\bclass\s+([A-Za-z_$][\w$]*)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
  ];
  for (const re of patterns) {
    for (const m of src.matchAll(re)) names.add(m[1]);
  }
  return names;
}

/** Identifiers `src` calls, excluding method calls and its own declarations. */
function calledNames(src: string): string[] {
  const masked = maskLiterals(src);
  const own = declaredNames(masked);
  const found: string[] = [];

  for (let i = 0; i < masked.length; i++) {
    if (!IDENT_START.test(masked[i])) continue;
    let end = i + 1;
    while (end < masked.length && IDENT_PART.test(masked[end])) end++;
    const name = masked.slice(i, end);
    const before = i > 0 ? masked[i - 1] : '';
    let after = end;
    while (after < masked.length && /\s/.test(masked[after])) after++;
    i = end - 1;

    if (masked[after] !== '(') continue; // not a call
    if (before === '.') continue; // method call — the receiver owns it
    if (KEYWORDS.has(name) || PROVIDED.has(name) || own.has(name)) continue;
    if (!found.includes(name)) found.push(name);
  }
  return found;
}

export interface DrillContract {
  /** Symbols the editor must define for the tests to run, in first-use order. */
  required: string[];
  /** The exact statements the grader executes, one per test case. */
  calls: string[];
}

/**
 * The observable contract between a drill's prompt and its grader.
 *
 * Deliberately omits every `expect` value: the point is to tell the user what
 * to define, not what the answer is.
 */
export function drillContract(testCases: DrillTestCase[] | undefined): DrillContract {
  const required: string[] = [];
  const calls: string[] = [];

  for (const test of testCases ?? []) {
    const provided = declaredNames(maskLiterals(test.setup ?? ''));
    for (const name of calledNames(test.run ?? '')) {
      if (!provided.has(name) && !required.includes(name)) required.push(name);
    }
    const call = (test.run ?? '').trim();
    if (call && !calls.includes(call)) calls.push(call);
  }

  return { required, calls };
}
