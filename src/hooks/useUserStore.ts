import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import type { ArtifactStatus, DrillStatus, ProjectStatus } from '../data/learning-os';
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
