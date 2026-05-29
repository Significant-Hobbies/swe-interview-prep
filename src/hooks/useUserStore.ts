import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import type { ArtifactStatus, DrillStatus, ProjectStatus, TrackId } from '../data/learning-os';
import { DEFAULT_USER_ELO, updatePlayerElo } from '../lib/elo';
import {
  loadLocal,
  type MergeableNote,
  mergeNotes,
  mergeRecords,
  saveLocal,
  STORE_KEYS,
} from '../lib/userStore';

// ---------------------------------------------------------------------------
// Generic record store: localStorage-first, DB-synced when signed in.
// ---------------------------------------------------------------------------

interface RecordStoreConfig<T> {
  localKey: string;
  action: string;
  field: string;
  toPayload: (id: string, entry: T) => Record<string, unknown>;
}

function useRecordStore<T>(config: RecordStoreConfig<T>) {
  const { localKey, action, field, toPayload } = config;
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, T>>(() => loadLocal(localKey, {}));
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // On sign-in: pull DB state and merge it over local (DB wins, local fills gaps).
  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/learning?action=${action}`, { credentials: 'include' });
      if (!res.ok) return;
      const d = await res.json();
      const merged = mergeRecords(loadLocal<Record<string, T>>(localKey, {}), d[field] || {});
      setData(merged);
      saveLocal(localKey, merged);
    } catch {
      // Offline / no endpoint — keep localStorage state.
    }
  }, [user, action, field, localKey]);

  useEffect(() => { void load(); }, [load]);

  const set = useCallback((id: string, entry: T) => {
    setData(prev => {
      const next = { ...prev, [id]: entry };
      saveLocal(localKey, next);
      return next;
    });
    if (!user) return;
    // Debounce DB writes per id so rapid edits collapse into one request.
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      void fetch(`/api/learning?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toPayload(id, entry)),
      }).catch(() => {});
    }, 500);
  }, [user, action, localKey, toPayload]);

  return { data, set };
}

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

export interface ArtifactEntry {
  status: ArtifactStatus;
  url: string;
  path: string;
  notes: string;
  criteria: number[];
}

export const EMPTY_ARTIFACT: ArtifactEntry = { status: 'todo', url: '', path: '', notes: '', criteria: [] };

const ARTIFACT_CONFIG: RecordStoreConfig<ArtifactEntry> = {
  localKey: STORE_KEYS.artifacts,
  action: 'artifacts',
  field: 'artifacts',
  toPayload: (artifactId, e) => ({ artifactId, ...e }),
};

export function useArtifactStore() {
  const { data, set } = useRecordStore<ArtifactEntry>(ARTIFACT_CONFIG);
  return {
    artifacts: data,
    getArtifact: (id: string): ArtifactEntry => data[id] || EMPTY_ARTIFACT,
    setArtifact: set,
  };
}

// ---------------------------------------------------------------------------
// Drills
// ---------------------------------------------------------------------------

export interface DrillEntry {
  status: DrillStatus;
  lastCode: string;
  attempts: number;
}

export const EMPTY_DRILL: DrillEntry = { status: 'unsolved', lastCode: '', attempts: 0 };

const DRILL_CONFIG: RecordStoreConfig<DrillEntry> = {
  localKey: STORE_KEYS.drills,
  action: 'drills',
  field: 'drills',
  toPayload: (drillId, e) => ({ drillId, status: e.status, lastCode: e.lastCode }),
};

