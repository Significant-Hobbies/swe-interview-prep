import type { DefinitionIssue, ScenarioDefinition, SystemsLabDefinition } from './types';

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function validateScenario(
  lab: SystemsLabDefinition,
  scenario: ScenarioDefinition,
  knownActors: Set<string>
): DefinitionIssue[] {
  const issues: DefinitionIssue[] = [];
  const path = `labs.${lab.id}.scenarios.${scenario.id}`;
  const transitionIds = new Set(scenario.transitions.map((transition) => transition.id));
  const evidence = scenario.transitions.flatMap((transition) => transition.evidence ?? []);
  const evidenceIds = new Set(evidence.map((item) => item.id));

  for (const duplicate of duplicateValues(scenario.transitions.map((item) => item.id))) {
    issues.push({
      path: `${path}.transitions`,
      message: `Duplicate transition ID "${duplicate}".`,
    });
  }
  for (const duplicate of duplicateValues(evidence.map((item) => item.id))) {
    issues.push({ path: `${path}.evidence`, message: `Duplicate evidence ID "${duplicate}".` });
  }
  if (!transitionIds.has(scenario.entryTransitionId)) {
    issues.push({
      path: `${path}.entryTransitionId`,
      message: `Unknown entry transition "${scenario.entryTransitionId}".`,
    });
  }
  if (!scenario.predictionOptions.some((option) => option.id === scenario.correctPredictionId)) {
    issues.push({
      path: `${path}.correctPredictionId`,
      message: `Correct prediction "${scenario.correctPredictionId}" is not an option.`,
    });
  }

  for (const transition of scenario.transitions) {
    if (!knownActors.has(transition.actorId)) {
      issues.push({
        path: `${path}.transitions.${transition.id}.actorId`,
        message: `Unknown actor "${transition.actorId}".`,
      });
    }
    if (transition.next !== null && !transitionIds.has(transition.next)) {
      issues.push({
        path: `${path}.transitions.${transition.id}.next`,
        message: `Unknown transition target "${transition.next}".`,
      });
    }
    for (const item of transition.evidence ?? []) {
      if (!knownActors.has(item.actorId)) {
        issues.push({
          path: `${path}.transitions.${transition.id}.evidence.${item.id}.actorId`,
          message: `Unknown evidence actor "${item.actorId}".`,
        });
      }
    }
  }

  for (const actorId of Object.keys(scenario.expectedOutcome.actorStates)) {
    if (!knownActors.has(actorId)) {
      issues.push({
        path: `${path}.expectedOutcome.actorStates.${actorId}`,
        message: `Unknown expected actor "${actorId}".`,
      });
    }
  }
  for (const evidenceId of scenario.expectedOutcome.evidenceIds) {
    if (!evidenceIds.has(evidenceId)) {
      issues.push({
        path: `${path}.expectedOutcome.evidenceIds`,
        message: `Unknown decisive evidence "${evidenceId}".`,
      });
    }
  }

  const visited = new Set<string>();
  let cursor: string | null = scenario.entryTransitionId;
  while (cursor && transitionIds.has(cursor) && !visited.has(cursor)) {
    visited.add(cursor);
    cursor = scenario.transitions.find((transition) => transition.id === cursor)?.next ?? null;
  }
  if (cursor && visited.has(cursor)) {
    issues.push({
      path: `${path}.transitions.${cursor}`,
      message: `Cycle detected at transition "${cursor}".`,
    });
  }
  for (const transition of scenario.transitions) {
    if (!visited.has(transition.id)) {
      issues.push({
        path: `${path}.transitions.${transition.id}`,
        message: `Transition "${transition.id}" is unreachable from the scenario entry.`,
      });
    }
  }

  return issues;
}

