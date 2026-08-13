import { describe, expect, it } from 'vitest';

import artifactsData from './artifacts.json';
import conceptsData from './concepts.json';
import drillsData from './drills.json';
import reviewQuestionsData from './review-questions.json';
import roadmapsData from './roadmaps.json';

const NEW_CONCEPT_IDS = [
  'repository-instruction-topology',
  'agent-environment-contracts',
  'agent-work-state-handoffs',
  'agent-scope-control',
  'independent-agent-verification',
  'agent-run-lifecycle',
  'harness-evaluation',
] as const;

const REUSED_CONCEPT_IDS = [
  'coding-agent-systems',
  'repository-intelligence',
  'durable-agent-execution',
  'agent-memory-context',
  'agent-observability',
  'agent-permissions-sandboxing',
  'ai-regression-testing',
  'tool-use-evaluations',
] as const;

const BUILD_DRILL_IDS = [
  'build-rules-first-workspace',
  'make-agent-readable-workspace',
  'build-multi-session-continuity',
  'add-feedback-and-scope-control',
  'separate-maker-and-checker',
  'build-complete-harness-lifecycle',
  'evaluate-automated-agent-loop',
] as const;

describe('Harness Engineering curriculum', () => {
  const concepts = conceptsData.concepts;
  const drills = drillsData.drills;
  const reviews = reviewQuestionsData.reviewQuestions;
  const artifacts = artifactsData.artifacts;
  const roadmap = roadmapsData.roadmaps.find((candidate) => candidate.id === 'harness-engineering');

  it('ships one seven-build roadmap in the intended order', () => {
    expect(roadmap?.milestones.map((milestone) => milestone.title)).toEqual([
      'Build 1 — Prompt-only versus rules-first',
      'Build 2 — Agent-readable workspace',
      'Build 3 — Multi-session continuity',
      'Build 4 — Runtime feedback and scope control',
      'Build 5 — Independent self-verification',
      'Build 6 — Complete harness lifecycle',
      'Build 7 — Automated maker-checker loop',
    ]);
    for (const [index, drillId] of BUILD_DRILL_IDS.entries()) {
      expect(roadmap?.milestones[index]?.drills).toContain(drillId);
    }
  });

  it('reuses established concepts and introduces only the missing atomic layer', () => {
    const conceptIds = new Set(concepts.map((concept) => concept.id));
    for (const id of [...NEW_CONCEPT_IDS, ...REUSED_CONCEPT_IDS])
      expect(conceptIds.has(id)).toBe(true);
    expect(
      concepts
        .filter((concept) => concept.curriculumSource === 'harness-engineering-v1')
        .map((concept) => concept.id)
    ).toEqual(NEW_CONCEPT_IDS);
  });

  it('links every new concept to executable practice, review, resources, and synthesis', () => {
    const drillById = new Map(drills.map((drill) => [drill.id, drill]));
    const reviewIds = new Set(reviews.map((review) => review.id));
    const artifactIds = new Set(artifacts.map((artifact) => artifact.id));

    for (const concept of concepts.filter((candidate) =>
      NEW_CONCEPT_IDS.includes(candidate.id as (typeof NEW_CONCEPT_IDS)[number])
    )) {
      expect(concept.roadmaps).toContain('harness-engineering');
      expect(concept.resources.length).toBeGreaterThanOrEqual(2);
      expect(concept.reviewQuestions.every((id) => reviewIds.has(id))).toBe(true);
      expect(concept.artifacts.every((id) => artifactIds.has(id))).toBe(true);
      for (const drillId of concept.drills) {
        const drill = drillById.get(drillId);
        expect(drill?.conceptId).toBe(concept.id);
        expect(drill?.testCases?.length).toBeGreaterThan(0);
        expect(drill?.referenceSolution?.length).toBeGreaterThan(40);
      }
    }
  });

  it('keeps all roadmap references inside the canonical catalogs', () => {
    const conceptIds = new Set(concepts.map((concept) => concept.id));
    const drillIds = new Set(drills.map((drill) => drill.id));
    const artifactIds = new Set(artifacts.map((artifact) => artifact.id));

    for (const milestone of roadmap?.milestones ?? []) {
      expect(milestone.concepts.every((id) => conceptIds.has(id))).toBe(true);
      expect(milestone.drills.every((id) => drillIds.has(id))).toBe(true);
      expect(milestone.artifacts.every((id) => artifactIds.has(id))).toBe(true);
    }
  });
});
