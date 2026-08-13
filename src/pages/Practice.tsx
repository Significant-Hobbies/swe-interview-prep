import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { CONCEPT_BY_ID, type Drill, EDITORIAL_DRILLS, primaryGroup } from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useReviewMastery } from '../hooks/useReviewMastery';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { useDrillStore, useUserElo } from '../hooks/useUserStore';
import { useProfile } from '../hooks/useProfile';
import { dueReviewQuestions } from '../lib/planner';
import { pickPracticeDrill } from '../lib/recommend';
import { computeSessionStreak } from '../lib/session';

export default function Practice() {
  const { drills: drillState } = useDrillStore();
  const { mastery } = useConceptMastery();
  const { mastery: rqMastery } = useReviewMastery();
  const { getElo } = useUserElo();
  const { profile } = useProfile();
  const session = useSessionPlan();
  const todayConcept = session?.concept.id;

  const dueCount = dueReviewQuestions(rqMastery, mastery).length;
  const solvedCount = Object.values(drillState).filter((d) => d.status === 'solved').length;
  const streak = computeSessionStreak();

  const nextDrill = useMemo(
    () => pickPracticeDrill(drillState, getElo, todayConcept, profile.experience),
    [drillState, getElo, todayConcept, profile.experience]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      {nextDrill ? <NextDrillHero drill={nextDrill} /> : <AllCaughtUp />}

      <details className="group mt-12 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-white/55 hover:text-white">
          Other ways to practice
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <nav className="divide-y divide-white/[0.06] pb-3" aria-label="Practice modes">
          <PracticeMode
            to="/wars"
            title="Software Wars"
            description="Fast technical battles or 30-minute design debates."
          />
          <PracticeMode
            to="/mock"
            title="Mock interview"
            description="Rehearse technical, system-design, or behavioral answers."
          />
          <PracticeMode
            to="/playground"
            title="Playground"
            description="Work in code, diagrams, and explain-backs."
          />
          <PracticeMode
            to="/build"
            title="Build Lab"
            description="Turn a concept into an inspectable artifact."
          />
          <PracticeMode
            to="/labs"
            title="Systems Labs"
            description="Repair deterministic infrastructure scenarios."
          />
          <PracticeMode
            to="/practice/all?tab=reviews"
            title="Reviews"
            description={`${dueCount} recall ${dueCount === 1 ? 'item' : 'items'} due.`}
          />
        </nav>
      </details>

      <details className="group mt-4 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-white/55 hover:text-white">
          Practice history
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <p className="pb-4 pt-2 text-sm text-white/50">
          {solvedCount} of {EDITORIAL_DRILLS.length} drills solved · {streak} day streak
        </p>
      </details>
    </div>
  );
}

function NextDrillHero({ drill }: { drill: Drill }) {
  const concept = CONCEPT_BY_ID[drill.conceptId];
  const grp = concept ? primaryGroup(concept) : undefined;
  return (
    <div>
      <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
        Next drill {grp && <span className="text-white/50">· {grp.short}</span>}{' '}
        <span className="text-white/50">· {drill.difficulty}</span>
      </div>

      <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {drill.title}
      </h1>

      {concept && (
        <p className="mt-4 font-mono text-xs text-white/50">
          via <span className="text-white/70">{concept.name}</span>
        </p>
      )}

      <p className="mt-5 line-clamp-3 max-w-2xl text-base leading-relaxed text-white/55">
        {drill.prompt}
      </p>

      <div className="mt-8">
        <Link
          to={`/drills/${drill.id}`}
          className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          Open in Playground
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function AllCaughtUp() {
  return (
    <div>
      <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
        Next drill
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">All solved.</h1>
      <p className="mt-6 max-w-prose text-base text-white/60 sm:text-lg">
        Browse drills by group to revisit any.
      </p>
      <Link
        to="/practice/all"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-black hover:bg-white/90"
      >
        Browse drills <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function PracticeMode({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className="group flex min-h-16 items-center justify-between gap-5 py-3">
      <span>
        <span className="block text-sm font-medium text-white">{title}</span>
        <span className="mt-0.5 block text-sm text-white/50">{description}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}
