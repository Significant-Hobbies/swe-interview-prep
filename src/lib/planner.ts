// Unified session planner — scores candidates, packs into time budget. No AI.
import {
  type Artifact,
  type Concept,
  type Drill,
  EDITORIAL_DRILLS,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
  type Roadmap,
  ROADMAP_BY_ID,
  ROADMAPS,
} from '../data/learning-os';
import { ALL_CONCEPTS, type MasteryEntry } from '../hooks/useConcepts';
import type { DrillEntry } from '../hooks/useUserStore';
import { deriveConceptStatus, isDue } from './conceptState';
import type { GateContext } from './gates';
import { conceptAccessible } from './gates';
import {
  adjustWeightsForExperience,
  adjustWeightsForHorizon,
  type LearnerProfile,
  normalizeModalityWeights,
  normalizeRoadmapWeights,
} from './profile';
import {
  pickDrillForConcept,
  pickEditorialArtifactForConcept,
  pickNextConcept,
  pickNextConceptInRoadmap,
  prereqsMet,
} from './recommend';
import { isSchedulableReviewQuestion } from './contentQuality';
import type { ReviewMasteryEntry } from './reviewMastery';
import { isReviewDue, sortReviewQueue } from './reviewMastery';

export type BlockKind = 'learn' | 'drill' | 'build' | 'review';

export interface SessionBlock {
  kind: BlockKind;
  minutes: number;
  title: string;
  subtitle?: string;
  href: string;
  done?: boolean;
}

export interface SessionPlan {
  roadmap: Roadmap;
  concept: Concept;
  headline: string;
  rationale: string;
  totalMinutes: number;
  blocks: SessionBlock[];
  reviewsDue: number;
  reviewQueue: ReviewQuestion[];
  drill: Drill | null;
  artifact: Artifact | null;
}

const MIN_PER_REVIEW = 3;

function reachable(
  c: Concept,
  mastery: Record<string, MasteryEntry>,
  gateCtx: GateContext | null | undefined,
  skipIds: Set<string>
): boolean {
  if (skipIds.has(c.id)) return false;
  return prereqsMet(c, mastery) && (!gateCtx || conceptAccessible(c, gateCtx));
}

/** Weighted roadmap pick — blends multiple active paths. */
function pickWeightedRoadmap(
  profile: LearnerProfile,
  mastery: Record<string, MasteryEntry>
): Roadmap {
  const weights = normalizeRoadmapWeights(profile.roadmapWeights);
  let best: { id: string; score: number } | null = null;
  for (const [rid, w] of Object.entries(weights)) {
    const roadmap = ROADMAP_BY_ID[rid];
    if (!roadmap) continue;
    const ids = new Set(roadmap.milestones.flatMap((m) => m.concepts));
    const open = ALL_CONCEPTS.filter(
      (c) => ids.has(c.id) && deriveConceptStatus(mastery[c.id]) !== 'mastered'
    ).length;
    const score = w * (1 + open * 0.02);
    if (!best || score > best.score) best = { id: rid, score };
  }
  return ROADMAP_BY_ID[best?.id ?? 'ai-search-infra-90-day'] ?? ROADMAPS[0];
}

export function pickConceptForSession(
  profile: LearnerProfile,
  mastery: Record<string, MasteryEntry>,
  gateCtx: GateContext | null | undefined
): { roadmap: Roadmap; concept: Concept } | null {
  const skip = new Set(profile.skipConceptIds);
  const weights = normalizeRoadmapWeights(profile.roadmapWeights);

  // Due concepts across weighted roadmaps first
  const dueCandidates: { concept: Concept; roadmap: Roadmap; score: number }[] = [];
  for (const [rid, w] of Object.entries(weights)) {
    const roadmap = ROADMAP_BY_ID[rid];
    if (!roadmap) continue;
    const idSet = new Set(roadmap.milestones.flatMap((m) => m.concepts));
    for (const c of ALL_CONCEPTS) {
      if (!idSet.has(c.id) || skip.has(c.id)) continue;
      if (!isDue(mastery[c.id]) || !reachable(c, mastery, gateCtx, skip)) continue;
      dueCandidates.push({
        concept: c,
        roadmap,
        score: w * (1 - (mastery[c.id]?.confidence ?? 0)),
      });
    }
  }
  if (dueCandidates.length) {
    dueCandidates.sort((a, b) => b.score - a.score);
    return { concept: dueCandidates[0].concept, roadmap: dueCandidates[0].roadmap };
  }

  // Weighted roadmap walk
  const sortedRoadmaps = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  for (const [rid] of sortedRoadmaps) {
    const roadmap = ROADMAP_BY_ID[rid];
    if (!roadmap) continue;
    const concept = pickNextConceptInRoadmap(roadmap, mastery, gateCtx);
    if (concept && !skip.has(concept.id)) return { roadmap, concept };
  }

  const global = pickNextConcept(mastery, gateCtx);
  if (global && !skip.has(global.id)) {
    const roadmap = pickWeightedRoadmap(profile, mastery);
    return { roadmap, concept: global };
  }
  return null;
}

function pickFailedDrillConcept(
  drillState: Record<string, DrillEntry>,
  _mastery: Record<string, MasteryEntry>
): Concept | null {
  const failed = EDITORIAL_DRILLS.filter((d) => {
    const st = drillState[d.id];
    return st && st.attempts >= 2 && st.status !== 'solved';
  });
  if (!failed.length) return null;
  failed.sort((a, b) => (drillState[b.id]?.attempts ?? 0) - (drillState[a.id]?.attempts ?? 0));
  return ALL_CONCEPTS.find((c) => c.id === failed[0].conceptId) ?? null;
}

