import { ArrowLeft, Check, CheckCircle2, Circle, ExternalLink, Hammer, Lightbulb, Play, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import CodeEditor from '../components/CodeEditor';
import { Badge, Button, Card, color, DIFFICULTY_COLOR, EmptyState, PageHeader, PageShell, SectionTitle } from '../components/ui';
import {
  type Artifact,
  ARTIFACTS,
  type ArtifactStatus,
  CONCEPT_BY_ID,
  DRILL_BY_ID,
} from '../data/learning-os';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useConceptMastery } from '../hooks/useConcepts';
import { type ArtifactEntry, type DrillEntry, useArtifactStore, useDrillStore } from '../hooks/useUserStore';
import type { Language } from '../types';

export default function BuildLab() {
  const { id } = useParams();
  // /drills/:id renders the drill workspace; /build renders the artifact board.
  if (id && DRILL_BY_ID[id]) return <DrillWorkspace drillId={id} />;
  return <ArtifactBoard />;
}

// --- Artifact board ---------------------------------------------------------

const COLUMNS: { status: ArtifactStatus; label: string; tone: string }[] = [
  { status: 'todo', label: 'To build', tone: 'gray' },
  { status: 'building', label: 'Building', tone: 'amber' },
  { status: 'shipped', label: 'Shipped', tone: 'emerald' },
];

