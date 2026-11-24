import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import type { LearningItem, LearningSource } from '../data/learning-sources';

type RequestIdentity = { accountId: string | null; attempt: number };
type ReaderResult =
  | {
      request: RequestIdentity;
      state: 'ready';
      items: LearningItem[];
      source: LearningSource | null;
    }
  | { request: RequestIdentity; state: 'denied' | 'error' };
const NO_ITEMS: LearningItem[] = [];

export function useReaderLearning() {
  const auth = useAuth();
  const accountId = auth.isGuest ? null : (auth.user?.id ?? null);
  const verifiedAccountId = auth.loading ? null : accountId;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ReaderResult | null>(null);
  const request = useMemo(
    () => ({ accountId: verifiedAccountId, attempt }),
    [verifiedAccountId, attempt]
  );

  useEffect(() => {
    if (!request.accountId) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
      setResult({ request, state: 'error' });
    }, 12000);
    fetch('/api/learning/reader', { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (controller.signal.aborted) return;
        if (response.status === 401 || response.status === 403) {
          setResult({ request, state: 'denied' });
          return;
        }
        if (!response.ok) throw new Error('Reader learning source unavailable');
        const payload = await response.json();
        if (!Array.isArray(payload?.items)) throw new Error('Reader learning source is invalid');
        if (!controller.signal.aborted)
          setResult({
            request,
            state: 'ready',
            items: payload.items,
            source: payload.source ?? null,
          });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ request, state: 'error' });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [request]);

  // During an account switch, hide the prior response before the effect runs.
  const current = result?.request === request ? result : null;
  return {
    accountId,
    items: current?.state === 'ready' ? current.items : NO_ITEMS,
    source: current?.state === 'ready' ? current.source : null,
    loading: !auth.isGuest && (auth.loading || (!!accountId && !current)),
    denied: current?.state === 'denied' || !accountId,
    failed: current?.state === 'error',
    retry: () => setAttempt((value) => value + 1),
  };
}
