// Return-to-record handling for sign-in: an MCP deep link opened while signed
// out should land on the same record page after sign-in.

const RECORD_KINDS = new Set(['courses', 'sessions', 'resources', 'gaps']);
const SAFE_SEGMENT = /^[A-Za-z0-9_.%-]+$/u;
const SAFE_FRAGMENT = /^[a-z][a-z-]{0,40}$/u;

function recordPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0]?.toLowerCase() !== 'record') return null;
  if (parts.length === 1) return '/record';
  const kind = parts[1]?.toLowerCase();
  const id = parts[2];
  if (parts.length !== 3 || !RECORD_KINDS.has(kind) || !SAFE_SEGMENT.test(id) || id === '..') {
    return null;
  }
  return ['', 'record', kind, id].join('/');
}

/** A validated in-app record destination (path plus optional section), or null. */
export function recordDestination(next: string | null): string | null {
  if (!next?.startsWith('/') || next.startsWith('//')) return null;
  const [pathname, fragment = ''] = next.split('#');
  const path = recordPath(pathname);
  if (!path) return null;
  if (!fragment) return path;
  return SAFE_FRAGMENT.test(fragment) ? `${path}#${fragment}` : path;
}

/** The sign-in link for the current page, carrying a record destination when there is one. */
export function loginHref(pathname: string, hash = ''): string {
  const destination = recordDestination(`${pathname}${hash}`);
  if (!destination) return '/login#sign-in';
  return `/login?${new URLSearchParams({ next: destination }).toString()}#sign-in`;
}
