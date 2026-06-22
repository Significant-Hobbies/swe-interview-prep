import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { ROADMAP_BY_ID } from '../data/learning-os';
import { ROADMAP_GROUPS } from '../lib/roadmapGroups';
import { saveActiveRoadmapId } from '../lib/recommend';

const GROUP_EMOJI: Record<string, string> = {
  interview: '🎯',
  systems: '⚙️',
  ai: '🤖',
  math: '📐',
};

interface PathDoorProps {
  /** Highlight the macro path that matches the active roadmap. */
  activeRoadmapId?: string;
  className?: string;
}

export default function PathDoor({ activeRoadmapId, className = '' }: PathDoorProps) {
  const navigate = useNavigate();
  const activeGroupId = activeRoadmapId
    ? ROADMAP_GROUPS.find(g => g.roadmapIds.includes(activeRoadmapId))?.id
    : undefined;

  return (
    <section aria-label="Learning paths" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Start here
          </h2>
          <p className="mt-1 max-w-prose text-xs text-white/45">
            Four doors — interview, systems, AI, math. Pick one for Today&apos;s weekly focus, or browse everything below.
          </p>
        </div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-white/45 transition-colors hover:text-white/70"
        >
          Explore full catalog <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ROADMAP_GROUPS.map(group => {
          const defaultId = group.roadmapIds[0];
          const defaultRoadmap = ROADMAP_BY_ID[defaultId];
          const active = activeGroupId === group.id;
          const count = group.roadmapIds.length;

          return (
            <div
              key={group.id}
              className={`flex flex-col rounded-xl border transition-colors ${
                active
                  ? 'border-white/25 bg-white/[0.06]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              <Link
                to={`/explore#${group.id}`}
                className="flex flex-1 flex-col px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg" aria-hidden>
                    {GROUP_EMOJI[group.id] ?? '📍'}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-white/35">
                    {count} path{count > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="mt-2 text-sm font-semibold tracking-tight text-white">
                  {group.title}
                </span>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/45">
                  {group.subtitle}
                </p>
                {defaultRoadmap && (
                  <p className="mt-2 font-mono text-[10px] text-white/30">
                    Default: {defaultRoadmap.title}
                  </p>
                )}
              </Link>
              {defaultId && (
                <button
                  type="button"
                  onClick={() => {
                    saveActiveRoadmapId(defaultId);
                    navigate('/learn');
                  }}
                  className="border-t border-white/[0.06] px-3.5 py-2 text-left font-mono text-[10px] text-white/40 transition-colors hover:bg-white/[0.03] hover:text-white/65"
                >
                  Set as active path →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}