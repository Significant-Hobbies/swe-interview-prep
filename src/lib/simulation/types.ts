export type TruthPlane =
  | 'source'
  | 'controller'
  | 'resource'
  | 'process'
  | 'operation'
  | 'storage'
  | 'query'
  | 'user-visible';

export type ActorStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'waiting'
  | 'healthy'
  | 'degraded'
  | 'failed'
  | 'blocked'
  | 'complete';

export type EvidenceKind = 'state' | 'log' | 'metric' | 'record' | 'request' | 'query';

export type ScalarValue = string | number | boolean | null;

export interface ActorDefinition {
  id: string;
  label: string;
  kind: string;
  truthPlane: TruthPlane;
  description: string;
  initialStatus: ActorStatus;
  initialDetail: string;
  initialMetrics?: Record<string, ScalarValue>;
}

export interface ActorPatch {
  status?: ActorStatus;
  detail?: string;
  metrics?: Record<string, ScalarValue>;
}

export interface EvidenceDefinition {
  id: string;
  actorId: string;
  truthPlane: TruthPlane;
  kind: EvidenceKind;
  label: string;
  value: ScalarValue;
  detail: string;
  decisive?: boolean;
}

export interface TransitionDefinition {
  id: string;
  at: number;
  actorId: string;
  title: string;
  description: string;
  patch?: ActorPatch;
  evidence?: EvidenceDefinition[];
  checkpoint?: 'decision';
  next: string | null;
}

interface PredictionOption {
  id: string;
  label: string;
}

interface ExpectedOutcome {
  summary: string;
  actorStates: Partial<Record<string, ActorStatus>>;
  evidenceIds: string[];
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  summary: string;
  controls: Record<string, ScalarValue>;
  predictionPrompt: string;
  predictionOptions: PredictionOption[];
  correctPredictionId: string;
  entryTransitionId: string;
  transitions: TransitionDefinition[];
  expectedOutcome: ExpectedOutcome;
}

interface ControlOption {
  value: ScalarValue;
  label: string;
}

interface ControlDefinition {
  id: string;
  label: string;
  description: string;
  options: ControlOption[];
}

interface SourceReference {
  label: string;
  href: string;
  note: string;
}

type FidelityLevel = 'modeled' | 'source-verified' | 'oracle-verified';

type VerificationMethod = 'source-review' | 'upstream-test-vector' | 'executable-oracle';

interface UpstreamProvenance {
  id: string;
  project: string;
  repository: string;
  revision: string;
  sourcePaths: string[];
  license: string;
  verifiedOn: string;
  method: VerificationMethod;
  note: string;
}

interface LabFidelity {
  level: FidelityLevel;
  summary: string;
}

interface ConfigurationFileDefinition {
  id: string;
  label: string;
  path: string;
  language: 'yaml' | 'promql';
  starter: string;
}

export interface ConfigurationSlotDefinition {
  id: string;
  fileId: string;
  marker: string;
  expectedLine: string;
  label: string;
  hint: string;
  evidence: string;
}

export interface ConfigurationChallenge {
  id: string;
  title: string;
  summary: string;
  objective: string;
  requirements: string[];
  files: ConfigurationFileDefinition[];
  slots: ConfigurationSlotDefinition[];
}

export interface ConfigurationCheckResult {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
  evidence: string;
  actualLine: string | null;
}

export interface SystemsLabDefinition {
  id: string;
  version: number;
  eyebrow: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  conceptIds: string[];
  learningObjectives: string[];
  actors: ActorDefinition[];
  controls: ControlDefinition[];
  scenarios: ScenarioDefinition[];
  defaultScenarioId: string;
  configurationChallenge: ConfigurationChallenge;
  fidelity: LabFidelity;
  provenance: UpstreamProvenance[];
  sources: SourceReference[];
}

export interface ActorState {
  id: string;
  label: string;
  kind: string;
  truthPlane: TruthPlane;
  status: ActorStatus;
  detail: string;
  metrics: Record<string, ScalarValue>;
  lastChangedAt: number;
}

export interface EvidenceRecord extends EvidenceDefinition {
  transitionId: string;
  tick: number;
  sequence: number;
}

interface EventRecord {
  transitionId: string;
  actorId: string;
  title: string;
  description: string;
  tick: number;
  sequence: number;
}

type SimulationPhase = 'ready' | 'running' | 'paused' | 'complete';

export interface SimulationSnapshot {
  labId: string;
  definitionVersion: number;
  scenarioId: string;
  phase: SimulationPhase;
  tick: number;
  sequence: number;
  nextTransitionId: string | null;
  actorStates: Record<string, ActorState>;
  eventLog: EventRecord[];
  evidence: EvidenceRecord[];
}

export type SimulationAction =
  | { type: 'start' }
  | { type: 'step' }
  | { type: 'advance' }
  | { type: 'finish' }
  | { type: 'reset' };

export interface SimulationReplayV1 {
  schemaVersion: 1;
  labId: string;
  definitionVersion: number;
  scenarioId: string;
  actions: SimulationAction[];
  finalSnapshotFingerprint: string;
}

interface SourceContractAssertion {
  path: string;
  expected: ScalarValue;
  note: string;
}

export interface SourceContractFixture {
  id: string;
  labId: string;
  scenarioId: string;
  provenanceId: string;
  assertions: SourceContractAssertion[];
}

export interface SourceContractMismatch {
  fixtureId: string;
  path: string;
  expected: ScalarValue;
  actual: ScalarValue | undefined;
}

export interface DefinitionIssue {
  path: string;
  message: string;
}

export interface PredictionResult {
  predictionId: string;
  correctPredictionId: string;
  isCorrect: boolean;
  outcome: ExpectedOutcome;
  decisiveEvidence: EvidenceRecord[];
}
