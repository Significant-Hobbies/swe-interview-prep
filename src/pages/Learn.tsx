import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Card, color, DIFFICULTY_COLOR, EmptyState, PageShell, STATUS_META } from '../components/ui';
import {
  type Concept,
  drillsForConcept,
  roadmapConceptIds,
  ROADMAPS,
  sortedTracks,
  TRACK_BY_ID,
  type TrackId,
} from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { confidencePct, deriveConceptStatus, rollupMastery } from '../lib/conceptState';

type StatusFilter = 'all' | 'untouched' | 'active' | 'mastered';

const HORIZON: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

export default function Learn() {
  const { mastery } = useConceptMastery();
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const tracks = sortedTracks();

  // React Compiler memoizes automatically; manual useMemo here trips the
  // preserve-manual-memoization rule.
  const q = query.trim().toLowerCase();
  const filtered = ALL_CONCEPTS.filter(c => {
    if (track !== 'all' && c.track !== track) return false;
    const st = deriveConceptStatus(mastery[c.id]);
    if (status === 'untouched' && st !== 'not-started') return false;
    if (status === 'mastered' && st !== 'mastered') return false;
    if (status === 'active' && (st === 'not-started' || st === 'mastered')) return false;
    if (q && !`${c.name} ${c.description} ${c.subtrack}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const byTrack: Record<string, Concept[]> = {};
  for (const c of filtered) (byTrack[c.track] ||= []).push(c);

  return (
    <PageShell wide>
      <header className="mb-5">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Learn</h1>
        <p className="mt-1 text-sm text-gray-500">
          {ROADMAPS.length} roadmaps · {ALL_CONCEPTS.length} concepts across 8 tracks
        </p>
      </header>

      <section className="mb-7">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Roadmaps</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROADMAPS.map(r => {
            const ids = roadmapConceptIds(r);
            const roll = rollupMastery(ids, mastery);
            const pct = ids.length ? Math.round((roll.mastered / ids.length) * 100) : 0;
            return (
              <Card key={r.id} as="link" to={`/roadmaps/${r.id}`} className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-1.5">
                  <Badge tone="purple">{HORIZON[r.horizon]}</Badge>
                  <span className="text-[11px] text-gray-600">{ids.length} concepts</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{r.title}</h3>
                <p className="line-clamp-2 text-xs text-gray-400">{r.goal}</p>
                <div className="mt-auto text-[11px] text-gray-500">{pct}% mastered</div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Concepts</div>
          <span className="text-[11px] text-gray-600">{filtered.length} shown</span>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search concepts…"
              className="w-full rounded-lg border border-gray-800 bg-gray-900/60 py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Pill active={track === 'all'} onClick={() => setTrack('all')}>All</Pill>
            {tracks.map(t => (
              <Pill key={t.id} active={track === t.id} tone={t.color} onClick={() => setTrack(t.id)}>
                {t.title}
              </Pill>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'untouched', 'active', 'mastered'] as StatusFilter[]).map(s => (
              <Pill key={s} active={status === s} onClick={() => setStatus(s)}>
                {s === 'all' ? 'Any status' : s[0].toUpperCase() + s.slice(1)}
              </Pill>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No concepts match" hint="Try clearing the search or filters." />
        ) : (
          <div className="space-y-6">
            {tracks
              .filter(t => byTrack[t.id]?.length)
              .map(t => (
                <div key={t.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${color(t.color).solid}`} />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t.title}</h2>
                    <span className="text-[11px] text-gray-600">{byTrack[t.id].length}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {byTrack[t.id]
                      .sort((a, b) => b.priority - a.priority)
                      .map(c => (
                        <ConceptCard key={c.id} concept={c} mastery={mastery[c.id]} />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function Pill({
  children,
  active,
  tone = 'purple',
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  tone?: string;
  onClick: () => void;
}) {
  const c = color(tone);
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
        active ? `${c.bg} ${c.border} ${c.text}` : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function ConceptCard({ concept, mastery }: { concept: Concept; mastery?: MasteryEntry }) {
  const status = deriveConceptStatus(mastery);
  const meta = STATUS_META[status];
  const drills = drillsForConcept(concept.id).length;
  const trk = TRACK_BY_ID[concept.track];
  return (
    <Link
      to={`/concepts/${concept.id}`}
      className="group flex flex-col gap-1 rounded-lg border border-gray-800 bg-gray-900/40 p-3 transition-colors hover:border-gray-700 hover:bg-gray-900/70"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-100 group-hover:text-white">{concept.name}</h3>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-700 group-hover:text-gray-400" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge tone={meta.color}>{meta.label}</Badge>
        <Badge tone={DIFFICULTY_COLOR[concept.difficulty]}>{concept.difficulty}</Badge>
        {trk && <span className="text-gray-600">{trk.short}</span>}
        {drills > 0 && <span className="text-gray-600">· {drills} drill{drills > 1 ? 's' : ''}</span>}
        {mastery && <span className="text-gray-600">· {confidencePct(mastery)}%</span>}
      </div>
    </Link>
  );
}
