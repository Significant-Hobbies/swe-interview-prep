import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { type Concept as BaseConcept, CONCEPTS } from '../data/learning-os';
import { masteryConfidence, reviewConcept, type MasteryRating, type MasteryRow } from '../lib/fsrs';
import { masteryCacheGeneration, readMasteryCache, writeMasteryCache } from '../lib/masteryCache';
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

export const ALL_CONCEPTS: Concept[] = CONCEPTS.map((c) => ({ ...c, prereqs: c.prerequisites }));
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  ALL_CONCEPTS.map((c) => [c.id, c])
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
    // Recomputed on read rather than trusting the stored snapshot, so a guest's
    // confidence decays over time exactly like the server's does.
    confidence: masteryConfidence(row),
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

function saveMastery(
  mastery: Record<string, MasteryEntry>,
  userId: string | undefined,
  generation: number
): void {
  const raw = Object.fromEntries(Object.entries(mastery).map(([k, v]) => [k, entryToRow(v)]));
  saveLocal(STORE_KEYS.mastery, raw);
  if (userId) writeMasteryCache(userId, raw, generation);
}

export function useConceptMastery() {
  const { user } = useAuth();
  const userId = user?.id;
  const [mastery, setMastery] = useState<Record<string, MasteryEntry>>(() =>
    userId
      ? Object.fromEntries(
          Object.entries(readMasteryCache(userId) ?? {}).map(([id, row]) => [id, rowToEntry(row)])
        )
      : loadGuestMastery()
  );
  const [loading, setLoading] = useState(Boolean(userId && !readMasteryCache(userId)));
  const [error, setError] = useState<string | null>(null);

  const fetchMastery = useCallback(async () => {
    if (!userId) {
      setMastery(loadGuestMastery());
      setError(null);
      setLoading(false);
      return;
    }
    const generation = masteryCacheGeneration();
    setLoading(!readMasteryCache(userId));
    setError(null);
    try {
      const res = await fetch('/api/learning?action=concepts', { credentials: 'include' });
      if (!res.ok) throw new Error(`Could not load concept mastery (${res.status}).`);
      const data = await res.json();
      if (generation !== masteryCacheGeneration()) return;
      const remote = (data.mastery || {}) as Record<string, MasteryEntry>;
      const merged = mergeRecords(loadGuestMastery(), remote);
      setMastery(merged);
      saveMastery(merged, userId, generation);
    } catch (reason) {
      if (generation !== masteryCacheGeneration()) return;
      setError(reason instanceof Error ? reason.message : 'Could not load concept mastery.');
    } finally {
      if (generation === masteryCacheGeneration()) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMastery();
  }, [fetchMastery]);

  /**
   * Grade a concept. Resolves `true` when the rating was durably recorded,
   * `false` when the server rejected it and nothing was written.
   *
   * Callers that just fire-and-forget can keep ignoring the result; Sweep uses
   * it to avoid marking a concept triaged when the write never landed.
   */
  const review = useCallback(
    async (conceptId: string, rating: MasteryRating): Promise<boolean> => {
      const generation = masteryCacheGeneration();
      if (userId) {
        try {
          const res = await fetch('/api/learning?action=concepts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ conceptId, rating }),
          });
          // A rejection is authoritative (expired session, server error).
          // Writing locally would fabricate progress that can never sync.
          if (!res.ok) return false;
          const data = await res.json();
          if (generation !== masteryCacheGeneration()) return false;
          if (data.mastery) {
            setMastery((prev) => {
              if (generation !== masteryCacheGeneration()) return prev;
              const next = {
                ...prev,
                [conceptId]: { ...data.mastery, confidence: data.mastery.confidence },
              };
              saveMastery(next, userId, generation);
              return next;
            });
          }
          return true;
        } catch {
          // Preserve an offline review locally; an explicit server rejection
          // above remains authoritative and never fabricates progress.
        }
      }
      if (generation !== masteryCacheGeneration()) return false;
      setMastery((prev) => {
        if (generation !== masteryCacheGeneration()) return prev;
        const row = reviewConcept(prev[conceptId] ? entryToRow(prev[conceptId]) : null, rating);
        const next = { ...prev, [conceptId]: rowToEntry(row) };
        saveMastery(next, userId, generation);
        return next;
      });
      return true;
    },
    [userId]
  );

  return { mastery, loading, error, refresh: fetchMastery, review };
}
