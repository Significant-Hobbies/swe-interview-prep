import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import BrowseLinks from '../components/BrowseLinks';
import { Sparkline } from '../components/viz';
import { CONCEPT_BY_ID, type Drill, EDITORIAL_DRILLS, primaryGroup } from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { useReviewMastery } from '../hooks/useReviewMastery';
import { useSessionPlan } from '../hooks/useSessionPlan';
import { useDrillStore, useUserElo } from '../hooks/useUserStore';
import { useProfile } from '../hooks/useProfile';
import { dueReviewQuestions } from '../lib/planner';
import { pickPracticeDrill } from '../lib/recommend';
import { computeSessionStreak } from '../lib/session';

export default function Practice() {
  const { drills: drillState } = useDrillStore();
  const { mastery } = useConceptMastery();
  const { mastery: rqMastery } = useReviewMastery();
  const { getElo } = useUserElo();
  const { profile } = useProfile();
  const session = useSessionPlan();
  const todayConcept = session?.concept.id;

  const dueCount = dueReviewQuestions(rqMastery, mastery).length;
  const solvedCount = Object.values(drillState).filter(d => d.status === 'solved').length;
  const sparkline = useMemo(() => buildRecentActivity(mastery, 14), [mastery]);
  const streak = computeSessionStreak();

  const nextDrill = useMemo(
    () => pickPracticeDrill(drillState, getElo, todayConcept, profile.experience),
    [drillState, getElo, todayConcept, profile.experience],
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      {nextDrill ? <NextDrillHero drill={nextDrill} /> : <AllCaughtUp />}

      <section className="section-rule mt-20 pt-10">
        <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          This week
        </div>
        <div className="grid grid-cols-3 gap-8">
          <Stat label="Solved" value={solvedCount} sub={`of ${EDITORIAL_DRILLS.length}`} />
          <Stat label="Due" value={dueCount} sub={dueCount ? 'reviews' : 'caught up'} accent={dueCount > 0} />
          <Stat label="Streak" value={`${streak}d`} sub="active" />
        </div>
        <div className="mt-8">
          <Sparkline values={sparkline} width={520} height={36} tone="sky" />
        </div>
      </section>

      <BrowseLinks className="mt-12" omit={['drills', 'reviews']} />
    </div>
  );
}

function NextDrillHero({ drill }: { drill: Drill }) {
  const concept = CONCEPT_BY_ID[drill.conceptId];
  const grp = concept ? primaryGroup(concept) : undefined;
  return (
    <div className="relative">
      <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        Next drill {grp && <span className="text-white/30">· {grp.short}</span>} <span className="text-white/30">· {drill.difficulty}</span>
      </div>

      <h1 className="text-balance text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
        {drill.title}
      </h1>

      {concept && (
        <p className="mt-4 font-mono text-xs text-white/40">
          via <span className="text-white/70">{concept.name}</span>
        </p>
      )}

      <p className="mt-6 line-clamp-3 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
        {drill.prompt}
      </p>

      <div className="mt-10">
        <Link
          to={`/drills/${drill.id}`}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-150 hover:bg-white/90"
        >
          Open in Playground
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function AllCaughtUp() {
  return (
    <div>
      <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Next drill</div>
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">All solved.</h1>
      <p className="mt-6 max-w-prose text-base text-white/60 sm:text-lg">
        Browse drills by group to revisit any.
      </p>
      <Link
        to="/practice/all"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
      >
        Browse drills <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className={`mt-2 text-4xl font-semibold tabular-nums tracking-tight ${accent ? 'text-amber-200' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="mt-1 font-mono text-xs text-white/40">{sub}</div>}
    </div>
  );
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


