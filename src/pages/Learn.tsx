import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import BrowseLinks from '../components/BrowseLinks';
import FeaturedPaths from '../components/FeaturedPaths';
import PathDoor from '../components/PathDoor';
import PlaygroundHero from '../components/PlaygroundHero';
import { CONCEPT_BY_ID, type Roadmap, roadmapConceptIds, ROADMAPS } from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { useGateContext } from '../hooks/useGates';
import { rollupMastery } from '../lib/conceptState';
import { conceptAccessible } from '../lib/gates';
import { pickDrillForConcept, pickNextConcept } from '../lib/recommend';
import { ROADMAP_GROUPS, roadmapsInGroup, ungroupedRoadmaps } from '../lib/roadmapGroups';

const HORIZON_LABEL: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

import { loadActiveRoadmapId, saveActiveRoadmapId } from '../lib/recommend';

export default function Learn() {
  const { mastery } = useConceptMastery();
  const gateCtx = useGateContext();
  const [activeId, setActiveId] = useState<string>(
    () => loadActiveRoadmapId() || pickDefaultActive(mastery)
  );

  function pick(id: string) {
    setActiveId(id);
    saveActiveRoadmapId(id);
  }

  const active = ROADMAPS.find((r) => r.id === activeId) ?? ROADMAPS[0];
  const next = pickNextConceptInRoadmap(active, mastery, gateCtx);
  const nextDrill = next ? pickDrillForConcept(next.id) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      <div className="relative">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />

        <div className="mb-8 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Learn
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Set your active path.
        </h1>
        <p className="mt-4 max-w-prose text-sm text-white/50 sm:text-base">
          Today&apos;s session follows the active roadmap. Start with four macro doors, quick
          interview picks, or all 14 roadmaps below.
        </p>
        <Link
          to="/explore"
          className="mt-4 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
        >
          Explore full catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <PathDoor activeRoadmapId={active.id} className="mt-10" />

      <div className="mt-10">
        <FeaturedPaths activeRoadmapId={active.id} onPick={pick} />
      </div>

      <PlaygroundHero className="mt-10" compact />

      <BrowseLinks className="mt-12" />

      <section className="mt-14 space-y-10">
        {ROADMAP_GROUPS.map((group) => {
          const roadmaps = roadmapsInGroup(group);
          if (!roadmaps.length) return null;
          return (
            <div key={group.id}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold tracking-tight text-white">{group.title}</h2>
                <p className="mt-1 max-w-prose text-xs text-white/45">{group.subtitle}</p>
              </div>
              <RoadmapList
                roadmaps={roadmaps}
                mastery={mastery}
                activeId={active.id}
                onPick={pick}
              />
            </div>
          );
        })}
        {ungroupedRoadmaps(ROADMAPS).length > 0 && (
          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold tracking-tight text-white">More paths</h2>
            </div>
            <RoadmapList
              roadmaps={ungroupedRoadmaps(ROADMAPS)}
              mastery={mastery}
              activeId={active.id}
              onPick={pick}
            />
          </div>
        )}
      </section>

      {next && (
        <section className="section-rule mt-16 pt-10">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Continue in {active.title}
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {next.name}
            </h2>
            <Link
              to={`/concepts/${next.id}`}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
            >
              Start
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/60">
            {next.description}
          </p>
          {nextDrill && (
            <p className="mt-3 font-mono text-xs text-white/40">
              Pair with drill:{' '}
              <Link to={`/drills/${nextDrill.id}`} className="text-white/70 hover:text-white">
                {nextDrill.title}
              </Link>
            </p>
          )}
        </section>
      )}

      <nav className="mt-16 font-mono text-sm">
        <Link to={`/roadmaps/${active.id}`} className="text-white/50 hover:text-white">
          Open active roadmap detail <span className="text-white/40">→</span>
        </Link>
      </nav>
    </div>
  );
}

function RoadmapList({
  roadmaps,
  mastery,
  activeId,
  onPick,
}: {
  roadmaps: Roadmap[];
  mastery: Record<string, MasteryEntry>;
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl bg-white/10">
      {roadmaps.map((r) => (
        <RoadmapRow
          key={r.id}
          roadmap={r}
          mastery={mastery}
          active={r.id === activeId}
          onPick={() => onPick(r.id)}
        />
      ))}
    </div>
  );
}

function RoadmapRow({
  roadmap,
  mastery,
  active,
  onPick,
}: {
  roadmap: Roadmap;
  mastery: Record<string, MasteryEntry>;
  active: boolean;
  onPick: () => void;
}) {
  const ids = roadmapConceptIds(roadmap);
  const roll = rollupMastery(ids, mastery);
  const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;

  return (
    <button
      type="button"
      onClick={onPick}
      className={`group flex flex-col gap-3 px-5 py-4 text-left transition-colors ${
        active ? 'bg-white/[0.04]' : 'bg-black hover:bg-white/[0.02]'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h3
              className={`truncate text-lg font-semibold tracking-tight ${active ? 'text-white' : 'text-white/80'}`}
            >
              {roadmap.title}
            </h3>
            {active && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                Active
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-white/40">{roadmap.goal}</p>
        </div>
        <div className="shrink-0 text-right font-mono text-xs text-white/40">
          <div className="text-sm tabular-nums text-white">{Math.round(pct)}%</div>
          <div>{HORIZON_LABEL[roadmap.horizon]}</div>
        </div>
      </div>

      <div className="h-px w-full overflow-hidden bg-white/10">
        <div
          className={`h-full transition-[width] duration-500 ${active ? 'bg-white' : 'bg-white/40'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
        <span>{roadmap.milestones.length} milestones</span>
        <span className="tabular-nums">
          {roll.mastered}/{ids.length} mastered
        </span>
      </div>
    </button>
  );
}

function pickDefaultActive(mastery: Record<string, MasteryEntry>): string {
  let best = ROADMAPS[0]?.id ?? '';
  let bestScore = -1;
  for (const r of ROADMAPS) {
    const ids = roadmapConceptIds(r);
    const roll = rollupMastery(ids, mastery);
    const started = ids.length - roll.untouched;
    const score = started > 0 && roll.mastered < ids.length ? started + roll.learning * 0.5 : -1;
    if (score > bestScore) {
      best = r.id;
      bestScore = score;
    }
  }
  return best;
}

function pickNextConceptInRoadmap(
  roadmap: Roadmap,
  mastery: Record<string, MasteryEntry>,
  gateCtx: ReturnType<typeof useGateContext>
) {
  // Prefer the global recommender's pick if it lives in this roadmap;
  // otherwise pick the first not-yet-mastered concept in milestone order.
  const fallbackIds = roadmapConceptIds(roadmap);
  const idSet = new Set(fallbackIds);
  const global = pickNextConcept(mastery, gateCtx);
  if (global && idSet.has(global.id)) return global;
  for (const cid of fallbackIds) {
    const m = mastery[cid];
    if (!m || (m.confidence ?? 0) < 0.9) {
      const c = CONCEPT_BY_ID[cid];
      if (c && conceptAccessible(c, gateCtx)) return c;
    }
  }
  return null;
}
