// Client-side "what should I do next?" logic for the Dashboard.
import {
  type Artifact,
  ARTIFACT_BY_ID,
  type Drill,
  EDITORIAL_ARTIFACTS,
  EDITORIAL_DRILLS,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
  type Roadmap,
} from '../data/learning-os';
import { ALL_CONCEPTS, type Concept, type MasteryEntry } from '../hooks/useConcepts';
import { isSchedulableReviewQuestion } from './contentQuality';
import { deriveConceptStatus, isDue } from './conceptState';
import { type GateContext, conceptAccessible } from './gates';
import { sweepOrder } from './sweep';

const PREREQ_THRESHOLD = 0.4;
const ACTIVE_ROADMAP_KEY = 'swe-os:active-roadmap';

const EDITORIAL_ARTIFACT_IDS = new Set(EDITORIAL_ARTIFACTS.map((a) => a.id));

/** A concept is unblocked when every prerequisite has at least minimal confidence. */
export function prereqsMet(
  concept: { prerequisites: string[] },
  mastery: Record<string, MasteryEntry>
): boolean {
  return concept.prerequisites.every((p) => (mastery[p]?.confidence ?? 0) >= PREREQ_THRESHOLD);
}

function reachable(
  c: Concept,
  mastery: Record<string, MasteryEntry>,
  gateCtx?: GateContext | null
): boolean {
  return prereqsMet(c, mastery) && (!gateCtx || conceptAccessible(c, gateCtx));
}

export function pickNextConcept(
  mastery: Record<string, MasteryEntry>,
  gateCtx?: GateContext | null
): Concept | null {
  const due = ALL_CONCEPTS.filter((c) => isDue(mastery[c.id]) && reachable(c, mastery, gateCtx));
  if (due.length) {
    return [...due].sort(
      (a, b) => (mastery[a.id]?.confidence ?? 0) - (mastery[b.id]?.confidence ?? 0)
    )[0];
  }
  const candidates = ALL_CONCEPTS.filter((c) => {
    const status = deriveConceptStatus(mastery[c.id]);
    return status !== 'mastered' && reachable(c, mastery, gateCtx);
  });
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => {
    const ca = mastery[a.id]?.confidence ?? 0;
    const cb = mastery[b.id]?.confidence ?? 0;
    if (ca !== cb) return ca - cb;
    return b.priority - a.priority;
  })[0];
}

export function pickNextConceptInRoadmap(
  roadmap: Roadmap,
  mastery: Record<string, MasteryEntry>,
  gateCtx?: GateContext | null
): Concept | null {
  const idSet = new Set(roadmap.milestones.flatMap((m) => m.concepts));
  const global = pickNextConcept(mastery, gateCtx);
  if (global && idSet.has(global.id)) return global;
  for (const m of roadmap.milestones) {
    for (const cid of m.concepts) {
      const c = ALL_CONCEPTS.find((x) => x.id === cid);
      if (!c) continue;
      if (deriveConceptStatus(mastery[cid]) === 'mastered') continue;
      if (!reachable(c, mastery, gateCtx)) continue;
      return c;
    }
  }
  return null;
}

export function loadActiveRoadmapId(): string {
  try {
    return localStorage.getItem(ACTIVE_ROADMAP_KEY) || 'ai-search-infra-90-day';
  } catch {
    return 'ai-search-infra-90-day';
  }
}

export function saveActiveRoadmapId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_ROADMAP_KEY, id);
  } catch {
    /* noop */
  }
}

/** Suggest an editorial drill for a concept. */
export function pickDrillForConcept(conceptId: string): Drill | null {
  const own = EDITORIAL_DRILLS.filter((d) => d.conceptId === conceptId);
  if (own.length) return own[0];
  return null;
}

export function pickEditorialArtifactForConcept(conceptId: string): Artifact | null {
  const c = ALL_CONCEPTS.find((x) => x.id === conceptId);
  if (!c?.artifacts?.length) return null;
  for (const aid of c.artifacts) {
    if (EDITORIAL_ARTIFACT_IDS.has(aid)) return ARTIFACT_BY_ID[aid] ?? null;
  }
  return null;
}

/** Concepts whose spaced-repetition review is due. */
export function dueConcepts(mastery: Record<string, MasteryEntry>): Concept[] {
  return ALL_CONCEPTS.filter((c) => isDue(mastery[c.id]));
}

/** Review questions whose parent concept is due for review. */
export function dueReviewQuestions(mastery: Record<string, MasteryEntry>): ReviewQuestion[] {
  return REVIEW_QUESTIONS.filter(
    (q) => isSchedulableReviewQuestion(q) && isDue(mastery[q.conceptId])
  );
}

/** Below this an FSRS confidence is not yet knowledge you can rely on. */
const WEAK_CONFIDENCE = 0.6;

/**
 * `shaky` — studied, but confidence is under the bar. `uncovered` — no mastery
 * row at all, i.e. never opened. The distinction is the whole point: only one
 * of them decays, and only one of them is a coverage gap.
 */
type ConceptGapKind = 'shaky' | 'uncovered';

export interface ConceptGap {
  concept: Concept;
  kind: ConceptGapKind;
  /** 0-1 FSRS confidence. Always 0 for `uncovered` — nothing was ever measured. */
  confidence: number;
}

/**
 * Where knowledge is thin — both ways it can be thin.
 *
 * This replaces `weakConcepts()`, which filtered on `mastery[c.id] && …` and so
 * could only ever report concepts you had already touched. A concept never
 * opened was indistinguishable from one that did not exist, which made the
 * product unable to state its own goal: it could say you were shaky on
 * something you had studied, never that you had not opened distributed systems
 * at all. Breadth is coverage plus retention, so absence has to be reportable.
 *
 * Shaky comes before uncovered, and the order is deliberate. A shaky concept is
 * time-sensitive — FSRS confidence is decaying while you read this — whereas an
 * uncovered one has been at zero for as long as the catalog has existed and
 * will keep until tomorrow. Within each group: shaky by confidence ascending,
 * uncovered by `sweepOrder` (foundations before frontier, then editorial
 * priority), which is the same order a triage pass would hand them to you.
 *
 * Deliberately NOT filtered by `reachable()`. Prereq gating reads mastery, so
 * for a learner who has touched nothing every prerequisite is unmet and every
 * gap would be filtered out — the same blind spot arriving by a second route.
 * `pickNextConcept` is the surface that owes you a reachable next step; this
 * one owes you the truth about coverage.
 */
export function conceptGaps(mastery: Record<string, MasteryEntry>, limit = 6): ConceptGap[] {
  const shaky: ConceptGap[] = [];
  const uncovered: Concept[] = [];
  for (const c of ALL_CONCEPTS) {
    const entry = mastery[c.id];
    if (!entry) {
      uncovered.push(c);
      continue;
    }
    // An entry with no confidence field is a scheduled row, not a weak one.
    const confidence = entry.confidence ?? 1;
    if (confidence < WEAK_CONFIDENCE) shaky.push({ concept: c, kind: 'shaky', confidence });
  }
  shaky.sort((a, b) => a.confidence - b.confidence);
  uncovered.sort(sweepOrder);
  return [
    ...shaky,
    ...uncovered.map((concept): ConceptGap => ({ concept, kind: 'uncovered', confidence: 0 })),
  ].slice(0, limit);
}
