import { ArrowRight, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useConceptMastery } from '../hooks/useConcepts';
import { useProfile } from '../hooks/useProfile';
import { useReviewMastery } from '../hooks/useReviewMastery';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { dueReviewQuestions } from '../lib/planner';
import {
  computeSessionStreak,
  enrichBlocksWithProgress,
  sessionProgress,
  todayActivityKinds,
} from '../lib/session';
import { useImportedReviews } from '../hooks/useImportedReviews';
import { useArtifactStore, useDrillStore } from '../hooks/useUserStore';

export function DigestBanner() {
  const location = useLocation();
  const { profile } = useProfile();
  const { mastery } = useConceptMastery();
  const { mastery: rqMastery } = useReviewMastery();
  const plan = useSessionPlan();
  const { drills } = useDrillStore();
  const { artifacts } = useArtifactStore();
  const { reviews: importedReviews } = useImportedReviews();

  const due = dueReviewQuestions(rqMastery, mastery, importedReviews).length;
  const streak = computeSessionStreak();
  const horizon = profile.interviewHorizonDays;

  let sessionPct = 0;
  if (plan) {
    const blocks = enrichBlocksWithProgress(plan, drills, artifacts, todayActivityKinds());
    sessionPct = sessionProgress(blocks).pct;
  }

  const messages: { text: string; href: string; accent?: boolean }[] = [];

  if (due > 0) {
    messages.push({
      text: `${due} review${due > 1 ? 's' : ''} due — retrieval beats re-reading`,
      href: '/practice/all?tab=reviews',
      accent: true,
    });
  }
  if (horizon != null && horizon <= 14) {
    messages.push({
      text: `Interview in ${horizon}d — mock + drill priority`,
      href: '/mock',
    });
  }
  if (plan && sessionPct < 100 && sessionPct > 0) {
    messages.push({
      text: `Today's session ${sessionPct}% done`,
      href: '/today',
    });
  } else if (plan && sessionPct === 0) {
    messages.push({
      text: `${plan.totalMinutes}min session ready on Today`,
      href: '/today',
    });
  }
  if (streak >= 3) {
    messages.push({
      text: `${streak}-day session streak 🔥`,
      href: '/today',
    });
  }

  if (!messages.length) return null;
  if (location.pathname === '/onboarding') return null;

  const primary = messages[0];

  return (
    <div className="border-b border-white/[0.06] bg-gradient-to-r from-sky-500/8 via-transparent to-violet-500/8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2 md:px-6">
        <div className="flex min-w-0 items-center gap-2 text-xs text-white/70">
          <Bell className={`h-3.5 w-3.5 shrink-0 ${primary.accent ? 'text-amber-300' : 'text-sky-400'}`} />
          <span className="truncate">{primary.text}</span>
        </div>
        <Link
          to={primary.href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-white hover:text-white/80"
        >
          Go <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}