// Per-review-question FSRS — finer scheduling than concept-level alone.
import type { ReviewQuestion } from '../data/learning-os';
import type { MasteryEntry } from '../hooks/useConcepts';
import { reviewConcept, type MasteryRating, type MasteryRow } from './fsrs';
import { loadLocal, saveLocal } from './userStore';

const SUSPEND_KEY = 'swe-os:rq-suspended';

export interface ReviewMasteryEntry {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview?: string | null;
  due?: string | null;
}

export function isReviewDue(m: ReviewMasteryEntry | undefined, now = new Date()): boolean {
  if (!m || !m.due) return false;
  return new Date(m.due).getTime() <= now.getTime();
}

export function isLeech(m: ReviewMasteryEntry | undefined): boolean {
  return (m?.lapses ?? 0) >= 3;
}

function entryToRow(e: ReviewMasteryEntry | undefined): MasteryRow | null {
  if (!e) return null;
  return {
    stability: e.stability,
    difficulty: e.difficulty,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: e.reps,
    lapses: e.lapses,
    state: e.state,
    last_review: e.lastReview ?? null,
    due: e.due ?? null,
  };
}

function rowToEntry(row: MasteryRow): ReviewMasteryEntry {
  return {
    stability: row.stability,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    lastReview: row.last_review ?? null,
    due: row.due ?? null,
  };
}

export function reviewQuestion(
  prev: ReviewMasteryEntry | undefined,
  rating: MasteryRating,
): ReviewMasteryEntry {
  return rowToEntry(reviewConcept(entryToRow(prev), rating));
}

export function loadSuspendedRqs(): Set<string> {
  const ids = loadLocal<string[]>(SUSPEND_KEY, []);
  return new Set(ids);
}

export function suspendReviewQuestion(questionId: string): void {
  const s = loadSuspendedRqs();
  s.add(questionId);
  saveLocal(SUSPEND_KEY, [...s]);
}

export function unsuspendReviewQuestion(questionId: string): void {
  const s = loadSuspendedRqs();
  s.delete(questionId);
  saveLocal(SUSPEND_KEY, [...s]);
}

export function isSuspended(questionId: string): boolean {
  return loadSuspendedRqs().has(questionId);
}

/** Interleave by concept — avoid back-to-back same concept; weakest confidence first. */
export function sortReviewQueue(
  questions: ReviewQuestion[],
  rqMastery: Record<string, ReviewMasteryEntry>,
  conceptMastery: Record<string, MasteryEntry>,
): ReviewQuestion[] {
  const suspended = loadSuspendedRqs();
  const pool = questions.filter(q => !suspended.has(q.id));
  const scored = pool.map(q => {
    const conf = conceptMastery[q.conceptId]?.confidence ?? 0.5;
    const rqUrgency = rqMastery[q.id]?.lapses ? (rqMastery[q.id].lapses ?? 0) * 0.1 : 0;
    return { q, urgency: 1 - conf + rqUrgency, conceptId: q.conceptId };
  });
  scored.sort((a, b) => b.urgency - a.urgency);

  const result: ReviewQuestion[] = [];
  const remaining = [...scored];
  let lastConcept = '';
  while (remaining.length) {
    let idx = remaining.findIndex(s => s.conceptId !== lastConcept);
    if (idx < 0) idx = 0;
    const pick = remaining.splice(idx, 1)[0];
    result.push(pick.q);
    lastConcept = pick.conceptId;
  }
  return result;
}

/** Seed review cards for a concept after drill solve or Feynman gaps. */
export function reviewsToSeedForConcept(
  conceptId: string,
  allQuestions: ReviewQuestion[],
  rqMastery: Record<string, ReviewMasteryEntry>,
  rating: MasteryRating = 'hard',
): { questionId: string; rating: MasteryRating }[] {
  return allQuestions
    .filter(
      q =>
        q.conceptId === conceptId
        && !rqMastery[q.id]
        && q.source !== 'library'
        && q.source !== 'anki',
    )
    .map(q => ({ questionId: q.id, rating }));
}