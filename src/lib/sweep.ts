/**
 * Sweep — a fast triage pass over the concept catalog.
 *
 * The catalog is ~250 concepts whose `mentalModel` runs a median of 37 words.
 * Read end to end that is roughly a weekend, which makes "cover the whole
 * surface" a realistic goal rather than an aspiration. What makes the daily
 * cost survivable afterwards is not the reading — it is the triage.
 *
 * Without triage every concept enters the FSRS queue, including the ones you
 * already know, and ten minutes a day gets spent confirming things you never
 * forgot. Sweep exists to separate those: you rate each concept Known / Fuzzy /
 * New once, and only Fuzzy and New are seeded into review.
 *
 * Pure by design — the page imports these so they can be unit-tested in the
 * node environment the vitest config uses.
 */
import type { Concept, ReviewQuestion } from '../data/learning-os';
import type { MasteryRating } from './fsrs';
import type { ReviewMasteryEntry } from './reviewMastery';
import { reviewsToSeedForConcept } from './reviewMastery';
import { loadLocal, removeLocal, saveLocal, STORE_KEYS } from './userStore';

export type SweepRating = 'known' | 'fuzzy' | 'new';

export const SWEEP_RATINGS: { id: SweepRating; label: string; key: string; tone: string }[] = [
  { id: 'known', label: 'Known', key: '1', tone: 'emerald' },
  { id: 'fuzzy', label: 'Fuzzy', key: '2', tone: 'amber' },
  { id: 'new', label: 'New to me', key: '3', tone: 'rose' },
];

/**
 * Sweep ratings are self-assessment, not recall performance, so they map onto
 * the FSRS grades that produce the interval the claim deserves:
 *   known → `easy`  — long first interval; it resurfaces eventually, not soon.
 *   fuzzy → `hard`  — short interval; you half-know it, so prove it.
 *   new   → `again` — tomorrow.
 */
export const SWEEP_RATING_TO_FSRS: Record<SweepRating, MasteryRating> = {
  known: 'easy',
  fuzzy: 'hard',
  new: 'again',
};

/**
 * Whether a sweep rating should seed the concept's review questions.
 *
 * "Known" deliberately does not. Concept-level mastery still moves, so the
 * claim is recorded, but seeding ~1-2 cards for every concept you already know
 * is precisely the flood this feature exists to prevent. If the self-assessment
 * was wrong you will find out through a drill or a roadmap, and can re-sweep.
 */
export function shouldSeedReviews(rating: SweepRating): boolean {
  return rating !== 'known';
}

/**
 * Below this a mental model is a fragment rather than an explanation. The
 * shortest real one in the catalog is 15 words, so this is a guard against
 * future generator output, not a filter on anything shipping today.
 */
export const THIN_MENTAL_MODEL_WORDS = 12;

/**
 * Stems the content generators emit when they have nothing specific to say.
 * Mirrors `FORMULAIC_QUESTION_STEMS` in contentQuality.ts.
 */
const BOILERPLATE_MENTAL_MODELS = [
  'the core idea is',
  'in your own words',
  'this concept refers to',
  'is a technique used to',
  'is a way to',
];

/**
 * A mental model too weak to triage from.
 *
 * This deliberately does NOT measure length, and the correction matters.
 * The first version flagged anything under 25 words, which marked 57 concepts
 * "thin — needs a better mental model" and docked their domains in the ROI
 * score. Reading them showed every one was fine; 21 words is not a defect:
 *
 *   matrix-rank-basis — "Rank counts independent directions the matrix
 *   reaches. Regression lives in the column space of X; residuals are
 *   orthogonal to that subspace."
 *
 * Dense writing is the goal of this catalog, so a length gate penalised
 * exactly the prose it should reward. Judge the text, not its size — the same
 * correction contentQuality.ts already made when an id-shaped gate withheld
 * 84 good review cards.
 */
export function isThinConcept(concept: Pick<Concept, 'mentalModel'>): boolean {
  const text = (concept.mentalModel ?? '').trim();
  if (!text) return true;
  if (text.split(/\s+/).length < THIN_MENTAL_MODEL_WORDS) return true;
  const lower = text.toLowerCase();
  return BOILERPLATE_MENTAL_MODELS.some((stem) => lower.includes(stem));
}

export interface SweepState {
  /** conceptId → the rating given during a sweep pass. */
  rated: Record<string, SweepRating>;
  updatedAt: string;
}

export const EMPTY_SWEEP: SweepState = { rated: {}, updatedAt: '' };

/**
 * Where one person's triage lives.
 *
 * Namespaced by user id because sweep state, unlike every sibling store, has
 * no server round-trip to reconcile against — so a single shared key meant a
 * second Google account signing in on the same browser opened a queue already
 * pre-answered with the first account's ratings.
 */
export function sweepStorageKey(userId?: string | null): string {
  return userId ? `${STORE_KEYS.sweep}:${userId}` : STORE_KEYS.sweep;
}

