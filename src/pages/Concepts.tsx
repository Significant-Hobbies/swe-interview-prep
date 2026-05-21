import { CalendarDays, FlaskConical, Loader2, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  PERSONAL_DATABASE_TRACK,
  PERSONAL_INFRA_TRACK,
  PERSONAL_RUNTIME_TRACK,
  type PersonalRoadmapNode,
  type PersonalRoadmapPhase,
} from '../data/runtime-roadmaps';
import { ALL_CONCEPTS, type Concept, type MasteryEntry,useConceptMastery } from '../hooks/useConcepts';
import { buildWeaknessStudyPlan, type WeaknessPlanItem } from '../lib/studyPlanner';

const CATEGORIES = [
  { id: 'dsa', name: 'DSA', color: 'blue' },
  { id: 'lld', name: 'LLD', color: 'amber' },
  { id: 'hld', name: 'HLD', color: 'emerald' },
  { id: 'behavioral', name: 'Behavioral', color: 'purple' },
] as const;

function confidenceColor(conf: number): string {
  if (conf >= 0.85) return 'bg-green-500/30 border-green-500/50 text-green-300';
  if (conf >= 0.6) return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
  if (conf >= 0.3) return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
  if (conf > 0) return 'bg-red-500/20 border-red-500/40 text-red-300';
  return 'bg-gray-800 border-gray-700 text-gray-500';
}

function isDue(due?: string | null): boolean {
  if (!due) return true;
  return new Date(due) <= new Date();
}

