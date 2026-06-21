import { Check, Clock, Mic, RotateCcw, Target } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button, Card, FilterPill, PageHeader, PageShell } from '../components/ui';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { MOCK_PROMPTS, type MockKind } from '../data/mock-prompts';
import { useActivityLogger } from '../hooks/useActivity';
import { useConceptMastery } from '../hooks/useConcepts';
import { COMPANY_BY_ID } from '../lib/companies';
import { useProfile } from '../hooks/useProfile';
import { recordSessionActivity } from '../lib/session';
import { loadAIConfig } from '../hooks/useAI';
import { aiConfigured } from '../lib/aiClient';
import { mockRatingFromRubric, recommendMockPrompts } from '../lib/mockRecommend';

const KINDS: MockKind[] = ['technical', 'system-design', 'behavioral'];

export default function MockInterview() {
  const [searchParams] = useSearchParams();
  const { profile } = useProfile();
  const { mastery, review } = useConceptMastery();
  const logActivity = useActivityLogger();
  const defaultKind = profile.targetCompany
    ? (COMPANY_BY_ID[profile.targetCompany]?.mockKindBias ?? 'technical')
    : 'technical';
  const [kind, setKind] = useState<MockKind>(defaultKind);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [notes, setNotes] = useState('');
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [aiFeedback, setAiFeedback] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const deepLinked = useRef(false);

  const pool = useMemo(() => MOCK_PROMPTS.filter(p => p.kind === kind), [kind]);
  const recommended = useMemo(
    () => recommendMockPrompts(profile, mastery, 3).filter(p => p.kind === kind),
    [profile, mastery, kind],
  );
  const active = pool.find(p => p.id === activeId) ?? pool[0];

  useEffect(() => {
    if (!activeId || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [activeId, secondsLeft]);

  useEffect(() => {
    if (deepLinked.current) return;
    const promptId = searchParams.get('prompt');
    if (!promptId) return;
    const p = MOCK_PROMPTS.find(x => x.id === promptId);
    if (!p) return;
    deepLinked.current = true;
    setKind(p.kind);
    setActiveId(promptId);
    setSecondsLeft(p.durationMinutes * 60);
    setNotes('');
    setChecked(new Set());
    setAiFeedback('');
    recordSessionActivity('mock_start');
    void logActivity({
      kind: 'mock_start',
      problemId: promptId,
      conceptIds: p.conceptIds,
      payload: { kind: p.kind, durationMinutes: p.durationMinutes },
    });
  }, [searchParams, logActivity]);

  function start(promptId: string) {
    const p = MOCK_PROMPTS.find(x => x.id === promptId);
    if (!p) return;
    setActiveId(promptId);
    setSecondsLeft(p.durationMinutes * 60);
    setNotes('');
    setChecked(new Set());
    setAiFeedback('');
    recordSessionActivity('mock_start');
    void logActivity({
      kind: 'mock_start',
      problemId: promptId,
      conceptIds: p.conceptIds,
      payload: { kind: p.kind, durationMinutes: p.durationMinutes },
    });
  }

  function toggleRubric(i: number) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function requestAiFeedback() {
    if (!active || !aiConfigured()) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/learning?action=critique', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiConfig: loadAIConfig(),
          question: active.prompt,
          answer: notes,
          expected: active.rubric.join('\n'),
        }),
      });
      if (!res.ok) throw new Error('AI feedback failed');
      const data = await res.json();
      setAiFeedback([data.verdict, ...(data.missing || []).map((m: string) => `· ${m}`)].join('\n'));
    } catch {
      setAiFeedback('AI feedback unavailable — use the rubric checklist.');
    } finally {
      setLoadingAi(false);
    }
  }

  function finish() {
    if (!active) return;
    const rating = mockRatingFromRubric(checked.size, active.rubric.length);
    recordSessionActivity('mock_complete');
    void logActivity({
      kind: 'mock_complete',
      problemId: active.id,
      conceptIds: active.conceptIds,
      payload: {
        rubricChecked: checked.size,
        rubricTotal: active.rubric.length,
        rating,
      },
    });
    for (const conceptId of active.conceptIds ?? []) {
      void review(conceptId, rating);
    }
    setSecondsLeft(0);
  }

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Apply"
        title="Mock interview"
        subtitle={
          profile.interviewHorizonDays
            ? `Interview in ${profile.interviewHorizonDays} days — timed reps under pressure.`
            : 'Timed prompts with rubric checklists. Optional AI feedback if configured.'
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {KINDS.map(k => (
          <FilterPill key={k} active={kind === k} onClick={() => setKind(k)}>
            {k.replace('-', ' ')}
          </FilterPill>
        ))}
      </div>

      {recommended.length > 0 && secondsLeft === 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/50">
            <Target className="h-3.5 w-3.5" />
            Recommended for your gaps
          </div>
          <div className="flex flex-wrap gap-2">
            {recommended.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => start(p.id)}
                className="rounded-lg border border-sky-500/25 bg-sky-500/8 px-3 py-2 text-left text-xs text-white hover:border-sky-500/40"
              >
                <span className="font-medium">{p.title}</span>
                <span className="ml-2 font-mono text-white/40">{p.durationMinutes}m</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {pool.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => start(p.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                active?.id === p.id
                  ? 'border-sky-500/40 bg-sky-500/10'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'
              }`}
            >
              <div className="text-sm font-medium text-white">{p.title}</div>
              <div className="mt-1 font-mono text-[10px] text-white/40">{p.durationMinutes} min</div>
            </button>
          ))}
        </div>

        {active && (
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-sky-400" />
                <span className="text-sm font-semibold text-white">{active.title}</span>
              </div>
              {secondsLeft > 0 ? (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm ${
                  secondsLeft < 120 ? 'border-rose-500/30 text-rose-300' : 'border-white/15 text-white/70'
                }`}>
                  <Clock className="h-3.5 w-3.5" />
                  {mm}:{ss.toString().padStart(2, '0')}
                </span>
              ) : (
                <Button tone="ghost" onClick={() => start(active.id)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restart
                </Button>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">{active.prompt}</p>

            {active.conceptIds && active.conceptIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {active.conceptIds.map(cid => {
                  const c = CONCEPT_BY_ID[cid];
                  if (!c) return null;
                  return (
                    <Link
                      key={cid}
                      to={`/concepts/${cid}`}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50 hover:border-white/20 hover:text-white/70"
                    >
                      {c.name}
                    </Link>
                  );
                })}
              </div>
            )}

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Type your answer as you would speak it…"
              rows={8}
              className="mt-4 w-full resize-y rounded-md border border-white/[0.08] bg-black p-3 text-sm text-white placeholder:text-white/40 focus:border-white/25 focus:outline-none"
            />

            <div className="mt-5">
              <div className="mb-2 text-xs font-medium text-white/50">Rubric checklist</div>
              <ul className="space-y-2">
                {active.rubric.map((line, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => toggleRubric(i)}
                      className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                        checked.has(i)
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/[0.08] text-white/60 hover:border-white/15'
                      }`}
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {line}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {secondsLeft > 0 && (
                <Button onClick={finish}>Finish early</Button>
              )}
              {aiConfigured() && notes.trim().length > 40 && (
                <Button tone="ghost" onClick={() => void requestAiFeedback()} disabled={loadingAi}>
                  {loadingAi ? 'Grading…' : 'AI feedback'}
                </Button>
              )}
            </div>

            {aiFeedback && (
              <div className="mt-4 rounded-lg border border-white/[0.08] bg-black/40 p-3 text-sm text-white/70 whitespace-pre-wrap">
                {aiFeedback}
              </div>
            )}

            {secondsLeft === 0 && notes.trim() && (
              <p className="mt-4 text-xs text-white/40">
                Self-score: {checked.size}/{active.rubric.length} rubric items
                {active.conceptIds?.length
                  ? ` · mastery nudged for ${active.conceptIds.length} concept${active.conceptIds.length > 1 ? 's' : ''}`
                  : ''}{' '}
                ·{' '}
                <Link to="/practice/all?tab=reviews" className="text-sky-400 hover:text-sky-300">
                  follow up with reviews →
                </Link>
              </p>
            )}
          </Card>
        )}
      </div>
    </PageShell>
  );
}