import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Copy,
  Flag,
  RotateCcw,
  Search,
  Swords,
  Trophy,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge, Button, Card, FilterPill, ProgressBar } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import {
  buildPreviewWarsCurriculum,
  previewQuestionMatchesQueue,
  type WarsCurriculumItem,
  type WarsCurriculumManifest,
  type WarsCurriculumSection,
} from '../data/software-wars-curriculum';
import { PREVIEW_QUESTIONS, type PreviewQuestion } from '../data/software-wars-preview';
import { trackEvent } from '../lib/analytics';
import {
  createBlitzMatch,
  createChallenge,
  finalizeBlitzMatch,
  getBlitzMatch,
  getWarsCurriculum,
  shareBlitzResult,
  submitBlitzAnswer,
  warOperationId,
} from '../lib/softwareWars';

type BattleQuestion = Omit<
  PreviewQuestion,
  'correctOptionId' | 'explanation' | 'concept' | 'source'
> &
  Partial<Pick<PreviewQuestion, 'correctOptionId' | 'explanation' | 'concept' | 'source'>> & {
    primaryConcept?: { id: string; name: string; learnPath: string };
  };

interface QueueSelection {
  type: 'ranked_mix' | WarsCurriculumSection;
  id: string;
}

interface ResolvedQueue extends QueueSelection {
  title: string;
  playable: boolean;
  activeCount?: number;
  candidateCount?: number;
  learnPath?: string;
}

const RANKED_QUEUE: QueueSelection = {
  type: 'ranked_mix',
  id: 'ranked_mix',
};

interface BattleState {
  matchId: string;
  opponent: string;
  ranked: boolean;
  deadlineAt: string;
  questions: BattleQuestion[];
  preview: boolean;
}

