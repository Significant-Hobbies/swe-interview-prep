import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { RetentionDashboard } from '../components/RetentionDashboard';
import { WeeklyReport } from '../components/WeeklyReport';
import { Sparkline } from '../components/viz';
import { EDITORIAL_ARTIFACTS, EDITORIAL_DRILLS } from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { useArtifactStore, useDrillStore } from '../hooks/useUserStore';
import { rollupMastery } from '../lib/conceptState';

export default function Progress() {
  const { mastery } = useConceptMastery();
  const { artifacts } = useArtifactStore();
  const { drills } = useDrillStore();

  const overall = rollupMastery(
    ALL_CONCEPTS.map((c) => c.id),
    mastery
  );
  const drillsSolved = Object.values(drills).filter((d) => d.status === 'solved').length;
  const shipped = Object.values(artifacts).filter((a) => a.status === 'shipped').length;
  const sparkline = useMemo(() => buildRecentActivity(mastery, 30), [mastery]);
  const pct = overall.total ? (overall.mastered / overall.total) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:py-24">
      <div className="relative">
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

        <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Mastery
        </div>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="text-[110px] font-bold leading-none tracking-tighter tabular-nums text-white sm:text-[140px] lg:text-[160px]">
            {overall.mastered}
          </span>
          <span className="font-mono text-3xl text-white/30 sm:text-4xl">/ {overall.total}</span>
        </div>

        <div className="mt-2 font-mono text-xs text-white/50">
          concepts mastered · {Math.round(pct)}%
        </div>

        <div className="mt-10 -mx-1">
          <Sparkline values={sparkline} width={520} height={48} tone="sky" />
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Last 30 days
          </div>
        </div>
      </div>

      <section className="section-rule mt-20 grid grid-cols-3 gap-8 pt-10">
        <Sub label="Drills solved" value={`${drillsSolved}/${EDITORIAL_DRILLS.length}`} />
        <Sub label="Artifacts shipped" value={`${shipped}/${EDITORIAL_ARTIFACTS.length}`} />
        <Sub label="Started" value={`${overall.total - overall.untouched}/${overall.total}`} />
      </section>

      <section className="section-rule mt-16 pt-10">
        <RetentionDashboard />
      </section>

      <section className="section-rule mt-16 pt-10">
        <WeeklyReport />
      </section>

      <nav className="mt-12 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
        <Link to="/progress/all" className="text-white hover:text-white/70">
          By-group breakdown <span className="text-white/40">→</span>
        </Link>
        <Link to="/progress/all?tab=notes" className="text-white/50 hover:text-white">
          Notes
        </Link>
      </nav>
    </div>
  );
}

function Sub({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</div>
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
