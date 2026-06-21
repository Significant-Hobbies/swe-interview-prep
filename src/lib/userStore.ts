// Pure helpers for the hybrid (localStorage + DB) user-state stores.
// Kept free of React so they can be unit-tested directly.

export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — degrade silently.
  }
}

/**
 * Merge DB records over local records: DB wins on conflict, local fills gaps.
 * Mirrors the merge already used by useProgress when a user signs in.
 */
export function mergeRecords<T>(
  local: Record<string, T>,
  remote: Record<string, T>,
): Record<string, T> {
  return { ...local, ...remote };
}

/**
 * Merge two note lists by id. The newer `updatedAt` wins; ids unique to either
 * side are kept. Used to reconcile localStorage notes with DB notes.
 */
export interface MergeableNote {
  id: string;
  updatedAt?: string;
}

export function mergeNotes<T extends MergeableNote>(local: T[], remote: T[]): T[] {
  const byId = new Map<string, T>();
  for (const n of local) byId.set(n.id, n);
  for (const n of remote) {
    const existing = byId.get(n.id);
    if (!existing) {
      byId.set(n.id, n);
    } else {
      const a = existing.updatedAt || '';
      const b = n.updatedAt || '';
      byId.set(n.id, b >= a ? n : existing);
    }
  }
  return [...byId.values()].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

// localStorage keys for the Learning OS user-state stores.
export const STORE_KEYS = {
  artifacts: 'swe-os:artifacts',
  drills: 'swe-os:drills',
  projects: 'swe-os:projects',
  notes: 'swe-os:notes',
  focusMode: 'swe-os:focus-mode',
  userElo: 'swe-os:user-elo',
  mastery: 'swe-os:mastery',
  onboarding: 'swe-os:onboarding-v1',
  activeRoadmap: 'swe-os:active-roadmap',
} as const;
