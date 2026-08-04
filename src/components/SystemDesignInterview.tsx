import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { CONCEPT_BY_ID, DRILL_BY_ID } from '../data/learning-os';
import {
  SYSTEM_DESIGN_CASES,
  SYSTEM_DESIGN_CASE_BY_ID,
  SYSTEM_DESIGN_CASE_GROUPS,
} from '../data/system-design-cases';
import type { SystemDesignCase } from '../data/system-design-case-schema';
import { useActivityLogger } from '../hooks/useActivity';
import { useConceptMastery } from '../hooks/useConcepts';
import { aiConfigured, critiqueSystemDesignAttempt } from '../lib/aiClient';
import { recordSessionActivity } from '../lib/session';
import {
  evaluateSystemDesignAttempt,
  evaluateSystemDesignWithOptionalAi,
  type SystemDesignReview,
} from '../lib/systemDesignEvaluation';
import {
  createSystemDesignAttempt,
  loadSystemDesignAttempt,
  saveSystemDesignAttempt,
  systemDesignAttemptStorageKey,
  transitionSystemDesignAttempt,
  visibleInterviewerPrompt,
  type LoadedSystemDesignAttempt,
  type StoredCaseReview,
  type SystemDesignAttempt,
} from '../lib/systemDesignSession';
import { Button, Card } from './ui';

const LEGACY_CASE_IDS: Record<string, string> = {
  'mock-url-shortener': 'url-shortener',
  'mock-rate-limiter': 'distributed-rate-limiter',
  'mock-chat-system': 'real-time-chat',
  'mock-news-feed': 'ranked-news-feed',
};

export function resolveCaseId(value?: string | null) {
  if (!value) return SYSTEM_DESIGN_CASES[0].id;
  const resolved = LEGACY_CASE_IDS[value] ?? value;
  return SYSTEM_DESIGN_CASE_BY_ID[resolved] ? resolved : SYSTEM_DESIGN_CASES[0].id;
}

interface CaseSelectorProps {
  activeCaseId: string;
  onSelect: (caseId: string) => void;
}

