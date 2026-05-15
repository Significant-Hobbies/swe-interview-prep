import { Flame, Target, TrendingUp, Zap } from 'lucide-react';
import { useMemo } from 'react';

import { useConceptMastery } from '../hooks/useConcepts';

function dayKey(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function calculateStreak(reviewDays: Set<string>): number {
  if (reviewDays.size === 0) return 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  let streak = 0;
  // Allow today OR yesterday as the starting point — reviewing once a day
  // shouldn't break the streak just because the user reviewed in the
  // morning yesterday and it's now early the next morning.
  let start = new Date(today);
  if (!reviewDays.has(dayKey(start))) {
    start.setUTCDate(start.getUTCDate() - 1);
    if (!reviewDays.has(dayKey(start))) return 0;
  }
  for (let i = 0; i < 365; i += 1) {
    const check = new Date(start);
    check.setUTCDate(check.getUTCDate() - i);
    if (reviewDays.has(dayKey(check))) streak += 1;
    else break;
  }
  return streak;
}

/**
 * Activity strip surfaced on the Today page. Pulls FSRS mastery rows and
 * derives study stats — current streak, due-now count, concepts touched
 * this week, and average confidence. Read-only; clicking a tile deep-links
 * to the Concepts page.
 */
export default function StudyStats() {
  const { mastery, loading } = useConceptMastery();

  const stats = useMemo(() => {
    const entries = Object.values(mastery);
    if (entries.length === 0) {
      return { streak: 0, dueNow: 0, weekConcepts: 0, avgConfidence: 0, totalReviewed: 0 };
    }
    const reviewDays = new Set<string>();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    let dueNow = 0;
    let weekConcepts = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;
    let totalReviewed = 0;
    for (const e of entries) {
      if (e.lastReview) {
        reviewDays.add(dayKey(e.lastReview));
        totalReviewed += 1;
        if (new Date(e.lastReview).getTime() >= weekAgo) weekConcepts += 1;
      }
      if (e.due && new Date(e.due).getTime() <= now) dueNow += 1;
      if (typeof e.confidence === 'number' && Number.isFinite(e.confidence)) {
        confidenceSum += e.confidence;
        confidenceCount += 1;
      }
    }
    return {
      streak: calculateStreak(reviewDays),
      dueNow,
      weekConcepts,
      avgConfidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
      totalReviewed,
    };
  }, [mastery]);

  if (loading || stats.totalReviewed === 0) return null;

  const tiles = [
    {
      icon: Flame,
      label: 'Streak',
      value: `${stats.streak}d`,
      tint: 'text-orange-300',
    },
    {
      icon: Target,
      label: 'Due now',
      value: stats.dueNow,
      tint: stats.dueNow > 0 ? 'text-purple-300' : 'text-gray-400',
    },
    {
      icon: Zap,
      label: 'This week',
      value: stats.weekConcepts,
      tint: 'text-sky-300',
    },
    {
      icon: TrendingUp,
      label: 'Avg conf',
      value: `${Math.round(stats.avgConfidence * 100)}%`,
      tint: 'text-emerald-300',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.label}
            className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2"
          >
            <Icon className={`h-4 w-4 ${t.tint}`} />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                {t.label}
              </div>
              <div className="text-base font-semibold text-gray-100 tabular-nums">
                {t.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