export function useDrillStore() {
  const { data, set } = useRecordStore<DrillEntry>(DRILL_CONFIG);
  return {
    drills: data,
    getDrill: (id: string): DrillEntry => data[id] || EMPTY_DRILL,
    setDrill: (id: string, entry: DrillEntry) => set(id, { ...entry, attempts: (data[id]?.attempts || 0) + 1 }),
  };
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectEntry {
  status: ProjectStatus;
  nextAction: string;
  milestones: Record<string, boolean>;
}

const PROJECT_CONFIG: RecordStoreConfig<ProjectEntry> = {
  localKey: STORE_KEYS.projects,
  action: 'projects',
  field: 'projects',
  toPayload: (projectId, e) => ({ projectId, ...e }),
};

export function useProjectStore() {
  const { data, set } = useRecordStore<ProjectEntry>(PROJECT_CONFIG);
  return { projects: data, getProject: (id: string) => data[id], setProject: set };
}

// ---------------------------------------------------------------------------
// Notes — a list store, not a record store.
// ---------------------------------------------------------------------------

export interface LearningNote extends MergeableNote {
  id: string;
  scope: 'concept' | 'roadmap' | 'project' | 'free';
  refId: string;
  title: string;
  body: string;
  updatedAt: string;
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function useLearningNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LearningNote[]>(() => loadLocal(STORE_KEYS.notes, []));

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/learning?action=notes', { credentials: 'include' });
      if (!res.ok) return;
      const d = await res.json();
      const merged = mergeNotes(loadLocal<LearningNote[]>(STORE_KEYS.notes, []), d.notes || []);
      setNotes(merged);
      saveLocal(STORE_KEYS.notes, merged);
    } catch {
      // Offline / no endpoint — keep localStorage state.
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const saveNote = useCallback((note: Partial<LearningNote> & { scope: LearningNote['scope']; body: string }) => {
    const full: LearningNote = {
      id: note.id || newId(),
      scope: note.scope,
      refId: note.refId || '',
      title: note.title || '',
      body: note.body,
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => {
      const next = mergeNotes(prev.filter(n => n.id !== full.id), [full]);
      saveLocal(STORE_KEYS.notes, next);
      return next;
    });
    if (user) {
      void fetch('/api/learning?action=notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(full),
      }).catch(() => {});
    }
    return full;
  }, [user]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      saveLocal(STORE_KEYS.notes, next);
      return next;
    });
    if (user) {
      void fetch(`/api/learning?action=notes&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      }).catch(() => {});
    }
  }, [user]);

  return { notes, saveNote, deleteNote };
}

// ---------------------------------------------------------------------------
// Focus mode — no-tools audit. Hides AI assistance from Playground.
// Tracks each toggle-on transition as a "session" so weekly counts surface
// how often the user actually trains without scaffolding.
// localStorage-only for v1; not synced to DB.
// ---------------------------------------------------------------------------

interface FocusModeState {
  enabled: boolean;
  // Unix ms timestamps of each toggle-on transition. Truncated to last 90 days.
  sessions: number[];
}

const EMPTY_FOCUS: FocusModeState = { enabled: false, sessions: [] };
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useFocusMode() {
  const [state, setState] = useState<FocusModeState>(() =>
    loadLocal<FocusModeState>(STORE_KEYS.focusMode, EMPTY_FOCUS),
  );

  const setEnabled = useCallback((next: boolean) => {
    setState(prev => {
      const now = Date.now();
      const sessions = prev.sessions.filter(t => now - t < NINETY_DAYS_MS);
      // Log a session only on the off → on transition.
      if (next && !prev.enabled) sessions.push(now);
      const updated = { enabled: next, sessions };
      saveLocal(STORE_KEYS.focusMode, updated);
      return updated;
    });
  }, []);

  // Returned as a function so Date.now() — an impure call — happens at the
  // consumer's read site rather than during this hook's render. The count
  // is naturally bounded by the 7-day window in the filter.
  const sessionsThisWeek = useCallback(
    () => state.sessions.filter(t => Date.now() - t < SEVEN_DAYS_MS).length,
    [state.sessions],
  );

  return { enabled: state.enabled, setEnabled, sessionsThisWeek };
}

// ---------------------------------------------------------------------------
// Per-track user ELO — adaptive difficulty calibration.
// Problem ratings come from `difficultyToElo` (static); only the player's
// ELO moves. K-factor is elevated during the first ~10 solves per track for
// faster convergence. localStorage-only for v1.
// ---------------------------------------------------------------------------

interface UserEloState {
  // Per-track ELO. Missing tracks default to DEFAULT_USER_ELO.
  elo: Partial<Record<TrackId, number>>;
  // Per-track solve counter used to scale K-factor (provisional vs stable).
  solves: Partial<Record<TrackId, number>>;
}

const EMPTY_USER_ELO: UserEloState = { elo: {}, solves: {} };

export function useUserElo() {
  const [state, setState] = useState<UserEloState>(() =>
    loadLocal<UserEloState>(STORE_KEYS.userElo, EMPTY_USER_ELO),
  );

  const getElo = useCallback(
    (trackId: TrackId): number => state.elo[trackId] ?? DEFAULT_USER_ELO,
    [state.elo],
  );

  const recordResult = useCallback((trackId: TrackId, problemElo: number, score: number) => {
    setState(prev => {
      const current = prev.elo[trackId] ?? DEFAULT_USER_ELO;
      const solveCount = prev.solves[trackId] ?? 0;
      const next: UserEloState = {
        elo: { ...prev.elo, [trackId]: updatePlayerElo(current, problemElo, score, solveCount) },
        solves: { ...prev.solves, [trackId]: solveCount + 1 },
      };
      saveLocal(STORE_KEYS.userElo, next);
      return next;
    });
  }, []);

  return { getElo, recordResult, elo: state.elo, solves: state.solves };
}