export function SystemDesignCaseSelector({ activeCaseId, onSelect }: CaseSelectorProps) {
  return (
    <aside className="space-y-4" aria-label="System design cases">
      {SYSTEM_DESIGN_CASE_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`case-category-${group.id}`}>
          <h3
            id={`case-category-${group.id}`}
            className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35"
          >
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.cases.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                aria-current={candidate.id === activeCaseId ? 'true' : undefined}
                onClick={() => onSelect(candidate.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  candidate.id === activeCaseId
                    ? 'border-sky-500/40 bg-sky-500/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <div className="text-sm font-medium text-white">{candidate.title}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/40">
                  <span>{candidate.durationMinutes} min</span>
                  <span>v{candidate.version}</span>
                  <span
                    className={`rounded-full border px-1.5 py-0.5 ${
                      candidate.publication.state === 'approved'
                        ? 'border-emerald-500/25 text-emerald-300'
                        : 'border-white/10 text-white/35'
                    }`}
                  >
                    {candidate.publication.state === 'approved'
                      ? 'Guide + practice'
                      : 'Practice only'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
}

function storedReview(review: SystemDesignReview): StoredCaseReview {
  return {
    overallScore: review.overallScore,
    readinessBand: review.readinessBand,
    dimensions: review.dimensions.map((dimension) => ({
      dimensionId: dimension.dimensionId,
      score: dimension.score,
      evidence: dimension.evidence,
      missing: dimension.missing,
    })),
  };
}

function mmss(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const remainder = Math.max(0, seconds) % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function initialAttempt(caseDefinition: SystemDesignCase) {
  return createSystemDesignAttempt(caseDefinition);
}

interface Props {
  initialCaseId?: string | null;
  fromGuide?: boolean;
}

export default function SystemDesignInterview({ initialCaseId, fromGuide = false }: Props) {
  const initialId = resolveCaseId(initialCaseId);
  const [caseId, setCaseId] = useState(initialId);
  const caseDefinition = SYSTEM_DESIGN_CASE_BY_ID[caseId];
  const [attempt, setAttempt] = useState<SystemDesignAttempt>(() => initialAttempt(caseDefinition));
  const [draft, setDraft] = useState('');
  const [reviewResult, setReviewResult] = useState<SystemDesignReview | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [resumeNotice, setResumeNotice] = useState('');
  const [hydratedCaseId, setHydratedCaseId] = useState<string | null>(null);
  const [saveIssue, setSaveIssue] = useState<Extract<
    LoadedSystemDesignAttempt,
    { status: 'unsupported' | 'invalid' }
  > | null>(null);
  const [persistenceBlocked, setPersistenceBlocked] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { review: recordConceptReview } = useConceptMastery();
  const logActivity = useActivityLogger();

  const currentStageIndex = caseDefinition.stages.findIndex(
    (stage) => stage.id === attempt.currentStageId
  );
  const currentStage = caseDefinition.stages[currentStageIndex];
  const secondsLeft = Math.max(0, caseDefinition.durationMinutes * 60 - attempt.elapsedSeconds);
  const isActive = attempt.status === 'active';
  const prompt = visibleInterviewerPrompt(caseDefinition, attempt);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHydratedCaseId(null);
    const loaded = loadSystemDesignAttempt(window.localStorage, caseDefinition);
    setReviewResult(null);
    setSaveIssue(null);
    setPersistenceBlocked(false);
    if (loaded.status === 'ok') {
      setAttempt(loaded.attempt);
      setDraft('');
      setResumeNotice(
        loaded.attempt.status === 'active'
          ? `Resumed at ${loaded.attempt.currentStageId.replaceAll('-', ' ')}.`
          : 'Loaded the most recent completed review.'
      );
      if (loaded.attempt.status === 'review') {
        setReviewResult(evaluateSystemDesignAttempt(caseDefinition, loaded.attempt));
      }
      setHydratedCaseId(caseDefinition.id);
      return;
    }
    const fresh = initialAttempt(caseDefinition);
    setAttempt(fresh);
    setDraft('');
    setResumeNotice('');
    if (loaded.status === 'unsupported' || loaded.status === 'invalid') {
      setSaveIssue(loaded);
      setPersistenceBlocked(true);
    }
    setHydratedCaseId(caseDefinition.id);
  }, [caseDefinition]);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setAttempt((current) =>
        transitionSystemDesignAttempt(caseDefinition, current, { type: 'tick', seconds: 1 })
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [caseDefinition, isActive, secondsLeft]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      hydratedCaseId !== caseDefinition.id ||
      persistenceBlocked ||
      (attempt.status === 'active' && attempt.elapsedSeconds % 5 !== 0)
    ) {
      return;
    }
    saveSystemDesignAttempt(window.localStorage, attempt);
  }, [attempt, caseDefinition.id, hydratedCaseId, persistenceBlocked]);

  useEffect(() => {
    if (attempt.status === 'active') textareaRef.current?.focus();
  }, [attempt.currentStageId, attempt.status]);

  const progress = useMemo(
    () =>
      caseDefinition.stages.map((stage, index) => ({
        ...stage,
        state:
          index < currentStageIndex
            ? 'complete'
            : index === currentStageIndex
              ? 'current'
              : 'upcoming',
      })),
    [caseDefinition, currentStageIndex]
  );

  function persist(next: SystemDesignAttempt) {
    if (typeof window !== 'undefined' && !persistenceBlocked) {
      saveSystemDesignAttempt(window.localStorage, next);
    }
  }

  function beginFresh() {
    if (typeof window !== 'undefined' && saveIssue && 'raw' in saveIssue && saveIssue.raw) {
      const archiveKey = `${systemDesignAttemptStorageKey(caseDefinition.id)}:read-only:${Date.now()}`;
      try {
        window.localStorage.setItem(archiveKey, saveIssue.raw);
      } catch {
        setResumeNotice(
          'The old save could not be archived; this attempt will remain in memory only.'
        );
        return;
      }
    }
    const next = initialAttempt(caseDefinition);
    setPersistenceBlocked(false);
    setSaveIssue(null);
    setAttempt(next);
    setDraft('');
    setReviewResult(null);
    setResumeNotice('Started a fresh closed-book attempt.');
    if (typeof window !== 'undefined') saveSystemDesignAttempt(window.localStorage, next);
    recordSessionActivity('mock_start');
    void logActivity({
      kind: 'mock_start',
      problemId: caseDefinition.id,
      conceptIds: caseDefinition.conceptIds,
      payload: {
        kind: 'system-design',
        durationMinutes: caseDefinition.durationMinutes,
        caseVersion: caseDefinition.version,
      },
    });
  }

  async function completeReview(next: SystemDesignAttempt, applyMastery: boolean) {
    const local = evaluateSystemDesignAttempt(caseDefinition, next);
    setReviewResult(local);
    const localAttempt = transitionSystemDesignAttempt(caseDefinition, next, {
      type: 'attach-review',
      review: storedReview(local),
    });
    setAttempt(localAttempt);
    persist(localAttempt);

    setLoadingAi(aiConfigured());
    const final = await evaluateSystemDesignWithOptionalAi(
      caseDefinition,
      next,
      aiConfigured() ? () => critiqueSystemDesignAttempt(caseDefinition, next) : undefined
    );
    setLoadingAi(false);
    setReviewResult(final);
    const finalAttempt = transitionSystemDesignAttempt(caseDefinition, localAttempt, {
      type: 'attach-review',
      review: storedReview(final),
    });
    setAttempt(finalAttempt);
    persist(finalAttempt);

    if (applyMastery) {
      for (const remediation of final.remediation.concepts) {
        void recordConceptReview(remediation.conceptId, remediation.rating);
      }
      recordSessionActivity('mock_complete');
      void logActivity({
        kind: 'mock_complete',
        problemId: caseDefinition.id,
        conceptIds: final.remediation.concepts.map((item) => item.conceptId),
        payload: {
          caseVersion: caseDefinition.version,
          score: final.overallScore,
          readinessBand: final.readinessBand,
          dimensionScores: Object.fromEntries(
            final.dimensions.map((dimension) => [dimension.dimensionId, dimension.score])
          ),
        },
      });
    }
  }

  function submitStage() {
    if (!draft.trim() || !isActive || attempt.currentStageId === 'review') return;
    const next = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'submit-stage',
      stageId: attempt.currentStageId,
      answer: draft,
    });
    if (next === attempt) return;
    setAttempt(next);
    setDraft('');
    persist(next);
    if (next.status === 'review') void completeReview(next, true);
  }

  function abandonToReview() {
    const next = transitionSystemDesignAttempt(caseDefinition, attempt, {
      type: 'abandon-to-review',
    });
    setAttempt(next);
    setDraft('');
    persist(next);
    void completeReview(next, false);
  }

  return (
    <div className="space-y-5">
      {fromGuide && isActive && (
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/8 px-4 py-3 text-sm text-amber-100">
          Closed-book mode is active. Returning to the public guide exits the integrity of this rep.
        </div>
      )}

      {saveIssue && (
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/8 p-4" role="alert">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-medium text-amber-100">Older attempt kept read-only</p>
              <p className="mt-1 text-xs text-amber-100/70">{saveIssue.reason}</p>
              <Button className="mt-3" tone="ghost" onClick={beginFresh}>
                Archive it and start fresh
              </Button>
            </div>
          </div>
        </div>
      )}

      {resumeNotice && !saveIssue && (
        <p className="text-xs text-emerald-300" role="status">
          {resumeNotice} Progress is saved locally.
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <SystemDesignCaseSelector activeCaseId={caseId} onSelect={setCaseId} />

        <div className="min-w-0 space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-sky-300">
                  <Target className="h-3.5 w-3.5" /> Structured case
                </div>
                <h2 className="mt-2 text-xl font-semibold text-white">{caseDefinition.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">
                  {caseDefinition.prompt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm ${
                    secondsLeft < 120 && isActive
                      ? 'border-rose-500/30 text-rose-300'
                      : 'border-white/15 text-white/70'
                  }`}
                >
                  <Clock3 className="h-3.5 w-3.5" /> {mmss(secondsLeft)}
                </span>
                <Button tone="ghost" onClick={beginFresh} aria-label="Start a new attempt">
                  <RotateCcw className="h-3.5 w-3.5" /> New
                </Button>
              </div>
            </div>

            <ol
              className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6"
              aria-label="Interview stages"
            >
              {progress.map((stage, index) => (
                <li
                  key={stage.id}
                  aria-current={stage.state === 'current' ? 'step' : undefined}
                  className={`rounded-md border px-2.5 py-2 text-[11px] ${
                    stage.state === 'complete'
                      ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-200'
                      : stage.state === 'current'
                        ? 'border-sky-500/35 bg-sky-500/10 text-sky-100'
                        : 'border-white/[0.07] text-white/35'
                  }`}
                >
                  <span className="font-mono">{index + 1}</span> {stage.title}
                </li>
              ))}
            </ol>
          </Card>

          {isActive && currentStage && (
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/40">
                    Stage {currentStageIndex + 1} of {caseDefinition.stages.length}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{currentStage.title}</h3>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/45">
                  Answer as you would speak
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/75">{prompt}</p>

              <label
                htmlFor="system-design-answer"
                className="mt-5 block text-xs font-medium text-white/50"
              >
                Your answer
              </label>
              <textarea
                ref={textareaRef}
                id="system-design-answer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault();
                    submitStage();
                  }
                }}
                placeholder="State assumptions, show units, and make trade-offs explicit…"
                rows={12}
                className="mt-2 w-full resize-y rounded-md border border-white/[0.08] bg-black p-3 text-sm leading-relaxed text-white placeholder:text-white/30 focus:border-sky-400/50 focus:outline-none"
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button onClick={submitStage} disabled={!draft.trim()}>
                  Submit stage <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button tone="ghost" onClick={abandonToReview}>
                  Exit to review
                </Button>
                <span className="text-[11px] text-white/35">⌘/Ctrl + Enter to submit</span>
              </div>
              {secondsLeft === 0 && (
                <p className="mt-3 text-xs text-amber-300" role="status">
                  Time is up. Finish this stage or exit to review; your submitted stages are saved.
                </p>
              )}
            </Card>
          )}

          {!isActive && (
            <SystemDesignReviewPanel
              caseDefinition={caseDefinition}
              result={reviewResult}
              loadingAi={loadingAi}
              abandoned={attempt.reviewReason === 'abandoned'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SystemDesignReviewPanel({
  caseDefinition,
  result,
  loadingAi,
  abandoned,
}: {
  caseDefinition: SystemDesignCase;
  result: SystemDesignReview | null;
  loadingAi: boolean;
  abandoned: boolean;
}) {
  if (!result) {
    return (
      <Card className="p-5" aria-busy="true">
        <p className="text-sm text-white/60">Building evidence-backed review…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> Review unlocked
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-white">{result.overallScore}/100</h3>
            <p className="mt-1 text-sm text-white/65">{result.verdict}</p>
          </div>
          <div className="text-right">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
              {result.readinessBand.replaceAll('-', ' ')}
            </span>
            <p className="mt-2 text-[10px] text-white/35">
              {result.generator === 'ai'
                ? 'Validated AI + fixed rubric'
                : 'Deterministic evidence rubric'}
            </p>
          </div>
        </div>
        {abandoned && (
          <p className="mt-4 rounded-md border border-amber-400/20 bg-amber-400/8 px-3 py-2 text-xs text-amber-100/80">
            This was an early review, so mastery was not changed.
          </p>
        )}
        {loadingAi && (
          <p className="mt-4 text-xs text-sky-300" role="status">
            Validating optional semantic critique… deterministic results are already safe.
          </p>
        )}
        {result.warning && (
          <p className="mt-4 text-xs text-amber-300" role="status">
            {result.warning}
          </p>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {result.dimensions.map((dimension) => (
          <Card key={dimension.dimensionId} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-white">{dimension.label}</h4>
              <span className="font-mono text-sm text-sky-300">{dimension.score}/3</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/45">{dimension.anchor}</p>
            {dimension.evidence.length > 0 ? (
              <div className="mt-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-300/70">
                  Your evidence
                </p>
                <ul className="mt-1 space-y-1 text-xs text-white/65">
                  {dimension.evidence.slice(0, 2).map((evidence) => (
                    <li key={evidence}>“{evidence}”</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-xs text-rose-300/80">No supporting evidence found.</p>
            )}
            {dimension.missing.length > 0 && (
              <p className="mt-3 text-[11px] text-white/40">
                Missing signals: {dimension.missing.slice(0, 4).join(', ')}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-sky-300">
          <Sparkles className="h-4 w-4" /> Stronger answer
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{result.strongerAnswer}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            <Target className="h-4 w-4" /> Harder follow-ups
          </div>
          <ol className="mt-3 space-y-2 pl-5 text-sm text-white/65">
            {result.followUps.map((followUp) => (
              <li key={followUp} className="list-decimal">
                {followUp}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            <BookOpen className="h-4 w-4" /> Common mistakes
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            {caseDefinition.commonMistakes.map((mistake) => (
              <li key={mistake}>· {mistake}</li>
            ))}
          </ul>
        </Card>
      </div>

      {result.remediation.concepts.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-white">Targeted remediation</h3>
          <p className="mt-1 text-xs text-white/45">
            Only dimensions with insufficient evidence are scheduled for repair.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.remediation.concepts.map((item) => {
              const concept = CONCEPT_BY_ID[item.conceptId];
              return (
                <Link
                  key={item.conceptId}
                  to={`/concepts/${item.conceptId}`}
                  className="rounded-full border border-sky-500/25 bg-sky-500/8 px-3 py-1.5 text-xs text-sky-200 hover:border-sky-400/50"
                >
                  {concept?.name ?? item.conceptId} · {item.rating}
                </Link>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.remediation.drillIds.map((drillId) => (
              <Link
                key={drillId}
                to={`/drills/${drillId}`}
                className="text-xs text-white/50 underline decoration-white/20 underline-offset-4 hover:text-white/75"
              >
                {DRILL_BY_ID[drillId]?.title ?? drillId}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
