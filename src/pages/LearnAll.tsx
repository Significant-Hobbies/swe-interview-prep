import { ArrowLeft, ArrowRight, Hammer, Search, Target } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, CollapsiblePanel, color, DIFFICULTY_COLOR, EmptyState, FilterPill, PageHeader, PageShell, STATUS_META } from '../components/ui';
import {
  ConceptChain,
  type DonutSegment,
  MasteryDonut,
  MilestoneTimeline,
  StackedBar,
  type TimelineStep,
} from '../components/viz';
import {
  type Concept,
  CONCEPT_BY_ID,
  conceptsByTag,
  drillsForConcept,
  groupForTag,
  primaryGroup,
  type Roadmap,
  roadmapConceptIds,
  ROADMAPS,
  sortedTracks,
} from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { confidencePct, deriveConceptStatus, rollupMastery } from '../lib/conceptState';
import { pickDrillForConcept, pickNextConcept, weakConcepts } from '../lib/recommend';

type StatusFilter = 'all' | 'untouched' | 'active' | 'mastered';

const HORIZON: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

const STATUS_TONE: Record<string, string> = {
  'not-started': 'slate',
  learning: 'sky',
  drilling: 'amber',
  building: 'sky',
  review: 'sky',
  mastered: 'emerald',
};

const PRIMARY_ROADMAP_ID = 'ai-search-infra-90-day';

