import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { type Concept as BaseConcept, CONCEPTS } from '../data/learning-os';

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

export function useConceptMastery() {
  const { user } = useAuth();
  const [mastery, setMastery] = useState<Record<string, MasteryEntry>>({});
  const [loading, setLoading] = useState(false);

  // The auth token lives in an httpOnly cookie — send it with credentials.
  const fetchMastery = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/learning?action=concepts', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setMastery(data.mastery || {});
    } catch {
      // Offline / no endpoint — leave mastery empty.
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMastery(); }, [fetchMastery]);

  const review = useCallback(async (conceptId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!user) return;
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
        setMastery(prev => ({ ...prev, [conceptId]: { ...data.mastery, confidence: data.mastery.confidence } }));
      }
    } catch {
      // best-effort
    }
  }, [user]);

  return { mastery, loading, refresh: fetchMastery, review };
}
