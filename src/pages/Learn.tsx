import { ArrowRight, Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, color, PageShell, ProgressBar } from '../components/ui';
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
    <PageShell>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-slate-50">Learn</h1>

      {next ? (
        <UpNextCard concept={next} drillTitle={nextDrill?.title} drillId={nextDrill?.id} />
      ) : (
        <EmptyUpNext />
      )}

      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-400">Active path</div>
            <div className="truncate text-sm text-slate-200">{activeRoadmap.title}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-semibold tabular-nums text-slate-50">
              {Math.round(pct)}%
            </div>
            <div className="text-xs text-slate-500">
              {roll.mastered} / {ids.length}
            </div>
          </div>
        </div>
        <ProgressBar value={pct} />
      </section>

      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link to="/learn/all" className="text-sky-400 hover:text-sky-300">
          Browse all concepts →
        </Link>
        <Link to={`/roadmaps/${activeRoadmap.id}`} className="text-slate-400 hover:text-slate-200">
          Open active roadmap
        </Link>
      </nav>
    </PageShell>
  );
}

function UpNextCard({
  concept,
  drillTitle,
  drillId,
}: {
  concept: Concept;
  drillTitle?: string;
  drillId?: string;
}) {
  const trk = primaryGroup(concept);
  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
        <span>Up next</span>
        {trk && (
          <>
            <span className="text-slate-700">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${color(trk.color).solid}`} />
              {trk.short}
            </span>
          </>
        )}
      </div>
      <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">{concept.name}</h2>
      <p className="mt-2 line-clamp-2 max-w-prose text-sm text-slate-400">{concept.description}</p>

      {drillTitle && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Hammer className="h-3 w-3 text-slate-500" />
          Pair with drill: <span className="text-slate-200">{drillTitle}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to={`/concepts/${concept.id}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-400"
        >
          Start <ArrowRight className="h-4 w-4" />
        </Link>
        {drillId && (
          <Link
            to={`/drills/${drillId}`}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Open drill →
          </Link>
        )}
      </div>
    </Card>
  );
}

function EmptyUpNext() {
  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-2 text-xs font-medium text-slate-400">Up next</div>
      <h2 className="text-xl font-semibold text-slate-50">All caught up.</h2>
      <p className="mt-2 text-sm text-slate-400">
        Nothing is due right now. Browse the library to pick something new.
      </p>
      <Link
        to="/learn/all"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-400"
      >
        Browse concepts <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
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