function formatTimer(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function previewBattle(queue: QueueSelection): BattleState {
  const filtered =
    queue.type === 'ranked_mix'
      ? PREVIEW_QUESTIONS
      : PREVIEW_QUESTIONS.filter((question) =>
          previewQuestionMatchesQueue(question, queue.type as WarsCurriculumSection, queue.id)
        );
  const questions = filtered.map((question) => ({
    ...question,
    primaryConcept: {
      id: question.conceptId,
      name: question.concept,
      learnPath: `/concepts/${encodeURIComponent(question.conceptId)}`,
    },
  }));
  return {
    matchId: `preview-${crypto.randomUUID()}`,
    opponent: 'Cloudflare Sage',
    ranked: false,
    deadlineAt: new Date(Date.now() + 90_000).toISOString(),
    questions,
    preview: true,
  };
}

export default function BlitzWar() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [queueSelection, setQueueSelection] = useState<QueueSelection>(RANKED_QUEUE);
  const [browseMode, setBrowseMode] = useState<WarsCurriculumSection>('track');
  const [curriculum, setCurriculum] = useState<WarsCurriculumManifest>(buildPreviewWarsCurriculum);
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [battle, setBattle] = useState<BattleState>();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [result, setResult] = useState<Record<string, any>>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const finishing = useRef(false);

  const current = battle?.questions[index];
  const selected = current ? answers[current.id] : undefined;

  const queue = useMemo<ResolvedQueue>(() => {
    if (queueSelection.type === 'ranked_mix') {
      return { ...RANKED_QUEUE, title: 'Ranked Mix', playable: true };
    }
    const items =
      queueSelection.type === 'track'
        ? curriculum.tracks
        : queueSelection.type === 'roadmap'
          ? curriculum.roadmaps
          : curriculum.concepts;
    const item = items.find(({ id }) => id === queueSelection.id);
    return item
      ? { type: queueSelection.type, ...item }
      : { ...queueSelection, title: queueSelection.id, playable: false };
  }, [curriculum, queueSelection]);

  useEffect(() => {
    let live = true;
    void getWarsCurriculum().then((manifest) => {
      if (live) setCurriculum(manifest);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!matchId || !user || battle?.matchId === matchId) return;
    let live = true;
    setBusy(true);
    void getBlitzMatch(matchId)
      .then((data: any) => {
        if (!live) return;
        if (data.status === 'complete') {
          setBattle({
            matchId: data.matchId,
            opponent: data.opponent.displayName,
            ranked: data.ranked,
            deadlineAt: data.completedAt,
            questions: [],
            preview: false,
          });
          setResult(data);
          return;
        }
        setBattle({
          matchId: data.matchId,
          opponent: data.opponent.displayName,
          ranked: data.ranked,
          deadlineAt: data.deadlineAt,
          questions: data.questions,
          preview: false,
        });
        navigate(`/wars/blitz/${data.matchId}`, { replace: true });
        setAnswers(
          Object.fromEntries(
            (data.answeredQuestionIds ?? []).map((questionId: string) => [questionId, 'submitted'])
          )
        );
        const nextIndex = data.questions.findIndex(
          (question: BattleQuestion) => !(data.answeredQuestionIds ?? []).includes(question.id)
        );
        setIndex(nextIndex < 0 ? data.questions.length - 1 : nextIndex);
      })
      .catch((reason) => {
        if (live)
          setError(reason instanceof Error ? reason.message : 'Could not restore the match');
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [battle?.matchId, matchId, navigate, user]);

  const finish = useCallback(async () => {
    if (!battle || result || finishing.current) return;
    finishing.current = true;
    setBusy(true);
    try {
      if (battle.preview) {
        const mistakes = battle.questions
          .filter((question) => answers[question.id] !== question.correctOptionId)
          .map((question) => ({
            questionId: question.id,
            question: question.stem,
            selectedOptionId: answers[question.id],
            correctOptionId: question.correctOptionId,
            correctAnswer: question.options.find((option) => option.id === question.correctOptionId)
              ?.label,
            explanation: question.explanation,
            selectedAnswer: question.options.find((option) => option.id === answers[question.id])
              ?.label,
            options: question.options.map((option) => ({
              ...option,
              isCorrect: option.id === question.correctOptionId,
              wasSelected: option.id === answers[question.id],
            })),
            concepts: [question.primaryConcept?.id ?? question.conceptId],
            sources: question.source ? [question.source] : [],
          }));
        const correct = battle.questions.length - mistakes.length;
        setResult({
          outcome:
            correct >= Math.ceil(battle.questions.length * 0.7)
              ? 'win'
              : correct >= Math.ceil(battle.questions.length * 0.5)
                ? 'draw'
                : 'loss',
          score: { correct, total: battle.questions.length },
          opponent: {
            displayName: battle.opponent,
            correct: Math.max(2, battle.questions.length - 2),
          },
          rating: null,
          mistakes,
          weaknesses: [...new Set(mistakes.flatMap((mistake) => mistake.concepts))].map(
            (conceptId) => ({
              conceptId,
              misses: mistakes.filter((mistake) => mistake.concepts.includes(conceptId)).length,
              learnPath: `/concepts/${encodeURIComponent(String(conceptId))}`,
              drillPath: `/practice?concept=${encodeURIComponent(String(conceptId))}`,
              reviewScheduled: false,
            })
          ),
        });
      } else {
        setResult(await finalizeBlitzMatch(battle.matchId));
      }
      trackEvent('software_wars', {
        action: 'match_complete',
        mode: 'blitz',
        preview: battle.preview,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not finish the battle');
    } finally {
      finishing.current = false;
      setBusy(false);
    }
  }, [answers, battle, result]);

  useEffect(() => {
    if (!battle || result) return;
    const update = () =>
      setSecondsLeft(Math.max(0, Math.ceil((Date.parse(battle.deadlineAt) - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    const onVisibility = () => update();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [battle, result]);

  useEffect(() => {
    if (!battle || result) return;
    const trackAbandonment = () =>
      trackEvent('software_wars', {
        action: 'match_abandonment',
        mode: 'blitz',
        preview: battle.preview,
      });
    window.addEventListener('pagehide', trackAbandonment);
    return () => window.removeEventListener('pagehide', trackAbandonment);
  }, [battle, result]);

  useEffect(() => {
    if (battle && secondsLeft === 0 && !result) void finish();
  }, [battle, finish, result, secondsLeft]);

  useEffect(() => {
    if (!battle || result) return;
    const onKey = (event: KeyboardEvent) => {
      if (!current || event.metaKey || event.ctrlKey || event.altKey) return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < current.options.length) {
        event.preventDefault();
        setAnswers((existing) => ({ ...existing, [current.id]: current.options[optionIndex].id }));
      }
      if (event.key === 'Enter' && selected) {
        event.preventDefault();
        void advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const accuracy = useMemo(() => {
    if (!result?.score) return 0;
    return Math.round((result.score.correct / result.score.total) * 100);
  }, [result]);

  const browseItems = useMemo(() => {
    const items =
      browseMode === 'track'
        ? curriculum.tracks
        : browseMode === 'roadmap'
          ? curriculum.roadmaps
          : curriculum.concepts;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.title} ${item.id}`.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [browseMode, curriculum, query]);

  const visibleBrowseItems =
    showAll || query.trim() || browseMode !== 'concept' ? browseItems : browseItems.slice(0, 10);

  function selectQueueItem(item: WarsCurriculumItem) {
    setQueueSelection({ type: browseMode, id: item.id });
  }

  const canStart = queue.type === 'ranked_mix' || (Boolean(user) && queue.playable);
  const queueTitle = !user && queue.type === 'ranked_mix' ? 'Mixed battle' : queue.title;

  async function start() {
    setBusy(true);
    setError('');
    setAnswers({});
    setIndex(0);
    setResult(undefined);
    try {
      if (!user) {
        setBattle(previewBattle(queue));
      } else {
        const data = (await createBlitzMatch({
          queueType: queue.type,
          queueId: queue.type === 'ranked_mix' ? undefined : queue.id,
          questionCount: 7,
          durationSeconds: 90,
          idempotencyKey: warOperationId('blitz-create'),
        })) as any;
        setBattle({
          matchId: data.matchId,
          opponent: data.opponent.displayName,
          ranked: data.ranked,
          deadlineAt: data.deadlineAt,
          questions: data.questions,
          preview: false,
        });
        navigate(`/wars/blitz/${data.matchId}`, { replace: true });
      }
      trackEvent('software_wars', {
        action: 'match_start',
        mode: 'blitz',
        queue: queue.type,
        queue_id: queue.id,
      });
      window.setTimeout(() => questionHeading.current?.focus(), 0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not start a battle');
    } finally {
      setBusy(false);
    }
  }

  async function advance() {
    if (!battle || !current || !selected || busy) return;
    setBusy(true);
    setError('');
    try {
      if (!battle.preview) {
        const response = await submitBlitzAnswer(battle.matchId, {
          questionId: current.id,
          optionId: selected,
          idempotencyKey: warOperationId(`blitz-answer:${current.id}`),
        });
        if ((response as any).status === 'complete' || (response as any).outcome) {
          setResult(response);
          return;
        }
      }
      if (index === battle.questions.length - 1) await finish();
      else {
        setIndex((value) => value + 1);
        window.setTimeout(() => questionHeading.current?.focus(), 0);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your answer was not accepted');
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (result) trackEvent('software_wars', { action: 'immediate_rematch', mode: 'blitz' });
    setBattle(undefined);
    setResult(undefined);
    setAnswers({});
    setIndex(0);
    setError('');
  }

  async function copyChallenge() {
    let url = `${window.location.origin}/wars/blitz`;
    if (user && battle && !battle.preview) {
      try {
        const challenge = await createChallenge({
          mode: 'blitz',
          sourceMatchId: battle.matchId,
          rules: {
            queueType: queue.type,
            queueId: queue.id,
            questionCount: battle.questions.length,
            durationSeconds: 90,
          },
          idempotencyKey: warOperationId('challenge-create'),
        });
        url = `${window.location.origin}/wars/challenge/${challenge.token}`;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not create challenge link');
        return;
      }
    }
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError(`Challenge ready: ${url}`);
    }
    trackEvent('software_wars', { action: 'challenge_send', mode: 'blitz' });
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function copyResult() {
    if (!battle || battle.preview) return;
    try {
      const shared = await shareBlitzResult(battle.matchId);
      await navigator.clipboard.writeText(
        `${window.location.origin}/wars/results/${shared.shareSlug}`
      );
      setCopied(true);
      trackEvent('software_wars', { action: 'rating_share', mode: 'blitz' });
      window.setTimeout(() => setCopied(false), 1800);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not share this result');
    }
  }

  if (result && battle) {
    const outcomeMeta = {
      win: { icon: Trophy, label: 'Victory', tone: 'text-emerald-300' },
      draw: { icon: Swords, label: 'Draw', tone: 'text-amber-200' },
      loss: { icon: X, label: 'Defeat', tone: 'text-rose-300' },
    }[result.outcome as 'win' | 'draw' | 'loss'];
    const OutcomeIcon = outcomeMeta.icon;
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Link
          to="/wars"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Software Wars
        </Link>
        <header className="mt-8 grid gap-6 border-b border-white/[0.08] pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <div
              className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] ${outcomeMeta.tone}`}
            >
              <OutcomeIcon className="h-4 w-4" /> {outcomeMeta.label}
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {result.score.correct}/{result.score.total} correct
            </h1>
            <p className="mt-3 text-sm text-white/50">
              {accuracy}% accuracy against {result.opponent.displayName}
              {battle.preview ? ' · unranked preview' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!battle.preview && (
              <Button tone="ghost" onClick={() => void copyResult()}>
                <Copy className="h-4 w-4" /> Share result
              </Button>
            )}
            <Button tone="ghost" onClick={copyChallenge}>
              <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Challenge'}
            </Button>
            <Button onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Rematch
            </Button>
          </div>
        </header>

        {result.rating && (
          <div className="mt-6 inline-flex items-baseline gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">
            <span className="font-mono text-xs text-white/40">Blitz Elo</span>
            <span className="text-2xl font-semibold text-white">{result.rating.after}</span>
            <span className={result.rating.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
              {result.rating.delta >= 0 ? '+' : ''}
              {result.rating.delta}
            </span>
          </div>
        )}

        <section className="mt-10">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Weaknesses detected
          </h2>
          {result.weaknesses?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {result.weaknesses.map((weakness: any) => (
                <Card key={weakness.conceptId} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{weakness.conceptId}</h3>
                      <p className="mt-1 text-xs text-white/60">
                        {weakness.misses} miss{weakness.misses === 1 ? '' : 'es'} in this battle
                      </p>
                    </div>
                    <Badge tone={weakness.reviewScheduled ? 'sky' : 'default'}>
                      {weakness.reviewScheduled ? 'Review queued' : 'Preview only'}
                    </Badge>
                  </div>
                  <nav className="mt-5 flex gap-5 font-mono text-xs text-white/55">
                    <Link
                      to={`/concepts/${encodeURIComponent(String(weakness.conceptId))}`}
                      className="inline-flex min-h-11 items-center hover:text-white"
                    >
                      Learn
                    </Link>
                    <Link
                      to={weakness.drillPath}
                      className="inline-flex min-h-11 items-center hover:text-white"
                    >
                      Drill
                    </Link>
                    <Link
                      to="/practice/all?tab=reviews"
                      className="inline-flex min-h-11 items-center hover:text-white"
                    >
                      Review
                    </Link>
                  </nav>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-4 p-5 text-sm text-emerald-200">
              Clean run. No remediation was added.
            </Card>
          )}
        </section>
        {shareUrl && !copied && (
          <p className="mt-5 break-all font-mono text-[10px] text-sky-200/70">
            Share link: {shareUrl}
          </p>
        )}

        <section className="mt-10">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Mistake review
          </h2>
          <div className="mt-4 space-y-3">
            {result.mistakes?.length ? (
              result.mistakes.map((mistake: any, mistakeIndex: number) => (
                <details
                  key={mistake.questionId}
                  onToggle={(event) => {
                    if (event.currentTarget.open) {
                      trackEvent('software_wars', {
                        action: 'mistake_review',
                        mode: 'blitz',
                        concept_count: mistake.concepts.length,
                      });
                    }
                  }}
                  className="group rounded-xl border border-white/[0.08] bg-white/[0.02]"
                >
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-sm text-white/80">
                    <span>
                      <span className="mr-3 font-mono text-xs text-white/30">
                        {String(mistakeIndex + 1).padStart(2, '0')}
                      </span>
                      {mistake.question}
                    </span>
                    <span aria-hidden="true" className="text-white/40 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-white/[0.06] px-5 py-5">
                    {mistake.selectedAnswer && (
                      <p className="text-sm text-rose-200">
                        <X className="mr-2 inline h-4 w-4" />
                        Your answer: {mistake.selectedAnswer}
                      </p>
                    )}
                    <p className="text-sm text-white">
                      <Check className="mr-2 inline h-4 w-4 text-emerald-300" />
                      Correct answer: {mistake.correctAnswer}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
                      {mistake.explanation}
                    </p>
                    {mistake.concepts?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mistake.concepts.map((conceptId: string) => (
                          <Link
                            key={conceptId}
                            to={`/concepts/${encodeURIComponent(conceptId)}`}
                            className="inline-flex min-h-11 items-center rounded-md border border-white/10 px-3 font-mono text-[10px] text-sky-200 hover:border-sky-300/30 hover:text-white"
                          >
                            Learn {conceptId.replaceAll('-', ' ')}
                          </Link>
                        ))}
                      </div>
                    )}
                    {mistake.options?.length > 0 && (
                      <div className="mt-5 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                        {mistake.options.map((option: any) => (
                          <div key={option.id} className="py-4">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                              <span className="font-medium">{option.label}</span>
                              {option.isCorrect && (
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                                  Correct
                                </span>
                              )}
                              {option.wasSelected && !option.isCorrect && (
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-rose-300">
                                  Your choice
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-white/50">
                              {option.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {mistake.sources?.map((source: any) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex min-h-11 items-center font-mono text-xs text-sky-300 hover:text-sky-200"
                      >
                        Source · {source.title} ↗
                      </a>
                    ))}
                  </div>
                </details>
              ))
            ) : (
              <Card className="p-5 text-sm text-white/50">Every answer was correct.</Card>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (battle && current) {
    return (
      <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <Swords className="h-5 w-5 text-sky-300" />
            <div>
              <p className="text-sm font-medium text-white">You vs {battle.opponent}</p>
              <p className="font-mono text-[10px] text-white/40">
                {battle.ranked ? 'Ranked Mix' : 'Unranked practice'} ·{' '}
                {battle.preview ? 'local preview' : 'server synced'}
              </p>
            </div>
          </div>
          <div
            className={`flex min-h-11 items-center gap-2 rounded-md border px-3 font-mono text-sm ${secondsLeft <= 15 ? 'border-rose-300/30 text-rose-200' : 'border-white/10 text-white/75'}`}
            aria-label={`${secondsLeft} seconds remaining`}
          >
            <Clock3 className="h-4 w-4" aria-hidden="true" /> {formatTimer(secondsLeft)}
          </div>
        </header>
        <div className="mt-4 flex items-center gap-4">
          <span className="shrink-0 font-mono text-[10px] text-white/40">
            {index + 1} / {battle.questions.length}
          </span>
          <ProgressBar value={((index + 1) / battle.questions.length) * 100} tone="sky" />
        </div>

        <main className="mx-auto mt-12 max-w-3xl md:mt-16">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{current.topic}</Badge>
            <Badge>{current.difficulty}</Badge>
            {current.primaryConcept && (
              <Link
                to={current.primaryConcept.learnPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-md border border-sky-300/20 bg-sky-300/[0.06] px-2.5 font-mono text-[10px] text-sky-200 hover:border-sky-300/40 hover:text-white"
              >
                Concept · {current.primaryConcept.name} ↗
              </Link>
            )}
          </div>
          <h1
            ref={questionHeading}
            tabIndex={-1}
            className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white outline-none md:text-3xl"
          >
            {current.stem}
          </h1>
          <div className="mt-8 grid gap-3" role="radiogroup" aria-label="Answer choices">
            {current.options.map((option, optionIndex) => {
              const active = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() =>
                    setAnswers((existing) => ({ ...existing, [current.id]: option.id }))
                  }
                  className={`grid min-h-14 grid-cols-[2rem_1fr] items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${active ? 'border-sky-300/60 bg-sky-300/[0.08] text-white' : 'border-white/[0.09] bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'}`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md border font-mono text-xs ${active ? 'border-sky-200/50 text-sky-200' : 'border-white/10 text-white/35'}`}
                  >
                    {optionIndex + 1}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-300">
              {error}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-[10px] text-white/60">
              Keys 1–4 select · Enter submits
            </span>
            <Button
              onClick={() => void advance()}
              disabled={!selected || busy}
              className="min-h-11 px-5"
            >
              {index === battle.questions.length - 1 ? 'Finish' : 'Lock answer'}{' '}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <Link
        to="/wars"
        className="inline-flex min-h-11 items-center gap-2 font-mono text-xs text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Software Wars
      </Link>
      <header className="mt-7 max-w-2xl">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-sky-300">
          <Swords className="h-4 w-4" /> Blitz Wars
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ninety seconds. Every decision counts.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Pick a lane. Accuracy decides the match; response time only breaks a tie.
        </p>
      </header>

      <section className="mt-8 sm:mt-10" aria-labelledby="blitz-queue-heading">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <h2
            id="blitz-queue-heading"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40"
          >
            Queue
          </h2>
          {queue.type !== 'ranked_mix' && (
            <button
              type="button"
              onClick={() => setQueueSelection(RANKED_QUEUE)}
              className="inline-flex min-h-11 items-center rounded-md px-2 font-mono text-xs text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              Use Ranked Mix
            </button>
          )}
        </div>

        <Card className="grid min-w-0 gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-white">{queueTitle}</h3>
              <Badge tone={queue.type === 'ranked_mix' ? 'sky' : 'default'}>
                {queue.type === 'ranked_mix'
                  ? user
                    ? 'Ranked when enabled'
                    : 'Unranked guest'
                  : 'Unranked'}
              </Badge>
            </div>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              {queue.type === 'ranked_mix'
                ? user
                  ? 'Balanced questions across the full approved Software Wars bank.'
                  : 'Five source-backed questions from the browser-safe guest set. No signup required.'
                : queue.playable
                  ? `${queue.activeCount} approved questions. Practice this area without moving your global rating.`
                  : `${queue.candidateCount ?? 0} questions are currently mapped here, but this queue needs ${curriculum.minimumPlayableQuestions} approved questions before it opens.`}
            </p>
            {queue.learnPath && (
              <Link
                to={queue.learnPath}
                className="mt-3 inline-flex min-h-11 items-center font-mono text-xs text-sky-200 hover:text-white"
              >
                Open in Learn <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            )}
            <p className="mt-3 font-mono text-[10px] text-white/60">
              Opponent · Cloudflare Sage · fixed benchmark rating
            </p>
          </div>
          <Button
            onClick={() => void start()}
            disabled={busy || !canStart}
            className="min-h-11 w-full px-5 md:w-auto"
          >
            {busy
              ? 'Finding opponent…'
              : !queue.playable
                ? 'Queue building'
                : !user && queue.type !== 'ranked_mix'
                  ? 'Choose Mixed battle'
                  : user
                    ? 'Find opponent'
                    : 'Play unranked'}{' '}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Or practise a specific area</p>
            <p className="mt-1 text-xs text-white/60">
              {curriculum.totals.tracks} tracks · {curriculum.totals.roadmaps} roadmaps ·{' '}
              {curriculum.totals.concepts} concepts
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Queue catalogue">
            {(['track', 'roadmap', 'concept'] as const).map((section) => (
              <FilterPill
                key={section}
                active={browseMode === section}
                onClick={() => {
                  setBrowseMode(section);
                  setQuery('');
                  setShowAll(false);
                }}
              >
                {section === 'track' ? 'Tracks' : section === 'roadmap' ? 'Roadmaps' : 'Concepts'}
              </FilterPill>
            ))}
          </div>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">Search {browseMode}s</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${browseMode}s`}
            className="min-h-11 w-full rounded-xl border border-white/[0.09] bg-white/[0.025] py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-sky-300/40 focus:ring-2 focus:ring-sky-300/30"
          />
        </label>

        <div className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.015]">
          {visibleBrowseItems.map((item) => {
            const active = queue.type === browseMode && queue.id === item.id;
            return (
              <div
                key={item.id}
                className={`flex min-h-14 items-center gap-2 px-2 ${active ? 'bg-sky-300/[0.06]' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => selectQueueItem(item)}
                  aria-pressed={active}
                  className="min-w-0 flex-1 rounded-md px-2 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300/60"
                >
                  <span className="block truncate text-sm text-white/80">{item.title}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-white/60">
                    {item.activeCount > 0
                      ? `${item.activeCount} approved question${item.activeCount === 1 ? '' : 's'}`
                      : item.candidateCount > 0
                        ? `${item.candidateCount} in review`
                        : 'Coverage planned'}
                  </span>
                </button>
                <span
                  className={`hidden font-mono text-[10px] uppercase tracking-[0.12em] sm:block ${item.playable ? 'text-emerald-300' : 'text-white/60'}`}
                >
                  {item.playable ? 'Playable' : 'Building'}
                </span>
                <Link
                  to={item.learnPath}
                  className="inline-flex min-h-11 shrink-0 items-center px-2 font-mono text-[10px] text-sky-200/70 hover:text-white"
                >
                  Learn
                </Link>
              </div>
            );
          })}
          {visibleBrowseItems.length === 0 && (
            <p className="px-4 py-6 text-sm text-white/40">No matching curriculum area.</p>
          )}
        </div>
        {browseMode === 'concept' && !query.trim() && browseItems.length > 10 && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            className="mt-3 inline-flex min-h-11 items-center font-mono text-xs text-white/45 hover:text-white"
          >
            {showAll ? 'Show fewer' : `Show all ${browseItems.length} concepts`}
          </button>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-xl border border-rose-300/20 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200"
          >
            <Flag className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
        {!user && (
          <p className="mt-4 text-xs text-white/60">
            You are playing unranked in this browser. Sign in only to keep Elo, history, challenge
            links, and FSRS review across devices.
          </p>
        )}
      </section>
    </div>
  );
}
