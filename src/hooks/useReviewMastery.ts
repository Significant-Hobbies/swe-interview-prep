import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import type { MasteryRating } from '../lib/fsrs';
import { loadLocal, saveLocal, STORE_KEYS } from '../lib/userStore';
import {
  type ReviewMasteryEntry,
  reviewQuestion,
} from '../lib/reviewMastery';

function loadGuest(): Record<string, ReviewMasteryEntry> {
  return loadLocal(STORE_KEYS.reviewMastery, {});
}

function saveGuest(m: Record<string, ReviewMasteryEntry>) {
  saveLocal(STORE_KEYS.reviewMastery, m);
}

export function useReviewMastery() {
  const { user } = useAuth();
  const [mastery, setMastery] = useState<Record<string, ReviewMasteryEntry>>(loadGuest);
  const [loading, setLoading] = useState(false);

  const fetchMastery = useCallback(async () => {
    if (!user) {
      setMastery(loadGuest());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/learning?action=review-mastery', { credentials: 'include' });
      if (!res.ok) {
        setMastery(loadGuest());
        return;
      }
      const data = await res.json();
      const remote = (data.mastery || {}) as Record<string, ReviewMasteryEntry>;
      const merged = { ...loadGuest(), ...remote };
      setMastery(merged);
      saveGuest(merged);
    } catch {
      setMastery(loadGuest());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchMastery();
  }, [fetchMastery]);

  const review = useCallback(async (questionId: string, rating: MasteryRating) => {
    if (user) {
      try {
        const res = await fetch('/api/learning?action=review-mastery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ questionId, rating }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.mastery) {
          setMastery(prev => {
            const next = { ...prev, [questionId]: data.mastery };
            saveGuest(next);
            return next;
          });
        }
        return;
      } catch {
        /* fall through */
      }
    }
    setMastery(prev => {
      const next = {
        ...prev,
        [questionId]: reviewQuestion(prev[questionId], rating),
      };
      saveGuest(next);
      return next;
    });
  }, [user]);

  return { mastery, loading, review, refresh: fetchMastery };
}