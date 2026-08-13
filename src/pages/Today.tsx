import { ArrowRight, BookOpen, Clock3, Code2, History, Route } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import {
  CONCEPT_BY_ID,
  CONCEPTS,
  DRILL_BY_ID,
  roadmapConceptIds,
  ROADMAPS,
} from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { useDrillStore } from '../hooks/useUserStore';
import { deriveConceptStatus, rollupMastery } from '../lib/conceptState';
import { loadRecentVisits } from '../lib/recentVisits';
import { recordSessionActivity } from '../lib/session';

export default function Today() {
  const plan = useSessionPlan();
  const { mastery } = useConceptMastery();
  const { drills } = useDrillStore();

  useEffect(() => {
    recordSessionActivity('session_start');
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
  const nextBlock = plan?.blocks.find((block) => !block.done) ?? plan?.blocks[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <header className="max-w-3xl">
        <p className="text-sm text-white/55">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Pick up where you left off.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
          Your learning path, practice queue, and recent work in one place.
        </p>
        {nextBlock ? (
          <Link
            to={nextBlock.href}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Continue {currentConcept?.name ?? 'learning'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/learn"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Choose a learning path
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </header>

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
                  <span className="font-mono text-[10px] text-white/40">
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
