// Retention analytics — pure heuristics, no AI.
import { ALL_CONCEPTS, type MasteryEntry } from '../hooks/useConcepts';
import type { DrillEntry } from '../hooks/useUserStore';
import { dueReviewQuestions } from './planner';
import type { ReviewMasteryEntry } from './reviewMastery';
import { REVIEW_QUESTIONS } from '../data/learning-os';

export interface RetentionSnapshot {
  dueNow: number;
  due7d: number;
  due30d: number;
  rotting: { id: string; name: string; confidence: number; lapses: number }[];
  strong: { id: string; name: string; confidence: number; reps: number }[];
  drillPassRate: number;
  reviewsDue: number;
}

function forecastDue(
  mastery: Record<string, MasteryEntry>,
  rqMastery: Record<string, ReviewMasteryEntry>,
  withinDays: number,
): number {
  const now = Date.now();
  const horizon = now + withinDays * 86400000;
  let count = 0;
  for (const q of REVIEW_QUESTIONS) {
    const rq = rqMastery[q.id];
    const due = rq?.due ?? mastery[q.conceptId]?.due;
    if (!due) continue;
    const t = new Date(due).getTime();
    if (t <= horizon) count++;
  }
  return count;
}

export function buildRetentionSnapshot(
  mastery: Record<string, MasteryEntry>,
  rqMastery: Record<string, ReviewMasteryEntry>,
  drillState: Record<string, DrillEntry>,
): RetentionSnapshot {
  const rotting = ALL_CONCEPTS
    .map(c => {
      const m = mastery[c.id];
      const conf = m?.confidence ?? 0;
      return { id: c.id, name: c.name, confidence: conf, lapses: m?.lapses ?? 0 };
    })
    .filter(r => r.confidence > 0 && r.confidence < 0.5)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 6);

  const strong = ALL_CONCEPTS
    .map(c => {
      const m = mastery[c.id];
      return { id: c.id, name: c.name, confidence: m?.confidence ?? 0, reps: m?.reps ?? 0 };
    })
    .filter(r => r.confidence >= 0.85)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  const solved = Object.values(drillState).filter(d => d.status === 'solved').length;
  const attempted = Object.values(drillState).filter(d => (d.attempts ?? 0) > 0).length;
  const drillPassRate = attempted ? Math.round((solved / attempted) * 100) : 0;

  const reviewsDue = dueReviewQuestions(rqMastery, mastery).length;

  return {
    dueNow: reviewsDue,
    due7d: forecastDue(mastery, rqMastery, 7),
    due30d: forecastDue(mastery, rqMastery, 30),
    rotting,
    strong,
    drillPassRate,
    reviewsDue,
  };
}