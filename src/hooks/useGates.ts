import { useMemo } from 'react';

import type { Concept } from '../data/learning-os';
import {
  type GateContext,
  type GateStatus,
  conceptAccessible as checkAccessible,
  gateStatus as evalGate,
} from '../lib/gates';
import { useConceptMastery } from './useConcepts';
import { useArtifactStore, useDrillStore, useUserElo } from './useUserStore';

export function useGateContext(): GateContext {
  const { mastery } = useConceptMastery();
  const { artifacts } = useArtifactStore();
  const { drills } = useDrillStore();
  const { getElo } = useUserElo();
  return useMemo(() => ({ mastery, getElo, artifacts, drills }), [mastery, getElo, artifacts, drills]);
}

export function useGates() {
  const ctx = useGateContext();
  return {
    ctx,
    gateStatus: (conceptId: string): GateStatus => evalGate(conceptId, ctx),
    conceptAccessible: (concept: Concept): boolean => checkAccessible(concept, ctx),
  };
}