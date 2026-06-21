import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { type Concept as BaseConcept, CONCEPTS } from '../data/learning-os';
import { reviewConcept, type MasteryRating, type MasteryRow } from '../lib/fsrs';
import { loadLocal, mergeRecords, saveLocal, STORE_KEYS } from '../lib/userStore';

// Back-compat alias: older code reads `prereqs`; the new schema uses `prerequisites`.
export type Concept = BaseConcept & { prereqs: string[] };

export interface MasteryEntry {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview?: string | null;
  due?: string | null;
  confidence: number;
}

export const ALL_CONCEPTS: Concept[] = CONCEPTS.map(c => ({ ...c, prereqs: c.prerequisites }));
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  ALL_CONCEPTS.map(c => [c.id, c]),
);

function rowToEntry(row: MasteryRow): MasteryEntry {
  return {
    stability: row.stability,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    lastReview: row.last_review ?? null,
    due: row.due ?? null,
    confidence: row.confidence ?? 0,
  };
}

function entryToRow(entry: MasteryEntry): MasteryRow {
  return {
    stability: entry.stability,
    difficulty: entry.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: entry.reps,
    lapses: entry.lapses,
    state: entry.state,
    last_review: entry.lastReview ?? null,
    due: entry.due ?? null,
    confidence: entry.confidence,
  };
}

function loadGuestMastery(): Record<string, MasteryEntry> {
  const raw = loadLocal<Record<string, MasteryRow>>(STORE_KEYS.mastery, {});
  return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, rowToEntry(v)]));
}

function saveGuestMastery(mastery: Record<string, MasteryEntry>): void {
  const raw = Object.fromEntries(Object.entries(mastery).map(([k, v]) => [k, entryToRow(v)]));
  saveLocal(STORE_KEYS.mastery, raw);
}

export function useConceptMastery() {
  const { user } = useAuth();
  const [mastery, setMastery] = useState<Record<string, MasteryEntry>>(() =>
    user ? {} : loadGuestMastery(),
  );
  const [loading, setLoading] = useState(false);

  const fetchMastery = useCallback(async () => {
    if (!user) {
      setMastery(loadGuestMastery());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/learning?action=concepts', { credentials: 'include' });
      if (!res.ok) {
        setMastery(loadGuestMastery());
        return;
      }
      const data = await res.json();
      const remote = (data.mastery || {}) as Record<string, MasteryEntry>;
      const merged = mergeRecords(loadGuestMastery(), remote);
      setMastery(merged);
      saveGuestMastery(merged);
    } catch {
      setMastery(loadGuestMastery());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMastery();
  }, [fetchMastery]);

  const review = useCallback(async (conceptId: string, rating: MasteryRating) => {
    if (user) {
      try {
        const res = await fetch('/api/learning?action=concepts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ conceptId, rating }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.mastery) {
          setMastery(prev => {
            const next = {
              ...prev,
              [conceptId]: { ...data.mastery, confidence: data.mastery.confidence },
            };
            saveGuestMastery(next);
            return next;
          });
        }
      } catch {
        // fall through to local
      }
      return;
    }

    setMastery(prev => {
      const row = reviewConcept(prev[conceptId] ? entryToRow(prev[conceptId]) : null, rating);
      const next = { ...prev, [conceptId]: rowToEntry(row) };
      saveGuestMastery(next);
      return next;
    });
  }, [user]);

  return { mastery, loading, refresh: fetchMastery, review };
}