function ArtifactBoard() {
  const { getArtifact, setArtifact } = useArtifactStore();
  const { review } = useConceptMastery();
  const [openId, setOpenId] = useState<string | null>(null);

  // Shipping an artifact closes the loop: it nudges every linked concept's
  // mastery upward, since a completed artifact is proof of learning.
  function handleChange(artifact: Artifact, prev: ArtifactEntry, next: ArtifactEntry) {
    setArtifact(artifact.id, next);
    if (next.status === 'shipped' && prev.status !== 'shipped') {
      for (const cid of artifact.concepts) void review(cid, 'good');
    }
  }

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Build Lab"
        title="Build Lab"
        subtitle="No learning without an artifact. Move each one from idea to shipped — code, benchmark, or design doc. Shipping nudges its concepts toward mastered."
        actions={
          <Link to="/playground" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">
            <Hammer className="h-4 w-4" /> Open workspace
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map(col => {
          const items = ARTIFACTS.filter(a => getArtifact(a.id).status === col.status);
          return (
            <div key={col.status}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${color(col.tone).solid}`} />
                <h2 className="text-sm font-semibold text-gray-200">{col.label}</h2>
                <span className="text-xs text-gray-600">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(a => (
                  <ArtifactCard
                    key={a.id}
                    artifact={a}
                    entry={getArtifact(a.id)}
                    open={openId === a.id}
                    onToggle={() => setOpenId(openId === a.id ? null : a.id)}
                    onChange={next => handleChange(a, getArtifact(a.id), next)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-800 py-6 text-center text-xs text-gray-600">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function ArtifactCard({
  artifact,
  entry,
  open,
  onToggle,
  onChange,
}: {
  artifact: Artifact;
  entry: ArtifactEntry;
  open: boolean;
  onToggle: () => void;
  onChange: (e: ArtifactEntry) => void;
}) {
  function toggleCriterion(i: number) {
    const has = entry.criteria.includes(i);
    onChange({ ...entry, criteria: has ? entry.criteria.filter(x => x !== i) : [...entry.criteria, i] });
  }

  const doneCount = entry.criteria.length;

  return (
    <Card className="p-3">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">{artifact.title}</h3>
          <Badge tone={DIFFICULTY_COLOR[artifact.difficulty]}>{artifact.difficulty}</Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-gray-400">{artifact.description}</p>
        <div className="mt-2 text-[11px] text-gray-500">
          {doneCount}/{artifact.successCriteria.length} criteria met
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-gray-800 pt-3">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Success criteria</div>
            <div className="space-y-1">
              {artifact.successCriteria.map((c, i) => (
                <button key={i} onClick={() => toggleCriterion(i)} className="flex w-full items-start gap-2 text-left text-xs text-gray-300">
                  {entry.criteria.includes(i)
                    ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    : <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600" />}
                  <span className={entry.criteria.includes(i) ? 'text-gray-500 line-through' : ''}>{c}</span>
                </button>
              ))}
            </div>
          </div>

          <input
            value={entry.url}
            onChange={e => onChange({ ...entry, url: e.target.value })}
            placeholder="Link to commit / PR / demo / notes"
            className="w-full rounded-md border border-gray-800 bg-gray-950 px-2 py-1.5 text-xs text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
          />

          <div className="flex flex-wrap gap-1.5">
            {COLUMNS.map(col => (
              <Button
                key={col.status}
                tone={entry.status === col.status ? 'primary' : 'ghost'}
                onClick={() => onChange({ ...entry, status: col.status })}
              >
                {entry.status === col.status && <Check className="h-3 w-3" />}
                {col.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {artifact.concepts.map(cid => (
              <Link
                key={cid}
                to={`/concepts/${cid}`}
                className="rounded-md border border-gray-800 px-2 py-0.5 text-[11px] text-gray-400 hover:text-white"
              >
                {CONCEPT_BY_ID[cid]?.name || cid}
              </Link>
            ))}
          </div>

          {entry.url && (
            <a href={entry.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-purple-400">
              Open artifact <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

// --- Drill workspace --------------------------------------------------------

const STARTER: Record<Language, string> = {
  typescript: '// Write your solution here\n\nfunction solve() {\n  \n}\n\nconsole.log(solve());\n',
  javascript: '// Write your solution here\n\nfunction solve() {\n  \n}\n\nconsole.log(solve());\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hello")\n}\n',
};

const LANGUAGES: Language[] = ['typescript', 'go'];

function DrillWorkspace({ drillId }: { drillId: string }) {
  const drill = DRILL_BY_ID[drillId];
  const { getDrill, setDrill } = useDrillStore();
  const { review } = useConceptMastery();
  const { output, errors, isRunning, execute } = useCodeExecution();
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const entry = getDrill(drillId);
  const [language, setLanguage] = useState<Language>('typescript');
  const [code, setCode] = useState(entry.lastCode || STARTER.typescript);

  if (!drill) {
    return (
      <PageShell>
        <EmptyState title="Drill not found" />
      </PageShell>
    );
  }

  const concept = CONCEPT_BY_ID[drill.conceptId];

  function run() {
    void execute(code, [], language);
  }

  function mark(status: DrillEntry['status']) {
    setDrill(drillId, { status, lastCode: code, attempts: entry.attempts });
    // Solving a drill closes the loop — it nudges the concept toward mastery.
    if (status === 'solved') void review(drill!.conceptId, 'good');
  }

  function switchLanguage(lang: Language) {
    setLanguage(lang);
    const isStarter = !code.trim() || Object.values(STARTER).includes(code);
    if (isStarter) setCode(STARTER[lang]);
  }

  return (
    <PageShell wide>
      <Link to="/drills" className="mb-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Drills
      </Link>

      <div className="mb-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge tone={DIFFICULTY_COLOR[drill.difficulty]}>{drill.difficulty}</Badge>
          <Badge tone="gray">{drill.type}</Badge>
          {concept && (
            <Link to={`/concepts/${concept.id}`}>
              <Badge tone="purple">{concept.name}</Badge>
            </Link>
          )}
          <Badge tone={entry.status === 'solved' ? 'emerald' : entry.status === 'attempted' ? 'amber' : 'gray'}>
            {entry.status}{entry.attempts > 0 ? ` · ${entry.attempts} attempts` : ''}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">{drill.title}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card className="p-4">
            <SectionTitle>Prompt</SectionTitle>
            <p className="text-sm leading-relaxed text-gray-300">{drill.prompt}</p>
            <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Expected output</div>
              <p className="mt-1 text-sm text-gray-400">{drill.expectedOutput}</p>
            </div>
          </Card>

          <Card className="p-4">
            <button onClick={() => setShowHints(s => !s)} className="flex w-full items-center gap-1.5 text-sm font-semibold text-amber-300">
              <Lightbulb className="h-4 w-4" /> {showHints ? 'Hide' : 'Show'} hints ({drill.hints.length})
            </button>
            {showHints && (
              <ul className="mt-2 space-y-1.5">
                {drill.hints.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" /> {h}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <button onClick={() => setShowSolution(s => !s)} className="flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
              <Sparkles className="h-4 w-4" /> {showSolution ? 'Hide' : 'Show'} solution notes
            </button>
            {showSolution && <p className="mt-2 text-xs leading-relaxed text-gray-400">{drill.solutionNotes}</p>}
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2">
              <div className="flex gap-1">
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => switchLanguage(l)}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${language === l ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button tone="subtle" onClick={run} disabled={isRunning}>
                <Play className="h-3.5 w-3.5" /> {isRunning ? 'Running…' : 'Run'}
              </Button>
            </div>
            <div className="h-[320px]">
              <CodeEditor code={code} language={language} onChange={v => setCode(v || '')} onRun={run} />
            </div>
          </Card>

          <Card className="p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Output</div>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-gray-300">
              {errors
                ? <span className="text-rose-400">{errors}</span>
                : output || <span className="text-gray-600">Run your code to see output.</span>}
            </pre>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <Button tone="ghost" onClick={() => mark('attempted')}>Save attempt</Button>
            <Button onClick={() => mark('solved')}>
              <Check className="h-4 w-4" /> Mark solved
            </Button>
            <Link to="/playground" className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800">
              <Hammer className="h-4 w-4" /> Full workspace
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
