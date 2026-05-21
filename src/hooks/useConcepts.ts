import { useCallback,useEffect, useState } from 'react';

import { getAuthToken,useAuth } from '../contexts/AuthContext';
import conceptsData from '../data/concepts.json';

export interface Concept {
  id: string;
  name: string;
  category: 'dsa' | 'lld' | 'hld' | 'behavioral' | 'ml';
  prereqs: string[];
  description: string;
}

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

export const ALL_CONCEPTS: Concept[] = (conceptsData as any).concepts;
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  ALL_CONCEPTS.map(c => [c.id, c]),
);

export function useConceptMastery() {
  const { user } = useAuth();
  const [mastery, setMastery] = useState<Record<string, MasteryEntry>>({});
  const [loading, setLoading] = useState(false);

  const fetchMastery = useCallback(async () => {
    if (!user) return;
    const token = getAuthToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/learning?action=concepts', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setMastery(data.mastery || {});
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMastery(); }, [fetchMastery]);

  const review = useCallback(async (conceptId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const token = getAuthToken();
    if (!token) return;
    const res = await fetch('/api/learning?action=concepts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conceptId, rating }),
    });
    const data = await res.json();
    if (data.mastery) {
      setMastery(prev => ({ ...prev, [conceptId]: { ...data.mastery, confidence: data.mastery.confidence } }));
    }
  }, []);

  return { mastery, loading, refresh: fetchMastery, review };
}
