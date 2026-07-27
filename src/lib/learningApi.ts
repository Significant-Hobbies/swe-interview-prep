/**
 * One gate in front of the signed-in half of `/api/learning`.
 *
 * The app is open to everyone and guests keep all their state in
 * localStorage, so an auth-required request from a guest can only ever 401.
 * It cannot succeed, its result is discarded, and it shows up as a red line in
 * the console of every visitor — which is exactly what `action=elo` was doing
 * on every page load, unguarded, for anyone who never signed in.
 *
 * Most callers already checked `user` from `useAuth`. Six did not, and two of
 * those (`activity.ts`, `aiClient.ts`) are plain modules with no React context
 * to check against. Rather than add a seventh ad-hoc guard, every
 * auth-required call goes through here, and the auth/public split is read from
 * the same registry the server uses — so adding an action to `AUTH_ACTIONS`
 * gates the client automatically instead of silently leaving a hole.
 */
import { AUTH_ACTIONS } from '../../shared/api/learning-registry.mjs';

/** Profile cache written by AuthContext. Presence means "we believe we have a session". */
const PROFILE_KEY = 'dsa-prep-profile';

const AUTH_ACTION_SET = new Set<string>(AUTH_ACTIONS);

function requiresAuth(action: string): boolean {
  return AUTH_ACTION_SET.has(action);
}

/**
 * Whether a signed-in session plausibly exists.
 *
 * The JWT is an httpOnly cookie and deliberately unreadable, so this checks the
 * profile cache AuthContext keeps alongside it. A stale cache costs one 401
 * that the caller already handles; the point is to stop the guaranteed-useless
 * request, not to authenticate.
 */
export function hasSession(): boolean {
  try {
    return Boolean(localStorage.getItem(PROFILE_KEY));
  } catch {
    return false;
  }
}

/**
 * Call a learning action, skipping it entirely when it needs a session and
 * there is none. Resolves `null` when the call was skipped, so callers can
 * tell "not attempted" from "attempted and failed".
 */
export async function learningFetch(
  action: string,
  init?: RequestInit & { query?: string }
): Promise<Response | null> {
  if (requiresAuth(action) && !hasSession()) return null;
  const query = init?.query ? `&${init.query}` : '';
  const { query: _drop, ...rest } = init ?? {};
  return fetch(`/api/learning?action=${action}${query}`, {
    credentials: 'include',
    ...rest,
  });
}
