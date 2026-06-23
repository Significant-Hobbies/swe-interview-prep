import { useCallback } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { logActivity, type ActivityKind } from '../lib/activity';

export function useActivityLogger() {
  const { user } = useAuth();
  return useCallback(
    (opts: {
      kind: ActivityKind;
      conceptIds?: string[];
      problemId?: string;
      durationMs?: number;
      payload?: Record<string, unknown>;
    }) => {
      if (!user) return Promise.resolve();
      return logActivity(opts);
    },
    [user]
  );
}
