import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Target } from 'lucide-react';
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
import { Sparkline, StackedBar } from '../components/viz';
import {
  CONCEPT_BY_ID,
  type Drill,
  DRILLS,
  groupForTag,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
  sortedTracks,
} from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { type DrillEntry, useDrillStore, useUserElo } from '../hooks/useUserStore';
import { type Critique, critiqueAnswer } from '../lib/aiClient';
import { isDue } from '../lib/conceptState';
import { DEFAULT_USER_ELO, difficultyToElo } from '../lib/elo';

type Tab = 'drills' | 'reviews';

const DRILL_STATUS_TONE: Record<string, string> = {
  unsolved: 'slate',
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
      <Link
        to="/practice"
        className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Practice
      </Link>
      <PageHeader
        title="All drills & reviews"
        subtitle="Browse drills by track, run a review session. Reps over reading."
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
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-6 sm:flex sm:gap-10">
          <StatNumber label="Solved" value={`${solvedCount}/${DRILLS.length}`} hint={`${attemptedCount} in progress · ${unsolved} untouched`} />
          <StatNumber label="Due" value={dueCount} hint={dueCount === 0 ? 'all caught up' : 'concepts ready'} tone={dueCount ? 'amber' : 'default'} />
          <StatNumber label="Streak" value={`${streak}d`} hint={`${totalReps} total reps`} />
        </div>
        <div className="flex items-center justify-end gap-2 text-right">
          <div className="text-xs text-slate-500">Last 14 days</div>
          <Sparkline values={sparkline} width={140} height={32} tone="sky" />
        </div>
      </div>
      <div className="mt-4">
        <StackedBar
          segments={[
            { count: solvedCount, tone: 'emerald', label: 'Solved' },
            { count: attemptedCount, tone: 'amber', label: 'Attempted' },
            { count: unsolved, tone: 'slate', label: 'Unsolved' },
          ]}
          height={6}
          showLegend
        />
      </div>
    </Card>
  );
}

function StatNumber({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: string; tone?: 'default' | 'amber' }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${tone === 'amber' ? 'text-amber-300' : 'text-slate-50'}`}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

// --- Drills tab -------------------------------------------------------------

function DrillsTab() {
  const { drills: drillState, getDrill } = useDrillStore();
  const { getElo } = useUserElo();
  const [group, setGroup] = useState<string | 'all'>('all');

  // Attach primary group + problem ELO + distance to the user's strongest
  // roadmap-context for this concept. Smaller distance = closer to user's edge.
  const withMeta = useMemo(
    () => DRILLS.map(d => {
      const concept = CONCEPT_BY_ID[d.conceptId];
      const grp = concept?.tags[0];
      const roadmaps = concept?.roadmaps ?? [];
      const problemElo = difficultyToElo(d.difficulty);
      const userElo = roadmaps.length ? Math.max(...roadmaps.map(getElo)) : DEFAULT_USER_ELO;
      const distance = Math.abs(problemElo - userElo);
      return { drill: d, group: grp, problemElo, userElo, distance };
    }),
    [getElo],
  );

  const groupsRollup = useMemo(() => {
    return sortedTracks()
      .map(t => {
        const drills = withMeta.filter(x => x.group === t.id).map(x => x.drill);
        if (!drills.length) return null;
        const solved = drills.filter(d => drillState[d.id]?.status === 'solved').length;
        return { group: t, total: drills.length, solved };
      })
      .filter(Boolean) as { group: ReturnType<typeof sortedTracks>[number]; total: number; solved: number }[];
  }, [drillState, withMeta]);

  // Filter, then sort by proximity to user ELO so the "edge" drills bubble up.
  const filtered = useMemo(() => {
    const base = group === 'all' ? withMeta : withMeta.filter(x => x.group === group);
    return [...base].sort((a, b) => a.distance - b.distance);
  }, [withMeta, group]);

  // Recommended: closest unsolved drills to the user's current ELO.
  const recommended = useMemo(
    () => filtered
      .filter(x => (drillState[x.drill.id]?.status ?? 'unsolved') !== 'solved')
      .slice(0, 3),
    [filtered, drillState],
  );

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 text-xs font-medium text-slate-400">Filter by group</div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterPill active={group === 'all'} onClick={() => setGroup('all')}>
            All ({DRILLS.length})
          </FilterPill>
          {groupsRollup.map(({ group: g, total, solved }) => (
            <FilterPill key={g.id} active={group === g.id} tone={g.color} onClick={() => setGroup(g.id)}>
              {g.short} ({solved}/{total})
            </FilterPill>
          ))}
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-xs font-medium text-sky-300">
              Recommended for your level
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {recommended.map(({ drill: d, group: gid }) => {
              const st = getDrill(d.id);
              const concept = CONCEPT_BY_ID[d.conceptId];
              return <DrillCard key={d.id} drill={d} state={st} groupTag={gid} conceptName={concept?.name} />;
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No drills in this group yet" hint="Pick a different group above." />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map(({ drill: d, group: gid }) => {
            const st = getDrill(d.id);
            const concept = CONCEPT_BY_ID[d.conceptId];
            return <DrillCard key={d.id} drill={d} state={st} groupTag={gid} conceptName={concept?.name} />;
          })}
        </div>
      )}
    </div>
  );
}

function DrillCard({
  drill,
  state,
  groupTag,
  conceptName,
}: {
  drill: Drill;
  state: DrillEntry;
  groupTag?: string;
  conceptName?: string;
}) {
  const trk = groupTag ? groupForTag(groupTag) : undefined;
  return (
    <Link
      to={`/drills/${drill.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white">{drill.title}</h3>
          {conceptName && (
            <div className="mt-0.5 text-[11px] text-slate-500">via <span className="text-slate-400">{conceptName}</span></div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-400" />
      </div>
      <p className="line-clamp-2 text-xs text-slate-400">{drill.prompt}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[11px]">
        {trk && <Badge tone={trk.color}>{trk.short}</Badge>}
        <Badge tone={DIFFICULTY_COLOR[drill.difficulty]}>{drill.difficulty}</Badge>
        <Badge tone={DRILL_STATUS_TONE[state.status]}>{state.status}</Badge>
        {state.attempts > 0 && <span className="text-slate-500">· {state.attempts} attempt{state.attempts > 1 ? 's' : ''}</span>}
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
          <Link to={`/concepts/${current.conceptId}`} className="text-xs text-slate-500 hover:text-slate-300">
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
          className="mt-4 w-full resize-y rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none disabled:opacity-70"
        />

        {!revealed ? (
          <div className="mt-4">
            <Button onClick={() => setRevealed(true)}>
              <RotateCcw className="h-4 w-4" /> Reveal answer
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="mb-1 text-[11px] font-medium text-slate-500">Reference answer</div>
              <p className="text-sm leading-relaxed text-slate-300">{current.answer}</p>
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
