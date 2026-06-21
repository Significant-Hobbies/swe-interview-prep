import {
  BarChart3,
  BookOpen,
  Code2,
  Dumbbell,
  FolderKanban,
  Hammer,
  Mic,
  Network,
  NotebookPen,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  CONCEPTS,
  EDITORIAL_DRILLS,
  PRACTICE_DRILLS,
  ROADMAPS,
  TRACKS,
} from '../data/learning-os';
import { BROWSE_DESTINATIONS, type BrowseDestination } from '../lib/browseLinks';

const ICONS: Record<string, LucideIcon> = {
  concepts: Network,
  drills: Dumbbell,
  reviews: RotateCcw,
  docs: BookOpen,
  build: Hammer,
  playground: Code2,
  projects: FolderKanban,
  notes: NotebookPen,
  mock: Mic,
  progress: BarChart3,
};

function countFor(id: string): string | null {
  switch (id) {
    case 'concepts':
      return `${CONCEPTS.length} concepts · ${TRACKS.length} tracks`;
    case 'drills':
      return `${EDITORIAL_DRILLS.length} editorial · ${PRACTICE_DRILLS.length} total`;
    case 'docs':
      return `${ROADMAPS.length} companion roadmaps`;
    default:
      return null;
  }
}

interface BrowseLinksProps {
  /** Omit ids already prominent elsewhere (e.g. primary nav on a hub page). */
  omit?: string[];
  className?: string;
}

export default function BrowseLinks({ omit = [], className = '' }: BrowseLinksProps) {
  const links = BROWSE_DESTINATIONS.filter(d => !omit.includes(d.id));

  return (
    <section aria-label="Browse catalog" className={className}>
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Browse
        </h2>
        <p className="mt-1 max-w-prose text-xs text-white/45">
          Concepts, drills, docs, notes — jump anywhere without picking a path first.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
        {links.map(dest => (
          <BrowseCard key={dest.id} dest={dest} />
        ))}
      </div>
    </section>
  );
}

function BrowseCard({ dest }: { dest: BrowseDestination }) {
  const Icon = ICONS[dest.id] ?? Network;
  const count = countFor(dest.id);

  return (
    <Link
      to={dest.to}
      className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/35 group-hover:text-white/55" />
        <div className="min-w-0">
          <span className="text-sm font-semibold tracking-tight text-white">{dest.label}</span>
          <p className="mt-0.5 text-[11px] leading-snug text-white/45">{dest.blurb}</p>
          {count && (
            <p className="mt-1 font-mono text-[10px] text-white/30">{count}</p>
          )}
        </div>
      </div>
    </Link>
  );
}