import type { RoleFitAnalysis, RoleFitImportance } from '../../shared/lib/role-fit.mjs';
import { fingerprintRoleFitSource } from '../../shared/lib/role-fit.mjs';
import {
  artifactsForConcept,
  CONCEPT_BY_ID,
  type Concept,
  editorialDrillsForConcept,
  primaryGroup,
} from '../data/learning-os';
import type { MasteryEntry } from '../hooks/useConcepts';
import { deriveConceptStatus } from './conceptState';
import type { RoleFocus } from './profile';
import type { SweepRating } from './sweep';

type RoleFitBucket = 'demonstrated' | 'verify' | 'learn';

export interface RoleFitPlanItem {
  conceptId: string;
  concept: Concept;
  direct: boolean;
  requirementIds: string[];
  requirementLabels: string[];
  importance: RoleFitImportance;
  matchConfidence: number;
  score: number;
  bucket: RoleFitBucket;
  reason: string;
  source?: 'active-role';
  drillId?: string;
  artifactId?: string;
}

export interface RoleFitPlan {
  targetConceptIds: string[];
  supportingConceptIds: string[];
  demonstrated: RoleFitPlanItem[];
  verify: RoleFitPlanItem[];
  learn: RoleFitPlanItem[];
  roadmapWeights: Record<string, number>;
  trackIds: string[];
}

interface Candidate {
  concept: Concept;
  direct: boolean;
  requirementIds: Set<string>;
  requirementLabels: Set<string>;
  importance: RoleFitImportance;
  matchConfidence: number;
  score: number;
}

const IMPORTANCE_SCORE: Record<RoleFitImportance, number> = {
  must: 300,
  preferred: 200,
  context: 100,
};

function higherImportance(a: RoleFitImportance, b: RoleFitImportance): RoleFitImportance {
  return IMPORTANCE_SCORE[a] >= IMPORTANCE_SCORE[b] ? a : b;
}

function addCandidate(
  candidates: Map<string, Candidate>,
  conceptId: string,
  input: Omit<Candidate, 'concept'>
) {
  const concept = CONCEPT_BY_ID[conceptId];
  if (!concept) return;
  const current = candidates.get(conceptId);
  if (!current) {
    candidates.set(conceptId, { concept, ...input });
    return;
  }
  current.direct ||= input.direct;
  for (const id of input.requirementIds) current.requirementIds.add(id);
  for (const label of input.requirementLabels) current.requirementLabels.add(label);
  current.importance = higherImportance(current.importance, input.importance);
  current.matchConfidence = Math.max(current.matchConfidence, input.matchConfidence);
  current.score = Math.max(current.score, input.score);
}

function addPrerequisites(
  candidates: Map<string, Candidate>,
  conceptId: string,
  source: Omit<Candidate, 'concept' | 'direct'>,
  seen: Set<string>,
  depth = 1
) {
  const concept = CONCEPT_BY_ID[conceptId];
  if (!concept) return;
  for (const prerequisiteId of concept.prerequisites) {
    if (seen.has(prerequisiteId)) continue;
    seen.add(prerequisiteId);
    addCandidate(candidates, prerequisiteId, {
      ...source,
      direct: false,
      score: source.score - depth * 12,
    });
    addPrerequisites(candidates, prerequisiteId, source, seen, depth + 1);
  }
}

function bucketFor(
  conceptId: string,
  mastery: Record<string, MasteryEntry>,
  sweepRatings: Record<string, SweepRating>,
  now: Date
): RoleFitBucket {
  if (deriveConceptStatus(mastery[conceptId], now) === 'mastered') return 'demonstrated';
  if (
    mastery[conceptId] ||
    sweepRatings[conceptId] === 'fuzzy' ||
    sweepRatings[conceptId] === 'new'
  ) {
    return 'learn';
  }
  return 'verify';
}

/** Rebuild the actionable portion of a saved target without retaining model output. */
export function buildActiveRolePlan(
  focus: RoleFocus,
  mastery: Record<string, MasteryEntry>,
  sweepRatings: Record<string, SweepRating>,
  now = new Date()
): RoleFitPlan {
  const directIds = new Set(focus.targetConceptIds);
  const ids = [...new Set([...focus.targetConceptIds, ...focus.supportingConceptIds])];
  const items = ids.flatMap((conceptId): RoleFitPlanItem[] => {
    const concept = CONCEPT_BY_ID[conceptId];
    if (!concept) return [];
    const direct = directIds.has(conceptId);
    return [
      {
        conceptId,
        concept,
        direct,
        requirementIds: [],
        requirementLabels: [],
        importance: 'context',
        matchConfidence: 1,
        score: concept.priority ?? 0,
        bucket: bucketFor(conceptId, mastery, sweepRatings, now),
        reason: direct
          ? `Saved direct match for ${focus.roleTitle}.`
          : `Saved prerequisite for ${focus.roleTitle}.`,
        source: 'active-role',
        drillId: editorialDrillsForConcept(conceptId)[0]?.id,
        artifactId: artifactsForConcept(conceptId)[0]?.id,
      },
    ];
  });
  const byPriority = (a: RoleFitPlanItem, b: RoleFitPlanItem) =>
    Number(b.direct) - Number(a.direct) ||
    b.score - a.score ||
    a.concept.name.localeCompare(b.concept.name);

  return {
    targetConceptIds: focus.targetConceptIds.filter((id) => Boolean(CONCEPT_BY_ID[id])),
    supportingConceptIds: focus.supportingConceptIds.filter((id) => Boolean(CONCEPT_BY_ID[id])),
    demonstrated: items.filter((item) => item.bucket === 'demonstrated').sort(byPriority),
    verify: items.filter((item) => item.bucket === 'verify').sort(byPriority),
    learn: items.filter((item) => item.bucket === 'learn').sort(byPriority),
    roadmapWeights: focus.roadmapWeights,
    trackIds: focus.trackIds,
  };
}

