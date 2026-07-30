import conceptsData from '../concepts.json';
import { gitopsLab } from './gitops';
import { metricsLab } from './metrics';
import { tracingLab } from './tracing';
import { branchByControls } from '../../lib/simulation/primitives';
import type {
  ScalarValue,
  ScenarioDefinition,
  SystemsLabDefinition,
} from '../../lib/simulation/types';
import { assertValidLabDefinition } from '../../lib/simulation/validate';

export const systemsLabs = [gitopsLab, tracingLab, metricsLab] satisfies SystemsLabDefinition[];

const knownConceptIds = new Set(conceptsData.concepts.map((concept) => concept.id));
for (const lab of systemsLabs) assertValidLabDefinition(lab, knownConceptIds);

export function getSystemsLab(labId: string): SystemsLabDefinition | undefined {
  return systemsLabs.find((lab) => lab.id === labId);
}

export function getLabsForConcept(conceptId: string): SystemsLabDefinition[] {
  return systemsLabs.filter((lab) => lab.conceptIds.includes(conceptId));
}

export function getScenarioForControls(
  lab: SystemsLabDefinition,
  controls: Record<string, ScalarValue>
): ScenarioDefinition | undefined {
  return branchByControls(lab.scenarios, controls);
}

export { gitopsLab, metricsLab, tracingLab };
