import type {
  FailureInjection,
  FollowUpBranch,
  SystemDesignCase,
  SystemDesignStageId,
} from '../data/system-design-case-schema';

export const SYSTEM_DESIGN_SESSION_SCHEMA_VERSION = 1;
const SYSTEM_DESIGN_ATTEMPT_KEY_PREFIX = 'swe-prep:system-design-attempt:';

interface StageSubmission {
  answer: string;
  submittedAt: string;
}

interface StoredDimensionResult {
  dimensionId: string;
  score: number;
  evidence: string[];
  missing: string[];
}

export interface StoredCaseReview {
  overallScore: number;
  readinessBand: string;
  dimensions: StoredDimensionResult[];
}

export interface SystemDesignAttempt {
  id: string;
  caseId: string;
  caseVersion: string;
  status: 'active' | 'review';
  currentStageId: SystemDesignStageId;
  answers: Partial<Record<SystemDesignStageId, StageSubmission>>;
  selectedFollowUpId?: string;
  selectedFailureId?: string;
  startedAt: string;
  updatedAt: string;
  elapsedSeconds: number;
  review?: StoredCaseReview;
  reviewReason?: 'submitted' | 'abandoned';
}

interface SystemDesignAttemptEnvelope {
  schemaVersion: typeof SYSTEM_DESIGN_SESSION_SCHEMA_VERSION;
  attempt: SystemDesignAttempt;
}

export type SystemDesignSessionEvent =
  | { type: 'submit-stage'; stageId: SystemDesignStageId; answer: string; now?: string }
  | { type: 'tick'; seconds: number; now?: string }
  | { type: 'abandon-to-review'; now?: string }
  | { type: 'attach-review'; review: StoredCaseReview; now?: string };

export type LoadedSystemDesignAttempt =
  | { status: 'missing' }
  | { status: 'ok'; attempt: SystemDesignAttempt }
  | { status: 'unsupported'; reason: string; raw: string }
  | { status: 'invalid'; reason: string; raw: string };

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function timestamp(now?: string) {
  return now ?? new Date().toISOString();
}

function attemptId(caseDefinition: SystemDesignCase, now: string) {
  return `${caseDefinition.id}:${now}`;
}

export function createSystemDesignAttempt(
  caseDefinition: SystemDesignCase,
  now?: string
): SystemDesignAttempt {
  const createdAt = timestamp(now);
  return {
    id: attemptId(caseDefinition, createdAt),
    caseId: caseDefinition.id,
    caseVersion: caseDefinition.version,
    status: 'active',
    currentStageId: 'scoping',
    answers: {},
    startedAt: createdAt,
    updatedAt: createdAt,
    elapsedSeconds: 0,
  };
}

function normalizedText(attempt: SystemDesignAttempt) {
  return Object.values(attempt.answers)
    .map((submission) => submission?.answer ?? '')
    .join(' ')
    .toLocaleLowerCase();
}

function chooseFollowUp(
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt
): FollowUpBranch | undefined {
  const answer = normalizedText(attempt);
  return (
    caseDefinition.followUps.find((branch) =>
      branch.matchAny.some((signal) => answer.includes(signal.toLocaleLowerCase()))
    ) ?? caseDefinition.followUps[0]
  );
}

function chooseFailureInjection(caseDefinition: SystemDesignCase): FailureInjection | undefined {
  return caseDefinition.failureInjections[0];
}

export function canRevealSystemDesignAnswers(attempt: SystemDesignAttempt) {
  return attempt.status === 'review';
}

export function visibleInterviewerPrompt(
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt
): string {
  const stage = caseDefinition.stages.find((candidate) => candidate.id === attempt.currentStageId);
  if (!stage) return '';
  if (stage.id === 'deep-dive' && attempt.selectedFollowUpId) {
    return (
      caseDefinition.followUps.find((branch) => branch.id === attempt.selectedFollowUpId)?.prompt ??
      stage.prompt
    );
  }
  if (stage.id === 'failure' && attempt.selectedFailureId) {
    return (
      caseDefinition.failureInjections.find((failure) => failure.id === attempt.selectedFailureId)
        ?.prompt ?? stage.prompt
    );
  }
  return stage.prompt;
}

