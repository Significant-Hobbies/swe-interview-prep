import { loadLocal, saveLocal, STORE_KEYS } from './userStore';

export interface RecentVisit {
  href: string;
  label: string;
  visitedAt: string;
}

const SKIP_PATHS = new Set(['/', '/dashboard', '/today', '/login', '/onboarding']);

function humanize(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

export function visitLabel(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (pathname === '/learn') return 'Learn';
  if (pathname === '/practice' || pathname === '/playground') return 'Practice workspace';
  if (pathname === '/wars') return 'Software Wars';
  if (pathname === '/progress') return 'Progress';
  if (pathname === '/explore') return 'Complete learning catalogue';
  if (pathname === '/practice/all') return 'Complete problem catalogue';
  if (segments.length > 1) return humanize(segments.at(-1) ?? segments[0]);
  return humanize(segments[0] ?? 'Learning OS');
}

export function loadRecentVisits(): RecentVisit[] {
  return loadLocal<RecentVisit[]>(STORE_KEYS.recentVisits, []);
}

export function recordRecentVisit(pathname: string, search = ''): void {
  if (SKIP_PATHS.has(pathname) || pathname.startsWith('/share/')) return;
  const href = `${pathname}${search}`;
  const next: RecentVisit = {
    href,
    label: visitLabel(pathname),
    visitedAt: new Date().toISOString(),
  };
  const visits = loadRecentVisits().filter((visit) => visit.href !== href);
  saveLocal(STORE_KEYS.recentVisits, [next, ...visits].slice(0, 12));
}
