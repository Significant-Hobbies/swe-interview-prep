import { Brain, CheckCircle2, Clock, MessageSquare, Play, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  type MockInterviewSession,
  type MockInterviewType,
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
            Start mock
          </button>
        </section>
      ) : session.status === 'complete' && summary ? (
        <section className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Overall" value={`${summary.overall}/100`} />
            <Stat label="Turns" value={summary.turnsCompleted} />
            <Stat label="Review cards" value={summary.reviewCards.length} />
          </div>
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
