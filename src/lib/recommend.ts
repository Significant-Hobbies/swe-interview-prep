// Client-side "what should I do next?" logic for the Dashboard.
import {
  type Artifact,
  ARTIFACT_BY_ID,
  type Drill,
  DRILLS,
  EDITORIAL_ARTIFACTS,
  EDITORIAL_DRILLS,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
  type Roadmap,
  ROADMAP_BY_ID,
} from '../data/learning-os';
import { ALL_CONCEPTS, type Concept, type MasteryEntry } from '../hooks/useConcepts';
import type { ArtifactEntry, DrillEntry } from '../hooks/useUserStore';
import { isEditorialArtifact, isEditorialDrill, isSchedulableReviewQuestion } from './contentQuality';
import { deriveConceptStatus, isDue } from './conceptState';
import { type GateContext, conceptAccessible } from './gates';
import { type ExperienceLevel, experienceEloOffset } from './profile';

const PREREQ_THRESHOLD = 0.4;
const ACTIVE_ROADMAP_KEY = 'swe-os:active-roadmap';

export { EDITORIAL_DRILLS, EDITORIAL_ARTIFACTS };
export const EDITORIAL_ARTIFACT_IDS = new Set(EDITORIAL_ARTIFACTS.map(a => a.id));

/** A concept is unblocked when every prerequisite has at least minimal confidence. */
export function prereqsMet(concept: Concept, mastery: Record<string, MasteryEntry>): boolean {
  return concept.prerequisites.every(p => (mastery[p]?.confidence ?? 0) >= PREREQ_THRESHOLD);
}

function reachable(c: Concept, mastery: Record<string, MasteryEntry>, gateCtx?: GateContext | null): boolean {
  return prereqsMet(c, mastery) && (!gateCtx || conceptAccessible(c, gateCtx));
}

export function pickNextConcept(
  mastery: Record<string, MasteryEntry>,
  gateCtx?: GateContext | null,
): Concept | null {
  const due = ALL_CONCEPTS.filter(c => isDue(mastery[c.id]) && reachable(c, mastery, gateCtx));
  if (due.length) {
    return [...due].sort((a, b) => (mastery[a.id]?.confidence ?? 0) - (mastery[b.id]?.confidence ?? 0))[0];
  }
  const candidates = ALL_CONCEPTS.filter(c => {
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
  gateCtx?: GateContext | null,
): Concept | null {
  const idSet = new Set(roadmap.milestones.flatMap(m => m.concepts));
  const global = pickNextConcept(mastery, gateCtx);
  if (global && idSet.has(global.id)) return global;
  for (const m of roadmap.milestones) {
    for (const cid of m.concepts) {
      const c = ALL_CONCEPTS.find(x => x.id === cid);
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
  const own = EDITORIAL_DRILLS.filter(d => d.conceptId === conceptId);
  if (own.length) return own[0];
  return null;
}

export function pickEditorialArtifactForConcept(conceptId: string): Artifact | null {
  const c = ALL_CONCEPTS.find(x => x.id === conceptId);
  if (!c?.artifacts?.length) return null;
  for (const aid of c.artifacts) {
    if (EDITORIAL_ARTIFACT_IDS.has(aid)) return ARTIFACT_BY_ID[aid] ?? null;
  }
  return null;
}

export interface TodayPlan {
  roadmap: Roadmap;
  concept: Concept;
  drill: Drill | null;
  artifact: Artifact | null;
  reviewsDue: number;
  reviewHref: string;
}

/** Single daily plan — concept → editorial drill → editorial artifact → reviews. */
export function pickTodayPlan(
  mastery: Record<string, MasteryEntry>,
  gateCtx?: GateContext | null,
  roadmapId?: string,
): TodayPlan | null {
  const rid = roadmapId ?? loadActiveRoadmapId();
  const roadmap = ROADMAP_BY_ID[rid] ?? ROADMAP_BY_ID['ai-search-infra-90-day'];
  if (!roadmap) return null;

  const concept = pickNextConceptInRoadmap(roadmap, mastery, gateCtx);
  if (!concept) return null;

  const reviewsDue = REVIEW_QUESTIONS.filter(
    q => isSchedulableReviewQuestion(q) && isDue(mastery[q.conceptId]),
  ).length;

  return {
    roadmap,
    concept,
    drill: pickDrillForConcept(concept.id),
    artifact: pickEditorialArtifactForConcept(concept.id),
    reviewsDue,
    reviewHref: reviewsDue > 0 ? '/practice/all?tab=reviews' : '/practice/all?tab=reviews',
  };
}

/** Concepts whose spaced-repetition review is due. */
export function dueConcepts(mastery: Record<string, MasteryEntry>): Concept[] {
  return ALL_CONCEPTS.filter(c => isDue(mastery[c.id]));
}

/** Review questions whose parent concept is due for review. */
export function dueReviewQuestions(mastery: Record<string, MasteryEntry>): ReviewQuestion[] {
  return REVIEW_QUESTIONS.filter(q => isSchedulableReviewQuestion(q) && isDue(mastery[q.conceptId]));
}

/** The weakest touched concepts — low confidence but already started. */
export function weakConcepts(mastery: Record<string, MasteryEntry>, limit = 6): Concept[] {
  return ALL_CONCEPTS
    .filter(c => mastery[c.id] && (mastery[c.id].confidence ?? 1) < 0.6)
    .sort((a, b) => (mastery[a.id]?.confidence ?? 0) - (mastery[b.id]?.confidence ?? 0))
    .slice(0, limit);
}

/** Practice drill picker — editorial drills only, aligned to today concept when possible. */
export function pickPracticeDrill(
  drillState: Record<string, DrillEntry>,
  getElo: (roadmapId: string) => number,
  todayConceptId?: string | null,
  experience: ExperienceLevel = 'mid',
): Drill | null {
  const pool = EDITORIAL_DRILLS.filter(d => (drillState[d.id]?.status ?? 'unsolved') !== 'solved');
  if (!pool.length) return null;

  if (todayConceptId) {
    const match = pool.find(d => d.conceptId === todayConceptId);
    if (match) return match;
  }

  const eloOffset = experienceEloOffset(experience);
  const ranked = pool
    .map(d => {
      const roadmaps = ALL_CONCEPTS.find(c => c.id === d.conceptId)?.roadmaps ?? [];
      const userElo = (roadmaps.length ? Math.max(...roadmaps.map(getElo)) : 1500) + eloOffset;
      const problemElo = d.difficulty === 'intro' ? 1200 : d.difficulty === 'core' ? 1600 : 2000;
      const distance = Math.abs(problemElo - userElo);
      const inProgressBoost = drillState[d.id]?.status === 'attempted' ? -100 : 0;
      const failBoost = (drillState[d.id]?.attempts ?? 0) >= 2 && drillState[d.id]?.status !== 'solved' ? -150 : 0;
      return { drill: d, score: distance + inProgressBoost + failBoost };
    })
    .sort((a, b) => a.score - b.score);
  return ranked[0]?.drill ?? null;
}