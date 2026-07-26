import { useEffect, useState } from 'react';

import type { LearningItem, LearningSource } from '../data/learning-sources';
import { hasSession } from '../lib/learningApi';

export function useReaderLearning() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [source, setSource] = useState<LearningSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Owner-only endpoint. /sources is public now, so guests reach this hook.
    if (!hasSession()) {
      setLoading(false);
      return;
    }
    fetch('/api/learning/reader', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Reader learning source unavailable (${response.status})`);
        return response.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setItems(payload.items || []);
        setSource(payload.source || null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, source, loading };
}
