// Best-effort activity logging — signed-in users only.
import { getAuthToken } from '../contexts/AuthContext';

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
  const token = getAuthToken();
  if (!token) return;
  try {
    await fetch('/api/learning?action=activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
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
