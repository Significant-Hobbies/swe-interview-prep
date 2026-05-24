import { ArrowRight, CheckCircle2, Flame, RotateCcw, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AnswerCritiquePanel, ReviewRatingButtons } from '../components/ReviewFeedback';
import {
  Badge,
  Button,
  Card,
  color,
  DIFFICULTY_COLOR,
  EmptyState,
  FilterPill,
  PageHeader,
  PageShell,
  SessionStatBar,
  TabButton,
  TabGroup,
} from '../components/ui';
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
import { type Critique, critiqueAnswer } from '../lib/aiClient';
import { isDue } from '../lib/conceptState';

type Tab = 'drills' | 'reviews';

const DRILL_STATUS_TONE: Record<string, string> = {
  unsolved: 'gray',
  attempted: 'amber',
  solved: 'emerald',
};

export default function Practice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: Tab = tabParam === 'reviews' ? 'reviews' : 'drills';

  const { drills: drillState } = useDrillStore();
  const { mastery } = useConceptMastery();

  const dueCount = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId])).length;
  const solvedCount = Object.values(drillState).filter(d => d.status === 'solved').length;
  const attemptedCount = Object.values(drillState).filter(d => d.status === 'attempted').length;
  const solvedPct = DRILLS.length ? solvedCount / DRILLS.length : 0;
  const totalReps = Object.values(drillState).reduce((s, d) => s + (d.attempts ?? 0), 0);
  const sparkline = buildRecentActivity(mastery, 14);

  function setTab(next: Tab) {
    if (next === 'drills') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', next);
    }
    setSearchParams(searchParams, { replace: true });
  }

  return (
    <PageShell wide>
      <PageHeader
        title="Practice"
        subtitle="Reps over reading. Drills turn a concept into implementation; reviews keep it from decaying."
      />

      <PracticeHero
        solvedCount={solvedCount}
        attemptedCount={attemptedCount}
        solvedPct={solvedPct}
        totalReps={totalReps}
        dueCount={dueCount}
        sparkline={sparkline}
      />

      <div className="mt-6 mb-4">
        <TabGroup>
          <TabButton active={tab === 'drills'} onClick={() => setTab('drills')} label="Drills" count={`${solvedCount}/${DRILLS.length}`} />
          <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')} label="Reviews" count={dueCount} />
        </TabGroup>
      </div>

      {tab === 'drills' ? <DrillsTab /> : <ReviewSession />}
    </PageShell>
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
    <>
      {/* Mobile: compact stat row */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2 text-center">
          <div className="text-lg font-bold text-emerald-300">{solvedCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Solved</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2 text-center">
          <div className="text-lg font-bold text-amber-300">{dueCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Due</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2 text-center">
          <div className="text-lg font-bold text-fuchsia-300">{streak}d</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Streak</div>
        </div>
      </div>

      {/* Desktop: full hero cards */}
      <div className="hidden gap-4 sm:grid lg:grid-cols-3">
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
              {dueCount === 0 ? 'Start more concepts to feed the queue.' : 'Recall, don\'t reread. Rate honestly.'}
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
    </>
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

  const tracksRollup = useMemo(() => {
    const tracks = sortedTracks();
    return tracks
      .map(t => {
        const drills = withTrack.filter(x => x.track === t.id).map(x => x.drill);
        if (!drills.length) return null;
        const solved = drills.filter(d => drillState[d.id]?.status === 'solved').length;
        return { track: t, total: drills.length, solved };
      })
      .filter(Boolean) as { track: ReturnType<typeof sortedTracks>[number]; total: number; solved: number }[];
  }, [drillState, withTrack]);

  const filtered = track === 'all' ? withTrack : withTrack.filter(x => x.track === track);

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Filter by track</div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterPill active={track === 'all'} onClick={() => setTrack('all')}>
            All ({DRILLS.length})
          </FilterPill>
          {tracksRollup.map(({ track: t, total, solved }) => (
            <FilterPill key={t.id} active={track === t.id} tone={t.color} onClick={() => setTrack(t.id)}>
              {t.short} ({solved}/{total})
            </FilterPill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No drills in this track yet" hint="Pick a different track above." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map(({ drill: d, track: tid }) => {
            const st = getDrill(d.id);
            const concept = CONCEPT_BY_ID[d.conceptId];
            return <DrillCard key={d.id} drill={d} state={st} trackId={tid} conceptName={concept?.name} />;
          })}
        </div>
      )}
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
    <div className="space-y-4">
      <SessionStatBar
        items={[
          { label: 'Reviewed', value: done.size, hint: 'this session' },
          { label: 'In queue', value: queue.length, hint: mode === 'due' ? 'due now' : 'practice mode' },
        ]}
      />

      <Card className="p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge tone="cyan">{current.type}</Badge>
            {mode === 'practice' && <Badge tone="gray">practice</Badge>}
          </div>
          <Link to={`/concepts/${current.conceptId}`} className="text-xs text-gray-500 hover:text-gray-300">
            {CONCEPT_BY_ID[current.conceptId]?.name}
          </Link>
        </div>
        <h2 className="text-base font-semibold text-white sm:text-lg">{current.question}</h2>

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
              <AnswerCritiquePanel
                critique={critique}
                critiquing={critiquing}
                critiqueError={critiqueError}
                onCritique={() => void runCritique()}
                showTrigger={!critique}
              />
            )}

            <ReviewRatingButtons onRate={next} />
          </div>
        )}
      </Card>
    </div>
  );
}

// --- Activity helpers -------------------------------------------------------

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