export function reviewQuestionPool(extra: ReviewQuestion[] = []): ReviewQuestion[] {
  return [...REVIEW_QUESTIONS, ...extra];
}

export function dueReviewQuestions(
  rqMastery: Record<string, ReviewMasteryEntry>,
  conceptMastery: Record<string, MasteryEntry>,
  extra: ReviewQuestion[] = []
): ReviewQuestion[] {
  const due = reviewQuestionPool(extra).filter((q) => {
    if (!isSchedulableReviewQuestion(q)) return false;
    const rq = rqMastery[q.id];
    if (rq) return isReviewDue(rq);
    return isDue(conceptMastery[q.conceptId]);
  });
  return sortReviewQueue(due, rqMastery, conceptMastery);
}

export function buildSessionPlan(opts: {
  profile: LearnerProfile;
  mastery: Record<string, MasteryEntry>;
  rqMastery: Record<string, ReviewMasteryEntry>;
  gateCtx: GateContext | null | undefined;
  drillState: Record<string, DrillEntry>;
  getElo: (roadmapId: string) => number;
  extraReviewQuestions?: ReviewQuestion[];
}): SessionPlan | null {
  const { profile, mastery, rqMastery, gateCtx, drillState } = opts;
  const totalMinutes = profile.minutesPerDay;
  const weights = adjustWeightsForHorizon(
    adjustWeightsForExperience(
      normalizeModalityWeights(profile.modalityWeights),
      profile.experience
    ),
    profile.interviewHorizonDays
  );

  let reviewMin = Math.round(totalMinutes * weights.review);
  let drillMin = Math.round(totalMinutes * weights.drill);
  const buildMin = Math.round(totalMinutes * weights.build);
  let learnMin = totalMinutes - reviewMin - drillMin - buildMin;
  if (learnMin < 5) {
    learnMin = 5;
    const excess = reviewMin + drillMin + buildMin + learnMin - totalMinutes;
    reviewMin = Math.max(0, reviewMin - Math.ceil(excess / 2));
    drillMin = Math.max(10, drillMin - Math.floor(excess / 2));
  }

  const reviewQueue = dueReviewQuestions(rqMastery, mastery, opts.extraReviewQuestions ?? []);
  const maxReviews = Math.max(1, Math.floor(reviewMin / MIN_PER_REVIEW));
  const reviewsToShow = reviewQueue.slice(0, maxReviews);
  const actualReviewMin = reviewsToShow.length
    ? Math.min(reviewMin, reviewsToShow.length * MIN_PER_REVIEW)
    : 0;

  let picked = pickConceptForSession(profile, mastery, gateCtx);
  const failedConcept = pickFailedDrillConcept(drillState, mastery);
  if (failedConcept && (!picked || (mastery[failedConcept.id]?.confidence ?? 1) < 0.55)) {
    picked = {
      concept: failedConcept,
      roadmap: pickWeightedRoadmap(profile, mastery),
    };
  }
  if (!picked) return null;

  const { concept, roadmap } = picked;
  const drill = pickDrillForConcept(concept.id);
  const artifact = pickEditorialArtifactForConcept(concept.id);
  const conf = mastery[concept.id]?.confidence;
  const confPct = conf != null ? Math.round(conf * 100) : null;

  let headline: string;
  if (failedConcept?.id === concept.id) {
    headline = `Retry: ${concept.name}`;
  } else if (confPct != null && confPct < 35) {
    headline = `Rescue: ${concept.name}`;
  } else if (reviewQueue.length > 3) {
    headline = `Review-heavy day · ${concept.name}`;
  } else {
    headline = concept.name;
  }

  const rationaleParts: string[] = [];
  if (profile.interviewHorizonDays && profile.interviewHorizonDays <= 30) {
    rationaleParts.push(`Interview in ${profile.interviewHorizonDays}d — prioritizing reps.`);
  }
  if (confPct != null) rationaleParts.push(`Confidence ${confPct}%.`);
  if (reviewQueue.length) rationaleParts.push(`${reviewQueue.length} reviews due.`);
  rationaleParts.push(`${totalMinutes}-minute session sized to your profile.`);

  const blocks: SessionBlock[] = [];

  if (actualReviewMin > 0 && reviewsToShow.length) {
    blocks.push({
      kind: 'review',
      minutes: actualReviewMin,
      title: `Spaced review · ${reviewsToShow.length} card${reviewsToShow.length > 1 ? 's' : ''}`,
      subtitle: `${reviewQueue.length} total due`,
      href: '/practice/all?tab=reviews',
      done: false,
    });
  }

  if (learnMin >= 5) {
    blocks.push({
      kind: 'learn',
      minutes: learnMin,
      title: 'Learn the concept',
      subtitle: concept.name,
      href: `/concepts/${concept.id}`,
    });
  }

  if (drill && drillMin >= 8) {
    const st = drillState[drill.id];
    blocks.push({
      kind: 'drill',
      minutes: drillMin,
      title: drill.title,
      subtitle: st?.status === 'attempted' ? 'In progress' : drill.difficulty,
      href: `/drills/${drill.id}`,
      done: st?.status === 'solved',
    });
  }

  if (artifact && buildMin >= 10) {
    blocks.push({
      kind: 'build',
      minutes: buildMin,
      title: artifact.title,
      subtitle: 'Ship in Playground',
      href: `/playground?artifact=${artifact.id}`,
    });
  }

  return {
    roadmap,
    concept,
    headline,
    rationale: rationaleParts.join(' '),
    totalMinutes,
    blocks,
    reviewsDue: reviewQueue.length,
    reviewQueue: reviewsToShow,
    drill,
    artifact,
  };
}
