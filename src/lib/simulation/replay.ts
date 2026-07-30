import { replaySimulation, serializeSnapshot } from './engine';
import type {
  SimulationAction,
  SimulationReplayV1,
  SimulationSnapshot,
  SystemsLabDefinition,
} from './types';

const REPLAY_SCHEMA_VERSION = 1;
const MAX_REPLAY_ACTIONS = 1_000;
const ACTION_TYPES = new Set<SimulationAction['type']>([
  'start',
  'step',
  'advance',
  'finish',
  'reset',
]);

function fingerprint(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function isSimulationAction(value: unknown): value is SimulationAction {
  if (!value || typeof value !== 'object') return false;
  const entries = Object.entries(value);
  return (
    entries.length === 1 &&
    entries[0][0] === 'type' &&
    typeof entries[0][1] === 'string' &&
    ACTION_TYPES.has(entries[0][1] as SimulationAction['type'])
  );
}

export function createSimulationReplay(
  lab: SystemsLabDefinition,
  scenarioId: string,
  actions: SimulationAction[]
): SimulationReplayV1 {
  if (actions.length > MAX_REPLAY_ACTIONS) {
    throw new Error(`A replay cannot contain more than ${MAX_REPLAY_ACTIONS} actions.`);
  }
  const snapshot = replaySimulation(lab, scenarioId, actions);
  return {
    schemaVersion: REPLAY_SCHEMA_VERSION,
    labId: lab.id,
    definitionVersion: lab.version,
    scenarioId,
    actions: actions.map((action) => ({ ...action })),
    finalSnapshotFingerprint: fingerprint(serializeSnapshot(snapshot)),
  };
}

export function serializeSimulationReplay(replay: SimulationReplayV1): string {
  return JSON.stringify(replay, null, 2);
}

export function parseSimulationReplay(
  lab: SystemsLabDefinition,
  serialized: string
): { replay: SimulationReplayV1; snapshot: SimulationSnapshot } {
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch {
    throw new Error('Replay is not valid JSON.');
  }
  if (!value || typeof value !== 'object') throw new Error('Replay must be a JSON object.');

  const replay = value as Partial<SimulationReplayV1>;
  if (replay.schemaVersion !== REPLAY_SCHEMA_VERSION) {
    throw new Error(`Unsupported replay schema version "${String(replay.schemaVersion)}".`);
  }
  if (replay.labId !== lab.id) {
    throw new Error(`Replay belongs to lab "${String(replay.labId)}", not "${lab.id}".`);
  }
  if (replay.definitionVersion !== lab.version) {
    throw new Error(
      `Replay uses definition v${String(replay.definitionVersion)}; this lab is v${lab.version}.`
    );
  }
  if (
    typeof replay.scenarioId !== 'string' ||
    !lab.scenarios.some((scenario) => scenario.id === replay.scenarioId)
  ) {
    throw new Error(`Replay references unknown scenario "${String(replay.scenarioId)}".`);
  }
  if (!Array.isArray(replay.actions) || replay.actions.length > MAX_REPLAY_ACTIONS) {
    throw new Error(`Replay actions must be an array of at most ${MAX_REPLAY_ACTIONS} entries.`);
  }
  if (!replay.actions.every(isSimulationAction)) {
    throw new Error('Replay contains an unknown or malformed action.');
  }
  if (typeof replay.finalSnapshotFingerprint !== 'string') {
    throw new Error('Replay is missing its final snapshot fingerprint.');
  }

  const typedReplay = replay as SimulationReplayV1;
  const snapshot = replaySimulation(lab, typedReplay.scenarioId, typedReplay.actions);
  const actualFingerprint = fingerprint(serializeSnapshot(snapshot));
  if (actualFingerprint !== typedReplay.finalSnapshotFingerprint) {
    throw new Error(
      'Replay fingerprint does not match this definition. The replay may be corrupted or stale.'
    );
  }

  return { replay: typedReplay, snapshot };
}
