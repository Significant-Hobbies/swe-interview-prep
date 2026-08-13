import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  Gavel,
  LockKeyhole,
  MessageSquareText,
  Radio,
  RotateCcw,
  Scale,
  Send,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { SoloTradeoffSetup } from '../components/SoloTradeoffSetup';
import {
  TradeoffArtifactWorkspace,
  type TradeoffArtifactKind,
  type TradeoffDrafts,
} from '../components/TradeoffArtifactWorkspace';
import { Badge, Button, Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { PREVIEW_TRADEOFF } from '../data/software-wars-preview';
import { trackEvent } from '../lib/analytics';
import {
  continueSoloDebate,
  createSoloOpponentArtifact,
  evaluateSoloTradeoff,
  reviseSoloOpponentArtifact,
  type SoloTradeoffAIConfig,
  type SoloTradeoffDebateMessage,
} from '../lib/soloTradeoffAI';
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
type SessionMode = 'practice' | 'solo' | 'live';

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
  const [sessionMode, setSessionMode] = useState<SessionMode>(matchId ? 'live' : 'practice');
  const [phase, setPhase] = useState<Phase>('initial_solution');
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [drafts, setDrafts] = useState<TradeoffDrafts>(() => {
    const blank = Object.fromEntries(
      PREVIEW_TRADEOFF.allowedArtifacts.map((kind) => [kind, ''])
    ) as TradeoffDrafts;
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
  const [soloConfig, setSoloConfig] = useState<SoloTradeoffAIConfig>({
    endpointUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    model: '',
  });
  const [soloInitialArtifact, setSoloInitialArtifact] = useState('');
  const [soloRevisedArtifact, setSoloRevisedArtifact] = useState('');
  const [soloDebateMessages, setSoloDebateMessages] = useState<SoloTradeoffDebateMessage[]>([]);
  const [soloDebateInput, setSoloDebateInput] = useState('');
  const [soloFeedback, setSoloFeedback] = useState('');
  const [soloBusy, setSoloBusy] = useState(false);
  const [soloError, setSoloError] = useState('');
  const socketRef = useRef<WebSocket | undefined>(undefined);
  const soloAbortRef = useRef<AbortController | undefined>(undefined);

  const activePhase = liveState ? displayPhase(liveState.phase) : phase;
  const phaseIndex = PHASES.findIndex((item) => item.id === activePhase);
  const frozen = ['debate', 'voting', 'complete'].includes(activePhase);
  const isSolo = sessionMode === 'solo';
  const soloOpponentArtifact = soloRevisedArtifact || soloInitialArtifact;

  const learnerArtifact = useMemo(
    () =>
      (PREVIEW_TRADEOFF.allowedArtifacts as TradeoffArtifactKind[])
        .filter((kind) => drafts[kind].trim())
        .map((kind) => `## ${kind}\n${drafts[kind].trim()}`)
        .join('\n\n'),
    [drafts]
  );

  useEffect(
    () => () => {
      soloAbortRef.current?.abort();
    },
    []
  );

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
        const artifacts = (Object.entries(drafts) as Array<[TradeoffArtifactKind, string]>).filter(
          ([, content]) => content.trim()
        );
        void Promise.all(
          artifacts.map(([kind, content]) =>
            saveTradeoffArtifact(matchId, {
              artifactType: kind.toLowerCase(),
              content,
              idempotencyKey: warOperationId(`artifact-${kind.toLowerCase()}`),
            })
          )
        )
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
  }, [drafts, entered, liveState, matchId, user]);

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

  async function nextPhase() {
    if (liveState) return;
    if (isSolo && activePhase === 'initial_solution') {
      setSoloBusy(true);
      setSoloError('');
      const controller = new AbortController();
      soloAbortRef.current?.abort();
      soloAbortRef.current = controller;
      try {
        const revised = await reviseSoloOpponentArtifact(
          soloConfig,
          PREVIEW_TRADEOFF,
          soloInitialArtifact,
          controller.signal
        );
        setSoloRevisedArtifact(revised);
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setSoloError(reason instanceof Error ? reason.message : 'AI opponent revision failed.');
        trackEvent('software_wars', {
          action: 'provider_failure',
          mode: 'tradeoff',
          solo: true,
          stage: 'twist_revision',
        });
        return;
      } finally {
        setSoloBusy(false);
      }
    }
    const next = PHASES[Math.min(PHASES.length - 1, phaseIndex + 1)];
    setPhase(next.id);
    setSecondsLeft(next.seconds);
    trackEvent('software_wars', {
      action: 'phase_advance',
      mode: 'tradeoff',
      phase: next.id,
      solo: isSolo,
    });
  }

  async function startSoloSession() {
    if (soloBusy) return;
    setSoloBusy(true);
    setSoloError('');
    setRoomError('');
    const controller = new AbortController();
    soloAbortRef.current?.abort();
    soloAbortRef.current = controller;
    try {
      const opponentArtifact = await createSoloOpponentArtifact(
        soloConfig,
        PREVIEW_TRADEOFF,
        controller.signal
      );
      setSoloInitialArtifact(opponentArtifact);
      setSoloRevisedArtifact('');
      setSoloDebateMessages([]);
      setSoloFeedback('');
      setSoloDebateInput('');
      setVote(undefined);
      setPhase('initial_solution');
      setSecondsLeft(PHASES[0].seconds);
      setSessionMode('solo');
      setConnection('connected');
      setEntered(true);
      trackEvent('software_wars', {
        action: 'match_start',
        mode: 'tradeoff',
        solo: true,
        ranked: false,
      });
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setSoloError(reason instanceof Error ? reason.message : 'Could not prepare the AI opponent.');
      trackEvent('software_wars', {
        action: 'provider_failure',
        mode: 'tradeoff',
        solo: true,
        stage: 'opponent_setup',
      });
    } finally {
      setSoloBusy(false);
    }
  }

  async function sendSoloDebateMessage() {
    const message = soloDebateInput.trim();
    if (!isSolo || !message || soloBusy) return;
    setSoloBusy(true);
    setSoloError('');
    const controller = new AbortController();
    soloAbortRef.current?.abort();
    soloAbortRef.current = controller;
    try {
      const reply = await continueSoloDebate(
        soloConfig,
        PREVIEW_TRADEOFF,
        learnerArtifact,
        soloOpponentArtifact,
        soloDebateMessages,
        message,
        controller.signal
      );
      setSoloDebateMessages((existing) => [
        ...existing,
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ]);
      setSoloDebateInput('');
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setSoloError(reason instanceof Error ? reason.message : 'The AI opponent did not respond.');
    } finally {
      setSoloBusy(false);
    }
  }

  function continueSoloLocally() {
    soloAbortRef.current?.abort();
    setSoloBusy(false);
    setSoloError('');
    setSessionMode('practice');
    setConnection('preview');
    trackEvent('software_wars', {
      action: 'solo_fallback',
      mode: 'tradeoff',
      phase: activePhase,
    });
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
    if (isSolo) {
      setSoloBusy(true);
      setSoloError('');
      const controller = new AbortController();
      soloAbortRef.current?.abort();
      soloAbortRef.current = controller;
      void evaluateSoloTradeoff(
        soloConfig,
        PREVIEW_TRADEOFF,
        learnerArtifact,
        soloOpponentArtifact,
        soloDebateMessages,
        vote,
        controller.signal
      )
        .then((feedback) => {
          setSoloFeedback(feedback);
          setPhase('complete');
          setSecondsLeft(0);
          trackEvent('software_wars', {
            action: 'match_complete',
            mode: 'tradeoff',
            solo: true,
            ranked: false,
          });
        })
        .catch((reason) => {
          if (reason instanceof DOMException && reason.name === 'AbortError') return;
          setSoloError(reason instanceof Error ? reason.message : 'AI review failed.');
        })
        .finally(() => setSoloBusy(false));
      return;
    }
    if (!liveState) {
      void nextPhase();
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
            Solve an open-ended brief alone with AI or against another engineer. Halfway through,
            the system changes. Build, defend, and decide.
          </p>
        </header>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
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
                setSessionMode('practice');
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
          <SoloTradeoffSetup
            config={soloConfig}
            onChange={setSoloConfig}
            onStart={() => void startSoloSession()}
            busy={soloBusy}
            error={soloError}
          />
          <Card className="p-6">
            <Users className="h-5 w-5 text-white/50" />
            <h2 className="mt-4 font-medium text-white">Schedule a real battle</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Invite links, check-in, synchronized twists, video, private voting, and AI
              adjudication are server-backed and require two signed-in accounts.
            </p>
            {!user && (
              <p className="mt-4 text-xs leading-5 text-white/45">
                Play solo or open the practice workbench without signup. Sign in only when you want
                to invite another person.
              </p>
            )}
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
            {!user && (
              <Link
                to="/login#sign-in"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-white/10 px-4 text-sm text-white/60 hover:border-white/20 hover:text-white"
              >
                Sign in to invite someone
              </Link>
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
              {matchId
                ? `${room?.ranked ? 'Ranked' : 'Unranked'} room`
                : isSolo
                  ? 'Solo AI room · unranked'
                  : 'Practice room'}{' '}
              · artifacts private until reveal
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
          {isSolo ? (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-medium text-white">
                  <Bot className="h-4 w-4 text-sky-300" /> AI opponent
                </span>
                <span className="font-mono text-[10px] text-emerald-300/70">ready</span>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-white/45">
                Its initial design was generated before entry. Your key and this AI session live
                only in this tab.
              </p>
              <p className="mt-3 truncate font-mono text-[10px] text-white/35">
                {soloConfig.model}
              </p>
            </Card>
          ) : (
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
          )}

          {!isSolo && (
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
          )}
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
                        : isSolo
                          ? 'Solo review complete.'
                          : 'Practice complete'}
                </h1>
                <p className="mx-auto mt-3 max-w-xl whitespace-pre-wrap text-center text-sm leading-6 text-white/50">
                  {result?.evaluation?.reasoning ??
                    (liveState
                      ? 'Private votes and frozen evidence are being reconciled. This page updates automatically.'
                      : isSolo
                        ? soloFeedback ||
                          'Comparing the frozen designs against the evaluation lens.'
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
                        if (isSolo) void startSoloSession();
                        else {
                          setPhase('initial_solution');
                          setSecondsLeft(PHASES[0].seconds);
                          setVote(undefined);
                        }
                      }}
                      disabled={soloBusy}
                    >
                      {soloBusy ? 'Preparing opponent…' : 'Rematch'}
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
                    {isSolo
                      ? 'Make your own call before the AI reviewer compares the frozen designs.'
                      : 'The other player cannot see your vote. Compatible votes finalize immediately; disagreement goes to adjudication.'}
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
                  <Button
                    onClick={submitVote}
                    disabled={!vote || soloBusy}
                    className="mt-7 min-h-11 px-5"
                  >
                    {soloBusy ? 'Reviewing both designs…' : 'Submit private vote'}{' '}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {activePhase === 'debate' &&
                  (revealedArtifacts.length > 0 || (isSolo && soloOpponentArtifact)) && (
                    <section
                      className="border-b border-white/[0.08] p-4"
                      aria-label="Revealed artifacts"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/35">
                        Frozen evidence revealed
                      </p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {isSolo && soloOpponentArtifact && (
                          <article className="rounded-lg border border-sky-300/20 bg-sky-300/[0.03] p-4">
                            <div className="flex justify-between gap-3 font-mono text-[10px] uppercase text-white/35">
                              <span>AI opponent artifact</span>
                              <span>Frozen</span>
                            </div>
                            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap font-mono text-xs leading-5 text-white/60">
                              {soloOpponentArtifact}
                            </pre>
                          </article>
                        )}
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
                <TradeoffArtifactWorkspace
                  drafts={drafts}
                  onChange={(kind, value) =>
                    setDrafts((existing) => ({ ...existing, [kind]: value }))
                  }
                  frozen={frozen}
                  diagramId={`tradeoff-${matchId ?? 'local'}`}
                  savedLabel={
                    savedAt
                      ? `saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${matchId ? 'project storage' : 'browser draft'}`
                      : 'saving…'
                  }
                />
              </div>
            )}
          </Card>
        </main>

        <aside className="order-2 space-y-4 xl:order-3">
          {activePhase !== 'complete' && (
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
              {!liveState && activePhase !== 'voting' && (
                <Button
                  onClick={() => void nextPhase()}
                  disabled={soloBusy}
                  className="mt-5 min-h-11 w-full"
                >
                  {soloBusy
                    ? 'AI opponent is revising…'
                    : activePhase === 'initial_solution'
                      ? 'Reveal twist'
                      : activePhase === 'revision'
                        ? 'Freeze & debate'
                        : 'Move to voting'}{' '}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </Card>
          )}

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

          {isSolo && activePhase === 'debate' && (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-sky-300/70" />
                <h2 className="text-xs font-medium text-white">Debate the opponent</h2>
              </div>
              <div className="mt-3 max-h-64 space-y-3 overflow-y-auto" aria-live="polite">
                {soloDebateMessages.length === 0 ? (
                  <p className="text-[11px] leading-5 text-white/40">
                    Challenge one assumption in the revealed AI design. It must defend or concede
                    it.
                  </p>
                ) : (
                  soloDebateMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`rounded-md px-3 py-2 text-[11px] leading-5 ${message.role === 'user' ? 'bg-white/[0.05] text-white/60' : 'border border-sky-300/15 text-white/55'}`}
                    >
                      {message.content}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Debate message</span>
                  <textarea
                    value={soloDebateInput}
                    onChange={(event) => setSoloDebateInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        void sendSoloDebateMessage();
                      }
                    }}
                    placeholder="Challenge an assumption…"
                    maxLength={4_000}
                    className="min-h-20 w-full resize-y rounded-md border border-white/10 bg-black p-3 text-xs leading-5 text-white outline-none placeholder:text-white/25 focus:border-sky-300/40"
                  />
                </label>
                <Button
                  onClick={() => void sendSoloDebateMessage()}
                  disabled={soloBusy || !soloDebateInput.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send debate message</span>
                </Button>
              </div>
            </Card>
          )}

          {soloError && entered && (
            <div className="space-y-2 px-1">
              <p role="alert" className="text-[11px] leading-5 text-amber-200/80">
                {soloError}
              </p>
              <Button tone="ghost" onClick={continueSoloLocally} className="w-full">
                Continue as local practice
              </Button>
            </div>
          )}

          <div className="flex items-start gap-2 px-1 text-[11px] leading-5 text-white/30">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />{' '}
            {matchId
              ? 'Server deadlines remain authoritative after reconnect.'
              : isSolo
                ? 'This tab owns the timer and clears the AI session when reloaded.'
                : 'Local practice stays private to this browser.'}
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
