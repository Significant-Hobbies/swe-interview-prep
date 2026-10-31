import { STORE_KEYS } from './userStore';

/**
 * Local stores that only gain content when someone has actually learned,
 * practised, or set up a path — never from merely opening a page. (That is
 * why `swe-os:daily-sessions` and recent visits are absent: opening the
 * dashboard alone writes them.)
 *
 * `/` uses this to decide between the public landing (first-time visitors)
 * and the dashboard (returning learners). The early entry script is generated
 * from these same keys and predicates so it does not maintain a second list.
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

/** True when a parsed store value holds at least one real record. */
export function hasStoredContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === '') return false;
  if (Array.isArray(value)) return value.some(hasStoredContent);
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(
      ([key, entry]) => key !== 'schemaVersion' && key !== 'version' && hasStoredContent(entry)
    );
  }
  return true;
}

export interface InitialEntry {
  returning: boolean;
  prerender: boolean;
}

/** Conservative optimization gate; Home remains the owner of navigation. */
export function readInitialEntry(
  pathname: string,
  storage: Pick<Storage, 'getItem'> | null,
  keys: readonly string[] = LEARNER_PROGRESS_KEYS
): InitialEntry {
  if (pathname !== '/' || !storage) return { returning: false, prerender: false };
  try {
    if (storage.getItem('dsa-prep-profile')) return { returning: true, prerender: false };
    const values = keys.map((key) => {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    });
    if (values.some(hasStoredContent)) return { returning: true, prerender: false };
    // Layout also shows a local-progress banner for schema-only mastery/sweep
    // stores. Keep that browser-specific presentation on the normal client path.
    const presentationState = ['swe-os:mastery', 'swe-os:sweep-v1'].some((key) => {
      const raw = storage.getItem(key);
      return raw ? Object.keys(JSON.parse(raw) ?? {}).length > 0 : false;
    });
    return { returning: false, prerender: !presentationState };
  } catch {
    // Malformed or inaccessible storage must never reveal the guest snapshot.
    return { returning: false, prerender: false };
  }
}

export function initialEntry(): InitialEntry {
  return readInitialEntry(window.location.pathname, safeStorage());
}

/** Called by Vite after TypeScript transformation, before any browser modules. */
export function initialEntryScript(prerendered: boolean): string {
  return `const hasStoredContent=${hasStoredContent.toString()};
const readInitialEntry=${readInitialEntry.toString()};
let entry={returning:false,prerender:false};
try{entry=readInitialEntry(location.pathname,localStorage,${JSON.stringify(LEARNER_PROGRESS_KEYS)})}catch{}
window.__sweEntry={...entry,enabled:${prerendered},settingsPending:false};
if(entry.prerender&&${prerendered}){
 document.documentElement.dataset.publicEntry='';
 const capture=event=>{
  const button=event.target instanceof Element?event.target.closest('button[aria-label="Settings"]'):null;
  if(!button||!document.getElementById('root')?.contains(button))return;
  event.preventDefault();event.stopImmediatePropagation();
  window.__sweEntry.settingsPending=true;
  button.setAttribute('aria-busy','true');
 };
 window.__sweEntry.capture=capture;
 document.addEventListener('click',capture,true);
}`;
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
