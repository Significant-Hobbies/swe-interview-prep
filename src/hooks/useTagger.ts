import { useEffect, useRef } from 'react';

import { getAuthToken } from '../contexts/AuthContext';
import { loadAIConfig } from './useAI';

interface TagResult {
  concept_id: string;
  evidence: string;
  depth: 'surface' | 'working' | 'deep';
}

const IDLE_MS = 5 * 60 * 1000;
const MIN_CODE_LEN = 80;

/**
 * Periodically tags code in playground with concepts and bumps mastery.
 * Triggers when code stabilizes (no edits for 5min) AND length > MIN_CODE_LEN.
 * Pass enabled=false (e.g. from focus mode) to suppress all tagging and AI calls.
 */
export function useTagger(code: string, language: string, problem: string, onTagged?: (tags: TagResult[]) => void, enabled: boolean = true) {
  const lastTaggedRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!enabled) return;
    if (code.length < MIN_CODE_LEN) return;
    if (code === lastTaggedRef.current) return;

    timerRef.current = setTimeout(async () => {
      const token = getAuthToken();
      if (!token) return;
      const config = loadAIConfig();
      if (!config.model) return;

      try {
        const res = await fetch('/api/learning?action=tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code, language, problem, aiConfig: config }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const tags: TagResult[] = data.concepts || [];
        lastTaggedRef.current = code;
        if (tags.length === 0) return;

        // Map depth → rating: surface=hard, working=good, deep=easy
        const updates = tags.map(t => ({
          conceptId: t.concept_id,
          rating: t.depth === 'deep' ? 'easy' : t.depth === 'working' ? 'good' : 'hard',
        }));
        await fetch('/api/learning?action=concepts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ updates }),
        });
        await fetch('/api/learning?action=activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            kind: 'auto_tag',
            conceptIds: tags.map(t => t.concept_id),
            payload: { tags },
          }),
        });
        onTagged?.(tags);
      } catch {
        // Silent — tagger is best-effort
      }
    }, IDLE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [code, language, problem, onTagged, enabled]);
}