function normalizedWeights(scores: Map<string, number>, limit: number): Record<string, number> {
  const entries = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
  const total = entries.reduce((sum, [, score]) => sum + score, 0);
  if (!total) return {};
  return Object.fromEntries(entries.map(([id, score]) => [id, score / total]));
}

function activationBias(items: RoleFitPlanItem[]) {
  const roadmapScores = new Map<string, number>();
  const trackScores = new Map<string, number>();
  for (const item of items.filter((candidate) => candidate.direct)) {
    const contribution = IMPORTANCE_SCORE[item.importance] + item.matchConfidence * 100;
    const roadmaps = item.concept.roadmaps;
    for (const roadmapId of roadmaps) {
      roadmapScores.set(
        roadmapId,
        (roadmapScores.get(roadmapId) ?? 0) + contribution / Math.max(1, roadmaps.length)
      );
    }
    const track = primaryGroup(item.concept)?.id;
    if (track) trackScores.set(track, (trackScores.get(track) ?? 0) + contribution);
  }
  return {
    roadmapWeights: normalizedWeights(roadmapScores, 4),
    trackIds: [...trackScores.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([id]) => id),
  };
}

/** Build an evidence-aware plan without letting the model classify mastery. */
export function buildRoleFitPlan(
  analysis: RoleFitAnalysis,
  mastery: Record<string, MasteryEntry>,
  sweepRatings: Record<string, SweepRating>,
  now = new Date()
): RoleFitPlan {
  const candidates = new Map<string, Candidate>();

  for (const requirement of analysis.requirements) {
    const baseScore = IMPORTANCE_SCORE[requirement.importance] + requirement.confidence * 100;
    const source = {
      requirementIds: new Set([requirement.id]),
      requirementLabels: new Set([requirement.label]),
      importance: requirement.importance,
      matchConfidence: requirement.confidence,
      score: baseScore,
    };
    for (const conceptId of requirement.conceptIds) {
      addCandidate(candidates, conceptId, { ...source, direct: true });
      addPrerequisites(candidates, conceptId, source, new Set([conceptId]));
    }
  }

  const items = [...candidates.values()].map((candidate): RoleFitPlanItem => {
    const bucket = bucketFor(candidate.concept.id, mastery, sweepRatings, now);
    const firstLabel = [...candidate.requirementLabels][0] ?? 'the role requirement';
    return {
      conceptId: candidate.concept.id,
      concept: candidate.concept,
      direct: candidate.direct,
      requirementIds: [...candidate.requirementIds],
      requirementLabels: [...candidate.requirementLabels],
      importance: candidate.importance,
      matchConfidence: candidate.matchConfidence,
      score: candidate.score + (candidate.concept.priority ?? 0),
      bucket,
      reason: candidate.direct
        ? `Direct match for “${firstLabel}”.`
        : `Foundation required before “${firstLabel}”.`,
      drillId: editorialDrillsForConcept(candidate.concept.id)[0]?.id,
      artifactId: artifactsForConcept(candidate.concept.id)[0]?.id,
    };
  });

  const byPriority = (a: RoleFitPlanItem, b: RoleFitPlanItem) =>
    Number(b.direct) - Number(a.direct) ||
    b.score - a.score ||
    a.concept.name.localeCompare(b.concept.name);
  const targetConceptIds = items
    .filter((item) => item.direct)
    .sort(byPriority)
    .map((item) => item.conceptId);
  const supportingConceptIds = items
    .filter((item) => !item.direct)
    .sort((a, b) => b.score - a.score || a.concept.name.localeCompare(b.concept.name))
    .map((item) => item.conceptId);
  const bias = activationBias(items);

  return {
    targetConceptIds,
    supportingConceptIds,
    demonstrated: items.filter((item) => item.bucket === 'demonstrated').sort(byPriority),
    verify: items.filter((item) => item.bucket === 'verify').sort(byPriority),
    learn: items.filter((item) => item.bucket === 'learn').sort(byPriority),
    ...bias,
  };
}

export function buildRoleFocus(
  analysis: RoleFitAnalysis,
  plan: RoleFitPlan,
  jobDescription: string,
  previous: RoleFocus | undefined,
  now = new Date()
): RoleFocus {
  const timestamp = now.toISOString();
  const sourceFingerprint = fingerprintRoleFitSource(jobDescription);
  return {
    roleTitle: analysis.roleTitle,
    targetConceptIds: plan.targetConceptIds,
    supportingConceptIds: plan.supportingConceptIds,
    roadmapWeights: plan.roadmapWeights,
    trackIds: plan.trackIds,
    sourceFingerprint,
    createdAt: previous?.sourceFingerprint === sourceFingerprint ? previous.createdAt : timestamp,
    updatedAt: timestamp,
  };
}

export function roleFocusMatchesPlan(
  focus: RoleFocus | undefined,
  plan: RoleFitPlan,
  sourceFingerprint: string
): boolean {
  if (!focus || focus.sourceFingerprint !== sourceFingerprint) return false;
  const sameIds = (left: string[], right: string[]) => {
    if (left.length !== right.length) return false;
    const sortedRight = [...right].sort();
    return [...left].sort().every((id, index) => id === sortedRight[index]);
  };
  return (
    sameIds(focus.targetConceptIds, plan.targetConceptIds) &&
    sameIds(focus.supportingConceptIds, plan.supportingConceptIds)
  );
}
