import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import PathDoor from '../components/PathDoor';
import PlaygroundHero from '../components/PlaygroundHero';
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
  recordSessionActivity,
  sessionProgress,
  todayActivityKinds,
} from '../lib/session';

export default function Today() {
  const { profile, activeRoadmapId } = useProfile();
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

  if (!enrichedPlan) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:py-12">
        <h1 className="text-4xl font-bold text-white">You&apos;re caught up.</h1>
        <p className="mt-4 text-white/50">
          Pick a path or explore the full catalog — nothing is gated.
        </p>
        <PathDoor activeRoadmapId={activeRoadmapId} className="mt-10" />
        <PlaygroundHero className="mt-10" compact />
        <nav className="mt-10 flex flex-wrap gap-6 font-mono text-sm text-white/60">
          <Link to="/explore" className="inline-flex min-h-11 items-center hover:text-white">
            Explore everything
          </Link>
          <Link to="/learn" className="inline-flex min-h-11 items-center hover:text-white">
            Switch roadmap
          </Link>
          <Link to="/practice/all" className="inline-flex min-h-11 items-center hover:text-white">
            All drills
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 lg:py-12">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
          Today
        </span>
        {streak > 0 && (
          <span className="font-mono text-[10px] text-white/60">{streak}d session streak</span>
        )}
      </div>

      {progress && (
        <div
          className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
          aria-live="polite"
        >
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between text-xs text-white/65">
              <span>Session progress</span>
              <span className="font-mono">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Evidence-backed session progress"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.done}
              aria-valuetext={`${progress.done} of ${progress.total} evidence steps complete`}
            >
              <div
                className="h-full rounded-full bg-sky-400 transition-all duration-300"
                style={{ width: `${progress.pct}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
          {progress.pct === 100 && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
            </span>
          )}
        </div>
      )}

      <SessionPlanView plan={enrichedPlan} />

      <DailySourceQueue />

      <details className="group mt-8 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md font-mono text-xs text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          More ways to learn
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-1 pb-3 font-mono text-sm text-white/60"
          aria-label="More learning routes"
        >
          <Link to="/explore" className="inline-flex min-h-11 items-center hover:text-white">
            Explore catalog
          </Link>
          <Link to="/learn" className="inline-flex min-h-11 items-center hover:text-white">
            Switch roadmap
          </Link>
          <Link
            to={`/roadmaps/${enrichedPlan.roadmap.id}`}
            className="inline-flex min-h-11 items-center hover:text-white"
          >
            View graph
          </Link>
          <Link to="/mock" className="inline-flex min-h-11 items-center hover:text-white">
            Mock interview
          </Link>
          <Link
            to="/practice/all?tab=reviews"
            className="inline-flex min-h-11 items-center hover:text-white"
          >
            Reviews{enrichedPlan.reviewsDue > 0 && ` · ${enrichedPlan.reviewsDue} due`}
          </Link>
        </nav>
      </details>

      {profile.interviewHorizonDays != null && profile.interviewHorizonDays <= 60 && (
        <section className="mt-12">
          <HorizonCalendar />
        </section>
      )}

      <details className="group mt-8 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md font-mono text-xs text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          Inspect learning gaps
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <section className="pb-4 pt-3">
          <GapAnalyzer />
        </section>
      </details>
    </div>
  );
}
