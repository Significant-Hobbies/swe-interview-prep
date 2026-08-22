import { ArrowRight, BookOpen, Clock3, Code2, History, Route, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  CONCEPT_BY_ID,
  CONCEPTS,
  DRILL_BY_ID,
  roadmapConceptIds,
  ROADMAPS,
} from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useLearningEvidence } from '../hooks/useLearningEvidence';
import { useProfile } from '../hooks/useProfile';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { useDrillStore } from '../hooks/useUserStore';
import { useAuth } from '../contexts/AuthContext';
import { deriveConceptStatus, rollupMastery } from '../lib/conceptState';
import { buildDailyLearningPriority } from '../lib/dailyPriority';
import { loadFocusedStudyDrafts } from '../lib/learningContinuity';
import { loadRecentVisits } from '../lib/recentVisits';
import { recordSessionActivity } from '../lib/session';

export default function Today() {
  const plan = useSessionPlan();
  const { mastery, loading: masteryLoading } = useConceptMastery();
  const { drills } = useDrillStore();
  const { profile } = useProfile();
  const { loading: authLoading } = useAuth();
  const { accountScope, decisionReceipts, paperAttempts } = useLearningEvidence();
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    recordSessionActivity('session_start');
  }, []);

  useEffect(() => {
    const refresh = () => setOnline(navigator.onLine);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    return () => {
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);

  const recentVisits = useMemo(() => loadRecentVisits().slice(0, 5), []);
  const activeRoadmap = plan?.roadmap ?? ROADMAPS[0];
  const currentConcept = plan?.concept ?? null;
  const nextConcept = useMemo(() => {
    if (!activeRoadmap || !currentConcept) return null;
    const ids = roadmapConceptIds(activeRoadmap);
    const currentIndex = ids.indexOf(currentConcept.id);
    return (
      ids
        .slice(Math.max(0, currentIndex + 1))
        .map((id) => CONCEPT_BY_ID[id])
        .find((concept) => concept && deriveConceptStatus(mastery[concept.id]) !== 'mastered') ??
      null
    );
  }, [activeRoadmap, currentConcept, mastery]);

  const attemptedDrills = useMemo(
    () =>
      Object.entries(drills)
        .filter(([, entry]) => entry.attempts > 0)
        .reverse()
        .map(([id, entry]) => ({ drill: DRILL_BY_ID[id], entry }))
        .filter((item) => item.drill),
    [drills]
  );
  const lastPractice = attemptedDrills[0] ?? null;
  const nextPractice = plan?.drill ?? null;
  const masteryRollup = rollupMastery(
    CONCEPTS.map((concept) => concept.id),
    mastery
  );
  const focusedStudyDrafts = useMemo(() => loadFocusedStudyDrafts(accountScope), [accountScope]);
  const priority = useMemo(
    () =>
      buildDailyLearningPriority({
        plan,
        profile,
        mastery,
        drillState: drills,
        decisionReceipts,
        paperAttempts,
        focusedStudyDrafts,
        masteryAvailable: !masteryLoading,
        online,
      }),
    [
      plan,
      profile,
      mastery,
      drills,
      decisionReceipts,
      paperAttempts,
      focusedStudyDrafts,
      masteryLoading,
      online,
    ]
  );
  const loadingPriority = authLoading || masteryLoading;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <header aria-labelledby="daily-priority">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/50">
          <span>Dashboard · Learn this today</span>
          <span className="font-mono text-xs">
            {loadingPriority
              ? 'reading learning state'
              : `${priority.minutes} min · ${priority.reason.replace('-', ' ')}`}
          </span>
        </div>

        {loadingPriority ? (
          <div className="mt-6 border-y border-white/[0.08] py-10" aria-busy="true">
            <h1 id="daily-priority" className="text-xl font-semibold text-white">
              Building today’s priority from your learning state…
            </h1>
          </div>
        ) : (
          <div className="mt-6 border-y border-white/[0.08] py-8 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:gap-12">
              <div>
                <div className="flex items-center gap-2 text-xs text-sky-300">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  <span>{priority.state.replace('-', ' ')}</span>
                </div>
                <h1
                  id="daily-priority"
                  className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl"
                >
                  {priority.objective}
                </h1>
                <div className="mt-6 max-w-3xl">
                  <h2 className="text-xs font-medium text-white/60">Why this wins today</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">
                    {priority.rationale}
                  </p>
                </div>
                <Link
                  to={priority.action.href}
                  className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  {priority.action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="border-t border-white/[0.08] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <h2 className="text-xs font-medium text-white/60">Evidence required</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{priority.evidence}</p>
                <div className="mt-6 border-t border-white/[0.08] pt-5">
                  <h2 className="text-xs font-medium text-white/60">Completion unlocks</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{priority.unlocks}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {plan && !loadingPriority && (
        <section className="mt-8" aria-labelledby="session-map">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="session-map" className="text-sm font-semibold text-white">
              Supporting session map
            </h2>
            <span className="text-xs text-white/60">
              Primary decision stays fixed until evidence changes
            </span>
          </div>
          <div className="mt-3 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {plan.blocks.map((block) => (
              <Link
                key={`${block.kind}:${block.href}`}
                to={block.href}
                className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-3 text-sm hover:text-white"
              >
                <span className="w-12 font-mono text-xs text-white/60">{block.minutes}m</span>
                <span>
                  <span className="font-medium text-white/80">{block.title}</span>
                  {block.subtitle && <span className="ml-2 text-white/60">{block.subtitle}</span>}
                </span>
                <ArrowRight className="h-4 w-4 text-white/35" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-t border-white/[0.08] pt-8" aria-labelledby="learning-now">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/55">Learning</p>
            <h2 id="learning-now" className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {activeRoadmap?.title ?? 'Choose a path'}
            </h2>
          </div>
          {activeRoadmap && (
            <Link
              to={`/roadmaps/${activeRoadmap.id}`}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white"
            >
              View path <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/[0.08] md:grid-cols-2">
          <DashboardStep
            label="Learning now"
            title={currentConcept?.name ?? 'No concept selected'}
            detail={currentConcept?.description ?? 'Choose a path to build your learning queue.'}
            href={currentConcept ? `/concepts/${currentConcept.id}` : '/learn'}
            action={currentConcept ? 'Continue' : 'Choose path'}
            icon={BookOpen}
          />
          <DashboardStep
            label="Next in learning"
            title={nextConcept?.name ?? 'Path checkpoint'}
            detail={
              nextConcept?.description ??
              'Complete the current concept and the path will advance automatically.'
            }
            href={
              nextConcept ? `/concepts/${nextConcept.id}` : `/roadmaps/${activeRoadmap?.id ?? ''}`
            }
            action="Preview"
            icon={Route}
          />
        </div>
      </section>

      <section className="mt-12 border-t border-white/[0.08] pt-8" aria-labelledby="practice-now">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/55">Practice</p>
            <h2 id="practice-now" className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Turn the concept into evidence.
            </h2>
          </div>
          <Link
            to="/practice"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            Open workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/[0.08] md:grid-cols-2">
          <DashboardStep
            label="Last practised"
            title={lastPractice?.drill.title ?? 'No practice yet'}
            detail={
              lastPractice
                ? `${lastPractice.entry.attempts} attempt${lastPractice.entry.attempts === 1 ? '' : 's'} · ${lastPractice.entry.status}`
                : 'Select a problem in Practice to start building a history.'
            }
            href={lastPractice ? `/practice?problem=${lastPractice.drill.id}` : '/practice'}
            action={lastPractice ? 'Open again' : 'Start practice'}
            icon={History}
          />
          <DashboardStep
            label="Next in practice"
            title={nextPractice?.title ?? 'Choose a problem'}
            detail={
              nextPractice?.prompt ??
              'The complete problem catalogue is available from the workspace selector.'
            }
            href={nextPractice ? `/practice?problem=${nextPractice.id}` : '/practice'}
            action={nextPractice ? 'Start problem' : 'Browse problems'}
            icon={Code2}
          />
        </div>
      </section>

      <section
        className="mt-12 border-t border-white/[0.08] pt-8"
        aria-labelledby="available-paths"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/55">Available paths</p>
            <h2
              id="available-paths"
              className="mt-2 text-2xl font-semibold tracking-tight text-white"
            >
              Go deeper when you need to.
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            Browse all {ROADMAPS.length} paths <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {ROADMAPS.filter((roadmap) => roadmap.id !== activeRoadmap?.id)
            .slice(0, 4)
            .map((roadmap) => (
              <Link
                key={roadmap.id}
                to={`/roadmaps/${roadmap.id}`}
                className="flex min-h-16 items-center justify-between gap-5 py-3 text-sm transition-colors hover:text-white"
              >
                <span>
                  <span className="font-medium text-white/85">{roadmap.title}</span>
                  <span className="ml-3 hidden text-white/50 sm:inline">{roadmap.goal}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/40" />
              </Link>
            ))}
        </div>
      </section>

      <section className="mt-12 grid gap-10 border-t border-white/[0.08] pt-8 md:grid-cols-[1fr_0.65fr]">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Recently visited</h2>
            <Clock3 className="h-4 w-4 text-white/40" />
          </div>
          {recentVisits.length > 0 ? (
            <nav className="mt-3 divide-y divide-white/[0.08]" aria-label="Recently visited">
              {recentVisits.map((visit) => (
                <Link
                  key={visit.href}
                  to={visit.href}
                  className="flex min-h-12 items-center justify-between gap-4 text-sm text-white/60 hover:text-white"
                >
                  <span>{visit.label}</span>
                  <span className="font-mono text-[10px] text-white/60">
                    {new Date(visit.visitedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              ))}
            </nav>
          ) : (
            <p className="mt-4 text-sm text-white/50">
              Concepts, paths, and practice problems you open will appear here.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Progress</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            {masteryRollup.mastered} mastered · {masteryRollup.learning} learning ·{' '}
            {plan?.reviewsDue ?? 0} reviews due
          </p>
          <Link
            to="/progress"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-white/65 hover:text-white"
          >
            Inspect progress <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function DashboardStep({
  label,
  title,
  detail,
  href,
  action,
  icon: Icon,
}: {
  label: string;
  title: string;
  detail: string;
  href: string;
  action: string;
  icon: typeof BookOpen;
}) {
  return (
    <article className="flex min-h-60 flex-col bg-black p-6">
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">{detail}</p>
      <Link
        to={href}
        className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-medium text-white/70 hover:text-white"
      >
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
