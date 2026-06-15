// "Test your understanding" — AI-graded comprehension probe rendered at
// the bottom of a learning doc. Two modes:
//
//   - quiz       → AI asks 5 open-ended questions, user types answers,
//                  AI grades and identifies gaps
//   - explain    → user writes a free-form explain-back, AI grades
//
// Backend: /api/learning?action=understanding (BYOK; dev falls back to env).

import { Brain, FileQuestion, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

import { loadAIConfig } from '../hooks/useAI';
import { Button, Card, SectionTitle } from './ui';

interface Question {
  q: string;
  hint?: string;
}

interface QuizGrade {
  overall: number;
  perQuestion: { q: string; a: string; grade: number; feedback: string }[];
  summary: string;
  gaps: string[];
}

interface ExplanationGrade {
  grade: number;
  feedback: string;
  gaps: string[];
  missedSources?: string[];
}

type Mode = 'quiz' | 'explain';

interface Props {
  docTitle: string;
  docContent: string;
}

async function callUnderstanding(body: Record<string, unknown>): Promise<any> {
  const res = await fetch('/api/learning?action=understanding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

function gradeColor(n: number): string {
  if (n >= 90) return 'text-emerald-400';
  if (n >= 70) return 'text-amber-400';
  if (n >= 50) return 'text-orange-400';
  return 'text-rose-400';
}

export default function UnderstandingCheck({ docTitle, docContent }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <div className="mt-10 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-5 w-5 text-purple-400" />
        <h2 className="text-base font-semibold text-white">Test your understanding</h2>
      </div>
      <p className="mb-4 max-w-2xl text-sm text-gray-400">
        Don't take it from me — verify you got the doc. Two modes: AI asks
        you five open questions, or you explain the thesis back in your own
        words. Either way, you get a 0–100 grade and a list of gaps to
        re-read.
      </p>

      {mode === null && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setMode('quiz')}
            className="group flex items-start gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-left transition-colors hover:bg-purple-500/20"
          >
            <FileQuestion className="mt-0.5 h-5 w-5 shrink-0 text-purple-300" />
            <div>
              <div className="text-sm font-semibold text-white">Quiz me</div>
              <div className="mt-0.5 text-xs text-gray-400">
                AI asks 5 open-ended questions about this doc. You type
                answers. AI grades each.
              </div>
            </div>
          </button>
          <button
            onClick={() => setMode('explain')}
            className="group flex items-start gap-3 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4 text-left transition-colors hover:bg-fuchsia-500/20"
          >
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-300" />
            <div>
              <div className="text-sm font-semibold text-white">Explain back</div>
              <div className="mt-0.5 text-xs text-gray-400">
                Write the doc's thesis in your own words, as if teaching a
                peer. AI grades + lists what you missed.
              </div>
            </div>
          </button>
        </div>
      )}

      {mode === 'quiz' && (
        <QuizFlow
          docTitle={docTitle}
          docContent={docContent}
          onReset={() => setMode(null)}
        />
      )}

      {mode === 'explain' && (
        <ExplainFlow
          docTitle={docTitle}
          docContent={docContent}
          onReset={() => setMode(null)}
        />
      )}
    </div>
  );
}

// --- Quiz flow -------------------------------------------------------------

