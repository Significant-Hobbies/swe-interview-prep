import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Card, PageShell } from '../components/ui';
import { Sparkline } from '../components/viz';
import { ARTIFACTS, DRILLS } from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { useArtifactStore, useDrillStore } from '../hooks/useUserStore';
import { rollupMastery } from '../lib/conceptState';

export default function Progress() {
  const { mastery } = useConceptMastery();
  const { artifacts } = useArtifactStore();
  const { drills } = useDrillStore();

  const overall = rollupMastery(ALL_CONCEPTS.map(c => c.id), mastery);
  const drillsSolved = Object.values(drills).filter(d => d.status === 'solved').length;
  const shipped = Object.values(artifacts).filter(a => a.status === 'shipped').length;
  const sparkline = useMemo(() => buildRecentActivity(mastery, 30), [mastery]);

  return (
    <PageShell>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-slate-50">Progress</h1>

      <Card className="p-8 sm:p-10">
        <div className="text-xs font-medium text-slate-400">Mastery</div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-5xl font-semibold tabular-nums text-slate-50">{overall.mastered}</span>
          <span className="text-2xl text-slate-500">/ {overall.total}</span>
          <span className="ml-2 text-sm text-slate-400">concepts</span>
        </div>
        <div className="mt-6">
          <Sparkline values={sparkline} width={360} height={48} tone="sky" />
          <div className="mt-1 text-xs text-slate-500">Last 30 days of review activity</div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-800 pt-6 text-sm">
          <Sub label="Drills solved" value={`${drillsSolved} / ${DRILLS.length}`} />
          <Sub label="Artifacts shipped" value={`${shipped} / ${ARTIFACTS.length}`} />
          <Sub label="Started" value={`${overall.total - overall.untouched} / ${overall.total}`} />
        </div>
      </Card>

      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link to="/progress/all" className="text-sky-400 hover:text-sky-300">
          See by-track breakdown →
        </Link>
        <Link to="/progress/all#artifacts" className="text-slate-400 hover:text-slate-200">
          Artifact pipeline
        </Link>
        <Link to="/progress/all?tab=notes" className="text-slate-400 hover:text-slate-200">
          Notes
        </Link>
      </nav>
    </PageShell>
  );
}

function Sub({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-base font-semibold tabular-nums text-slate-200">{value}</div>
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
