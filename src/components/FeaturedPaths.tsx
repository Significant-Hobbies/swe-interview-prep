import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROADMAP_BY_ID } from '../data/learning-os';
import { FEATURED_ROADMAP_PICKS } from '../lib/roadmapGroups';

const HORIZON_SHORT: Record<string, string> = {
  '9d': '9d',
  '30d': '30d',
  '90d': '90d',
  '12mo': '12mo',
};

interface FeaturedPathsProps {
  activeRoadmapId?: string;
  onPick?: (id: string) => void;
  /** Docs index: link to roadmaps; Learn: buttons that set active path. */
  variant?: 'pick' | 'link';
}

export default function FeaturedPaths({
  activeRoadmapId,
  onPick,
  variant = 'pick',
}: FeaturedPathsProps) {
  return (
    <section aria-label="Interview quick picks">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Quick interview picks
          </h2>
          <p className="mt-1 max-w-prose text-xs text-white/45">
            Shortcut tiles for LLD, HLD, DSA, DB, runtime, OS — not the full catalog.
          </p>
        </div>
        <Link
          to="/learning/interview-prep"
          className="inline-flex items-center gap-1 font-mono text-[11px] text-white/45 transition-colors hover:text-white/70"
        >
          Interview checklist <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {FEATURED_ROADMAP_PICKS.map((pick) => {
          const roadmap = ROADMAP_BY_ID[pick.id];
          if (!roadmap) return null;
          const active = activeRoadmapId === pick.id;
          const horizon = HORIZON_SHORT[roadmap.horizon] ?? roadmap.horizon;

          const shellClass = `flex flex-col rounded-xl border transition-colors ${
            active
              ? 'border-white/25 bg-white/[0.06]'
              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
          }`;

          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className="text-base font-semibold tracking-tight text-white">
                  {pick.label}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-white/35">{horizon}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/45">
                {roadmap.title}
              </p>
            </>
          );

          if (variant === 'link') {
            return (
              <Link
                key={pick.id}
                to={`/roadmaps/${pick.id}`}
                className={`${shellClass} px-3.5 py-3`}
              >
                {body}
                {pick.docSlug && (
                  <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-white/35">
                    <BookOpen className="h-3 w-3" />
                    Doc available
                  </span>
                )}
              </Link>
            );
          }

          return (
            <div key={pick.id} className={shellClass}>
              <button
                type="button"
                onClick={() => onPick?.(pick.id)}
                className="flex flex-1 flex-col px-3.5 py-3 text-left"
              >
                {body}
              </button>
              {pick.docSlug && (
                <Link
                  to={`/learning/${pick.docSlug}`}
                  className="inline-flex items-center gap-1 border-t border-white/[0.06] px-3.5 py-2 font-mono text-[10px] text-white/35 hover:text-white/60"
                >
                  <BookOpen className="h-3 w-3" />
                  Read doc
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
