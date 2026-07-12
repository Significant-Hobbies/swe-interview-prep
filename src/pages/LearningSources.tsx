import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Newspaper,
  Search,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  LEARNING_SOURCES,
  loadLearningProgress,
  type LearningItem,
  type LearningSourceKind,
} from '../data/learning-sources';

const KINDS: Array<{ id: 'all' | LearningSourceKind; label: string }> = [
  { id: 'all', label: 'Everything' },
  { id: 'briefing', label: 'Daily news' },
  { id: 'project', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'reader', label: 'Reader' },
];

function itemHref(item: LearningItem, sprint = false) {
  return `/sources/${encodeURIComponent(item.id)}${sprint ? '?mode=sprint' : ''}`;
}

export default function LearningSources() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | LearningSourceKind>('all');
  const [sourceId, setSourceId] = useState('all');
  const progress = loadLearningProgress();
  const sourceOptions = LEARNING_SOURCES.sources.filter(
    (source) => source.itemCount > 0 && source.kind !== 'native'
  );
  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return LEARNING_SOURCES.items.filter((item) => {
      if (kind !== 'all' && item.sourceKind !== kind) return false;
      if (sourceId !== 'all' && item.sourceId !== sourceId) return false;
      if (!normalized) return true;
      return [item.title, item.summary, item.project, item.collection, ...item.tracks]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [query, kind, sourceId]);
  const completed = Object.values(progress).filter((entry) => entry.status === 'completed').length;
  const sprintItem = items.find((item) => progress[item.id]?.status !== 'completed') || items[0];

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-6 md:py-16">
      <header className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky-300/70">
            Unified learning
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            One place for everything worth learning.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Daily news, project lessons, research paths, interview tracks, and saved reading. Source
            material stays where it belongs; progress and practice live here.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 text-center">
          <Metric value={LEARNING_SOURCES.items.length} label="items" />
          <Metric value={sourceOptions.length + 1} label="sources" />
          <Metric value={completed} label="completed" />
        </div>
      </header>

      <section className="sticky top-16 z-30 -mx-4 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl md:-mx-6 md:px-6">
        <div className="mx-auto grid max-w-[1400px] gap-3 lg:grid-cols-[minmax(260px,1fr)_auto_auto] lg:items-center">
          <label className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, papers, tracks, or topics"
              className="h-11 w-full rounded-md border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-sky-400/50"
            />
          </label>
          <select
            value={sourceId}
            onChange={(event) => setSourceId(event.target.value)}
            className="h-11 min-w-48 rounded-md border border-white/10 bg-black px-3 text-sm text-white/65 outline-none focus:border-sky-400/50"
          >
            <option value="all">All projects and paths</option>
            {sourceOptions.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label} · {source.itemCount}
              </option>
            ))}
          </select>
          {sprintItem && (
            <Link
              to={itemHref(sprintItem, true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-sky-400 px-4 text-sm font-semibold text-black hover:bg-sky-300"
            >
              <Zap className="h-4 w-4" /> Sprint this source
            </Link>
          )}
        </div>
        <div className="mx-auto mt-3 flex max-w-[1400px] min-w-0 items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 shrink-0 text-white/30" />
          {KINDS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setKind(option.id)}
              className={`h-9 shrink-0 rounded-md px-3 text-xs font-medium transition-colors ${kind === option.id ? 'bg-white text-black' : 'border border-white/10 text-white/55 hover:border-white/25 hover:text-white'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-white">{items.length} available items</h2>
          <span className="font-mono text-[10px] text-white/30">
            synced {new Date(LEARNING_SOURCES.generatedAt).toLocaleString()}
          </span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const done = progress[item.id]?.status === 'completed';
            return (
              <article
                key={item.id}
                className="flex min-h-64 flex-col bg-black p-5 transition-colors hover:bg-white/[0.025]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                    {item.sourceKind === 'briefing' ? (
                      <Newspaper className="h-3.5 w-3.5" />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5" />
                    )}
                    {item.project || item.collection || item.sourceKind}
                  </span>
                  {done && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Completed" />
                  )}
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-6 text-white">{item.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/50">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tracks.slice(0, 4).map((track) => (
                    <span
                      key={track}
                      className="rounded-sm bg-white/[0.05] px-2 py-1 text-[10px] text-white/40"
                    >
                      {track}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                  <span className="inline-flex items-center gap-1 text-xs text-white/35">
                    <Clock className="h-3.5 w-3.5" /> {item.estimatedMinutes} min ·{' '}
                    {item.assessments?.length || 0} MCQ
                  </span>
                  <Link
                    to={itemHref(item)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200"
                  >
                    Learn <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-24 bg-black px-4 py-4">
      <div className="font-mono text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/35">{label}</div>
    </div>
  );
}
