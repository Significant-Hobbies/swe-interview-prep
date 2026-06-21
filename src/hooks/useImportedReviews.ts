import { useCallback, useEffect, useState } from 'react';

import type { ReviewQuestion } from '../data/learning-os';
import { useAuth } from '../contexts/AuthContext';
import { loadLocal, saveLocal, STORE_KEYS } from '../lib/userStore';

const GUEST_KEY = 'swe-os:imported-reviews';

function loadGuest(): ReviewQuestion[] {
  return loadLocal<ReviewQuestion[]>(GUEST_KEY, []);
}

function saveGuest(reviews: ReviewQuestion[]) {
  saveLocal(GUEST_KEY, reviews);
}

export function useImportedReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewQuestion[]>(loadGuest);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setReviews(loadGuest());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/learning?action=imported-reviews', { credentials: 'include' });
      if (!res.ok) {
        setReviews(loadGuest());
        return;
      }
      const data = await res.json();
      const remote = (data.reviews || []) as ReviewQuestion[];
      setReviews(remote);
      saveGuest(remote);
    } catch {
      setReviews(loadGuest());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const importDeck = useCallback(
    async (deckName: string, cards: ReviewQuestion[]) => {
      if (!user) {
        const merged = [...loadGuest()];
        const seen = new Set(merged.map(c => c.id));
        for (const c of cards) {
          if (!seen.has(c.id)) merged.push(c);
        }
        saveGuest(merged);
        setReviews(merged);
        return { imported: cards.length, skipped: 0 };
      }

      const CHUNK = 200;
      let imported = 0;
      let skipped = 0;
      let reviews: ReviewQuestion[] = [];

      for (let i = 0; i < cards.length; i += CHUNK) {
        const slice = cards.slice(i, i + CHUNK);
        const res = await fetch('/api/learning?action=imported-reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ deckName, cards: slice }),
        });
        if (!res.ok) throw new Error('Import failed');
        const data = await res.json();
        imported += data.imported ?? 0;
        skipped += data.skipped ?? 0;
        reviews = (data.reviews || []) as ReviewQuestion[];
      }

      setReviews(reviews);
      saveGuest(reviews);
      return { imported, skipped };
    },
    [user],
  );

  return { reviews, loading, refresh, importDeck };
}