export default function Concepts() {
  const { mastery, loading, review } = useConceptMastery();
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Concept | null>(null);

  const grouped = useMemo(() => {
    const out: Record<string, Concept[]> = {};
    for (const c of ALL_CONCEPTS) {
      if (filter !== 'all' && c.category !== filter) continue;
      out[c.category] ||= [];
      out[c.category].push(c);
    }
    return out;
  }, [filter]);

  const stats = useMemo(() => {
    const entries = Object.values(mastery);
    const touched = entries.length;
    const due = entries.filter(e => isDue(e.due)).length;
    const rotting = entries.filter(e => e.confidence > 0 && e.confidence < 0.5).length;
    const strong = entries.filter(e => e.confidence >= 0.85).length;
    return { touched, due, rotting, strong, total: ALL_CONCEPTS.length };
  }, [mastery]);

  const studyPlan = useMemo(() => buildWeaknessStudyPlan(ALL_CONCEPTS, mastery), [mastery]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Concept Graph</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mastery decays over time. Red rots fastest.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="Touched" value={`${stats.touched}/${stats.total}`} />
        <Stat label="Due" value={stats.due} accent="red" />
        <Stat label="Rotting" value={stats.rotting} accent="orange" />
        <Stat label="Strong" value={stats.strong} accent="green" />
        <Stat label="Untouched" value={stats.total - stats.touched} accent="gray" />
      </div>

      <DeepDiveRoadmaps />

      <WeaknessPlanner plan={studyPlan} />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterBtn>
        {CATEGORIES.map(c => (
          <FilterBtn key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.name}</FilterBtn>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading mastery…
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, concepts]) => (
          <section key={cat}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{CATEGORIES.find(c => c.id === cat)?.name}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {concepts.map(c => {
                const m = mastery[c.id];
                const conf = m?.confidence ?? 0;
                const due = isDue(m?.due);
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`relative rounded-lg border p-3 text-left transition-all hover:scale-[1.02] ${confidenceColor(conf)}`}
                  >
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] opacity-70">
                      <span>{m ? `${Math.round(conf * 100)}%` : '0%'}</span>
                      {m && due && <span className="rounded bg-black/30 px-1">due</span>}
                    </div>
                    {m && (
                      <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-black/40">
                        <div className="h-full bg-current transition-all" style={{ width: `${conf * 100}%` }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <ConceptDrawer
          concept={selected}
          mastery={mastery[selected.id]}
          onClose={() => setSelected(null)}
          onReview={(rating) => review(selected.id, rating)}
        />
      )}
    </div>
  );
}

const PERSONAL_TRACKS = [
  {
    id: 'runtime',
    title: 'Runtime',
    eyebrow: 'Code execution',
    description: 'How code runs, blocks, allocates, ships, and fails.',
    phases: PERSONAL_RUNTIME_TRACK,
  },
  {
    id: 'database',
    title: 'DB',
    eyebrow: 'Product truth',
    description: 'Schema design, query plans, transactions, caches, analytics, backfills.',
    phases: PERSONAL_DATABASE_TRACK,
  },
  {
    id: 'infra',
    title: 'Infra',
    eyebrow: 'Production control',
    description: 'Linux, Docker, config, CI/CD, Cloudflare, observability, rollbacks.',
    phases: PERSONAL_INFRA_TRACK,
  },
] as const;

type PersonalTrackId = (typeof PERSONAL_TRACKS)[number]['id'];
type PersonalTrack = {
  id: PersonalTrackId;
  title: string;
  eyebrow: string;
  description: string;
  phases: PersonalRoadmapPhase[];
};

function roadmapNodeKey(phase: PersonalRoadmapPhase, node: PersonalRoadmapNode) {
  return `${phase.id}:${node.title}`;
}

function DeepDiveRoadmaps() {
  const [trackId, setTrackId] = useState<PersonalTrackId>('runtime');
  const track = (PERSONAL_TRACKS.find(item => item.id === trackId) ?? PERSONAL_TRACKS[0]) as PersonalTrack;
  const nodes = track.phases.flatMap(phase =>
    phase.nodes.map(node => ({ phase, node, key: roadmapNodeKey(phase, node) }))
  );
  const [selectedKey, setSelectedKey] = useState(() =>
    roadmapNodeKey(PERSONAL_RUNTIME_TRACK[0], PERSONAL_RUNTIME_TRACK[0].nodes[0])
  );
  const selected = nodes.find(item => item.key === selectedKey) ?? nodes[0];

  const selectTrack = (id: PersonalTrackId) => {
    const next = (PERSONAL_TRACKS.find(item => item.id === id) ?? PERSONAL_TRACKS[0]) as PersonalTrack;
    setTrackId(id);
    const firstPhase = next.phases[0];
    const firstNode = firstPhase?.nodes[0];
    if (firstPhase && firstNode) {
      setSelectedKey(roadmapNodeKey(firstPhase, firstNode));
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
      <div className="border-b border-gray-800 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-100">
              <Target className="h-4 w-4 text-blue-400" />
              Deep-dive roadmap
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Pick one track and one node. Everything else stays as a compact outline.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-md border border-gray-800 bg-gray-900 p-1 sm:min-w-[340px]">
            {PERSONAL_TRACKS.map(item => (
              <button
                key={item.id}
                onClick={() => selectTrack(item.id)}
                className={`rounded px-3 py-2 text-xs font-medium transition-colors ${
                  trackId === item.id
                    ? 'bg-gray-100 text-gray-950'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-gray-800 lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-800 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              {track.eyebrow}
            </div>
            <div className="mt-1 text-sm font-medium text-gray-100">{track.title}</div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{track.description}</p>
          </div>
          <div className="max-h-[440px] overflow-y-auto p-3">
            {track.phases.map(phase => (
              <div key={phase.id} className="mb-4 last:mb-0">
                <div className="mb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {phase.title}
                  </div>
                </div>
                <div className="space-y-1">
                  {phase.nodes.map(node => (
                    <button
                      key={node.title}
                      onClick={() => setSelectedKey(roadmapNodeKey(phase, node))}
                      className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left transition-colors ${
                        selected?.key === roadmapNodeKey(phase, node)
                          ? 'border-blue-700 bg-blue-950/30'
                          : 'border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900'
                      }`}
                    >
                      <span className="min-w-0 truncate text-xs font-medium text-gray-200">
                        {node.title}
                      </span>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase ${nodeStatusClass(node.status)}`}>
                        {node.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && <RoadmapFocusPanel node={selected.node} phase={selected.phase} />}
      </div>
    </section>
  );
}

function RoadmapFocusPanel({ node, phase }: { node: PersonalRoadmapNode; phase: PersonalRoadmapPhase }) {
  const params = new URLSearchParams({
    task: 'explain',
    prompt: node.prompt,
  });
  const resource = roadmapResource(node);

  return (
    <div className="min-w-0 p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <span className="rounded bg-gray-900 px-2 py-1 text-[10px] uppercase text-gray-500">
              {phase.title}
            </span>
            <span className={`rounded px-2 py-1 text-[10px] uppercase ${nodeStatusClass(node.status)}`}>
              {node.status}
            </span>
            <span className="rounded bg-gray-900 px-2 py-1 text-[10px] uppercase text-gray-500">
              {node.lane}
            </span>
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-100">{node.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">{node.whyForYou}</p>
        </div>
        <div className="flex shrink-0 gap-2 sm:pt-1">
          <a
            href={resource.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-gray-700 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-900"
          >
            {resource.label}
          </a>
          <Link
            to={`/playground?${params}`}
            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            Ask AI
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-md border border-gray-800 bg-gray-900/40 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Learn
          </div>
          <div className="flex flex-wrap gap-1.5">
            {node.learn.map(item => (
              <span key={item} className="rounded border border-gray-800 bg-gray-950 px-2 py-1 text-xs text-gray-300">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-emerald-900/40 bg-emerald-950/10 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-400/80">
            Proof
          </div>
          <p className="text-sm leading-6 text-emerald-100/80">{node.proof}</p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-600">
        Ask AI opens this node with the right prompt prefilled.
      </p>
    </div>
  );
}

function roadmapResource(node: PersonalRoadmapNode) {
  if (node.lane === 'typescript') {
    return {
      label: 'TS Docs',
      href: 'https://www.typescriptlang.org/docs/',
    };
  }
  if (node.lane === 'python') {
    return {
      label: 'Py Docs',
      href: 'https://docs.python.org/3/',
    };
  }
  if (node.lane === 'go') {
    return {
      label: 'Go Docs',
      href: 'https://go.dev/doc/',
    };
  }
  if (node.lane === 'rust') {
    return {
      label: 'Rust Book',
      href: 'https://doc.rust-lang.org/book/',
    };
  }
  if (node.lane === 'database') {
    return {
      label: 'PG Docs',
      href: 'https://www.postgresql.org/docs/current/',
    };
  }
  if (node.lane === 'data') {
    return {
      label: 'SQLite',
      href: 'https://www.sqlite.org/docs.html',
    };
  }
  if (node.lane === 'infra') {
    return {
      label: 'Docker',
      href: 'https://docs.docker.com/',
    };
  }
  if (node.lane === 'devops') {
    return {
      label: 'Actions',
      href: 'https://docs.github.com/en/actions',
    };
  }
  if (node.lane === 'production') {
    return {
      label: 'OTel',
      href: 'https://opentelemetry.io/docs/',
    };
  }
  if (node.title.includes('Blocking')) {
    return {
      label: 'MDN',
      href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model',
    };
  }
  return {
    label: 'Linux',
    href: 'https://man7.org/linux/man-pages/man7/signal.7.html',
  };
}

function RoadmapLegend({ label, color }: { label: string; color: string }) {
  return <div className={`rounded px-2 py-1 text-center ${color}`}>{label}</div>;
}

function nodeStatusClass(status: PersonalRoadmapNode['status']) {
  if (status === 'now') return 'bg-emerald-500/20 text-emerald-300';
  if (status === 'next') return 'bg-blue-500/20 text-blue-300';
  if (status === 'later') return 'bg-amber-500/20 text-amber-300';
  return 'bg-gray-800 text-gray-400';
}

function practiceHref(item: WeaknessPlanItem): string {
  const params = new URLSearchParams({
    concept: item.concept.id,
    task: item.taskType,
    prompt: item.prompt,
  });
  return `/playground?${params}`;
}

function confidenceLabel(item: WeaknessPlanItem): string {
  if (item.confidence === null) return '0%';
  return `${Math.round(item.confidence * 100)}%`;
}

function WeaknessPlanner({ plan }: { plan: ReturnType<typeof buildWeaknessStudyPlan> }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-100">
            <Target className="h-4 w-4 text-purple-400" />
            Weakness-driven planner
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Ranked from FSRS confidence, due dates, lapses, untouched concepts, and prereq readiness.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right sm:grid-cols-4">
          <MiniStat label="Ready" value={plan.summary.readyWeaknesses} />
          <MiniStat label="Due" value={plan.summary.due} />
          <MiniStat label="Untouched" value={plan.summary.untouched} />
          <MiniStat label="Blocked" value={plan.summary.blockedWeaknesses} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="grid gap-2 sm:grid-cols-2">
          {plan.focus.slice(0, 4).map(item => (
            <Link
              key={item.concept.id}
              to={practiceHref(item)}
              className="group rounded-lg border border-gray-800 bg-gray-950/70 p-3 transition-colors hover:border-purple-700/60 hover:bg-purple-950/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-100">{item.concept.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wide text-gray-500">
                    <span>{item.concept.category}</span>
                    <span>·</span>
                    <span>{item.taskType}</span>
                    <span>·</span>
                    <span>{item.minutes}m</span>
                  </div>
                </div>
                <span className="rounded bg-black/40 px-2 py-0.5 text-xs text-purple-300">
                  {confidenceLabel(item)}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-gray-500">{item.reason}</p>
              {item.blockedBy.length > 0 && (
                <div className="mt-2 text-[10px] text-orange-300">Repair prereq first: {item.blockedBy.join(', ')}</div>
              )}
            </Link>
          ))}
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <CalendarDays className="h-3.5 w-3.5" />
            7-day rotation
          </div>
          <div className="space-y-2">
            {plan.schedule.map(day => (
              <Link
                key={`${day.dayIndex}-${day.item.concept.id}`}
                to={practiceHref(day.item)}
                className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-900"
              >
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">{day.label}</div>
                  <div className="truncate text-sm text-gray-200">{day.item.concept.name}</div>
                </div>
                <div className="shrink-0 text-right text-[10px] uppercase text-gray-600">
                  {day.item.taskType} · {day.item.minutes}m
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-gray-800 bg-gray-950 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wide text-gray-600">{label}</div>
      <div className="text-sm font-semibold text-gray-200">{value}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  const colorMap: Record<string, string> = {
    red: 'text-red-400', orange: 'text-orange-400', green: 'text-green-400', gray: 'text-gray-500',
  };
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${accent ? colorMap[accent] : 'text-gray-100'}`}>{value}</div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function ConceptDrawer({ concept, mastery, onClose, onReview }: {
  concept: Concept;
  mastery?: MasteryEntry;
  onClose: () => void;
  onReview: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-gray-800 px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-100">{concept.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{concept.description}</p>
        </div>
        <div className="space-y-4 p-5">
          {concept.prereqs.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Prereqs</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {concept.prereqs.map(p => (
                  <span key={p} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{p}</span>
                ))}
              </div>
            </div>
          )}
          {mastery && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Detail label="Confidence" value={`${Math.round(mastery.confidence * 100)}%`} />
              <Detail label="Reps" value={mastery.reps} />
              <Detail label="Lapses" value={mastery.lapses} />
              <Detail label="Next due" value={mastery.due ? new Date(mastery.due).toLocaleDateString() : '—'} />
            </div>
          )}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Self-rate</div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['again', 'hard', 'good', 'easy'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => { onReview(r); onClose(); }}
                  className={`rounded-md py-2 text-xs font-medium capitalize transition-colors ${
                    r === 'again' ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' :
                    r === 'hard' ? 'bg-orange-900/30 text-orange-300 hover:bg-orange-900/50' :
                    r === 'good' ? 'bg-green-900/30 text-green-300 hover:bg-green-900/50' :
                    'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                  }`}
                >{r}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/playground?concept=${concept.id}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <FlaskConical className="h-4 w-4" /> Practice in Playground
            </Link>
            <button
              onClick={onClose}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-gray-800 bg-gray-900/40 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-gray-600">{label}</div>
      <div className="text-sm text-gray-200">{value}</div>
    </div>
  );
}