export function validateLabDefinition(
  lab: SystemsLabDefinition,
  knownConceptIds?: Set<string>
): DefinitionIssue[] {
  const issues: DefinitionIssue[] = [];
  const actorIds = new Set(lab.actors.map((actor) => actor.id));
  const scenarioIds = new Set(lab.scenarios.map((scenario) => scenario.id));
  const controlIds = new Set(lab.controls.map((control) => control.id));
  const provenanceIds = new Set(lab.provenance.map((record) => record.id));
  const configurationFileIds = new Set(lab.configurationChallenge.files.map((file) => file.id));

  for (const duplicate of duplicateValues(lab.actors.map((actor) => actor.id))) {
    issues.push({ path: `labs.${lab.id}.actors`, message: `Duplicate actor ID "${duplicate}".` });
  }
  for (const duplicate of duplicateValues(lab.scenarios.map((scenario) => scenario.id))) {
    issues.push({
      path: `labs.${lab.id}.scenarios`,
      message: `Duplicate scenario ID "${duplicate}".`,
    });
  }
  for (const duplicate of duplicateValues(lab.controls.map((control) => control.id))) {
    issues.push({
      path: `labs.${lab.id}.controls`,
      message: `Duplicate control ID "${duplicate}".`,
    });
  }
  for (const duplicate of duplicateValues(lab.provenance.map((record) => record.id))) {
    issues.push({
      path: `labs.${lab.id}.provenance`,
      message: `Duplicate provenance ID "${duplicate}".`,
    });
  }
  for (const duplicate of duplicateValues(
    lab.configurationChallenge.files.map((file) => file.id)
  )) {
    issues.push({
      path: `labs.${lab.id}.configurationChallenge.files`,
      message: `Duplicate configuration file ID "${duplicate}".`,
    });
  }
  for (const duplicate of duplicateValues(
    lab.configurationChallenge.slots.map((slot) => slot.id)
  )) {
    issues.push({
      path: `labs.${lab.id}.configurationChallenge.slots`,
      message: `Duplicate configuration slot ID "${duplicate}".`,
    });
  }
  if (lab.configurationChallenge.requirements.length === 0) {
    issues.push({
      path: `labs.${lab.id}.configurationChallenge.requirements`,
      message: 'Configuration challenge must provide a discoverable delivery brief.',
    });
  }
  for (const slot of lab.configurationChallenge.slots) {
    const path = `labs.${lab.id}.configurationChallenge.slots.${slot.id}`;
    const file = lab.configurationChallenge.files.find((candidate) => candidate.id === slot.fileId);
    if (!configurationFileIds.has(slot.fileId) || !file) {
      issues.push({
        path: `${path}.fileId`,
        message: `Unknown configuration file "${slot.fileId}".`,
      });
      continue;
    }
    const markerCount = file.starter
      .split(/\r?\n/)
      .filter((line) => line.trim() === slot.marker).length;
    if (markerCount !== 1) {
      issues.push({
        path: `${path}.marker`,
        message: `Configuration marker must occur exactly once; found ${markerCount}.`,
      });
    }
    if (slot.expectedLine.trim().length === 0) {
      issues.push({
        path: `${path}.expectedLine`,
        message: 'Configuration slot must require a non-empty line.',
      });
    }
  }
  if (lab.fidelity.level !== 'modeled' && provenanceIds.size === 0) {
    issues.push({
      path: `labs.${lab.id}.fidelity`,
      message: `Fidelity "${lab.fidelity.level}" requires at least one provenance record.`,
    });
  }
  if (
    lab.fidelity.level === 'oracle-verified' &&
    !lab.provenance.some((record) => record.method === 'executable-oracle')
  ) {
    issues.push({
      path: `labs.${lab.id}.fidelity`,
      message: 'Oracle-verified fidelity requires an executable-oracle provenance record.',
    });
  }
  for (const record of lab.provenance) {
    const path = `labs.${lab.id}.provenance.${record.id}`;
    if (!/^[0-9a-f]{40}$/.test(record.revision)) {
      issues.push({
        path: `${path}.revision`,
        message: 'Upstream revision must be a pinned 40-character Git commit SHA.',
      });
    }
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(record.repository)) {
      issues.push({
        path: `${path}.repository`,
        message: 'Upstream repository must be a canonical GitHub repository URL.',
      });
    }
    if (record.sourcePaths.length === 0) {
      issues.push({
        path: `${path}.sourcePaths`,
        message: 'Upstream provenance must name at least one reviewed source path.',
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.verifiedOn)) {
      issues.push({
        path: `${path}.verifiedOn`,
        message: 'Verification date must use YYYY-MM-DD.',
      });
    }
  }
  if (!scenarioIds.has(lab.defaultScenarioId)) {
    issues.push({
      path: `labs.${lab.id}.defaultScenarioId`,
      message: `Unknown default scenario "${lab.defaultScenarioId}".`,
    });
  }
  if (knownConceptIds) {
    for (const conceptId of lab.conceptIds) {
      if (!knownConceptIds.has(conceptId)) {
        issues.push({
          path: `labs.${lab.id}.conceptIds`,
          message: `Unknown concept "${conceptId}".`,
        });
      }
    }
  }

  for (const scenario of lab.scenarios) {
    for (const controlId of Object.keys(scenario.controls)) {
      if (!controlIds.has(controlId)) {
        issues.push({
          path: `labs.${lab.id}.scenarios.${scenario.id}.controls.${controlId}`,
          message: `Unknown control "${controlId}".`,
        });
      }
    }
    issues.push(...validateScenario(lab, scenario, actorIds));
  }

  return issues;
}

export function assertValidLabDefinition(
  lab: SystemsLabDefinition,
  knownConceptIds?: Set<string>
): void {
  const issues = validateLabDefinition(lab, knownConceptIds);
  if (issues.length > 0) {
    throw new Error(
      `Invalid systems lab definition:\n${issues
        .map((issue) => `- ${issue.path}: ${issue.message}`)
        .join('\n')}`
    );
  }
}
