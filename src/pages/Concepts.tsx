import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Card, color, DIFFICULTY_COLOR, EmptyState, PageHeader, PageShell, STATUS_META } from '../components/ui';
import { type Concept, drillsForConcept, sortedTracks, type TrackId } from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { confidencePct, deriveConceptStatus } from '../lib/conceptState';

type StatusFilter = 'all' | 'untouched' | 'active' | 'mastered';

export default function Concepts() {
  const { mastery } = useConceptMastery();
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const tracks = sortedTracks();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CONCEPTS.filter(c => {
      if (track !== 'all' && c.track !== track) return false;
      const st = deriveConceptStatus(mastery[c.id]);
      if (status === 'untouched' && st !== 'not-started') return false;
      if (status === 'mastered' && st !== 'mastered') return false;
      if (status === 'active' && (st === 'not-started' || st === 'mastered')) return false;
      if (q && !`${c.name} ${c.description} ${c.subtrack}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, track, status, mastery]);

  const byTrack = useMemo(() => {
    const out: Record<string, Concept[]> = {};
    for (const c of filtered) (out[c.track] ||= []).push(c);
    return out;
  }, [filtered]);

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Concepts"
        title="Concept Library"
        subtitle={`${ALL_CONCEPTS.length} concepts across 8 tracks. Every concept maps to drills, artifacts, and reviews.`}
      />

      <div className="mb-5 flex flex-col gap-3">
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
          <FilterPill active={track === 'all'} onClick={() => setTrack('all')}>All tracks</FilterPill>
          {tracks.map(t => (
            <FilterPill key={t.id} active={track === t.id} tone={t.color} onClick={() => setTrack(t.id)}>
              {t.title}
            </FilterPill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'untouched', 'active', 'mastered'] as StatusFilter[]).map(s => (
            <FilterPill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s === 'all' ? 'Any status' : s[0].toUpperCase() + s.slice(1)}
            </FilterPill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No concepts match" hint="Try clearing the search or filters." />
      ) : (
        <div className="space-y-8">
          {tracks
            .filter(t => byTrack[t.id]?.length)
            .map(t => (
              <section key={t.id}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color(t.color).solid}`} />
                  <h2 className="text-sm font-semibold text-gray-200">{t.title}</h2>
                  <span className="text-xs text-gray-600">{byTrack[t.id].length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byTrack[t.id]
                    .sort((a, b) => b.priority - a.priority)
                    .map(c => (
                      <ConceptCard key={c.id} concept={c} mastery={mastery[c.id]} />
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </PageShell>
  );
}

function FilterPill({
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? `${c.bg} ${c.border} ${c.text}` : 'border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
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
  return (
    <Card as="link" to={`/concepts/${concept.id}`} className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{concept.name}</h3>
        <Badge tone={meta.color}>{meta.label}</Badge>
      </div>
      <p className="line-clamp-2 text-xs text-gray-400">{concept.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <Badge tone={DIFFICULTY_COLOR[concept.difficulty]}>{concept.difficulty}</Badge>
        {concept.priority >= 4 && <Badge tone="rose">priority {concept.priority}</Badge>}
        {drills > 0 && <span className="text-[11px] text-gray-500">{drills} drill{drills > 1 ? 's' : ''}</span>}
        {mastery && <span className="text-[11px] text-gray-500">· {confidencePct(mastery)}% conf</span>}
      </div>
    </Card>
  );
}
