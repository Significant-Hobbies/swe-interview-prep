import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gavel,
  LockKeyhole,
  MessageSquareText,
  Radio,
  RotateCcw,
  Save,
  Scale,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, FilterPill } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { PREVIEW_TRADEOFF } from '../data/software-wars-preview';
import { trackEvent } from '../lib/analytics';
import {
  checkInTradeoff,
  createChallenge,
  getTradeoffArtifacts,
  getTradeoffMediaToken,
  getTradeoffResult,
  reportTradeoffProblem,
  saveTradeoffArtifact,
  setTranscriptConsent,
  shareTradeoffResult,
  type TradeoffArtifactView,
  type TradeoffPhase,
  type TradeoffRoom,
  type TradeoffState,
  warOperationId,
} from '../lib/softwareWars';

const TradeoffMedia = lazy(() =>
  import('../components/TradeoffMedia').then((module) => ({ default: module.TradeoffMedia }))
);
const MediaUnavailable = lazy(() =>
  import('../components/TradeoffMedia').then((module) => ({ default: module.MediaUnavailable }))
);

const PHASES = [
  { id: 'initial_solution', label: 'Initial', seconds: 10 * 60 },
  { id: 'revision', label: 'Twist', seconds: 8 * 60 },
  { id: 'debate', label: 'Debate', seconds: 8 * 60 },
  { id: 'voting', label: 'Vote', seconds: 4 * 60 },
  { id: 'complete', label: 'Result', seconds: 0 },
] as const;

type Phase = (typeof PHASES)[number]['id'];
type Artifact = (typeof PREVIEW_TRADEOFF.allowedArtifacts)[number];

function displayPhase(phase: TradeoffPhase): Phase {
  if (phase === 'twist' || phase === 'revision') return 'revision';
  if (phase === 'reveal' || phase === 'debate') return 'debate';
  if (phase === 'voting') return 'voting';
  if (phase === 'adjudicating') return 'complete';
  if (phase === 'complete' || phase === 'review_required') return 'complete';
  return 'initial_solution';
}