export function transitionSystemDesignAttempt(
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt,
  event: SystemDesignSessionEvent
): SystemDesignAttempt {
  const now = timestamp(event.now);
  if (event.type === 'tick') {
    if (attempt.status !== 'active' || !Number.isFinite(event.seconds) || event.seconds <= 0) {
      return attempt;
    }
    return {
      ...attempt,
      elapsedSeconds: attempt.elapsedSeconds + Math.floor(event.seconds),
      updatedAt: now,
    };
  }

  if (event.type === 'attach-review') {
    if (attempt.status !== 'review') return attempt;
    return { ...attempt, review: event.review, updatedAt: now };
  }

  if (event.type === 'abandon-to-review') {
    if (attempt.status !== 'active') return attempt;
    return {
      ...attempt,
      status: 'review',
      currentStageId: 'review',
      reviewReason: 'abandoned',
      updatedAt: now,
    };
  }

  if (
    attempt.status !== 'active' ||
    event.stageId !== attempt.currentStageId ||
    event.stageId === 'review' ||
    !event.answer.trim()
  ) {
    return attempt;
  }

  const currentIndex = caseDefinition.stages.findIndex((stage) => stage.id === event.stageId);
  const nextStage = caseDefinition.stages[currentIndex + 1];
  if (!nextStage) return attempt;

  let next: SystemDesignAttempt = {
    ...attempt,
    answers: {
      ...attempt.answers,
      [event.stageId]: { answer: event.answer.trim(), submittedAt: now },
    },
    currentStageId: nextStage.id,
    updatedAt: now,
  };

  if (nextStage.id === 'deep-dive') {
    next = { ...next, selectedFollowUpId: chooseFollowUp(caseDefinition, next)?.id };
  }
  if (nextStage.id === 'failure') {
    next = { ...next, selectedFailureId: chooseFailureInjection(caseDefinition)?.id };
  }
  if (nextStage.id === 'review') {
    next = { ...next, status: 'review', reviewReason: 'submitted' };
  }
  return next;
}

export function systemDesignAttemptStorageKey(caseId: string) {
  return `${SYSTEM_DESIGN_ATTEMPT_KEY_PREFIX}${caseId}`;
}

export function saveSystemDesignAttempt(storage: StorageLike, attempt: SystemDesignAttempt) {
  const envelope: SystemDesignAttemptEnvelope = {
    schemaVersion: SYSTEM_DESIGN_SESSION_SCHEMA_VERSION,
    attempt,
  };
  try {
    storage.setItem(systemDesignAttemptStorageKey(attempt.caseId), JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

function isAttemptShape(value: unknown): value is SystemDesignAttempt {
  if (!value || typeof value !== 'object') return false;
  const attempt = value as Partial<SystemDesignAttempt>;
  return (
    typeof attempt.id === 'string' &&
    typeof attempt.caseId === 'string' &&
    typeof attempt.caseVersion === 'string' &&
    (attempt.status === 'active' || attempt.status === 'review') &&
    typeof attempt.currentStageId === 'string' &&
    typeof attempt.answers === 'object' &&
    typeof attempt.startedAt === 'string' &&
    typeof attempt.updatedAt === 'string' &&
    typeof attempt.elapsedSeconds === 'number'
  );
}

export function parseSystemDesignAttempt(
  raw: string,
  caseDefinition: SystemDesignCase
): LoadedSystemDesignAttempt {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'invalid', reason: 'Saved attempt is not valid JSON.', raw };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { status: 'invalid', reason: 'Saved attempt is not an object.', raw };
  }
  const envelope = parsed as Partial<SystemDesignAttemptEnvelope> & { schemaVersion?: number };
  if (envelope.schemaVersion !== SYSTEM_DESIGN_SESSION_SCHEMA_VERSION) {
    return {
      status: 'unsupported',
      reason: `Saved attempt uses unsupported schema ${String(envelope.schemaVersion)}.`,
      raw,
    };
  }
  const attempt = envelope.attempt;
  if (!isAttemptShape(attempt)) {
    return { status: 'invalid', reason: 'Saved attempt is incomplete.', raw };
  }
  if (attempt.caseId !== caseDefinition.id || attempt.caseVersion !== caseDefinition.version) {
    return {
      status: 'unsupported',
      reason: `Saved attempt targets ${attempt.caseId}@${attempt.caseVersion}.`,
      raw,
    };
  }
  if (!caseDefinition.stages.some((stage) => stage.id === attempt.currentStageId)) {
    return { status: 'invalid', reason: 'Saved attempt has an unknown stage.', raw };
  }
  return { status: 'ok', attempt };
}

export function loadSystemDesignAttempt(
  storage: StorageLike,
  caseDefinition: SystemDesignCase
): LoadedSystemDesignAttempt {
  let raw: string | null;
  try {
    raw = storage.getItem(systemDesignAttemptStorageKey(caseDefinition.id));
  } catch {
    return { status: 'invalid', reason: 'Attempt storage is unavailable.', raw: '' };
  }
  if (!raw) return { status: 'missing' };
  return parseSystemDesignAttempt(raw, caseDefinition);
}
