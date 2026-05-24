import { ArrowRight, Search, Sparkles, Target } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, CollapsiblePanel, color, DIFFICULTY_COLOR, EmptyState, FilterPill, PageHeader, PageShell, STATUS_META } from '../components/ui';
import {
  ConceptChain,
  type DonutSegment,
  MasteryDonut,
  MilestoneTimeline,
  Ring,
  StackedBar,
  type TimelineStep,
} from '../components/viz';
import {
  type Concept,
  CONCEPT_BY_ID,
  conceptsByTrack,
  drillsForConcept,
  type Roadmap,
  roadmapConceptIds,
  ROADMAPS,
  sortedTracks,
  TRACK_BY_ID,
  type TrackId,
} from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { confidencePct, deriveConceptStatus, rollupMastery } from '../lib/conceptState';
import { pickDrillForConcept, pickNextConcept } from '../lib/recommend';

type StatusFilter = 'all' | 'untouched' | 'active' | 'mastered';

const HORIZON: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

const STATUS_TONE: Record<string, string> = {
  'not-started': 'gray',
  learning: 'blue',
  drilling: 'amber',
  building: 'purple',
  review: 'cyan',
  mastered: 'emerald',
};

const PRIMARY_ROADMAP_ID = 'ai-search-infra-90-day';

