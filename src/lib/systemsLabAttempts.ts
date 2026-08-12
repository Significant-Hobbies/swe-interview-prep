import type { PredictionResult, SystemsLabDefinition } from './simulation/types';
import { loadLocal, saveLocal, STORE_KEYS } from './userStore';

type SystemsLabAttemptStatus = 'draft' | 'predicted' | 'completed' | 'explained';

export interface SystemsLabAttempt {
  id: string;
  accountScope: string;
  labId: string;
  definitionVersion: number;
  scenarioId: string;
  status: SystemsLabAttemptStatus;
  predictionId: string | null;
  predictionFrozenAt: string | null;
  completedAt: string | null;
  predictionCorrect: boolean | null;
  decisiveEvidenceIds: string[];
  configurationPassed: boolean;
  configurationPassedAt: string | null;
  configurationEvidenceIds: string[];
  configurationFiles: Record<string, string>;
  explanation: string;
  explanationGrade: number | null;
  masteryStatus: 'pending' | 'applied';
  updatedAt: string;
}

type AttemptStore = Record<string, SystemsLabAttempt[]>;

function loadStore(): AttemptStore {
  return loadLocal<AttemptStore>(STORE_KEYS.systemsLabs, {});
}

export function loadSystemsLabAttempts(accountScope: string): SystemsLabAttempt[] {
  return (loadStore()[accountScope] ?? []).map((attempt) => ({
    ...attempt,
    configurationPassed: attempt.configurationPassed === true,
    configurationPassedAt: attempt.configurationPassedAt ?? null,
    configurationEvidenceIds: attempt.configurationEvidenceIds ?? [],
    configurationFiles: attempt.configurationFiles ?? {},
  }));
}

export function saveSystemsLabAttempt(attempt: SystemsLabAttempt): SystemsLabAttempt[] {
  const store = loadStore();
  const attempts = store[attempt.accountScope] ?? [];
  const index = attempts.findIndex((candidate) => candidate.id === attempt.id);
  const next =
    index === -1
      ? [attempt, ...attempts]
      : attempts.map((candidate) => (candidate.id === attempt.id ? attempt : candidate));
  store[attempt.accountScope] = next;
  saveLocal(STORE_KEYS.systemsLabs, store);
  return next;
}

export function createSystemsLabAttempt(
  accountScope: string,
  lab: SystemsLabDefinition,
  scenarioId: string,
  now = new Date()
): SystemsLabAttempt {
  const timestamp = now.toISOString();
  return {
    id: `${lab.id}:${scenarioId}:${timestamp}`,
    accountScope,
    labId: lab.id,
    definitionVersion: lab.version,
    scenarioId,
    status: 'draft',
    predictionId: null,
    predictionFrozenAt: null,
    completedAt: null,
    predictionCorrect: null,
    decisiveEvidenceIds: [],
    configurationPassed: false,
    configurationPassedAt: null,
    configurationEvidenceIds: [],
    configurationFiles: {},
    explanation: '',
    explanationGrade: null,
    masteryStatus: 'pending',
    updatedAt: timestamp,
  };
}

export function updateSystemsLabConfiguration(
  attempt: SystemsLabAttempt,
  passed: boolean,
  evidenceIds: string[],
  files: Record<string, string>,
  now = new Date()
): SystemsLabAttempt {
  const timestamp = now.toISOString();
  return {
    ...attempt,
    configurationPassed: passed,
    configurationPassedAt: passed ? timestamp : null,
    configurationEvidenceIds: passed ? [...evidenceIds] : [],
    configurationFiles: { ...files },
    updatedAt: timestamp,
  };
}

export function reuseVerifiedSystemsLabConfiguration(
  attempt: SystemsLabAttempt,
  attempts: SystemsLabAttempt[]
): SystemsLabAttempt {
  const verified = attempts.find(
    (candidate) =>
      candidate.labId === attempt.labId &&
      candidate.definitionVersion === attempt.definitionVersion &&
      candidate.configurationPassed === true
  );
  if (!verified) return attempt;
  return {
    ...attempt,
    configurationPassed: true,
    configurationPassedAt: verified.configurationPassedAt,
    configurationEvidenceIds: [...verified.configurationEvidenceIds],
    configurationFiles: { ...verified.configurationFiles },
  };
}

export function freezeSystemsLabPrediction(
  attempt: SystemsLabAttempt,
  predictionId: string,
  now = new Date()
): SystemsLabAttempt {
  if (attempt.status !== 'draft') {
    throw new Error('A frozen prediction cannot be changed. Start a new attempt instead.');
  }
  const timestamp = now.toISOString();
  return {
    ...attempt,
    status: 'predicted',
    predictionId,
    predictionFrozenAt: timestamp,
    updatedAt: timestamp,
  };
}

export function completeSystemsLabAttempt(
  attempt: SystemsLabAttempt,
  result: PredictionResult,
  now = new Date()
): SystemsLabAttempt {
  if (attempt.status !== 'predicted' || !attempt.predictionId) {
    throw new Error('Freeze a prediction before completing the simulation.');
  }
  const timestamp = now.toISOString();
  return {
    ...attempt,
    status: 'completed',
    completedAt: timestamp,
    predictionCorrect: result.isCorrect,
    decisiveEvidenceIds: result.decisiveEvidence.map((item) => item.id),
    updatedAt: timestamp,
  };
}

export function updateSystemsLabExplanation(
  attempt: SystemsLabAttempt,
  explanation: string,
  grade: number | null,
  masteryApplied: boolean,
  now = new Date()
): SystemsLabAttempt {
  if (attempt.status !== 'completed' && attempt.status !== 'explained') {
    throw new Error('Complete the simulation before writing an explain-back.');
  }
  if (grade !== null && attempt.explanationGrade === null && attempt.configurationPassed !== true) {
    throw new Error('Validate the infrastructure configuration before grading an explain-back.');
  }
  const timestamp = now.toISOString();
  return {
    ...attempt,
    status: grade === null ? attempt.status : 'explained',
    explanation,
    explanationGrade: grade,
    masteryStatus: masteryApplied ? 'applied' : 'pending',
    updatedAt: timestamp,
  };
}

export function latestCompatibleAttempt(
  attempts: SystemsLabAttempt[],
  lab: SystemsLabDefinition,
  scenarioId: string
): SystemsLabAttempt | undefined {
  return attempts.find(
    (attempt) =>
      attempt.labId === lab.id &&
      attempt.definitionVersion === lab.version &&
      attempt.scenarioId === scenarioId
  );
}

export function hasStaleSystemsLabAttempt(
  attempts: SystemsLabAttempt[],
  lab: SystemsLabDefinition,
  scenarioId: string
): boolean {
  return attempts.some(
    (attempt) =>
      attempt.labId === lab.id &&
      attempt.definitionVersion !== lab.version &&
      attempt.scenarioId === scenarioId
  );
}
