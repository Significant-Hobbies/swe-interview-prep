import { AlertTriangle, Calendar, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from './ui';
import { useConceptMastery } from '../hooks/useConcepts';
import { useReviewMastery } from '../hooks/useReviewMastery';
import { useDrillStore } from '../hooks/useUserStore';
import { buildRetentionSnapshot } from '../lib/retention';

export function RetentionDashboard() {
  const { mastery } = useConceptMastery();
  const { mastery: rqMastery } = useReviewMastery();
  const { drills } = useDrillStore();
  const snap = buildRetentionSnapshot(mastery, rqMastery, drills);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-400" />
        <div>
          <div className="text-sm font-semibold text-white">Retention forecast</div>
          <div className="text-[11px] text-white/40">FSRS queue + drill pass rate</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Due now" value={snap.dueNow} />
        <Stat label="Due 7d" value={snap.due7d} />
        <Stat label="Due 30d" value={snap.due30d} />
        <Stat label="Drill pass" value={`${snap.drillPassRate}%`} />
      </div>

      {snap.rotting.length > 0 && (
        <section className="mt-5 border-t border-white/[0.06] pt-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" /> Rotting
          </div>
          <ul className="space-y-1.5">
            {snap.rotting.map(r => (
              <li key={r.id} className="flex items-center justify-between text-xs">
                <Link to={`/concepts/${r.id}`} className="text-white/70 hover:text-white">{r.name}</Link>
                <span className="font-mono text-white/40">{Math.round(r.confidence * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {snap.strong.length > 0 && (
        <section className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-300">
            <Target className="h-3.5 w-3.5" /> Strong
          </div>
          <ul className="space-y-1.5">
            {snap.strong.map(s => (
              <li key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{s.name}</span>
                <span className="font-mono text-white/40">{Math.round(s.confidence * 100)}% · {s.reps}r</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {snap.dueNow > 0 && (
        <Link
          to="/practice/all?tab=reviews"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300"
        >
          <Calendar className="h-3.5 w-3.5" /> {snap.dueNow} reviews waiting →
        </Link>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}