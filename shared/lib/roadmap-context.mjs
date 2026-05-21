import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
let CONTEXT = null;

function loadContext() {
  if (!CONTEXT) {
    const p = join(__dirname, '..', 'data', 'roadmap-context.json');
    CONTEXT = JSON.parse(readFileSync(p, 'utf8'));
  }
  return CONTEXT;
}

export function getRoadmapContext(concept) {
  if (!concept) return null;
  const data = loadContext();
  const base = data.defaultByCategory[concept.category] || data.defaultByCategory.dsa;
  const override = data.byConceptId[concept.id] || {};
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
