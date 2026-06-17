import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Card, color, PageShell } from '../components/ui';
import { Sparkline } from '../components/viz';
import { CONCEPT_BY_ID, type Drill, DRILLS, primaryGroup, REVIEW_QUESTIONS } from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { useDrillStore, useUserElo } from '../hooks/useUserStore';
import { isDue } from '../lib/conceptState';
import { DEFAULT_USER_ELO, difficultyToElo } from '../lib/elo';

export default function Practice() {
  const { drills: drillState } = useDrillStore();
  const { mastery } = useConceptMastery();
  const { getElo } = useUserElo();

  const dueCount = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId])).length;
  const solvedCount = Object.values(drillState).filter(d => d.status === 'solved').length;
  const sparkline = useMemo(() => buildRecentActivity(mastery, 14), [mastery]);
  const streak = computeStreak(sparkline);

  const nextDrill = useMemo(() => pickNextDrill(drillState, getElo), [drillState, getElo]);

  return (
    <PageShell>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-slate-50">Practice</h1>

      {nextDrill ? <NextDrillCard drill={nextDrill} /> : <AllCaughtUp />}

      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <StatLine label="Solved" value={`${solvedCount}/${DRILLS.length}`} />
          <StatLine label="Due" value={dueCount} tone={dueCount ? 'amber' : 'default'} />
          <StatLine label="Streak" value={`${streak}d`} />
        </div>
        <Sparkline values={sparkline} width={120} height={28} tone="sky" />
      </div>

      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link to="/practice/all" className="text-sky-400 hover:text-sky-300">
          Browse all drills →
        </Link>
        <Link to="/practice/all?tab=reviews" className="text-slate-400 hover:text-slate-200">
          Review queue {dueCount > 0 && <span className="text-slate-500">· {dueCount}</span>}
        </Link>
      </nav>
    </PageShell>
  );
}

function NextDrillCard({ drill }: { drill: Drill }) {
  const concept = CONCEPT_BY_ID[drill.conceptId];
  const trk = concept ? primaryGroup(concept) : undefined;
  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
        <span>Next drill</span>
        {trk && (
          <>
            <span className="text-slate-700">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${color(trk.color).solid}`} />
              {trk.short}
            </span>
          </>
        )}
        <span className="text-slate-700">·</span>
        <span>{drill.difficulty}</span>
      </div>
      <h2 className="text-xl font-semibold text-slate-50 sm:text-2xl">{drill.title}</h2>
      {concept && (
        <p className="mt-1 text-xs text-slate-500">via <span className="text-slate-300">{concept.name}</span></p>
      )}
      <p className="mt-3 line-clamp-3 max-w-prose text-sm text-slate-400">{drill.prompt}</p>

      <div className="mt-6">
        <Link
          to={`/drills/${drill.id}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-400"
        >
          Open in Playground <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

function AllCaughtUp() {
  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-2 text-xs font-medium text-slate-400">Next drill</div>
      <h2 className="text-xl font-semibold text-slate-50">All solved.</h2>
      <p className="mt-2 text-sm text-slate-400">Browse drills by track to revisit any.</p>
      <Link
        to="/practice/all"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-400"
      >
        Browse drills <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function StatLine({ label, value, tone }: { label: string; value: React.ReactNode; tone?: 'default' | 'amber' }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${tone === 'amber' ? 'text-amber-300' : 'text-slate-100'}`}>
        {value}
      </div>
    </div>
  );
}

function pickNextDrill(
  drillState: Record<string, { status: string; attempts: number }>,
  getElo: (roadmapId: string) => number,
): Drill | null {
  const unsolved = DRILLS.filter(d => (drillState[d.id]?.status ?? 'unsolved') !== 'solved');
  if (!unsolved.length) return null;
  const ranked = unsolved
    .map(d => {
      const roadmaps = CONCEPT_BY_ID[d.conceptId]?.roadmaps ?? [];
      // Sort against the user's strongest roadmap-context for this concept.
      const userElo = roadmaps.length
        ? Math.max(...roadmaps.map(getElo))
        : DEFAULT_USER_ELO;
      const problemElo = difficultyToElo(d.difficulty);
      const distance = Math.abs(problemElo - userElo);
      const inProgressBoost = drillState[d.id]?.status === 'attempted' ? -100 : 0;
      return { drill: d, score: distance + inProgressBoost };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0].drill;
}

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

function computeStreak(sparkline: number[]): number {
  const firstZero = sparkline.slice().reverse().findIndex(v => v === 0);
  return firstZero === -1 ? sparkline.length : firstZero;
}
