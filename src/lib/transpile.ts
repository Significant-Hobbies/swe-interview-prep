// Single place where editor source becomes runnable JavaScript.
//
// Two call sites need this and they used to disagree: `useCodeExecution`
// stripped TypeScript with sucrase before eval'ing in its sandbox iframe, while
// `drillRunner` handed the raw editor buffer straight to `new Function`. The
// editor is TypeScript by default, so any type annotation made "Run" and "Mark
// solved" fail with a bare `SyntaxError: Unexpected token ':'` and no location.
// Both paths now go through here.
import { transform } from 'sucrase';

import type { Language } from '../types';

export interface TranspileResult {
  /** Runnable JavaScript, or null when the source did not parse. */
  code: string | null;
  /** Parser message including a `(line:column)` suffix, relative to `source`. */
  error: string | null;
}

/**
 * Strip TypeScript and report syntax errors positioned against the user's own
 * source — not against the wrapper a caller later embeds it in.
 *
 * `javascript` is parsed too rather than passed through: the parse is what
 * turns an opaque `new Function` failure into `Unexpected token (3:24)`, and
 * for valid JavaScript the TypeScript transform is a no-op.
 */
export function transpile(source: string, _language: Language = 'typescript'): TranspileResult {
  try {
    const result = transform(source, { transforms: ['typescript'], disableESTransforms: true });
    return { code: result.code, error: null };
  } catch (e) {
    return { code: null, error: e instanceof Error ? e.message : String(e) };
  }
}
