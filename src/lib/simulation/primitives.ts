import type {
  ActorPatch,
  EvidenceDefinition,
  EvidenceKind,
  ScalarValue,
  TransitionDefinition,
  TruthPlane,
} from './types';

export type TransitionDraft = Omit<TransitionDefinition, 'next'>;

interface EvidenceInput {
  id: string;
  actorId: string;
  truthPlane: TruthPlane;
  kind: EvidenceKind;
  label: string;
  value: ScalarValue;
  detail: string;
  decisive?: boolean;
}

export function emitEvidence(input: EvidenceInput): EvidenceDefinition {
  return { ...input };
}

export function sequenceTransitions(drafts: TransitionDraft[]): TransitionDefinition[] {
  return drafts.map((draft, index) => ({
    ...draft,
    next: drafts[index + 1]?.id ?? null,
  }));
}

interface ReconciliationInput {
  id: string;
  at: number;
  actorId: string;
  queuedDetail: string;
  runningDetail: string;
  evidence?: EvidenceDefinition[];
}

export function queuedReconciliation(input: ReconciliationInput): TransitionDraft[] {
  return [
    {
      id: `${input.id}-queued`,
      at: input.at,
      actorId: input.actorId,
      title: 'Reconcile queued',
      description: input.queuedDetail,
      patch: { status: 'queued', detail: input.queuedDetail },
    },
    {
      id: `${input.id}-running`,
      at: input.at + 1,
      actorId: input.actorId,
      title: 'Reconcile started',
      description: input.runningDetail,
      patch: { status: 'running', detail: input.runningDetail },
      evidence: input.evidence,
    },
  ];
}

interface RetryInput {
  id: string;
  at: number;
  actorId: string;
  attempts: number;
  backoffTicks: number;
  attemptDetail: (attempt: number) => string;
  finalPatch: ActorPatch;
  evidenceForAttempt?: (attempt: number) => EvidenceDefinition[];
}

export function retryWithBackoff(input: RetryInput): TransitionDraft[] {
  const drafts: TransitionDraft[] = [];

  for (let attempt = 1; attempt <= input.attempts; attempt += 1) {
    drafts.push({
      id: `${input.id}-attempt-${attempt}`,
      at: input.at + (attempt - 1) * input.backoffTicks,
      actorId: input.actorId,
      title: `Attempt ${attempt}`,
      description: input.attemptDetail(attempt),
      patch:
        attempt === input.attempts
          ? input.finalPatch
          : {
              status: 'waiting',
              detail: `${input.attemptDetail(attempt)} Backing off before retry.`,
              metrics: { attempts: attempt },
            },
      evidence: input.evidenceForAttempt?.(attempt),
    });
  }

  return drafts;
}

interface HealthProjectionInput {
  id: string;
  at: number;
  actorId: string;
  status: ActorPatch['status'];
  detail: string;
  label: string;
  value: ScalarValue;
  truthPlane?: TruthPlane;
  decisive?: boolean;
}

export function projectHealth(input: HealthProjectionInput): TransitionDraft {
  return {
    id: input.id,
    at: input.at,
    actorId: input.actorId,
    title: input.label,
    description: input.detail,
    patch: { status: input.status, detail: input.detail },
    evidence: [
      emitEvidence({
        id: `${input.id}-evidence`,
        actorId: input.actorId,
        truthPlane: input.truthPlane ?? 'controller',
        kind: 'state',
        label: input.label,
        value: input.value,
        detail: input.detail,
        decisive: input.decisive,
      }),
    ],
  };
}

export function branchByControls<T extends { controls: Record<string, ScalarValue> }>(
  candidates: T[],
  controls: Record<string, ScalarValue>
): T | undefined {
  return candidates.find((candidate) => {
    const keys = new Set([...Object.keys(candidate.controls), ...Object.keys(controls)]);
    return [...keys].every((key) => candidate.controls[key] === controls[key]);
  });
}