export default function Learn() {
  const { mastery, loading } = useConceptMastery();

  // The "active" roadmap is the one with the most progress, falling back to the
  // canonical 90-day path for a fresh user.
  const activeRoadmap = pickActiveRoadmap(mastery);
  const next = pickNextConcept(mastery);
  const nextDrill = next ? pickDrillForConcept(next.id) : null;
  const upNext = pickUpNextChain(mastery, 4);

  return (
    <PageShell wide>
      <Link
        to="/learn"
        className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Learn
      </Link>
      <PageHeader
        title="Everything in Learn"
        subtitle={`${ROADMAPS.length} roadmaps · ${ALL_CONCEPTS.length} concepts · 8 tracks. Search, browse, switch roadmaps.`}
      />

      <ActivePathHero
        roadmap={activeRoadmap}
        nextConcept={next}
        nextDrillTitle={nextDrill?.title}
        upNext={upNext}
        mastery={mastery}
      />

      <WeakAreasPanel mastery={mastery} loading={loading} />

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
    <div className="rounded-xl border border-slate-800 bg-slate-900/40">
      <div className="p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
          <span>Active roadmap · {HORIZON[roadmap.horizon]}</span>
          <span className="text-slate-600">·</span>
          <span>{roadmap.tracks.length} tracks</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">{roadmap.title}</h2>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-semibold tabular-nums text-slate-50">{Math.round(pct * 100)}%</div>
            <div className="text-xs text-slate-500">{roll.mastered} of {ids.length} mastered</div>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-400">{roadmap.goal}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-sky-500 transition-[width] duration-300" style={{ width: `${pct * 100}%` }} />
        </div>
        {activeMilestone && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span><span className="text-slate-200">Milestone {pickActiveMilestoneIdx(roadmap, mastery) + 1} of {roadmap.milestones.length}</span> · {activeMilestone.title.split(' — ')[0]}</span>
            <span className="text-slate-600">·</span>
            <span>{ids.length - roll.untouched} started</span>
            <span className="text-slate-600">·</span>
            <span className={roll.due ? 'text-amber-300' : ''}>{roll.due} due</span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800/80 px-5 py-4 sm:px-6">
        <MilestoneTimeline steps={timelineSteps} />
      </div>

      {nextConcept && (
        <div className="grid gap-px border-t border-slate-800/80 bg-slate-800/40 sm:grid-cols-[1fr_auto]">
          <div className="bg-slate-900/40 p-5 sm:p-6">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-sky-400">
              <Target className="h-3.5 w-3.5" /> Up next
            </div>
            <Link to={`/concepts/${nextConcept.id}`} className="group inline-flex items-center gap-1 text-lg font-semibold text-slate-50 transition-colors hover:text-sky-300">
              {nextConcept.name}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <p className="mt-0.5 line-clamp-1 text-sm text-slate-400">{nextConcept.description}</p>
            {nextDrillTitle && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <Hammer className="h-3 w-3 text-slate-500" /> Pair with drill: <span className="text-slate-200">{nextDrillTitle}</span>
              </div>
            )}
          </div>

          {upNext.length > 1 && (
            <div className="hidden bg-slate-900/40 p-5 sm:block sm:p-6">
              <div className="mb-2 text-xs font-medium text-slate-400">After that</div>
              <div className="space-y-1.5">
                {upNext.slice(1, 4).map(c => (
                  <Link key={c.id} to={`/concepts/${c.id}`} className="block truncate text-sm text-slate-400 transition-colors hover:text-slate-200">
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

// --- Weak areas panel -------------------------------------------------------

function WeakAreasPanel({ mastery, loading }: { mastery: Record<string, MasteryEntry>; loading: boolean }) {
  const weak = weakConcepts(mastery, 4);
  const hasAnyMastery = Object.keys(mastery).length > 0;

  return (
    <section className="mt-6">
      <SectionHeader
        title="Weak areas"
        subtitle="Concepts you've started but whose confidence is still low — review or drill to strengthen them."
      />
      {loading && !hasAnyMastery ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      ) : weak.length === 0 ? (
        <EmptyState
          title={hasAnyMastery ? 'No weak areas right now' : 'Start a concept to see weak areas'}
          hint={
            hasAnyMastery
              ? 'Your weakest concepts will surface here as confidence decays or you start new ones.'
              : 'Rate your first concept review to begin tracking mastery.'
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {weak.map(c => {
            const m = mastery[c.id];
            const drill = pickDrillForConcept(c.id);
            const trk = primaryGroup(c);
            const pct = confidencePct(m);
            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors duration-150 hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/concepts/${c.id}`}
                      className="line-clamp-1 text-sm font-semibold text-slate-100 transition-colors hover:text-sky-300"
                    >
                      {c.name}
                    </Link>
                    {trk && <div className="mt-0.5 text-xs text-slate-500">{trk.short}</div>}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-amber-300">{pct}%</span>
                </div>
                <div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {m?.reps ?? 0} rep{(m?.reps ?? 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link
                    to="/practice?tab=reviews"
                    className="flex-1 rounded-md border border-slate-700 py-1.5 text-center text-xs font-medium text-slate-200 transition-colors duration-150 hover:border-slate-600 hover:bg-slate-800"
                  >
                    Review
                  </Link>
                  {drill && (
                    <Link
                      to={`/drills/${drill.id}`}
                      className="flex-1 rounded-md bg-sky-500 py-1.5 text-center text-xs font-medium text-slate-950 transition-colors duration-150 hover:bg-sky-400"
                    >
                      Drill
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// --- Mastery panel (donut + per-track) -------------------------------------

function MasteryPanel({ mastery }: { mastery: Record<string, MasteryEntry> }) {
  const tracks = sortedTracks();
  const segments: DonutSegment[] = tracks.map(t => {
    const ids = conceptsByTag(t.id).map(c => c.id);
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-3 text-xs font-medium text-slate-400">Mastery by track</div>
      <div className="flex flex-col items-center gap-3">
        <MasteryDonut segments={segments} size={180} thickness={16} />
        <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {segments.map(s => (
            <li key={s.id} className="flex items-center gap-1.5 truncate">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color(s.tone).solid}`} />
              <span className="truncate text-slate-300">{s.label}</span>
              <span className="ml-auto tabular-nums text-slate-500">{s.mastered}/{s.total}</span>
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-3 text-xs font-medium text-slate-400">All roadmaps</div>
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
              className={`group block rounded-lg border p-3 transition-colors duration-150 ${
                isActive
                  ? 'border-sky-500/40 bg-sky-500/5'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{HORIZON[r.horizon]}</span>
                {isActive && <span className="text-xs font-medium text-sky-300">Active</span>}
              </div>
              <h3 className="truncate text-sm font-semibold text-slate-100">{r.title}</h3>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                <div className={`h-full rounded-full ${isActive ? 'bg-sky-500' : 'bg-emerald-500'}`} style={{ width: `${pct * 100}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>{r.milestones.length} milestones</span>
                <span className="tabular-nums">{roll.mastered}/{ids.length}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// --- Track lane ------------------------------------------------------------

function TrackLane({ trackId, mastery }: { trackId: string; mastery: Record<string, MasteryEntry> }) {
  const track = groupForTag(trackId);
  if (!track) return null;
  const concepts = [...conceptsByTag(trackId)].sort((a, b) => b.priority - a.priority);
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
    { count: roll.learning, tone: 'sky', label: 'Learning' },
    { count: roll.untouched, tone: 'slate', label: 'Not started' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color(track.color).solid}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-slate-100">{track.title}</h3>
            <span className="text-[11px] text-slate-500">{concepts.length} concepts</span>
          </div>
          <p className="line-clamp-1 text-[11px] text-slate-500">{track.description}</p>
        </div>
        <div className="shrink-0 text-right text-[11px] text-slate-500">
          <div className="font-mono text-slate-300">{roll.mastered}/{concepts.length}</div>
          <div className="text-[10px]">mastered</div>
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
  const [group, setGroup] = useState<string | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const tracks = sortedTracks();
  const q = query.trim().toLowerCase();

  const filtered = ALL_CONCEPTS.filter(c => {
    if (group !== 'all' && !c.tags.includes(group)) return false;
    const st = deriveConceptStatus(mastery[c.id]);
    if (status === 'untouched' && st !== 'not-started') return false;
    if (status === 'mastered' && st !== 'mastered') return false;
    if (status === 'active' && (st === 'not-started' || st === 'mastered')) return false;
    if (q && !`${c.name} ${c.description} ${c.tags.join(' ')}`.toLowerCase().includes(q)) return false;
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search concepts…"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none"
          />
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterPill active={group === 'all'} onClick={() => setGroup('all')}>All</FilterPill>
          {tracks.map(t => (
            <FilterPill key={t.id} active={group === t.id} tone={t.color} onClick={() => setGroup(t.id)}>
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
  const trk = primaryGroup(concept);
  const sparse = !concept.mentalModel || !(concept.resources?.length ?? 0);
  return (
    <Link
      to={`/concepts/${concept.id}`}
      className="group flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/40 p-3 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-100 group-hover:text-white">{concept.name}</h3>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-slate-400" />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <Badge tone={meta.color}>{meta.label}</Badge>
        <Badge tone={DIFFICULTY_COLOR[concept.difficulty]}>{concept.difficulty}</Badge>
        {trk && <span className="text-slate-500">{trk.short}</span>}
        {drills > 0 && <span className="text-slate-500">· {drills} drill{drills > 1 ? 's' : ''}</span>}
        {mastery && <span className="text-slate-500">· {confidencePct(mastery)}%</span>}
        {sparse && <span className="text-slate-600" title="Links-first concept (no mental model authored)">·</span>}
      </div>
    </Link>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-medium text-slate-400">{title}</h2>
      <p className="text-[11px] text-slate-500">{subtitle}</p>
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
