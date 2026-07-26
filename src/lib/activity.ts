// Best-effort activity logging — signed-in users only.
import { learningFetch } from './learningApi';

export type ActivityKind =
  | 'drill_start'
  | 'drill_solve'
  | 'drill_fail'
  | 'review_session'
  | 'artifact_ship'
  | 'feynman'
  | 'feynman_skip'
  | 'session_start'
  | 'mock_start'
  | 'mock_complete';

export async function logActivity(opts: {
  kind: ActivityKind;
  conceptIds?: string[];
  problemId?: string;
  durationMs?: number;
  payload?: Record<string, unknown>;
}): Promise<void> {
  // Guarded by `learningFetch`, which skips auth actions without a session.
  //
  // This used to gate on `getAuthToken()`, which has returned a hard `null`
  // since the JWT moved to an httpOnly cookie for XSS hardening — so the guard
  // was passing for nobody and activity logging was silently dead for signed-in
  // users too. The cookie rides along on `credentials: 'include'`, so no
  // Authorization header is needed.
  try {
    await learningFetch('activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: opts.kind,
        conceptIds: opts.conceptIds,
        problemId: opts.problemId,
        durationMs: opts.durationMs ?? 0,
        payload: opts.payload,
      }),
    });
  } catch {
    /* best-effort */
  }
}
