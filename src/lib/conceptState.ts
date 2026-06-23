// Derives a Concept's lifecycle status and confidence from FSRS mastery state.
import type { ConceptStatus } from '../data/learning-os';
import type { MasteryEntry } from '../hooks/useConcepts';

export function isDue(m: MasteryEntry | undefined, now: Date = new Date()): boolean {
  if (!m?.due) return false;
  return new Date(m.due).getTime() <= now.getTime();
}

/**
 * Map FSRS mastery onto the PRD's concept lifecycle. Without an entry a concept
 * is untouched; with one, confidence and review-due drive the status.
 */
export function deriveConceptStatus(
  m: MasteryEntry | undefined,
  now: Date = new Date()
): ConceptStatus {
  if (!m) return 'not-started';
  const conf = m.confidence ?? 0;
  if (conf >= 0.85 && (m.reps ?? 0) >= 2) return 'mastered';
  if (isDue(m, now)) return 'review';
  if ((m.reps ?? 0) >= 3) return 'drilling';
  return 'learning';
}

/** Confidence as a 0-100 percentage for display. */
export function confidencePct(m: MasteryEntry | undefined): number {
  return Math.round((m?.confidence ?? 0) * 100);
}

/** Confidence on the PRD's 1-5 scale. */
export function confidence1to5(m: MasteryEntry | undefined): number {
  const conf = m?.confidence ?? 0;
  return Math.max(1, Math.min(5, Math.round(conf * 4) + 1));
}

export interface MasteryRollup {
  total: number;
  untouched: number;
  learning: number;
  drilling: number;
  mastered: number;
  due: number;
  avgConfidence: number;
}

export function rollupMastery(
  conceptIds: string[],
  mastery: Record<string, MasteryEntry>,
  now: Date = new Date()
): MasteryRollup {
  const r: MasteryRollup = {
    total: conceptIds.length,
    untouched: 0,
    learning: 0,
    drilling: 0,
    mastered: 0,
    due: 0,
    avgConfidence: 0,
  };
  let confSum = 0;
  for (const id of conceptIds) {
    const m = mastery[id];
    const status = deriveConceptStatus(m, now);
    if (status === 'not-started') r.untouched++;
    else if (status === 'mastered') r.mastered++;
    else if (status === 'drilling') r.drilling++;
    else r.learning++;
    if (isDue(m, now)) r.due++;
    confSum += m?.confidence ?? 0;
  }
  r.avgConfidence = conceptIds.length ? confSum / conceptIds.length : 0;
  return r;
}
