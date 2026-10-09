import { STORE_KEYS } from './userStore';

/**
 * Local stores that only gain content when someone has actually learned,
 * practised, or set up a path — never from merely opening a page. (That is
 * why `swe-os:daily-sessions` and recent visits are absent: opening the
 * dashboard alone writes them.)
 *
 * `/` uses this to decide between the public landing (first-time visitors)
 * and the dashboard (returning learners). The LCP shell script in
 * `index.html` mirrors this list; keep the two in step.
 */
const LEARNER_PROGRESS_KEYS = [
  STORE_KEYS.mastery,
  STORE_KEYS.reviewMastery,
  STORE_KEYS.sweep,
  STORE_KEYS.drills,
  STORE_KEYS.artifacts,
  STORE_KEYS.projects,
  STORE_KEYS.notes,
  STORE_KEYS.systemsLabs,
  STORE_KEYS.learningEvidence,
  STORE_KEYS.activeRoadmap,
  STORE_KEYS.onboarding,
] as const;

const SCHEMA_FIELDS = new Set(['schemaVersion', 'version']);

/** True when a parsed store value holds at least one real record. */
export function hasStoredContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === '') return false;
  if (Array.isArray(value)) return value.some(hasStoredContent);
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, entry]) => !SCHEMA_FIELDS.has(key) && hasStoredContent(entry)
    );
  }
  return true;
}

/** True when this browser holds any learning progress. */
export function hasLearnerProgress(storage: Pick<Storage, 'getItem'> | null = safeStorage()) {
  if (!storage) return false;
  return LEARNER_PROGRESS_KEYS.some((key) => {
    try {
      const raw = storage.getItem(key);
      return raw ? hasStoredContent(JSON.parse(raw)) : false;
    } catch {
      return false;
    }
  });
}

function safeStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
