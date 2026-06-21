import { ArrowRight, Hammer, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

import { GapAnalyzer } from './partials/GapAnalyzer';
import { useGateContext } from '../hooks/useGates';
import { useConceptMastery } from '../hooks/useConcepts';
import { playgroundArtifactUrl } from '../lib/gates';
import { pickTodayPlan } from '../lib/recommend';

export default function Today() {
  const { mastery } = useConceptMastery();
  const gateCtx = useGateContext();
  const plan = pickTodayPlan(mastery, gateCtx);

  if (!plan) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
        <h1 className="text-4xl font-bold text-white">You&apos;re caught up.</h1>
        <p className="mt-4 text-white/50">Browse roadmaps or drills to push further.</p>
        <Link to="/learn" className="mt-8 inline-flex items-center gap-2 text-sm text-white">
          Browse roadmaps <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const { roadmap, concept, drill, artifact, reviewsDue } = plan;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        Today · {roadmap.title}
      </div>

      <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {concept.name}
      </h1>
      <p className="mt-4 max-w-prose text-sm text-white/60 sm:text-base">{concept.description}</p>

      <ol className="mt-12 space-y-4">
        <Step n={1} title="Learn the concept" done={false}>
          <Link to={`/concepts/${concept.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
            Open concept <ArrowRight className="h-4 w-4" />
          </Link>
        </Step>

        {drill && (
          <Step n={2} title={`Drill: ${drill.title}`} done={false}>
            <Link to={`/drills/${drill.id}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5">
              Solve drill <Target className="h-4 w-4" />
            </Link>
          </Step>
        )}

        {artifact && (
          <Step n={drill ? 3 : 2} title={`Build: ${artifact.title}`} done={false}>
            <Link to={playgroundArtifactUrl(artifact.id)} className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-200">
              Open in Playground <Hammer className="h-4 w-4" />
            </Link>
          </Step>
        )}

        <Step n={(drill ? 1 : 0) + (artifact ? 1 : 0) + 2} title="Spaced review" done={reviewsDue === 0}>
          <Link to="/practice/all?tab=reviews" className="text-sm text-white/70 hover:text-white">
            {reviewsDue > 0 ? `${reviewsDue} due — review now` : 'Nothing due'}
          </Link>
        </Step>
      </ol>

      <nav className="mt-16 flex flex-wrap gap-6 font-mono text-sm text-white/50">
        <Link to="/learn" className="hover:text-white">Switch roadmap</Link>
        <Link to={`/roadmaps/${roadmap.id}`} className="hover:text-white">View graph</Link>
        <Link to="/build" className="hover:text-white">Build Lab</Link>
      </nav>

      <section className="mt-12">
        <GapAnalyzer />
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/70'
        }`}
      >
        {done ? '✓' : n}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="mt-3">{children}</div>
      </div>
    </li>
  );
}