/**
 * Read this user's pass, adopting a guest pass on first sign-in.
 *
 * Signing in must not throw away work: without adoption, namespacing would
 * reproduce the bug it fixes in reverse — an hour of guest triage vanishing at
 * the moment of login, exactly what `mutedTags` did before the server DEFAULT
 * was corrected. The guest key is cleared once adopted, so the next account to
 * sign in on this browser finds nothing to inherit.
 */
export function loadSweep(userId?: string | null): SweepState {
  const own = loadLocal<SweepState>(sweepStorageKey(userId), EMPTY_SWEEP);
  const ownRated = own.rated ?? {};
  if (!userId || Object.keys(ownRated).length) {
    return { rated: ownRated, updatedAt: own.updatedAt ?? '' };
  }

  const guest = loadLocal<SweepState>(STORE_KEYS.sweep, EMPTY_SWEEP);
  const guestRated = guest.rated ?? {};
  if (!Object.keys(guestRated).length) return { rated: {}, updatedAt: '' };

  const adopted = { rated: guestRated, updatedAt: guest.updatedAt ?? '' };
  saveLocal(sweepStorageKey(userId), adopted);
  removeLocal(STORE_KEYS.sweep);
  return adopted;
}

export function saveSweep(state: SweepState, userId?: string | null): void {
  saveLocal(sweepStorageKey(userId), state);
}

export function recordSweepRating(
  state: SweepState,
  conceptId: string,
  rating: SweepRating,
  now = new Date()
): SweepState {
  return {
    rated: { ...state.rated, [conceptId]: rating },
    updatedAt: now.toISOString(),
  };
}

const DIFFICULTY_ORDER: Record<string, number> = { intro: 0, core: 1, advanced: 2 };

/**
 * Queue order: foundations before frontier, then by editorial priority.
 *
 * Deliberately not a topological sort of `prerequisites`. A sweep is reading,
 * not building — you can read about consensus before replication and lose very
 * little, whereas a strict DAG walk would jump between unrelated domains to
 * satisfy ordering and destroy the sense of covering one area at a time.
 */
export function sweepOrder(a: Concept, b: Concept): number {
  const byDifficulty =
    (DIFFICULTY_ORDER[a.difficulty] ?? 1) - (DIFFICULTY_ORDER[b.difficulty] ?? 1);
  if (byDifficulty !== 0) return byDifficulty;
  const byPriority = (b.priority ?? 0) - (a.priority ?? 0);
  if (byPriority !== 0) return byPriority;
  return a.name.localeCompare(b.name);
}

export interface SweepQueueOptions {
  /** Restrict to one tag. Omit to sweep everything. */
  tag?: string;
  /** Concepts already rated in this pass — excluded from the queue. */
  rated: Record<string, SweepRating>;
}

export function buildSweepQueue(concepts: Concept[], options: SweepQueueOptions): Concept[] {
  const { tag, rated } = options;
  return concepts
    .filter((c) => (tag ? (c.tags ?? []).includes(tag) : true))
    .filter((c) => !rated[c.id])
    .sort(sweepOrder);
}

export interface SweepCoverage {
  total: number;
  rated: number;
  known: number;
  fuzzy: number;
  new: number;
  /** 0-100, share of the scope that has been triaged. */
  percent: number;
}

export function sweepCoverage(
  concepts: Concept[],
  rated: Record<string, SweepRating>
): SweepCoverage {
  const counts = { known: 0, fuzzy: 0, new: 0 };
  for (const concept of concepts) {
    const rating = rated[concept.id];
    if (rating) counts[rating] += 1;
  }
  const done = counts.known + counts.fuzzy + counts.new;
  return {
    total: concepts.length,
    rated: done,
    ...counts,
    percent: concepts.length ? Math.round((done / concepts.length) * 100) : 0,
  };
}

/**
 * Tags worth offering as a sweep scope. The catalog has ~150 tags, most of
 * which label a single concept; those are facets, not domains.
 *
 * Lives here rather than in roi.ts because it describes the catalog's tag
 * shape, but `rankDomains` is its only consumer — the tag grouping it used to
 * duplicate now happens once, there.
 */
export const MIN_DOMAIN_SIZE = 5;

/**
 * The full set of writes one sweep rating produces, as plain data so the
 * mapping is testable without mounting the page or touching FSRS.
 */
export interface SweepWrites {
  conceptId: string;
  conceptRating: MasteryRating;
  reviewSeeds: { questionId: string; rating: MasteryRating }[];
}

export function sweepWrites(
  conceptId: string,
  rating: SweepRating,
  allQuestions: ReviewQuestion[],
  rqMastery: Record<string, ReviewMasteryEntry>
): SweepWrites {
  const grade = SWEEP_RATING_TO_FSRS[rating];
  return {
    conceptId,
    conceptRating: grade,
    reviewSeeds: shouldSeedReviews(rating)
      ? reviewsToSeedForConcept(conceptId, allQuestions, rqMastery, grade)
      : [],
  };
}
