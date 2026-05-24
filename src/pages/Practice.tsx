import { ArrowRight, CheckCircle2, Flame, RotateCcw, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, color, DIFFICULTY_COLOR, EmptyState, PageShell } from '../components/ui';
import { Ring, Sparkline, StackedBar } from '../components/viz';
import {
  CONCEPT_BY_ID,
  type Drill,
  DRILLS,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
  sortedTracks,
  TRACK_BY_ID,
  type TrackId,
} from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { type DrillEntry, useDrillStore } from '../hooks/useUserStore';
import { aiConfigured, type Critique, critiqueAnswer } from '../lib/aiClient';
import { isDue } from '../lib/conceptState';

type Tab = 'drills' | 'reviews';

const DRILL_STATUS_TONE: Record<string, string> = {
  unsolved: 'gray',
  attempted: 'amber',
  solved: 'emerald',
};

export default function Practice() {
  const [tab, setTab] = useState<Tab>('drills');
  const { drills: drillState } = useDrillStore();
  const { mastery } = useConceptMastery();

  const dueCount = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId])).length;
  const solvedCount = Object.values(drillState).filter(d => d.status === 'solved').length;
  const attemptedCount = Object.values(drillState).filter(d => d.status === 'attempted').length;
  const solvedPct = DRILLS.length ? solvedCount / DRILLS.length : 0;
  const totalReps = Object.values(drillState).reduce((s, d) => s + (d.attempts ?? 0), 0);
  const sparkline = buildRecentActivity(mastery, 14);

  return (
    <PageShell wide>
      <header className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-400">Practice</div>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Drills &amp; spaced reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Reps over reading. Drills turn a concept into implementation; reviews keep it from decaying.
        </p>
      </header>

      <PracticeHero
        solvedCount={solvedCount}
        attemptedCount={attemptedCount}
        solvedPct={solvedPct}
        totalReps={totalReps}
        dueCount={dueCount}
        sparkline={sparkline}
      />

      <div className="mt-6 mb-4 flex rounded-lg border border-gray-800 p-0.5 sm:w-fit">
        <TabBtn active={tab === 'drills'} onClick={() => setTab('drills')}>
          Drills <span className="ml-1.5 text-gray-600">{solvedCount}/{DRILLS.length}</span>
        </TabBtn>
        <TabBtn active={tab === 'reviews'} onClick={() => setTab('reviews')}>
          Reviews <span className="ml-1.5 text-gray-600">{dueCount}</span>
        </TabBtn>
      </div>

      {tab === 'drills' ? <DrillsTab /> : <ReviewSession />}
    </PageShell>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-4 py-1.5 text-xs font-medium transition-colors sm:flex-none ${
        active ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

// --- Hero ------------------------------------------------------------------

function PracticeHero({
  solvedCount,
  attemptedCount,
  solvedPct,
  totalReps,
  dueCount,
  sparkline,
}: {
  solvedCount: number;
  attemptedCount: number;
  solvedPct: number;
  totalReps: number;
  dueCount: number;
  sparkline: number[];
}) {
  const unsolved = DRILLS.length - solvedCount - attemptedCount;
  const activeStreak = sparkline.slice().reverse().findIndex(v => v === 0);
  const streak = activeStreak === -1 ? sparkline.length : activeStreak;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
      <Card className="flex items-center gap-4 p-5">
        <Ring value={solvedPct} size={80} stroke={8} tone="emerald" label={`${solvedCount}`} sublabel="SOLVED" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-gray-500">Drill progress</div>
          <div className="text-sm font-semibold text-white">{solvedCount} of {DRILLS.length} solved</div>
          <p className="mt-1 text-[11px] text-gray-500">{attemptedCount} in progress · {unsolved} untouched</p>
          <div className="mt-2">
            <StackedBar
              segments={[
                { count: solvedCount, tone: 'emerald', label: 'Solved' },
                { count: attemptedCount, tone: 'amber', label: 'Attempted' },
                { count: unsolved, tone: 'gray', label: 'Unsolved' },
              ]}
              height={4}
            />
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-300">{dueCount}</div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-amber-400/80">DUE</div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-gray-500">Spaced reviews</div>
          <div className="text-sm font-semibold text-white">
            {dueCount === 0 ? 'All caught up' : `${dueCount} concept${dueCount > 1 ? 's' : ''} ready`}
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {dueCount === 0
              ? 'Start more concepts to feed the queue.'
              : 'Recall, don\'t reread. Rate honestly.'}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/30">
          <Flame className="h-5 w-5 text-fuchsia-300" />
          <div className="mt-0.5 text-xl font-bold text-fuchsia-200">{streak}d</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider text-gray-500">Recent activity</div>
          <div className="text-sm font-semibold text-white">{totalReps} total reps</div>
          <div className="mt-2">
            <Sparkline values={sparkline} width={180} height={28} tone="fuchsia" />
          </div>
        </div>
      </Card>
    </div>
  );
}

// --- Drills tab -------------------------------------------------------------

function DrillsTab() {
  const { drills: drillState, getDrill } = useDrillStore();
  const [track, setTrack] = useState<TrackId | 'all'>('all');

  const withTrack = useMemo(
    () => DRILLS.map(d => ({ drill: d, track: CONCEPT_BY_ID[d.conceptId]?.track })),
    [],
  );

  // Per-track stats — for the lane bars.
  const tracksRollup = useMemo(() => {
    const tracks = sortedTracks();
    return tracks
      .map(t => {
        const drills = withTrack.filter(x => x.track === t.id).map(x => x.drill);
        if (!drills.length) return null;
        const solved = drills.filter(d => drillState[d.id]?.status === 'solved').length;
        const attempted = drills.filter(d => drillState[d.id]?.status === 'attempted').length;
        return {
          track: t,
          total: drills.length,
          solved,
          attempted,
          unsolved: drills.length - solved - attempted,
        };
      })
      .filter(Boolean) as {
        track: ReturnType<typeof sortedTracks>[number];
        total: number;
        solved: number;
        attempted: number;
        unsolved: number;
      }[];
  }, [drillState, withTrack]);

  const filtered = track === 'all' ? withTrack : withTrack.filter(x => x.track === track);

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">By track</div>
        <button
          onClick={() => setTrack('all')}
          className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
            track === 'all'
              ? 'border-purple-500/40 bg-purple-500/5'
              : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-100">All tracks</span>
            <span className="text-gray-600">{DRILLS.length}</span>
          </div>
        </button>
        {tracksRollup.map(({ track: t, total, solved, attempted, unsolved }) => {
          const active = track === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTrack(t.id)}
              className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
                active
                  ? 'border-purple-500/40 bg-purple-500/5'
                  : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color(t.color).solid}`} />
                  <span className="truncate font-medium text-gray-100">{t.title}</span>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-gray-500">{solved}/{total}</span>
              </div>
              <StackedBar
                segments={[
                  { count: solved, tone: 'emerald', label: 'Solved' },
                  { count: attempted, tone: 'amber', label: 'Attempted' },
                  { count: unsolved, tone: 'gray', label: 'Unsolved' },
                ]}
                height={3}
              />
            </button>
          );
        })}
      </aside>

      <section>
        {filtered.length === 0 ? (
          <EmptyState title="No drills in this track yet" hint="Pick a different track on the left." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map(({ drill: d, track: tid }) => {
              const st = getDrill(d.id);
              const concept = CONCEPT_BY_ID[d.conceptId];
              return <DrillCard key={d.id} drill={d} state={st} trackId={tid} conceptName={concept?.name} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function DrillCard({
  drill,
  state,
  trackId,
  conceptName,
}: {
  drill: Drill;
  state: DrillEntry;
  trackId?: TrackId;
  conceptName?: string;
}) {
  const trk = trackId ? TRACK_BY_ID[trackId] : undefined;
  return (
    <Link
      to={`/drills/${drill.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-gray-800 bg-gray-900/40 p-4 transition-colors hover:border-gray-700 hover:bg-gray-900/70"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-100 group-hover:text-white">{drill.title}</h3>
          {conceptName && (
            <div className="mt-0.5 text-[11px] text-gray-500">via <span className="text-gray-400">{conceptName}</span></div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-gray-700 group-hover:text-gray-400" />
      </div>
      <p className="line-clamp-2 text-xs text-gray-400">{drill.prompt}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[11px]">
        {trk && <Badge tone={trk.color}>{trk.short}</Badge>}
        <Badge tone={DIFFICULTY_COLOR[drill.difficulty]}>{drill.difficulty}</Badge>
        <Badge tone={DRILL_STATUS_TONE[state.status]}>{state.status}</Badge>
        {state.attempts > 0 && <span className="text-gray-600">· {state.attempts} attempt{state.attempts > 1 ? 's' : ''}</span>}
      </div>
    </Link>
  );
}

// --- Reviews tab ------------------------------------------------------------

const RATINGS: { id: 'again' | 'hard' | 'good' | 'easy'; label: string; tone: string }[] = [
  { id: 'again', label: 'Again', tone: 'rose' },
  { id: 'hard', label: 'Hard', tone: 'amber' },
  { id: 'good', label: 'Good', tone: 'blue' },
  { id: 'easy', label: 'Easy', tone: 'emerald' },
];

function ReviewSession() {
  const { mastery, review } = useConceptMastery();
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [critique, setCritique] = useState<Critique | null>(null);
  const [critiquing, setCritiquing] = useState(false);
  const [critiqueError, setCritiqueError] = useState('');

  const { queue, mode } = useMemo(() => {
    const due = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId]) && !done.has(q.id));
    if (due.length) return { queue: due, mode: 'due' as const };
    const practice = REVIEW_QUESTIONS.filter(q => mastery[q.conceptId] && !done.has(q.id));
    return { queue: practice, mode: 'practice' as const };
  }, [mastery, done]);

  const current: ReviewQuestion | undefined = queue[0];

  function next(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!current) return;
    void review(current.conceptId, rating);
    setDone(prev => new Set(prev).add(current.id));
    setRevealed(false);
    setAnswer('');
    setCritique(null);
    setCritiqueError('');
  }

  async function runCritique() {
    if (!current) return;
    setCritiquing(true);
    setCritiqueError('');
    try {
      setCritique(await critiqueAnswer(current.question, answer, current.answer));
    } catch (e) {
      setCritiqueError(e instanceof Error ? e.message : 'Critique failed.');
    } finally {
      setCritiquing(false);
    }
  }

  if (!current) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-8 w-8 text-emerald-400" />}
        title={done.size > 0 ? 'All caught up.' : 'No reviews yet'}
        hint="Reviews appear as you rate concepts, solve drills, and ship artifacts."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Card className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Badge tone="cyan">{current.type}</Badge>
            {mode === 'practice' && <Badge tone="gray">practice</Badge>}
          </div>
          <Link to={`/concepts/${current.conceptId}`} className="text-xs text-gray-500 hover:text-gray-300">
            {CONCEPT_BY_ID[current.conceptId]?.name}
          </Link>
        </div>
        <h2 className="text-lg font-semibold text-white">{current.question}</h2>

        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Write your answer from memory…"
          rows={5}
          disabled={revealed}
          className="mt-4 w-full resize-y rounded-md border border-gray-800 bg-gray-950 p-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none disabled:opacity-70"
        />

        {!revealed ? (
          <div className="mt-4">
            <Button onClick={() => setRevealed(true)}>
              <RotateCcw className="h-4 w-4" /> Reveal answer
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Reference answer</div>
              <p className="text-sm leading-relaxed text-gray-300">{current.answer}</p>
            </div>

            {answer.trim() && (
              <div>
                {!critique && (
                  <Button tone="ghost" onClick={() => void runCritique()} disabled={critiquing}>
                    <Sparkles className="h-3.5 w-3.5" /> {critiquing ? 'Grading…' : 'AI critique my answer'}
                  </Button>
                )}
                {!aiConfigured() && !critique && (
                  <p className="mt-1.5 text-xs text-gray-600">
                    Add an AI provider in Settings to enable the critic.
                  </p>
                )}
                {critiqueError && <p className="mt-1.5 text-xs text-rose-400">{critiqueError}</p>}
                {critique && <CritiquePanel critique={critique} />}
              </div>
            )}

            <div>
              <div className="mb-2 text-xs text-gray-500">How well did you recall it?</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => next(r.id)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${color(r.tone).bg} ${color(r.tone).border} ${color(r.tone).text} hover:brightness-110`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            <Target className="h-3 w-3" /> Session
          </div>
          <div className="text-2xl font-bold text-white">{done.size}</div>
          <div className="text-[11px] text-gray-500">reviewed this session</div>
        </Card>
        <Card className="p-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Queue</div>
          <div className="text-2xl font-bold text-white">{queue.length}</div>
          <div className="text-[11px] text-gray-500">{mode === 'due' ? 'questions due' : 'practice questions'}</div>
        </Card>
      </aside>
    </div>
  );
}

function CritiquePanel({ critique }: { critique: Critique }) {
  const tone = critique.score >= 80 ? 'emerald' : critique.score >= 55 ? 'amber' : 'rose';
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${color(tone).text}`}>{critique.score}</span>
        <span className="text-sm text-gray-300">{critique.verdict}</span>
      </div>
      {critique.missing && critique.missing.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">What you missed</div>
          <ul className="mt-1 space-y-1">
            {critique.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" /> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
      {critique.strongerAnswer && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Stronger answer</div>
          <p className="mt-1 text-xs leading-relaxed text-gray-300">{critique.strongerAnswer}</p>
        </div>
      )}
      {critique.followUps && critique.followUps.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Follow-ups</div>
          <ul className="mt-1 space-y-1">
            {critique.followUps.map((f, i) => (
              <li key={i} className="text-xs text-gray-400">{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Activity helpers -------------------------------------------------------

// Daily-bucketed activity from FSRS `lastReview` timestamps. Mastery is the
// authoritative signal: every drill solve, artifact ship, and review rating
// touches it. A flat line means the loop has stalled.
function buildRecentActivity(mastery: Record<string, MasteryEntry>, days: number): number[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const buckets = new Array(days).fill(0);
  for (const m of Object.values(mastery)) {
    if (!m.lastReview) continue;
    const ts = Date.parse(m.lastReview);
    if (Number.isNaN(ts)) continue;
    const ageDays = Math.floor((now - ts) / dayMs);
    if (ageDays < 0 || ageDays >= days) continue;
    buckets[days - 1 - ageDays] += 1;
  }
  return buckets;
}
