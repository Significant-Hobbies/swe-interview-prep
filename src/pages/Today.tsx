import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import PathDoor from '../components/PathDoor';
import PlaygroundHero from '../components/PlaygroundHero';
import { Button } from '../components/ui';
import { SessionPlanView } from '../components/SessionPlanView';
import { HorizonCalendar } from '../components/HorizonCalendar';
import { DailySourceQueue } from '../components/DailySourceQueue';
import { GapAnalyzer } from './partials/GapAnalyzer';
import { useProfile } from '../hooks/useProfile';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { useArtifactStore, useDrillStore } from '../hooks/useUserStore';
import {
  computeSessionStreak,
  enrichBlocksWithProgress,
  markSessionComplete,
  recordSessionActivity,
  sessionProgress,
  todayActivityKinds,
} from '../lib/session';
import { loadActiveRoadmapId } from '../lib/recommend';

export default function Today() {
  const { profile } = useProfile();
  const plan = useSessionPlan();
  const { drills } = useDrillStore();
  const { artifacts } = useArtifactStore();

  useEffect(() => {
    recordSessionActivity('session_start');
  }, []);

  const enrichedPlan = useMemo(() => {
    if (!plan) return null;
    const blocks = enrichBlocksWithProgress(plan, drills, artifacts, todayActivityKinds());
    return { ...plan, blocks };
  }, [plan, drills, artifacts]);

  const progress = enrichedPlan ? sessionProgress(enrichedPlan.blocks) : null;
  const streak = computeSessionStreak();

  const activeRoadmapId = loadActiveRoadmapId();

  if (!enrichedPlan) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
        <h1 className="text-4xl font-bold text-white">You&apos;re caught up.</h1>
        <p className="mt-4 text-white/50">
          Pick a path or explore the full catalog — nothing is gated.
        </p>
        <PathDoor activeRoadmapId={activeRoadmapId} className="mt-10" />
        <PlaygroundHero className="mt-10" compact />
        <nav className="mt-10 flex flex-wrap gap-6 font-mono text-sm text-white/50">
          <Link to="/explore" className="hover:text-white">
            Explore everything
          </Link>
          <Link to="/learn" className="hover:text-white">
            Switch roadmap
          </Link>
          <Link to="/practice/all" className="hover:text-white">
            All drills
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Today
        </span>
        {streak > 0 && (
          <span className="font-mono text-[10px] text-white/40">{streak}d session streak</span>
        )}
      </div>

      {progress && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>Session progress</span>
              <span className="font-mono">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-300"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>
          {progress.pct === 100 ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
            </span>
          ) : (
            <Button tone="ghost" onClick={() => markSessionComplete()} className="text-xs">
              Mark done for today
            </Button>
          )}
        </div>
      )}

      <DailySourceQueue />

      <SessionPlanView plan={enrichedPlan} />

      <PlaygroundHero className="mt-12" compact />

      <nav className="mt-10 flex flex-wrap gap-6 font-mono text-sm text-white/50">
        <Link to="/explore" className="hover:text-white">
          Explore catalog
        </Link>
        <Link to="/learn" className="hover:text-white">
          Switch roadmap
        </Link>
        <Link to={`/roadmaps/${enrichedPlan.roadmap.id}`} className="hover:text-white">
          View graph
        </Link>
        <Link to="/mock" className="hover:text-white">
          Mock interview
        </Link>
        <Link to="/practice/all?tab=reviews" className="hover:text-white">
          Reviews{enrichedPlan.reviewsDue > 0 && ` · ${enrichedPlan.reviewsDue} due`}
        </Link>
      </nav>

      {profile.interviewHorizonDays != null && profile.interviewHorizonDays <= 60 && (
        <section className="mt-12">
          <HorizonCalendar />
        </section>
      )}

      <section className="mt-12">
        <GapAnalyzer />
      </section>
    </div>
  );
}
