import { ArrowRight, Brain, CheckCircle2, Clock, Lock, MessageSquare, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  type MockInterviewSession,
  type MockInterviewType,
  type MockTurn,
  startMockInterview,
  submitMockTurn,
  summarizeMockInterview,
} from '../lib/mockInterview';

const STORAGE_KEY = 'loop-mock-interview-session';

function loadSession(): MockInterviewSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: MockInterviewSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export default function MockInterview() {
  const [role, setRole] = useState('Senior frontend engineer');
  const [minutes, setMinutes] = useState(45);
  const [mix, setMix] = useState<MockInterviewType[]>(['dsa', 'hld', 'behavioral']);
  const [session, setSession] = useState<MockInterviewSession | null>(() => loadSession());
  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [diagramText, setDiagramText] = useState('');
  const summary = useMemo(() => (session ? summarizeMockInterview(session) : null), [session]);
  const current = session?.turns[session.currentTurn] ?? null;

  const start = () => {
    const next = startMockInterview({ role, minutes, mix });
    saveSession(next);
    setSession(next);
    setAnswer('');
    setCode('');
    setDiagramText('');
  };

  const submit = () => {
    if (!session || !answer.trim()) return;
    const next = submitMockTurn(session, { answer, code, diagramText });
    saveSession(next);
    setSession(next);
    setAnswer('');
    setCode('');
    setDiagramText('');
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setAnswer('');
    setCode('');
    setDiagramText('');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-100">
            <Brain className="h-6 w-6 text-purple-400" />
            Mock interview
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            A timed full-loop session across coding, design, and behavioral prompts.
          </p>
        </div>
        {session && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-900"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>

      {!session ? (
        <div className="space-y-4">
          <section className="grid gap-4 rounded-xl border border-gray-800 bg-gray-900/40 p-5 md:grid-cols-[1fr_auto]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-gray-500">Target role</span>
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-gray-500">Minutes</span>
                <input
                  type="number"
                  min={15}
                  max={120}
                  value={minutes}
                  onChange={(event) => setMinutes(Number(event.target.value))}
                  className="mt-2 w-40 rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500"
                />
              </label>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">Mix</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['dsa', 'lld', 'hld', 'behavioral'] as MockInterviewType[]).map((type) => {
                    const active = mix.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() =>
                          setMix((prev) =>
                            active ? prev.filter((row) => row !== type) : [...prev, type],
                          )
                        }
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                          active
                            ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                            : 'border-gray-800 text-gray-400 hover:bg-gray-900'
                        }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={start}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-700"
            >
              <Play className="h-4 w-4" />
              Start practice
            </button>
          </section>
          <SampleFeedbackPanel />
          <PaidMockPackPreview />
          <ScoreExplainerPanel />
        </div>
      ) : session.status === 'complete' && summary ? (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Overall" value={`${summary.overall}/100`} />
            <Stat label="Turns" value={summary.turnsCompleted} />
            <Stat label="Review cards" value={summary.reviewCards.length} />
          </div>
          {(() => {
            const weak = deriveWeakTopic(session.turns);
            if (!weak) return null;
            return (
              <NextStepCard
                topic={weak.label}
                score={weak.score}
                action={NEXT_STEP_ACTIONS[weak.label] ?? `Focus on improving your ${weak.label.toLowerCase()} in Practice → Drills.`}
              />
            );
          })()}
          <ScoreExplainerPanel />
          <Panel title="Missed patterns">
            {summary.missedPatterns.length === 0 ? (
              <p className="text-sm text-gray-500">No major missed patterns.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {summary.missedPatterns.map((pattern) => (
                  <span key={pattern} className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-300">
                    {pattern}
                  </span>
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Generated review cards">
            <div className="grid gap-3 md:grid-cols-2">
              {summary.reviewCards.map((card) => (
                <div key={card.id} className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                  <div className="text-sm font-medium text-gray-100">{card.front}</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-500">{card.back}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Turn {(session.currentTurn ?? 0) + 1} of {session.turns.length}
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {session.minutes} min
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-100">{current?.prompt}</h2>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={8}
              placeholder="Talk through your answer as if the interviewer is listening..."
              className="mt-5 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500"
            />
            <textarea
              value={code}
              onChange={(event) => setCode(event.target.value)}
              rows={5}
              placeholder="Optional code from Playground..."
              className="mt-3 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-100 outline-none focus:border-purple-500"
            />
            <textarea
              value={diagramText}
              onChange={(event) => setDiagramText(event.target.value)}
              rows={3}
              placeholder="Optional diagram summary from the design panel..."
              className="mt-3 w-full rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-purple-500"
            />
            <button
              onClick={submit}
              disabled={!answer.trim()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit answer
            </button>
          </div>
          <Panel title="Transcript">
            <div className="space-y-3">
              {session.transcript.map((entry, index) => (
                <div key={`${entry.speaker}-${index}`} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {entry.speaker}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-300">{entry.text}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-100">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {children}
    </div>
  );
}

function ScoreExplainerPanel() {
  const dimensions: Array<{
    label: string;
    color: string;
    up: string[];
    down: string[];
  }> = [
    {
      label: 'Clarity',
      color: 'bg-blue-500',
      up: ['Use examples, scenarios, or metrics', 'Aim for 30+ words per question'],
      down: ['One-line or vague answers', 'No concrete examples'],
    },
    {
      label: 'Correctness',
      color: 'bg-green-500',
      up: [
        'DSA: state time/space complexity (e.g. O(n log n))',
        'HLD/LLD: paste a diagram summary',
        'Include code for DSA answers',
        'Mention testing or test cases',
      ],
      down: ['Skip complexity on DSA questions', 'No diagram on design questions'],
    },
    {
      label: 'Tradeoffs',
      color: 'bg-yellow-500',
      up: ['Say "tradeoff", "latency", "memory", "cost", or "consistency"', 'Compare two approaches explicitly'],
      down: ['Present one solution without weighing alternatives'],
    },
    {
      label: 'Communication',
      color: 'bg-purple-500',
      up: ['Break answer into sections using line breaks', 'Longer structured answers score higher'],
      down: ['Single-paragraph wall of text with no structure'],
    },
  ];

  return (
    <Panel title="What moves your score">
      <div className="grid gap-4 sm:grid-cols-2">
        {dimensions.map(({ label, color, up, down }) => (
          <div key={label} className="rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
              <span className="text-sm font-medium text-gray-200">{label}</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wide text-green-500">Raises score</p>
                <ul className="space-y-1">
                  {up.map((tip) => (
                    <li key={tip} className="text-xs text-gray-400">↑ {tip}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-wide text-red-500">Lowers score</p>
                <ul className="space-y-1">
                  {down.map((tip) => (
                    <li key={tip} className="text-xs text-gray-500">↓ {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const NEXT_STEP_ACTIONS: Record<string, string> = {
  Tradeoffs: 'Open Practice → Drills and pick an HLD or LLD drill that asks you to compare two approaches explicitly.',
  Correctness: 'Open Practice → Drills, choose a DSA drill, and make sure to state time and space complexity in your answer.',
  Clarity: 'Open Practice → Drills and write answers that include a concrete example or a metric before moving on.',
  Communication: 'Open Practice → Drills and structure your next answer with labelled sections (Approach / Complexity / Edge Cases).',
};

function deriveWeakTopic(turns: MockTurn[]): { label: string; score: number } | null {
  const scored = turns.filter((t) => t.rubric);
  if (!scored.length) return null;
  const dims = [
    { label: 'Clarity', key: 'clarity' as const },
    { label: 'Correctness', key: 'correctness' as const },
    { label: 'Tradeoffs', key: 'tradeoffs' as const },
    { label: 'Communication', key: 'communication' as const },
  ];
  const avgs = dims.map(({ label, key }) => ({
    label,
    score: Math.round(scored.reduce((sum, t) => sum + (t.rubric![key] as number), 0) / scored.length),
  }));
  return avgs.reduce((min, cur) => (cur.score < min.score ? cur : min));
}

function NextStepCard({ topic, score, action }: { topic: string; score: number; action: string }) {
  return (
    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ArrowRight className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-300">Suggested next step</span>
      </div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">Weakest area</span>
        <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-300">
          {topic} · {score}/100
        </span>
      </div>
      <p className="text-sm text-gray-400">{action}</p>
    </div>
  );
}

function PaidMockPackPreview() {
  const [requested, setRequested] = useState(false);
  return (
    <div className="rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-950/30 to-gray-900/60 p-6">
      <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-purple-300">
        <Sparkles className="h-3 w-3" />
        Mock Pack
      </div>
      <h3 className="mt-2 text-base font-bold text-gray-100">See your complete interview outcome</h3>
      <p className="mb-5 mt-1 text-sm text-gray-500">
        A hiring signal verdict, written analysis, and a personalized drill roadmap — delivered after your first full session.
      </p>

      <div className="mb-6 space-y-5 rounded-xl border border-gray-800 bg-gray-950 p-5">
        <div className="flex items-stretch gap-4">
          <div className="flex min-w-[100px] flex-col items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3">
            <div className="text-[10px] uppercase tracking-wide text-green-400">Verdict</div>
            <div className="mt-1 whitespace-nowrap text-base font-bold text-green-300">Strong Yes</div>
            <div className="text-[10px] text-green-600">L4–L5 (Senior)</div>
          </div>
          <div className="flex-1">
            <div className="mb-1 text-[10px] uppercase tracking-wide text-gray-500">Overall readiness</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-gray-100">81</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-green-400" style={{ width: '81%' }} />
            </div>
            <div className="mt-2 flex gap-3 text-[11px] text-gray-500">
              <span>Top <b className="text-gray-300">24%</b> for Senior Frontend</span>
              <span>·</span>
              <span><b className="text-gray-300">3</b> pattern gaps</span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wide text-gray-500">Written analysis</div>
          <p className="text-sm leading-relaxed text-gray-300">
            Strong graph traversal fundamentals — BFS answer was concise and correctly stated O(V+E) time, O(V) space.
          </p>
          <div className="relative mt-1 overflow-hidden rounded-lg">
            <p className="pointer-events-none select-none text-sm leading-relaxed text-gray-300 blur-[3px]" aria-hidden="true">
              System design answer missed the caching layer and did not address the read/write ratio. Behavioral answers had clear STAR structure but lacked quantified impact metrics. Three targeted drills recommended before your next round.
            </p>
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent via-gray-950/70 to-gray-950 pb-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-400">
                <Lock className="h-3 w-3" /> Full analysis unlocked with Mock Pack
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wide text-gray-500">Pattern gaps detected</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
              <span className="text-sm text-gray-300">LRU Cache / two-pointer optimization</span>
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-400">High</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-3 py-2">
              <span className="text-sm text-gray-300">Feed ranking — read/write tradeoff</span>
              <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-yellow-400">Medium</span>
            </div>
            <div className="pointer-events-none flex select-none items-center justify-between rounded-lg border border-gray-700/50 bg-gray-900/40 px-3 py-2 blur-[2px]" aria-hidden="true">
              <span className="text-sm text-gray-500">+ 1 more gap</span>
              <Lock className="h-3.5 w-3.5 text-gray-600" />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wide text-gray-500">Personalized drill roadmap</div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">1</div>
            <div>
              <div className="text-sm text-gray-300">Practice 2 LRU Cache variants in DSA drills</div>
              <div className="text-[11px] text-gray-600">→ Practice → Drills → DSA</div>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gray-700" />
          </div>
          <div className="pointer-events-none mt-1.5 flex select-none items-center gap-3 rounded-lg border border-gray-700/50 bg-gray-900/40 px-3 py-2.5 blur-[2px]" aria-hidden="true">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-gray-600">2</div>
            <div>
              <div className="text-sm text-gray-500">HLD drill: design a scalable news feed</div>
              <div className="text-[11px] text-gray-600">→ Practice → Drills → HLD</div>
            </div>
            <Lock className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-700" />
          </div>
        </div>
      </div>

      <button
        onClick={() => setRequested(true)}
        className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-base font-semibold transition-all ${
          requested
            ? 'cursor-default bg-green-700 text-green-100'
            : 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 hover:bg-purple-500 hover:shadow-purple-900/70'
        }`}
      >
        {requested ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            You're on the list — we'll reach out soon
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Get my mock pack — full report + roadmap
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
      {!requested && (
        <p className="mt-2.5 text-center text-[11px] text-gray-600">
          One-time · no subscription · full analysis delivered to your inbox
        </p>
      )}
    </div>
  );
}

function SampleFeedbackPanel() {
  const categories: Array<{ label: string; score: number; colorClass: string }> = [
    { label: 'Clarity', score: 82, colorClass: 'bg-blue-500' },
    { label: 'Correctness', score: 78, colorClass: 'bg-green-500' },
    { label: 'Tradeoffs', score: 68, colorClass: 'bg-yellow-500' },
    { label: 'Communication', score: 74, colorClass: 'bg-purple-500' },
  ];
  return (
    <Panel title="Sample feedback — shown after every answer">
      <div className="mb-4 rounded-lg border border-gray-800 bg-gray-950 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-600">Example prompt</p>
        <p className="mt-1 text-sm text-gray-300">
          Implement a function that returns the shortest path length in an unweighted graph. Explain complexity and edge cases.
        </p>
        <p className="mt-3 text-xs uppercase tracking-wide text-gray-600">Example answer</p>
        <p className="mt-1 text-sm italic text-gray-400">
          "I'd use BFS since the graph is unweighted — O(V+E) time, O(V) space. Edge cases: disconnected nodes return -1, single-node returns 0."
        </p>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map(({ label, score, colorClass }) => (
          <div key={label} className="rounded-lg border border-gray-800 bg-gray-950 p-3">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="my-1 text-xl font-bold text-gray-100">{score}</div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
              <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-gray-600">Missed patterns</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm text-orange-300">test cases</span>
        </div>
      </div>
      <div className="mt-4">
        <NextStepCard
          topic="Tradeoffs"
          score={68}
          action={NEXT_STEP_ACTIONS['Tradeoffs']}
        />
      </div>
    </Panel>
  );
}