function QuizFlow({
  docTitle,
  docContent,
  onReset,
}: {
  docTitle: string;
  docContent: string;
  onReset: () => void;
}) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizGrade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callUnderstanding({
        op: 'quiz',
        docTitle,
        docContent,
        aiConfig: loadAIConfig(),
      });
      if (!Array.isArray(data.questions)) throw new Error('AI returned no questions');
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(''));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!questions) return;
    if (answers.some(a => a.trim().length < 5)) {
      setError('Write at least a sentence for each question (or skip the question with a single word like "skip" — be honest).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await callUnderstanding({
        op: 'grade-quiz',
        docTitle,
        docContent,
        questions: questions.map(q => q.q),
        answers,
        aiConfig: loadAIConfig(),
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuestions(null);
    setAnswers([]);
    setResult(null);
    setError(null);
    onReset();
  };

  if (!questions) {
    return (
      <div className="space-y-3">
        <Button onClick={generate} disabled={loading} tone="primary">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating
            </>
          ) : (
            <>
              <FileQuestion className="h-3.5 w-3.5" /> Generate 5 questions
            </>
          )}
        </Button>
        <button
          onClick={onReset}
          className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
        {error && <div className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>}
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="mb-2 flex items-baseline gap-3">
            <span className={`text-4xl font-bold ${gradeColor(result.overall)}`}>{result.overall}</span>
            <span className="text-xs text-gray-500">/ 100 overall</span>
          </div>
          <p className="text-sm text-gray-300">{result.summary}</p>
        </Card>

        <div>
          <SectionTitle>Per-question feedback</SectionTitle>
          <div className="space-y-2">
            {result.perQuestion.map((pq, i) => (
              <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <div className="text-sm font-medium text-gray-200">{pq.q}</div>
                  <span className={`shrink-0 font-mono text-xs ${gradeColor(pq.grade)}`}>{pq.grade}/100</span>
                </div>
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-300">Your answer</summary>
                  <div className="mt-1 rounded bg-gray-950 px-2 py-1.5 text-gray-400">{pq.a}</div>
                </details>
                <div className="mt-2 text-xs text-gray-300">{pq.feedback}</div>
              </div>
            ))}
          </div>
        </div>

        {result.gaps?.length > 0 && (
          <div>
            <SectionTitle>Topics to re-read</SectionTitle>
            <ul className="space-y-1.5">
              {result.gaps.map((g, i) => (
                <li
                  key={i}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
                >
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={reset} tone="ghost">
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Answer each in 2-5 sentences. Use your own words. Don't peek.
      </p>
      {questions.map((q, i) => (
        <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
          <div className="mb-1.5 text-sm font-medium text-white">
            <span className="mr-2 text-purple-400">Q{i + 1}.</span>
            {q.q}
          </div>
          {q.hint && <div className="mb-2 text-[11px] italic text-gray-500">Hint: {q.hint}</div>}
          <textarea
            value={answers[i] || ''}
            onChange={e => {
              const next = [...answers];
              next[i] = e.target.value;
              setAnswers(next);
            }}
            placeholder="Type your answer…"
            rows={3}
            className="w-full resize-y rounded-md border border-gray-800 bg-gray-950 p-2 text-sm text-gray-100 placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      ))}
      {error && (
        <div className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>
      )}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Grading
            </>
          ) : (
            <>
              <Brain className="h-3.5 w-3.5" /> Submit for grading
            </>
          )}
        </Button>
        <Button onClick={reset} tone="ghost">
          <X className="h-3.5 w-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}

// --- Explain-back flow -----------------------------------------------------

function ExplainFlow({
  docTitle,
  docContent,
  onReset,
}: {
  docTitle: string;
  docContent: string;
  onReset: () => void;
}) {
  const [explanation, setExplanation] = useState('');
  const [result, setResult] = useState<ExplanationGrade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (explanation.trim().length < 30) {
      setError('Write at least 30 chars. Be honest.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await callUnderstanding({
        op: 'grade-explanation',
        docTitle,
        docContent,
        explanation,
        aiConfig: loadAIConfig(),
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setExplanation('');
    setResult(null);
    setError(null);
    onReset();
  };

  if (result) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="mb-2 flex items-baseline gap-3">
            <span className={`text-4xl font-bold ${gradeColor(result.grade)}`}>{result.grade}</span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
          <p className="text-sm text-gray-300">{result.feedback}</p>
        </Card>

        {result.gaps?.length > 0 && (
          <div>
            <SectionTitle>Gaps in your explanation</SectionTitle>
            <ul className="space-y-1.5">
              {result.gaps.map((g, i) => (
                <li
                  key={i}
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
                >
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.missedSources && result.missedSources.length > 0 && (
          <div>
            <SectionTitle>Sources you skipped</SectionTitle>
            <ul className="space-y-1.5">
              {result.missedSources.map((s, i) => (
                <li
                  key={i}
                  className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={reset} tone="ghost">
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Pretend you're teaching the doc's thesis to a smart peer. Reference
        the actual sources (papers, blogs, talks) where they apply.
      </p>
      <textarea
        autoFocus
        value={explanation}
        onChange={e => setExplanation(e.target.value)}
        placeholder="The thesis of this doc is… The key mechanism is… The canonical source for this is…"
        rows={10}
        className="w-full resize-y rounded-md border border-gray-800 bg-gray-950 p-3 text-sm text-gray-100 placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
      />
      {error && (
        <div className="rounded-md bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>
      )}
      <div className="flex gap-2">
        <Button onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Grading
            </>
          ) : (
            <>
              <Brain className="h-3.5 w-3.5" /> Grade me
            </>
          )}
        </Button>
        <Button onClick={reset} tone="ghost">
          <X className="h-3.5 w-3.5" /> Cancel
        </Button>
      </div>
    </div>
  );
}