function formatTimer(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function TradeoffWar() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [entered, setEntered] = useState(Boolean(matchId));
  const [phase, setPhase] = useState<Phase>('initial_solution');
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [artifact, setArtifact] = useState<Artifact>('Text');
  const [drafts, setDrafts] = useState<Record<Artifact, string>>(() => {
    const blank = Object.fromEntries(
      PREVIEW_TRADEOFF.allowedArtifacts.map((kind) => [kind, ''])
    ) as Record<Artifact, string>;
    try {
      return {
        ...blank,
        ...JSON.parse(localStorage.getItem('software-wars:tradeoff-preview') || '{}'),
      };
    } catch {
      return blank;
    }
  });
  const [savedAt, setSavedAt] = useState<Date>();
  const [consent, setConsent] = useState(false);
  const [vote, setVote] = useState<'win' | 'draw' | 'loss'>();
  const [media, setMedia] = useState<{ authToken: string; meetingId: string }>();
  const [mediaReason, setMediaReason] = useState('RealtimeKit is disabled in local preview');
  const [room, setRoom] = useState<TradeoffRoom>();
  const [liveState, setLiveState] = useState<TradeoffState>();
  const [connection, setConnection] = useState<'preview' | 'connecting' | 'connected' | 'offline'>(
    matchId ? 'connecting' : 'preview'
  );
  const [roomError, setRoomError] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [revealedArtifacts, setRevealedArtifacts] = useState<TradeoffArtifactView[]>([]);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getTradeoffResult>>>();
  const [resultAction, setResultAction] = useState('');
  const socketRef = useRef<WebSocket | undefined>(undefined);

  const activePhase = liveState ? displayPhase(liveState.phase) : phase;
  const phaseIndex = PHASES.findIndex((item) => item.id === activePhase);
  const draft = drafts[artifact];
  const frozen = ['debate', 'voting', 'complete'].includes(activePhase);

  useEffect(() => {
    if (!matchId || !user || !liveState) return;
    if (
      !['reveal', 'debate', 'voting', 'adjudicating', 'complete', 'review_required'].includes(
        liveState.phase
      )
    ) {
      return;
    }
    let active = true;
    const loadArtifacts = () =>
      getTradeoffArtifacts(matchId)
        .then(({ artifacts }) => active && setRevealedArtifacts(artifacts))
        .catch(() => {});
    void loadArtifacts();
    const timer = window.setInterval(() => void loadArtifacts(), 5_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [liveState, matchId, user]);

  useEffect(() => {
    if (
      !matchId ||
      !user ||
      !liveState ||
      !['adjudicating', 'complete', 'review_required'].includes(liveState.phase)
    ) {
      return;
    }
    let active = true;
    let attempts = 0;
    const loadResult = async () => {
      try {
        const next = await getTradeoffResult(matchId);
        if (!active) return;
        setResult(next);
        if (next.status === 'complete' || next.status === 'review_required') return;
      } catch (reason) {
        if (active) setRoomError(reason instanceof Error ? reason.message : 'Result unavailable');
      }
      attempts += 1;
      if (active && attempts < 12) window.setTimeout(() => void loadResult(), 1_500);
    };
    void loadResult();
    return () => {
      active = false;
    };
  }, [liveState, matchId, user]);

  useEffect(() => {
    if (!matchId || !user) return;
    let active = true;
    let socket: WebSocket | undefined;
    void checkInTradeoff(matchId)
      .then(({ room: nextRoom, realtime }) => {
        if (!active) return;
        setRoom(nextRoom);
        const socketUrl = new URL(realtime.url);
        socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        socketUrl.searchParams.set('token', realtime.token);
        socket = new WebSocket(socketUrl);
        socketRef.current = socket;
        socket.addEventListener('open', () => setConnection('connected'));
        socket.addEventListener('close', () => active && setConnection('offline'));
        socket.addEventListener('error', () => active && setConnection('offline'));
        socket.addEventListener('message', (event) => {
          const message = JSON.parse(String(event.data)) as {
            type: string;
            state?: TradeoffState;
          };
          if (!active || !message.state) return;
          setLiveState(message.state);
          setSecondsLeft(
            message.state.phaseEndsAt
              ? Math.max(0, Math.ceil((message.state.phaseEndsAt - message.state.serverNow) / 1000))
              : 0
          );
          if (
            message.type === 'connected' &&
            message.state.phase === 'check_in' &&
            !message.state.ready[nextRoom.participant.side]
          ) {
            socket?.send(
              JSON.stringify({
                type: 'ready',
                operationId: warOperationId('ready'),
                expectedStateVersion: message.state.stateVersion,
              })
            );
          }
        });
      })
      .catch((reason) => {
        if (!active) return;
        setConnection('offline');
        setRoomError(reason instanceof Error ? reason.message : 'Could not enter this room');
      });
    return () => {
      active = false;
      socket?.close(1000, 'page_unmounted');
    };
  }, [matchId, user]);

  useEffect(() => {
    if (!entered || activePhase === 'complete') return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [activePhase, entered]);

  useEffect(() => {
    if (!matchId || !liveState || ['complete', 'review_required'].includes(liveState.phase)) return;
    const trackAbandonment = () =>
      trackEvent('software_wars', { action: 'match_abandonment', mode: 'tradeoff' });
    window.addEventListener('pagehide', trackAbandonment);
    return () => window.removeEventListener('pagehide', trackAbandonment);
  }, [liveState, matchId]);

  useEffect(() => {
    if (!entered) return;
    const timer = window.setTimeout(() => {
      if (
        matchId &&
        user &&
        liveState &&
        ['initial_solution', 'revision'].includes(liveState.phase)
      ) {
        void saveTradeoffArtifact(matchId, {
          artifactType: artifact.toLowerCase(),
          content: drafts[artifact],
          idempotencyKey: warOperationId(`artifact-${artifact.toLowerCase()}`),
        })
          .then(() => setSavedAt(new Date()))
          .catch((reason) =>
            setRoomError(reason instanceof Error ? reason.message : 'Artifact save failed')
          );
      } else {
        localStorage.setItem('software-wars:tradeoff-preview', JSON.stringify(drafts));
        setSavedAt(new Date());
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [artifact, drafts, entered, liveState, matchId, user]);

  useEffect(() => {
    if (!entered || !matchId || !user) return;
    let live = true;
    void getTradeoffMediaToken(matchId)
      .then((access) => {
        if (!live) return;
        if (access.available)
          setMedia({ authToken: access.authToken, meetingId: access.meetingId });
        else setMediaReason(access.reason);
      })
      .catch((reason) => {
        if (live) {
          setMediaReason(reason instanceof Error ? reason.message : 'Media unavailable');
          trackEvent('software_wars', { action: 'media_failure', mode: 'tradeoff' });
        }
      });
    return () => {
      live = false;
    };
  }, [entered, matchId, user]);

  const wordCount = useMemo(() => draft.trim().split(/\s+/).filter(Boolean).length, [draft]);

  function nextPhase() {
    if (liveState) return;
    const next = PHASES[Math.min(PHASES.length - 1, phaseIndex + 1)];
    setPhase(next.id);
    setSecondsLeft(next.seconds);
    trackEvent('software_wars', { action: 'phase_advance', mode: 'tradeoff', phase: next.id });
  }

  async function toggleConsent() {
    const next = !consent;
    setConsent(next);
    if (matchId && user) {
      try {
        await setTranscriptConsent(matchId, next);
        if (liveState && ['reveal', 'debate'].includes(liveState.phase)) {
          socketRef.current?.send(
            JSON.stringify({
              type: 'transcript_consent',
              consent: next,
              operationId: warOperationId('transcript-consent'),
              expectedStateVersion: liveState.stateVersion,
            })
          );
        }
      } catch {
        setConsent(!next);
      }
    }
  }

  function submitVote() {
    if (!vote) return;
    if (!liveState) {
      nextPhase();
      return;
    }
    socketRef.current?.send(
      JSON.stringify({
        type: 'vote',
        vote,
        operationId: warOperationId('vote'),
        expectedStateVersion: liveState.stateVersion,
      })
    );
  }

  async function createTradeoffInvite() {
    if (!user || creatingInvite) return;
    setCreatingInvite(true);
    setRoomError('');
    try {
      const challenge = await createChallenge({
        mode: 'tradeoff',
        rules: { ranked: false },
        idempotencyKey: warOperationId('tradeoff-challenge'),
      });
      const url = `${window.location.origin}/wars/challenge/${challenge.token}`;
      setInviteUrl(url);
      try {
        await navigator.clipboard?.writeText(url);
      } catch {
        // Keep the visible URL available when clipboard permission is denied.
      }
      trackEvent('software_wars', { action: 'challenge_send', mode: 'tradeoff' });
    } catch (reason) {
      setRoomError(reason instanceof Error ? reason.message : 'Could not create invite');
    } finally {
      setCreatingInvite(false);
    }
  }

  async function shareResult() {
    if (!matchId) return;
    setResultAction('Sharing…');
    try {
      const shared = await shareTradeoffResult(matchId);
      const url = `${window.location.origin}/wars/results/${shared.shareSlug}`;
      try {
        await navigator.clipboard?.writeText(url);
        setResultAction('Result link copied');
      } catch {
        setResultAction(`Share result: ${url}`);
      }
      trackEvent('software_wars', { action: 'rating_share', mode: 'tradeoff' });
    } catch (reason) {
      setResultAction(reason instanceof Error ? reason.message : 'Could not share result');
    }
  }

  async function reportProblem() {
    if (!matchId || !room?.problem.id) return;
    setResultAction('Reporting…');
    try {
      await reportTradeoffProblem(matchId, room.problem.id);
      setResultAction('Report sent for review');
    } catch (reason) {
      setResultAction(reason instanceof Error ? reason.message : 'Could not send report');
    }
  }

  if (!entered) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Link
          to="/wars"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Software Wars
        </Link>
        <header className="mt-7 max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            <Scale className="h-4 w-4" /> Tradeoff Wars
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Engineering judgment, under pressure.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            Two engineers solve the same open-ended brief. Halfway through, the system changes.
            Build, defend, and decide.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge>Practice workbench</Badge>
              <span className="font-mono text-[11px] text-white/40">30:00 total</span>
            </div>
            <h2 className="mt-7 text-xl font-semibold text-white">{PREVIEW_TRADEOFF.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Preview the full phase flow locally. Your draft stays in this browser; no opponent or
              rating is created.
            </p>
            <Button
              onClick={() => {
                setEntered(true);
                trackEvent('software_wars', {
                  action: 'match_start',
                  mode: 'tradeoff',
                  preview: true,
                });
              }}
              className="mt-7 min-h-11 px-5"
            >
              Open workbench <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
          <Card className="p-6">
            <Users className="h-5 w-5 text-white/50" />
            <h2 className="mt-4 font-medium text-white">Schedule a real battle</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Invite links, check-in, synchronized twists, video, private voting, and AI
              adjudication are server-backed and require two signed-in accounts.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
              <ShieldCheck className="h-4 w-4" /> Private preview until operator launch
            </div>
            {user && (
              <Button
                tone="ghost"
                onClick={() => void createTradeoffInvite()}
                disabled={creatingInvite}
                className="mt-5 min-h-11 w-full"
              >
                {creatingInvite ? 'Creating invite…' : 'Create battle invite'}
              </Button>
            )}
            {inviteUrl && (
              <p className="mt-3 break-all font-mono text-[10px] leading-5 text-sky-200/70">
                Invite copied: {inviteUrl}
              </p>
            )}
            {roomError && !entered && (
              <p role="alert" className="mt-3 text-xs text-amber-200/70">
                {roomError}
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-4 md:px-5 md:py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/wars"
            aria-label="Leave Tradeoff workbench"
            className="flex h-11 w-11 items-center justify-center rounded-md text-white/50 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-sm font-medium text-white">
              {room?.problem.title ?? PREVIEW_TRADEOFF.title}
            </p>
            <p className="font-mono text-[10px] text-white/35">
              {matchId ? `${room?.ranked ? 'Ranked' : 'Unranked'} room` : 'Practice room'} ·
              artifacts private until reveal
            </p>
          </div>
        </div>
        <div
          className={`flex min-h-11 items-center gap-2 rounded-md border px-3 font-mono text-sm ${secondsLeft <= 60 ? 'border-amber-200/30 text-amber-200' : 'border-white/10 text-white/75'}`}
          aria-live="polite"
        >
          <Clock3 className="h-4 w-4" /> {formatTimer(secondsLeft)}
        </div>
      </header>

      <ol
        className="mt-3 grid grid-cols-5 overflow-hidden rounded-lg border border-white/[0.08]"
        aria-label="Battle phases"
      >
        {PHASES.map((item, itemIndex) => (
          <li
            key={item.id}
            className={`min-w-0 border-r border-white/[0.06] px-2 py-2.5 text-center font-mono text-[10px] uppercase tracking-wide last:border-r-0 ${item.id === activePhase ? 'bg-white/[0.08] text-white' : itemIndex < phaseIndex ? 'text-emerald-300/65' : 'text-white/25'}`}
            aria-current={item.id === activePhase ? 'step' : undefined}
          >
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{itemIndex + 1}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_20rem]">
        <aside className="order-3 space-y-4 xl:order-1">
          <Card className="p-3">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
                Room
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono text-[10px] ${connection === 'offline' ? 'text-amber-200/70' : 'text-emerald-300/70'}`}
              >
                <Radio className="h-3 w-3" /> {connection}
              </span>
            </div>
            <Suspense
              fallback={<div className="min-h-40 animate-pulse rounded-lg bg-white/[0.03]" />}
            >
              {media ? <TradeoffMedia {...media} /> : <MediaUnavailable reason={mediaReason} />}
            </Suspense>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <div>
                <p className="text-xs font-medium text-white">Transcript consent</p>
                <p className="mt-1 text-[11px] leading-5 text-white/40">
                  Video recording is off. A transcript is copied to project storage only if both
                  players opt in.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent}
              onClick={() => void toggleConsent()}
              className={`mt-4 flex min-h-11 w-full items-center justify-between rounded-md border px-3 text-xs ${consent ? 'border-sky-200/30 text-sky-200' : 'border-white/10 text-white/50'}`}
            >
              {consent ? 'Consent given' : 'Do not transcribe'}
              <span
                className={`h-4 w-7 rounded-full p-0.5 ${consent ? 'bg-sky-300/70' : 'bg-white/15'}`}
              >
                <span
                  className={`block h-3 w-3 rounded-full bg-black transition-transform ${consent ? 'translate-x-3' : ''}`}
                />
              </span>
            </button>
          </Card>
        </aside>

        <main className="order-1 min-w-0 xl:order-2">
          <Card className="overflow-hidden">
            <div className="border-b border-white/[0.08] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge>
                  {activePhase === 'initial_solution'
                    ? liveState?.phase === 'check_in'
                      ? 'Waiting for opponent'
                      : 'Original brief'
                    : 'Requirement update active'}
                </Badge>
                <span className="font-mono text-[10px] text-white/35">Docs + AI allowed</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/70">
                {matchId
                  ? (liveState?.prompt ??
                    room?.problem.prompt ??
                    'The brief unlocks when the live room begins.')
                  : PREVIEW_TRADEOFF.prompt}
              </p>
              {activePhase !== 'initial_solution' && (
                <div className="mt-4 border-l border-amber-200/50 bg-amber-200/[0.04] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber-200/70">
                    Midway twist
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-50/80">
                    {matchId
                      ? (liveState?.hiddenTwist ??
                        room?.problem.hiddenTwist ??
                        'The requirement update is synchronizing…')
                      : PREVIEW_TRADEOFF.twist}
                  </p>
                </div>
              )}
            </div>

            {activePhase === 'complete' ? (
              <div className="p-6 md:p-10">
                <Gavel className="mx-auto h-7 w-7 text-sky-300" />
                <h1 className="mt-5 text-center text-3xl font-semibold tracking-tight text-white">
                  {result
                    ? result.outcome === 'win'
                      ? 'Judgment wins.'
                      : result.outcome === 'loss'
                        ? 'Argument lost.'
                        : 'Battle drawn.'
                    : liveState?.phase === 'review_required'
                      ? 'Operator review required.'
                      : liveState
                        ? 'Finalizing result…'
                        : 'Practice complete'}
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-white/50">
                  {result?.evaluation?.reasoning ??
                    (liveState
                      ? 'Private votes and frozen evidence are being reconciled. This page updates automatically.'
                      : `Your private vote was ${vote ?? 'not submitted'}. A real disagreement would enter rubric-based AI adjudication.`)}
                </p>
                {result?.rating && (
                  <div className="mx-auto mt-6 w-fit rounded-lg border border-white/10 px-5 py-3 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/35">
                      Tradeoff Elo
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {result.rating.after}{' '}
                      <span
                        className={result.rating.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}
                      >
                        {result.rating.delta >= 0 ? '+' : ''}
                        {result.rating.delta}
                      </span>
                    </p>
                  </div>
                )}
                {result?.weaknesses.length ? (
                  <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
                    {result.weaknesses.map((weakness) => (
                      <Card key={weakness.conceptId} className="p-4">
                        <Badge>{weakness.reviewRating} review</Badge>
                        <p className="mt-3 text-sm font-medium text-white">{weakness.conceptId}</p>
                        <div className="mt-4 flex gap-4 font-mono text-xs text-white/50">
                          <Link
                            to={`/concepts/${encodeURIComponent(weakness.conceptId)}`}
                            className="hover:text-white"
                          >
                            Learn
                          </Link>
                          <Link to={weakness.drillPath} className="hover:text-white">
                            Drill
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : null}
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {matchId && result ? (
                    <>
                      <Button tone="ghost" onClick={() => void createTradeoffInvite()}>
                        <RotateCcw className="h-4 w-4" /> Challenge again
                      </Button>
                      <Button tone="ghost" onClick={() => void shareResult()}>
                        <Share2 className="h-4 w-4" /> Share result
                      </Button>
                      <Button tone="ghost" onClick={() => void reportProblem()}>
                        Report problem
                      </Button>
                    </>
                  ) : (
                    <Button
                      tone="ghost"
                      onClick={() => {
                        setPhase('initial_solution');
                        setSecondsLeft(PHASES[0].seconds);
                        setVote(undefined);
                      }}
                    >
                      Rematch
                    </Button>
                  )}
                  <Link
                    to="/wars"
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-medium text-black"
                  >
                    Back to Wars
                  </Link>
                </div>
                {(resultAction || inviteUrl) && (
                  <p
                    aria-live="polite"
                    className="mt-4 break-all font-mono text-[10px] text-sky-200/70"
                  >
                    {resultAction || `Invite copied: ${inviteUrl}`}
                  </p>
                )}
              </div>
            ) : activePhase === 'voting' ? (
              <div className="p-6 md:p-10">
                <div className="mx-auto max-w-xl text-center">
                  <Scale className="mx-auto h-6 w-6 text-white/60" />
                  <h1 className="mt-4 text-2xl font-semibold text-white">Decide privately</h1>
                  <p className="mt-2 text-sm text-white/50">
                    The other player cannot see your vote. Compatible votes finalize immediately;
                    disagreement goes to adjudication.
                  </p>
                  <div className="mt-7 grid grid-cols-3 gap-3">
                    {(['win', 'draw', 'loss'] as const).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setVote(choice)}
                        className={`min-h-14 rounded-xl border text-sm capitalize ${vote === choice ? 'border-sky-300/50 bg-sky-300/[0.08] text-white' : 'border-white/10 text-white/50 hover:border-white/20'}`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  <Button onClick={submitVote} disabled={!vote} className="mt-7 min-h-11 px-5">
                    Submit private vote <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {activePhase === 'debate' && revealedArtifacts.length > 0 && (
                  <section
                    className="border-b border-white/[0.08] p-4"
                    aria-label="Revealed artifacts"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
                      Frozen evidence revealed
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {revealedArtifacts.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-lg border border-white/10 bg-black/20 p-4"
                        >
                          <div className="flex justify-between gap-3 font-mono text-[10px] uppercase text-white/35">
                            <span>
                              {item.side === room?.participant.side
                                ? 'Your'
                                : `${room?.opponent.displayName}'s`}{' '}
                              {item.artifactType}
                            </span>
                            <span>v{item.version}</span>
                          </div>
                          <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap font-mono text-xs leading-5 text-white/60">
                            {item.content || 'Stored artifact unavailable'}
                          </pre>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                <div className="flex flex-wrap gap-1 border-b border-white/[0.08] px-3 py-2">
                  {PREVIEW_TRADEOFF.allowedArtifacts.map((kind) => (
                    <FilterPill
                      key={kind}
                      active={artifact === kind}
                      onClick={() => setArtifact(kind)}
                    >
                      {kind}
                    </FilterPill>
                  ))}
                </div>
                <div className="relative">
                  <textarea
                    aria-label={`${artifact} artifact`}
                    value={draft}
                    disabled={frozen}
                    onChange={(event) =>
                      setDrafts((existing) => ({ ...existing, [artifact]: event.target.value }))
                    }
                    placeholder={
                      artifact === 'Code'
                        ? '// Sketch critical interfaces or data flow…'
                        : artifact === 'Schema'
                          ? 'events(id, tenant_id, endpoint_id, sequence, status, next_attempt_at)…'
                          : artifact === 'Diagram'
                            ? 'Diagram as Mermaid or nodes and directed edges: Client --> Gateway --> Queue…'
                            : artifact === 'Pseudocode'
                              ? 'deliver(event):\n  lease = acquire(event.id)\n  retry with bounded backoff…'
                              : 'State the requirements, invariants, design, failure modes, and tradeoffs…'
                    }
                    className="min-h-[29rem] w-full resize-y bg-black/20 p-5 font-mono text-sm leading-6 text-white/75 outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:text-white/45 md:p-6"
                  />
                  <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2 font-mono text-[10px] text-white/35">
                    <span>
                      {wordCount} words ·{' '}
                      {frozen
                        ? 'artifact frozen'
                        : savedAt
                          ? `saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'saving…'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {frozen ? <LockKeyhole className="h-3 w-3" /> : <Save className="h-3 w-3" />}{' '}
                      project-owned storage
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </main>

        <aside className="order-2 space-y-4 xl:order-3">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-white/40" />
              <h2 className="text-xs font-medium text-white">Phase objective</h2>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">
              {activePhase === 'initial_solution' &&
                'Establish requirements, invariants, data model, and the end-to-end delivery path.'}
              {activePhase === 'revision' &&
                'Absorb the twist. Amend the design and make the new tradeoffs explicit.'}
              {activePhase === 'debate' &&
                'Artifacts are frozen. Defend choices, probe failure modes, and concede real weaknesses.'}
              {activePhase === 'voting' &&
                'Vote on the stronger engineering argument, not presentation polish.'}
            </p>
            {!liveState && activePhase !== 'complete' && activePhase !== 'voting' && (
              <Button onClick={nextPhase} className="mt-5 min-h-11 w-full">
                {activePhase === 'initial_solution'
                  ? 'Reveal twist'
                  : activePhase === 'revision'
                    ? 'Freeze & debate'
                    : 'Move to voting'}{' '}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-white/40" />
              <h2 className="text-xs font-medium text-white">Evaluation lens</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-white/45">
              <li>· Requirements and invariants</li>
              <li>· Architecture and data flow</li>
              <li>· Failure handling and operability</li>
              <li>· Explicit, defensible tradeoffs</li>
            </ul>
          </Card>

          <div className="flex items-start gap-2 px-1 text-[11px] leading-5 text-white/30">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Server deadlines remain
            authoritative after reconnect.
          </div>
          {roomError && (
            <p role="alert" className="px-1 text-[11px] leading-5 text-amber-200/70">
              {roomError}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
