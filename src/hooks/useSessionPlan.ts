import { useMemo } from 'react';

import { useGateContext } from './useGates';
import { useConceptMastery } from './useConcepts';
import { useProfile } from './useProfile';
import { useReviewMastery } from './useReviewMastery';
import { useImportedReviews } from './useImportedReviews';
import { useDrillStore, useUserElo } from './useUserStore';
import { buildSessionPlan, type SessionPlan } from '../lib/planner';

export function useSessionPlan(): SessionPlan | null {
  const { profile } = useProfile();
  const { mastery } = useConceptMastery();
  const { mastery: rqMastery } = useReviewMastery();
  const { reviews: importedReviews } = useImportedReviews();
  const gateCtx = useGateContext();
  const { drills: drillState } = useDrillStore();
  const { getElo } = useUserElo();

  return useMemo(
    () => buildSessionPlan({
      profile,
      mastery,
      rqMastery,
      gateCtx,
      drillState,
      getElo,
      extraReviewQuestions: importedReviews,
    }),
    [profile, mastery, rqMastery, gateCtx, drillState, getElo, importedReviews],
  );
}