// Client-side "what should I do next?" logic for the Dashboard.
import { type Drill, DRILLS, REVIEW_QUESTIONS, type ReviewQuestion } from '../data/learning-os';
import { ALL_CONCEPTS, type Concept, type MasteryEntry } from '../hooks/useConcepts';
import { deriveConceptStatus, isDue } from './conceptState';

const PREREQ_THRESHOLD = 0.4;

/** A concept is unblocked when every prerequisite has at least minimal confidence. */
export function prereqsMet(concept: Concept, mastery: Record<string, MasteryEntry>): boolean {
  return concept.prerequisites.every(p => (mastery[p]?.confidence ?? 0) >= PREREQ_THRESHOLD);
}

/**
 * Pick one concept to learn next: prefer a due review, otherwise the
 * highest-priority unblocked concept with the lowest confidence.
 */
export function pickNextConcept(mastery: Record<string, MasteryEntry>): Concept | null {
  const due = ALL_CONCEPTS.filter(c => isDue(mastery[c.id]));
  if (due.length) {
    return [...due].sort((a, b) => (mastery[a.id]?.confidence ?? 0) - (mastery[b.id]?.confidence ?? 0))[0];
  }
  const candidates = ALL_CONCEPTS.filter(c => {
    const status = deriveConceptStatus(mastery[c.id]);
    return status !== 'mastered' && prereqsMet(c, mastery);
  });
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => {
    const ca = mastery[a.id]?.confidence ?? 0;
    const cb = mastery[b.id]?.confidence ?? 0;
    if (ca !== cb) return ca - cb;
    return b.priority - a.priority;
  })[0];
}

/** Concepts whose spaced-repetition review is due. */
export function dueConcepts(mastery: Record<string, MasteryEntry>): Concept[] {
  return ALL_CONCEPTS.filter(c => isDue(mastery[c.id]));
}

/** Review questions whose parent concept is due for review. */
export function dueReviewQuestions(mastery: Record<string, MasteryEntry>): ReviewQuestion[] {
  return REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId]));
}

/** The weakest touched concepts — low confidence but already started. */
export function weakConcepts(mastery: Record<string, MasteryEntry>, limit = 6): Concept[] {
  return ALL_CONCEPTS
    .filter(c => mastery[c.id] && (mastery[c.id].confidence ?? 1) < 0.6)
    .sort((a, b) => (mastery[a.id]?.confidence ?? 0) - (mastery[b.id]?.confidence ?? 0))
    .slice(0, limit);
}

/** Suggest a drill for a concept, preferring its own drills. */
export function pickDrillForConcept(conceptId: string): Drill | null {
  const own = DRILLS.filter(d => d.conceptId === conceptId);
  if (own.length) return own[0];
  return null;
}
