import roadmapContext from '../data/roadmap-context.json' with { type: 'json' };

import { categoryForConcept } from './category.mjs';

const CONTEXT = roadmapContext;

export function getRoadmapContext(concept) {
  if (!concept) return null;
  const category = categoryForConcept(concept);
  const base = CONTEXT.defaultByCategory[category] || CONTEXT.defaultByCategory.dsa;
  const override = CONTEXT.byConceptId[concept.id] || {};
  return {
    track: override.track || base.track,
    milestone: override.milestone || base.milestone,
    exitCriteria: override.exitCriteria || base.exitCriteria,
    artifacts: override.artifacts || base.artifacts,
  };
}

export function enrichPlanWithRoadmap(plan, concept) {
  const roadmap = getRoadmapContext(concept);
  if (!plan || !roadmap) return plan;
  return {
    ...plan,
    roadmap_track: roadmap.track,
    roadmap_milestone: roadmap.milestone,
    exit_criteria: roadmap.exitCriteria,
    artifacts: roadmap.artifacts,
  };
}

export function roadmapPromptSuffix(concept) {
  const roadmap = getRoadmapContext(concept);
  if (!roadmap) return '';
  return [
    '',
    'Roadmap proof contract:',
    `Track: ${roadmap.track}`,
    `Milestone: ${roadmap.milestone}`,
    `Exit criteria: ${roadmap.exitCriteria.join(' | ')}`,
    `Required artifacts: ${roadmap.artifacts.join(' | ')}`,
  ].join('\n');
}