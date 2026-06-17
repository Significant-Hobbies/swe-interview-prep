import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  type Concept,
  primaryGroup,
  type Roadmap,
  roadmapConceptIds,
  ROADMAPS,
} from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { rollupMastery } from '../lib/conceptState';
import { pickDrillForConcept, pickNextConcept } from '../lib/recommend';

const PRIMARY_ROADMAP_ID = 'ai-search-infra-90-day';

export default function Learn() {
  const { mastery } = useConceptMastery();

  const next = pickNextConcept(mastery);
  const nextDrill = next ? pickDrillForConcept(next.id) : null;
  const activeRoadmap = pickActiveRoadmap(mastery);
  const ids = roadmapConceptIds(activeRoadmap);
  const roll = rollupMastery(ids, mastery);
  const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      {next ? (
        <UpNextHero concept={next} drillTitle={nextDrill?.title} drillId={nextDrill?.id} />
      ) : (
        <EmptyUpNext />
      )}

      <section className="section-rule mt-20 pt-10">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Active path
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-white">{activeRoadmap.title}</h2>
          <div className="flex items-baseline gap-3 font-mono text-sm text-white/40">
            <span className="text-white">{Math.round(pct)}%</span>
            <span>·</span>
            <span>{roll.mastered}/{ids.length}</span>
          </div>
        </div>
        <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
          <div className="h-full bg-white transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-4 max-w-prose text-sm text-white/50">{activeRoadmap.goal}</p>
      </section>

      <nav className="mt-12 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
        <Link to="/learn/all" className="text-white hover:text-white/70">
          Browse all concepts <span className="text-white/40">→</span>
        </Link>
        <Link to={`/roadmaps/${activeRoadmap.id}`} className="text-white/50 hover:text-white">
          Open active roadmap
        </Link>
      </nav>
    </div>
  );
}

function UpNextHero({
  concept,
  drillTitle,
  drillId,
}: {
  concept: Concept;
  drillTitle?: string;
  drillId?: string;
}) {
  const grp = primaryGroup(concept);
  return (
    <div className="relative">
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        Up next {grp && <span className="text-white/30">· {grp.short}</span>}
      </div>

      <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
        {concept.name}
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
        {concept.description}
      </p>

      {drillTitle && (
        <p className="mt-3 font-mono text-xs text-white/40">
          Pair with drill: <span className="text-white/70">{drillTitle}</span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          to={`/concepts/${concept.id}`}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-150 hover:bg-white/90"
        >
          Start
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
        {drillId && (
          <Link
            to={`/drills/${drillId}`}
            className="font-mono text-sm text-white/50 hover:text-white"
          >
            Open drill →
          </Link>
        )}
      </div>
    </div>
  );
}

function EmptyUpNext() {
  return (
    <div>
      <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        Up next
      </div>
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
        All caught up.
      </h1>
      <p className="mt-6 max-w-prose text-base text-white/60 sm:text-lg">
        Nothing is due right now. Browse the library to pick something new.
      </p>
      <Link
        to="/learn/all"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
      >
        Browse concepts <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function pickActiveRoadmap(mastery: Record<string, MasteryEntry>): Roadmap {
  let best = ROADMAPS.find(r => r.id === PRIMARY_ROADMAP_ID) || ROADMAPS[0];
  let bestScore = -1;
  for (const r of ROADMAPS) {
    const ids = roadmapConceptIds(r);
    const roll = rollupMastery(ids, mastery);
    const started = ids.length - roll.untouched;
    const score = started > 0 && roll.mastered < ids.length ? started + roll.learning * 0.5 : -1;
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}