export default function Learn() {
  const { mastery } = useConceptMastery();

  // The "active" roadmap is the one with the most progress, falling back to the
  // canonical 90-day path for a fresh user.
  const activeRoadmap = pickActiveRoadmap(mastery);
  const next = pickNextConcept(mastery);
  const nextDrill = next ? pickDrillForConcept(next.id) : null;
  const upNext = pickUpNextChain(mastery, 4);

  return (
    <PageShell wide>
      <PageHeader
        title="Learn"
        subtitle={`${ROADMAPS.length} roadmaps · ${ALL_CONCEPTS.length} concepts · 8 tracks · driven by spaced repetition.`}
      />

      <ActivePathHero
        roadmap={activeRoadmap}
        nextConcept={next}
        nextDrillTitle={nextDrill?.title}
        upNext={upNext}
        mastery={mastery}
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_300px]">
        <RoadmapPicker activeId={activeRoadmap.id} mastery={mastery} />
        <MasteryPanel mastery={mastery} />
      </section>

      <section className="mt-8">
        <SectionHeader title="Tracks" subtitle="Each track is a learning lane. Dots = concepts coloured by status." />
        <div className="space-y-3">
          {sortedTracks().map(t => (
            <TrackLane key={t.id} trackId={t.id} mastery={mastery} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <ConceptBrowser mastery={mastery} />
      </section>
    </PageShell>
  );
}

// --- Active path hero -------------------------------------------------------

function ActivePathHero({
  roadmap,
  nextConcept,
  nextDrillTitle,
  upNext,
  mastery,
}: {
  roadmap: Roadmap;
  nextConcept: Concept | null;
  nextDrillTitle?: string;
  upNext: Concept[];
  mastery: Record<string, MasteryEntry>;
}) {
  const ids = roadmapConceptIds(roadmap);
  const roll = rollupMastery(ids, mastery);
  const pct = ids.length ? roll.mastered / ids.length : 0;
  const activeMilestoneIdx = pickActiveMilestoneIdx(roadmap, mastery);
  const activeMilestone = roadmap.milestones[activeMilestoneIdx];

  const timelineSteps: TimelineStep[] = roadmap.milestones.map((m, i) => {
    const mRoll = rollupMastery(m.concepts, mastery);
    const mPct = m.concepts.length ? mRoll.mastered / m.concepts.length : 0;
    return {
      id: `${roadmap.id}-${i}`,
      title: m.title.replace(/^(Days?|Week|Month|Q) [^—]+— ?/i, ''),
      sublabel: m.title.match(/^(Days?|Week|Month|Q)[^—]+/i)?.[0]?.trim() || `Step ${i + 1}`,
      pct: mPct,
      tone: i === activeMilestoneIdx ? 'purple' : 'emerald',
      active: i === activeMilestoneIdx,
    };
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-gray-900/40 to-gray-900/40">
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="purple">{HORIZON[roadmap.horizon]}</Badge>
            <Badge tone="gray">{roadmap.tracks.length} tracks</Badge>
            {activeMilestone && (
              <span className="text-[11px] uppercase tracking-wider text-purple-300/80">
                {activeMilestone.title.split(' — ')[0]}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{roadmap.title}</h2>
          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-gray-400">{roadmap.goal}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500">
                <span>Progress</span>
                <span>{roll.mastered}/{ids.length} mastered</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500" style={{ width: `${pct * 100}%` }} />
              </div>
            </div>
            <div className="flex shrink-0 gap-3 text-center text-xs">
              <Stat label="Started" value={ids.length - roll.untouched} />
              <Stat label="Due" value={roll.due} tone={roll.due ? 'amber' : 'gray'} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <Ring value={pct} size={120} stroke={10} tone="purple" label={`${Math.round(pct * 100)}%`} sublabel="MASTERED" />
        </div>
      </div>

      <div className="border-t border-gray-800/80 bg-gray-950/40 px-5 py-4 sm:px-6">
        <MilestoneTimeline steps={timelineSteps} />
      </div>

      {nextConcept && (
        <div className="grid gap-px border-t border-gray-800/80 bg-gray-800/60 sm:grid-cols-[1fr_auto]">
          <div className="bg-gray-950/40 p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-purple-300">
              <Target className="h-3 w-3" /> Up next
            </div>
            <Link to={`/concepts/${nextConcept.id}`} className="text-lg font-semibold text-white hover:text-purple-300">
              {nextConcept.name} <ArrowRight className="inline h-4 w-4" />
            </Link>
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{nextConcept.description}</p>
            {nextDrillTitle && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                <Sparkles className="h-3 w-3 text-amber-400" /> Pair with drill: <span className="text-gray-200">{nextDrillTitle}</span>
              </div>
            )}
          </div>

          {upNext.length > 1 && (
            <div className="hidden bg-gray-950/40 p-5 sm:block sm:p-6">
              <div className="mb-2 text-[11px] uppercase tracking-wider text-gray-500">After that</div>
              <div className="space-y-1.5">
                {upNext.slice(1, 4).map(c => (
                  <Link key={c.id} to={`/concepts/${c.id}`} className="block truncate text-sm text-gray-400 hover:text-gray-200">
                    · {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = 'gray' }: { label: string; value: number | string; tone?: string }) {
  return (
    <div>
      <div className={`text-base font-bold ${tone === 'amber' ? 'text-amber-400' : 'text-white'}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  );
}

// --- Mastery panel (donut + per-track) -------------------------------------

function MasteryPanel({ mastery }: { mastery: Record<string, MasteryEntry> }) {
  const tracks = sortedTracks();
  const segments: DonutSegment[] = tracks.map(t => {
    const ids = conceptsByTrack(t.id).map(c => c.id);
    const roll = rollupMastery(ids, mastery);
    return {
      id: t.id,
      label: t.title,
      total: ids.length,
      mastered: roll.mastered,
      tone: t.color,
    };
  });

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Mastery overview</div>
      <div className="flex flex-col items-center gap-3">
        <MasteryDonut segments={segments} size={180} thickness={16} />
        <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:text-xs">
          {segments.map(s => (
            <li key={s.id} className="flex items-center gap-1.5 truncate">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color(s.tone).solid.replace('bg-', '') ? undefined : undefined }}>
                <span className={`block h-full w-full rounded-full ${color(s.tone).solid}`} />
              </span>
              <span className="truncate text-gray-400">{s.label}</span>
              <span className="ml-auto text-gray-600">{s.mastered}/{s.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Roadmap picker --------------------------------------------------------

function RoadmapPicker({ activeId, mastery }: { activeId: string; mastery: Record<string, MasteryEntry> }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">All roadmaps</div>
        <span className="text-[10px] text-gray-600">switch what's active</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {ROADMAPS.map(r => {
          const ids = roadmapConceptIds(r);
          const roll = rollupMastery(ids, mastery);
          const pct = ids.length ? roll.mastered / ids.length : 0;
          const isActive = r.id === activeId;
          return (
            <Link
              key={r.id}
              to={`/roadmaps/${r.id}`}
              className={`group rounded-xl border p-3 transition-colors ${
                isActive
                  ? 'border-purple-500/40 bg-purple-500/5'
                  : 'border-gray-800 bg-gray-950/40 hover:border-gray-700'
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <Badge tone={isActive ? 'purple' : 'gray'}>{HORIZON[r.horizon]}</Badge>
                {isActive && <span className="text-[10px] uppercase tracking-wider text-purple-300">active</span>}
              </div>
              <h3 className="truncate text-sm font-semibold text-white">{r.title}</h3>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-800">
                <div className={`h-full ${isActive ? 'bg-purple-500' : 'bg-emerald-500/70'}`} style={{ width: `${pct * 100}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                <span>{r.milestones.length} milestones</span>
                <span>{roll.mastered}/{ids.length}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// --- Track lane ------------------------------------------------------------

function TrackLane({ trackId, mastery }: { trackId: TrackId; mastery: Record<string, MasteryEntry> }) {
  const track = TRACK_BY_ID[trackId];
  const concepts = [...conceptsByTrack(trackId)].sort((a, b) => b.priority - a.priority);
  const roll = rollupMastery(concepts.map(c => c.id), mastery);
  const nodes = concepts.map(c => ({
    id: c.id,
    name: c.name,
    tone: STATUS_TONE[deriveConceptStatus(mastery[c.id])],
    priority: c.priority,
    href: `/concepts/${c.id}`,
  }));

  const stack = [
    { count: roll.mastered, tone: 'emerald', label: 'Mastered' },
    { count: roll.drilling, tone: 'amber', label: 'Drilling' },
    { count: roll.learning, tone: 'blue', label: 'Learning' },
    { count: roll.untouched, tone: 'gray', label: 'Not started' },
  ];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color(track.color).solid}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-gray-100">{track.title}</h3>
            <span className="text-[11px] text-gray-600">{concepts.length} concepts</span>
          </div>
          <p className="line-clamp-1 text-[11px] text-gray-500">{track.description}</p>
        </div>
        <div className="shrink-0 text-right text-[11px] text-gray-500">
          <div className="font-mono text-gray-300">{roll.mastered}/{concepts.length}</div>
          <div className="text-[10px] uppercase tracking-wider">mastered</div>
        </div>
      </div>
      <StackedBar segments={stack} height={4} />
      <div className="mt-3">
        <ConceptChain nodes={nodes} />
      </div>
    </div>
  );
}

// --- Concept browser (collapsed) -------------------------------------------

function ConceptBrowser({ mastery }: { mastery: Record<string, MasteryEntry> }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const tracks = sortedTracks();
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

  return (
    <CollapsiblePanel
      title="Browse all concepts"
      subtitle="Search, filter, deep-link."
      open={open}
      onToggle={() => setOpen(v => !v)}
    >
      <div className="mb-4 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search concepts…"
            className="w-full rounded-lg border border-gray-800 bg-gray-950 py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterPill active={track === 'all'} onClick={() => setTrack('all')}>All</FilterPill>
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
        <EmptyState title="No concepts match" hint="Clear the search or filters." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <ConceptCard key={c.id} concept={c} mastery={mastery[c.id]} />
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );
}

function ConceptCard({ concept, mastery }: { concept: Concept; mastery?: MasteryEntry }) {
  const status = deriveConceptStatus(mastery);
  const meta = STATUS_META[status];
  const drills = drillsForConcept(concept.id).length;
  const trk = TRACK_BY_ID[concept.track];
  const sparse = !concept.mentalModel || !(concept.resources?.length ?? 0);
  return (
    <Link
      to={`/concepts/${concept.id}`}
      className="group flex flex-col gap-1 rounded-lg border border-gray-800 bg-gray-950/40 p-3 transition-colors hover:border-gray-700 hover:bg-gray-900/70"
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
        {sparse && <span className="text-gray-700" title="Links-first concept (no mental model authored)">·</span>}
      </div>
    </Link>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">{title}</h2>
      <p className="text-[11px] text-gray-600">{subtitle}</p>
    </div>
  );
}

// --- Heuristics ------------------------------------------------------------

function pickActiveRoadmap(mastery: Record<string, MasteryEntry>): Roadmap {
  let best = ROADMAPS.find(r => r.id === PRIMARY_ROADMAP_ID) || ROADMAPS[0];
  let bestScore = -1;
  for (const r of ROADMAPS) {
    const ids = roadmapConceptIds(r);
    const roll = rollupMastery(ids, mastery);
    // Score: started concepts beat mastered (don't surface "done" roadmaps as active).
    const started = ids.length - roll.untouched;
    const score = started > 0 && roll.mastered < ids.length ? started + roll.learning * 0.5 : -1;
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  return best;
}

function pickActiveMilestoneIdx(roadmap: Roadmap, mastery: Record<string, MasteryEntry>): number {
  for (let i = 0; i < roadmap.milestones.length; i++) {
    const m = roadmap.milestones[i];
    const roll = rollupMastery(m.concepts, mastery);
    if (roll.mastered < m.concepts.length) return i;
  }
  return roadmap.milestones.length - 1;
}

// Sequence of next concepts: the recommendation's pick first, then concepts
// whose prerequisites are satisfied and which the user hasn't mastered.
function pickUpNextChain(mastery: Record<string, MasteryEntry>, limit: number): Concept[] {
  const first = pickNextConcept(mastery);
  const chain: Concept[] = [];
  if (first) chain.push(first);
  const seen = new Set(chain.map(c => c.id));
  for (const c of ALL_CONCEPTS) {
    if (chain.length >= limit) break;
    if (seen.has(c.id)) continue;
    const status = deriveConceptStatus(mastery[c.id]);
    if (status === 'mastered') continue;
    const ok = c.prerequisites.every(p => {
      const conf = mastery[p]?.confidence ?? 0;
      return conf >= 0.4 || !CONCEPT_BY_ID[p];
    });
    if (!ok) continue;
    chain.push(c);
    seen.add(c.id);
  }
  return chain;
}
