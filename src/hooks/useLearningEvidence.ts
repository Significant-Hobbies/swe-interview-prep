import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { LEARNING_EVIDENCE_EVENT, loadLearningEvidence } from '../lib/learningEvidence';

export function useLearningEvidence() {
  const { user } = useAuth();
  const accountScope = user?.id ?? 'guest';
  const [evidence, setEvidence] = useState(() => loadLearningEvidence(accountScope));

  useEffect(() => {
    const refresh = () => setEvidence(loadLearningEvidence(accountScope));
    refresh();
    window.addEventListener(LEARNING_EVIDENCE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(LEARNING_EVIDENCE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [accountScope]);

  return { accountScope, ...evidence };
}
