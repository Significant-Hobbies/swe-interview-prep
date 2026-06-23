import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import BrowseLinks from '../components/BrowseLinks';
import CanonicalPrimers from '../components/CanonicalPrimers';
import PathDoor from '../components/PathDoor';
import PlaygroundHero from '../components/PlaygroundHero';
import { CONCEPTS, CONCEPT_PACKS, EDITORIAL_DRILLS, ROADMAPS, TRACKS } from '../data/learning-os';
import { loadActiveRoadmapId, saveActiveRoadmapId } from '../lib/recommend';
import { catalogPackStats, PACK_SLOT_LABEL, PACK_SLOTS } from '../lib/packStats';
import { ROADMAP_GROUPS, roadmapsInGroup } from '../lib/roadmapGroups';

const HORIZON_LABEL: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

export default function Explore() {
  const navigate = useNavigate();
  const activeId = loadActiveRoadmapId();
  const packStats = catalogPackStats(CONCEPT_PACKS);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      <div className="relative">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />

        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Full catalog
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Explore everything.
        </h1>
        <p className="mt-4 max-w-prose text-sm text-white/50 sm:text-base">
          {ROADMAPS.length} roadmaps · {CONCEPTS.length} concepts · {TRACKS.length} tracks ·{' '}
          {EDITORIAL_DRILLS.length} editorial drills. No onboarding required — jump anywhere.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            Personalize Today&apos;s plan
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/learn/all"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            Search all concepts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <PathDoor activeRoadmapId={activeId} className="mt-12" />

      <PlaygroundHero className="mt-10" />

      <section className="mt-12" aria-label="Pack quality">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          S-tier topic packs
        </h2>
        <p className="mt-1 max-w-prose text-xs text-white/45">
          Each concept pack is an array of resources — category, title, url. Filled external links
          are industry-canonical only.
        </p>
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-2xl font-semibold tabular-nums text-white">
              {packStats.averageItems.toFixed(1)}
              <span className="text-base font-normal text-white/40"> avg items / concept</span>
            </span>
            <Link
              to="/learn/all"
              className="font-mono text-[11px] text-white/40 hover:text-white/65"
            >
              Browse all concepts →
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-white/35">
            {PACK_SLOTS.map((slot) => (
              <span key={slot}>
                {PACK_SLOT_LABEL[slot]}: {packStats.bySlot[slot]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CanonicalPrimers className="mt-12" limit={6} />

      <section className="mt-14 space-y-12">
        {ROADMAP_GROUPS.map((group) => {
          const roadmaps = roadmapsInGroup(group);
          return (
            <div key={group.id} id={group.id} className="scroll-mt-24">
              <div className="mb-3">
                <h2 className="text-lg font-semibold tracking-tight text-white">{group.title}</h2>
                <p className="mt-1 max-w-prose text-xs text-white/45">{group.subtitle}</p>
              </div>
              <div className="grid gap-px overflow-hidden rounded-xl bg-white/10">
                {roadmaps.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 bg-black px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/roadmaps/${r.id}`}
                        className="text-lg font-semibold tracking-tight text-white hover:text-white/85"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs text-white/40">{r.goal}</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                        {r.milestones.length} milestones · {HORIZON_LABEL[r.horizon] ?? r.horizon}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          saveActiveRoadmapId(r.id);
                          navigate('/learn');
                        }}
                        className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[10px] text-white/55 transition-colors hover:border-white/30 hover:text-white"
                      >
                        Set active
                      </button>
                      <Link
                        to={`/roadmaps/${r.id}`}
                        className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[10px] text-white transition-colors hover:bg-white/15"
                      >
                        Open roadmap
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <BrowseLinks className="mt-16" />
    </div>
  );
}
