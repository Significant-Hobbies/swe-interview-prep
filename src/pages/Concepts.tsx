import { BookOpen, CalendarDays, FlaskConical, Layers3, Loader2, Rocket, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  COMPARATIVE_PROJECT,
  FOUNDATION_CONCEPTS,
  PERSONAL_RUNTIME_TRACK,
  type PersonalRoadmapNode,
  RUNTIME_LAYERS,
  RUNTIME_ROADMAPS,
  type RuntimeRoadmap,
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

      <PersonalRuntimeRoadmap />

      <RuntimeRoadmapPlanner />

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
                      <span>{m ? `${Math.round(conf * 100)}%` : 'new'}</span>
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

function PersonalRuntimeRoadmap() {
  return (
    <section className="mb-6 rounded-xl border border-blue-900/40 bg-blue-950/10 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-100">
            <Target className="h-4 w-4 text-blue-400" />
            Sarthak runtime path
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            A precise path for shipping and debugging your fleet: TypeScript + Python first,
            Go for backend infrastructure, Rust selectively for correctness and tooling.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[10px] uppercase tracking-wide">
          <RoadmapLegend label="Now" color="bg-emerald-500/20 text-emerald-300" />
          <RoadmapLegend label="Next" color="bg-blue-500/20 text-blue-300" />
          <RoadmapLegend label="Later" color="bg-amber-500/20 text-amber-300" />
          <RoadmapLegend label="Defer" color="bg-gray-800 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {PERSONAL_RUNTIME_TRACK.map((phase, phaseIndex) => (
          <div key={phase.id} className="relative rounded-lg border border-gray-800 bg-gray-950/80 p-3">
            {phaseIndex < PERSONAL_RUNTIME_TRACK.length - 1 && (
              <div className="pointer-events-none absolute right-[-1rem] top-10 hidden h-px w-4 bg-blue-900/60 xl:block" />
            )}
            <div className="mb-3">
              <div className="text-sm font-semibold text-gray-100">{phase.title}</div>
              <p className="mt-1 text-xs leading-5 text-gray-500">{phase.goal}</p>
            </div>
            <div className="space-y-2">
              {phase.nodes.map(node => (
                <PersonalRoadmapCard key={node.title} node={node} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PersonalRoadmapCard({ node }: { node: PersonalRoadmapNode }) {
  const params = new URLSearchParams({
    task: 'explain',
    prompt: node.prompt,
  });
  const resource = roadmapResource(node);

  return (
    <div className={`rounded-md border p-3 ${nodeBorderClass(node)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-100">{node.title}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${nodeStatusClass(node.status)}`}>
              {node.status}
            </span>
            <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] uppercase text-gray-500">
              {node.lane}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <a
            href={resource.href}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-gray-700 px-2 py-1 text-[10px] font-medium text-gray-300 hover:bg-gray-800"
          >
            {resource.label}
          </a>
          <Link
            to={`/playground?${params}`}
            className="rounded border border-blue-800 bg-blue-950/30 px-2 py-1 text-[10px] font-medium text-blue-300 hover:bg-blue-900/40"
          >
            Ask AI
          </Link>
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-gray-400">{node.whyForYou}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {node.learn.map(item => (
          <span key={item} className="rounded bg-gray-900 px-1.5 py-0.5 text-[11px] text-gray-500">
            {item}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-emerald-300/80">Proof: {node.proof}</p>
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

function nodeBorderClass(node: PersonalRoadmapNode) {
  const laneClasses: Record<PersonalRoadmapNode['lane'], string> = {
    foundation: 'border-sky-900/50 bg-sky-950/10',
    typescript: 'border-blue-900/50 bg-blue-950/10',
    python: 'border-yellow-900/50 bg-yellow-950/10',
    go: 'border-cyan-900/50 bg-cyan-950/10',
    rust: 'border-orange-900/50 bg-orange-950/10',
    production: 'border-emerald-900/50 bg-emerald-950/10',
  };
  return laneClasses[node.lane];
}

function RuntimeRoadmapPlanner() {
  const [selectedId, setSelectedId] = useState<RuntimeRoadmap['id']>('javascript');
  const selected =
    RUNTIME_ROADMAPS.find(roadmap => roadmap.id === selectedId) ?? RUNTIME_ROADMAPS[0];
  const projectParams = new URLSearchParams({
    task: 'build',
    prompt: `${COMPARATIVE_PROJECT.name}: ${COMPARATIVE_PROJECT.prompt} Start with the ${selected.name} version and call out what the runtime teaches.`,
  });

  return (
    <section className="mb-6 rounded-xl border border-gray-800 bg-gray-900/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-100">
            <Layers3 className="h-4 w-4 text-blue-400" />
            Runtime roadmap
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            Learn JavaScript, Python, Go, and Rust as runtime philosophies: how code runs, blocks,
            allocates, ships, scales, and fails.
          </p>
        </div>
        <Link
          to={`/playground?${projectParams}`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Rocket className="h-3.5 w-3.5" />
          Build shared project
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <BookOpen className="h-3.5 w-3.5" />
              Foundation first
            </div>
            <div className="grid gap-2">
              {FOUNDATION_CONCEPTS.map(concept => (
                <div key={concept.name} className="rounded-md border border-gray-800 bg-gray-900/60 p-2">
                  <div className="text-xs font-medium text-gray-200">{concept.name}</div>
                  <p className="mt-1 text-[11px] leading-5 text-gray-500">{concept.why}</p>
                  <p className="mt-1 text-[11px] leading-5 text-blue-300/80">Drill: {concept.drill}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Universal layers
            </div>
            <div className="grid gap-2">
              {RUNTIME_LAYERS.map((layer, index) => (
                <div
                  key={layer.name}
                  className="rounded-md bg-gray-900/60 p-2 text-xs text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-gray-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-gray-200">{layer.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-gray-500">{layer.build}</p>
                  <p className="mt-1 text-[11px] leading-5 text-emerald-300/80">Prove: {layer.prove}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {RUNTIME_ROADMAPS.map(roadmap => (
              <button
                key={roadmap.id}
                onClick={() => setSelectedId(roadmap.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedId === roadmap.id
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                {roadmap.name}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-blue-900/30 bg-blue-950/10 p-3">
            <div className="text-sm font-semibold text-gray-100">{selected.name}</div>
            <div className="mt-1 text-xs text-blue-300">{selected.philosophy}</div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <RoadmapDetail label="Runtime" value={selected.runtimeModel} />
            <RoadmapDetail label="Memory" value={selected.memoryModel} />
            <RoadmapDetail label="Concurrency" value={selected.concurrencyModel} />
            <RoadmapDetail label="Package/build" value={selected.packaging} />
            <RoadmapDetail label="Deployment" value={selected.deployment} />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <RoadmapList title="Must understand" items={selected.mustUnderstand} />
            <RoadmapList title="Then learn" items={selected.thenLearn} />
            <RoadmapList title="Build" items={selected.builds} />
            <RoadmapList title="Explain" items={selected.checklist} />
            <RoadmapList title="Avoid" items={selected.traps} />
          </div>

          <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Filled layer plan for {selected.name}
            </div>
            <div className="mt-3 grid gap-2">
              {selected.layerPlan.map(layer => (
                <div key={layer.name} className="rounded-md border border-gray-800 bg-gray-950/70 p-3">
                  <div className="text-sm font-medium text-gray-100">{layer.name}</div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <RoadmapMiniList title="Ask" items={layer.questions} />
                    <RoadmapMiniList title="Learn" items={layer.learn} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-blue-300/80">Build: {layer.build}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-300/80">Prove: {layer.prove}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Shared project: {COMPARATIVE_PROJECT.name}
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-400">{COMPARATIVE_PROJECT.prompt}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COMPARATIVE_PROJECT.features.map(feature => (
                <span key={feature} className="rounded border border-gray-800 bg-gray-950 px-2 py-1 text-[11px] text-gray-400">
                  {feature}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs leading-6 text-gray-500">
              Sequence: {COMPARATIVE_PROJECT.sequence.join(' -> ')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-800 bg-gray-900/40 p-2">
      <div className="text-[10px] uppercase tracking-wide text-gray-600">{label}</div>
      <div className="mt-1 text-xs leading-5 text-gray-300">{value}</div>
    </div>
  );
}

function RoadmapList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{title}</div>
      <ul className="space-y-1 text-xs text-gray-400">
        {items.map(item => (
          <li key={item} className="rounded bg-gray-900/60 px-2 py-1 leading-5">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function RoadmapMiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span key={item} className="rounded bg-gray-900 px-1.5 py-0.5 text-[11px] text-gray-400">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
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
  if (item.confidence === null) return 'new';
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
          <MiniStat label="New" value={plan.summary.untouched} />
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
