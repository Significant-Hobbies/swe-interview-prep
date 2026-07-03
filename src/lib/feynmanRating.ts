// Maps Feynman Gate grading output (0-100 grade + gaps + per-concept ratings)
// onto FSRS MasteryRating updates. Pure so it can be unit-tested; consumed by
// FeynmanGate when applying grades to concept mastery.
import type { MasteryRating } from './fsrs';

export interface FeynmanGradeLike {
  grade: number;
  feedback?: string;
  gaps?: { concept_id: string; weakness?: string }[] | null;
  ratings?: { concept_id: string; rating: string }[] | null;
}

export interface ConceptRatingUpdate {
  conceptId: string;
  rating: MasteryRating;
}

const VALID_RATINGS: readonly MasteryRating[] = ['again', 'hard', 'good', 'easy'];

export function isMasteryRating(value: string): value is MasteryRating {
  return (VALID_RATINGS as readonly string[]).includes(value);
}

/**
 * Overall grade → FSRS rating, mirroring the server-side grading rubric:
 * 90-100 nailed it, 70-89 solid, 50-69 shaky, below 50 butchered.
 */
export function gradeToRating(grade: number): MasteryRating {
  if (!Number.isFinite(grade)) return 'again';
  if (grade >= 90) return 'easy';
  if (grade >= 70) return 'good';
  if (grade >= 50) return 'hard';
  return 'again';
}

/**
 * Normalize a Feynman grading result into per-concept FSRS rating updates.
 *
 * - AI per-concept ratings win when present and valid.
 * - A named gap caps the concept at 'hard'; a gap with no rating means 'again'.
 * - Tagged concepts the AI didn't rate fall back to the overall grade, so a
 *   graded explanation always moves mastery for the concepts it covered.
 */
export function ratingsFromFeynman(
  result: FeynmanGradeLike,
  taggedConceptIds: string[] = []
): ConceptRatingUpdate[] {
  const map = new Map<string, MasteryRating>();
  for (const r of result.ratings ?? []) {
    if (r?.concept_id && isMasteryRating(r.rating)) map.set(r.concept_id, r.rating);
  }
  for (const g of result.gaps ?? []) {
    if (!g?.concept_id) continue;
    const current = map.get(g.concept_id);
    if (!current) map.set(g.concept_id, 'again');
    else if (current === 'good' || current === 'easy') map.set(g.concept_id, 'hard');
  }
  const fallback = gradeToRating(result.grade);
  for (const cid of taggedConceptIds) {
    if (cid && !map.has(cid)) map.set(cid, fallback);
  }
  return [...map.entries()].map(([conceptId, rating]) => ({ conceptId, rating }));
}
