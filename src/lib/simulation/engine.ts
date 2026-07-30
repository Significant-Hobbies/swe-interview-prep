import type {
  ActorState,
  EvidenceRecord,
  PredictionResult,
  ScenarioDefinition,
  SimulationAction,
  SimulationSnapshot,
  SystemsLabDefinition,
  TransitionDefinition,
} from './types';

function getScenario(lab: SystemsLabDefinition, scenarioId: string): ScenarioDefinition {
  const scenario = lab.scenarios.find((candidate) => candidate.id === scenarioId);
  if (!scenario) {
    throw new Error(`Unknown scenario "${scenarioId}" for lab "${lab.id}".`);
  }
  return scenario;
}

function initialActorStates(lab: SystemsLabDefinition): Record<string, ActorState> {
  return Object.fromEntries(
    lab.actors.map((actor) => [
      actor.id,
      {
        id: actor.id,
        label: actor.label,
        kind: actor.kind,
        truthPlane: actor.truthPlane,
        status: actor.initialStatus,
        detail: actor.initialDetail,
        metrics: { ...actor.initialMetrics },
        lastChangedAt: 0,
      },
    ])
  );
}

export function createSimulation(
  lab: SystemsLabDefinition,
  scenarioId = lab.defaultScenarioId
): SimulationSnapshot {
  const scenario = getScenario(lab, scenarioId);

  return {
    labId: lab.id,
    definitionVersion: lab.version,
    scenarioId: scenario.id,
    phase: 'ready',
    tick: 0,
    sequence: 0,
    nextTransitionId: scenario.entryTransitionId,
    actorStates: initialActorStates(lab),
    eventLog: [],
    evidence: [],
  };
}

function transitionById(scenario: ScenarioDefinition, transitionId: string): TransitionDefinition {
  const transition = scenario.transitions.find((candidate) => candidate.id === transitionId);
  if (!transition) {
    throw new Error(`Scenario "${scenario.id}" points to missing transition "${transitionId}".`);
  }
  return transition;
}

function applyTransition(
  snapshot: SimulationSnapshot,
  transition: TransitionDefinition
): SimulationSnapshot {
  const actor = snapshot.actorStates[transition.actorId];
  if (!actor) {
    throw new Error(
      `Transition "${transition.id}" points to missing actor "${transition.actorId}".`
    );
  }

  const sequence = snapshot.sequence + 1;
  const tick = transition.at;
  const nextActor: ActorState = {
    ...actor,
    status: transition.patch?.status ?? actor.status,
    detail: transition.patch?.detail ?? actor.detail,
    metrics: {
      ...actor.metrics,
      ...transition.patch?.metrics,
    },
    lastChangedAt: tick,
  };
  const evidence: EvidenceRecord[] = (transition.evidence ?? []).map((item) => ({
    ...item,
    transitionId: transition.id,
    tick,
    sequence,
  }));
  const isComplete = transition.next === null;

  return {
    ...snapshot,
    phase: isComplete ? 'complete' : transition.checkpoint ? 'paused' : 'running',
    tick,
    sequence,
    nextTransitionId: transition.next,
    actorStates: {
      ...snapshot.actorStates,
      [transition.actorId]: nextActor,
    },
    eventLog: [
      ...snapshot.eventLog,
      {
        transitionId: transition.id,
        actorId: transition.actorId,
        title: transition.title,
        description: transition.description,
        tick,
        sequence,
      },
    ],
    evidence: [...snapshot.evidence, ...evidence],
  };
}

function step(snapshot: SimulationSnapshot, scenario: ScenarioDefinition): SimulationSnapshot {
  if (snapshot.nextTransitionId === null) {
    return snapshot.phase === 'complete' ? snapshot : { ...snapshot, phase: 'complete' };
  }

  return applyTransition(snapshot, transitionById(scenario, snapshot.nextTransitionId));
}

function advance(snapshot: SimulationSnapshot, scenario: ScenarioDefinition): SimulationSnapshot {
  if (snapshot.nextTransitionId === null) return { ...snapshot, phase: 'complete' };

  let current = snapshot;

  while (current.nextTransitionId !== null) {
    const next = transitionById(scenario, current.nextTransitionId);
    current = applyTransition(current, next);
    if (current.phase === 'paused' || current.phase === 'complete') break;
  }

  return current;
}

function finish(snapshot: SimulationSnapshot, scenario: ScenarioDefinition): SimulationSnapshot {
  let current = snapshot;
  const maximumTransitions = scenario.transitions.length + 1;
  let applied = 0;

  while (current.nextTransitionId !== null && applied < maximumTransitions) {
    current = applyTransition(current, transitionById(scenario, current.nextTransitionId));
    applied += 1;
  }

  if (current.nextTransitionId !== null) {
    throw new Error(`Scenario "${scenario.id}" did not terminate.`);
  }

  return current.phase === 'complete' ? current : { ...current, phase: 'complete' };
}

export function reduceSimulation(
  lab: SystemsLabDefinition,
  snapshot: SimulationSnapshot,
  action: SimulationAction
): SimulationSnapshot {
  if (snapshot.labId !== lab.id || snapshot.definitionVersion !== lab.version) {
    throw new Error('Snapshot does not belong to this lab definition.');
  }

  const scenario = getScenario(lab, snapshot.scenarioId);

  switch (action.type) {
    case 'start':
      return snapshot.phase === 'ready' ? { ...snapshot, phase: 'running' } : snapshot;
    case 'step':
      return step(snapshot, scenario);
    case 'advance':
      return advance(snapshot, scenario);
    case 'finish':
      return finish(snapshot, scenario);
    case 'reset':
      return createSimulation(lab, snapshot.scenarioId);
  }
}

function sortForSerialization(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortForSerialization);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, sortForSerialization(entry)])
    );
  }
  return value;
}

export function serializeSnapshot(snapshot: SimulationSnapshot): string {
  return JSON.stringify(sortForSerialization(snapshot));
}

export function replaySimulation(
  lab: SystemsLabDefinition,
  scenarioId: string,
  actions: SimulationAction[]
): SimulationSnapshot {
  return actions.reduce(
    (snapshot, action) => reduceSimulation(lab, snapshot, action),
    createSimulation(lab, scenarioId)
  );
}

export function comparePrediction(
  scenario: ScenarioDefinition,
  snapshot: SimulationSnapshot,
  predictionId: string
): PredictionResult {
  if (snapshot.phase !== 'complete') {
    throw new Error('The simulation must complete before comparing a prediction.');
  }
  if (!scenario.predictionOptions.some((option) => option.id === predictionId)) {
    throw new Error(`Unknown prediction "${predictionId}".`);
  }

  return {
    predictionId,
    correctPredictionId: scenario.correctPredictionId,
    isCorrect: predictionId === scenario.correctPredictionId,
    outcome: scenario.expectedOutcome,
    decisiveEvidence: snapshot.evidence.filter((evidence) =>
      scenario.expectedOutcome.evidenceIds.includes(evidence.id)
    ),
  };
}
