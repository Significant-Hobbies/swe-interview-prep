import type { Critique } from './aiClient';

export type DelayedTransferOutcome = 'demonstrated' | 'partial' | 'not-demonstrated' | 'unknown';
export type DelayedTransferCritiqueSource = 'heuristic' | 'ai' | 'unknown';

export interface DelayedTransferEvent {
  id: string;
  conceptId: string;
  reviewQuestionId: string;
  interventionId: string;
  interventionAt: string;
  reviewDueAt: string;
  elapsedMs: number;
  outcome: DelayedTransferOutcome;
  score: number | null;
  critiqueSource: DelayedTransferCritiqueSource;
  createdAt: string;
}

export interface DelayedTransferIntervention {
  id: string;
  conceptIds: string[];
  interventionId: string;
  createdAt: string;
}

export interface DelayedTransferDecision {
  conceptId: string;
  reviewQuestionId: string | null;
  interventionId: string;
  interventionAt: string;
  elapsedMs: number;
  outcome: DelayedTransferOutcome | 'pending';
  score: number | null;
  critiqueSource: DelayedTransferCritiqueSource;
  createdAt: string;
}

export function classifyDelayedTransfer(
  critique: Critique | null,
  source: DelayedTransferCritiqueSource
): {
  outcome: DelayedTransferOutcome;
  score: number | null;
  critiqueSource: DelayedTransferCritiqueSource;
} {
  if (!critique || source === 'unknown' || !Number.isFinite(critique.score)) {
    return { outcome: 'unknown', score: null, critiqueSource: 'unknown' };
  }

  const score = Math.max(0, Math.min(100, Math.round(critique.score)));
  return {
    outcome: score >= 80 ? 'demonstrated' : score >= 55 ? 'partial' : 'not-demonstrated',
    score,
    critiqueSource: source,
  };
}

function newestInterventionByConcept(
  interventions: DelayedTransferIntervention[]
): Map<string, DelayedTransferIntervention> {
  const latest = new Map<string, DelayedTransferIntervention>();
  for (const intervention of interventions) {
    for (const conceptId of intervention.conceptIds) {
      const current = latest.get(conceptId);
      if (!current || intervention.createdAt > current.createdAt)
        latest.set(conceptId, intervention);
    }
  }
  return latest;
}

function newestEventByConcept(events: DelayedTransferEvent[]): Map<string, DelayedTransferEvent> {
  const latest = new Map<string, DelayedTransferEvent>();
  for (const event of events) {
    const current = latest.get(event.conceptId);
    if (
      !current ||
      event.interventionAt > current.interventionAt ||
      (event.interventionAt === current.interventionAt && event.createdAt > current.createdAt)
    ) {
      latest.set(event.conceptId, event);
    }
  }
  return latest;
}

function decisionForIntervention(
  conceptId: string,
  intervention: DelayedTransferIntervention,
  event: DelayedTransferEvent | undefined
): DelayedTransferDecision | null {
  if (event?.interventionId === intervention.interventionId) {
    return event.outcome === 'demonstrated' ? null : event;
  }
  return {
    conceptId,
    reviewQuestionId: null,
    interventionId: intervention.interventionId,
    interventionAt: intervention.createdAt,
    elapsedMs: 0,
    outcome: 'pending',
    score: null,
    critiqueSource: 'unknown',
    createdAt: intervention.createdAt,
  };
}

export function unresolvedDelayedTransfers(
  events: DelayedTransferEvent[],
  interventions: DelayedTransferIntervention[] = []
): DelayedTransferDecision[] {
  const latestInterventions = newestInterventionByConcept(interventions);
  const latestEvents = newestEventByConcept(events);
  return [...latestInterventions].flatMap(([conceptId, intervention]) => {
    const decision = decisionForIntervention(conceptId, intervention, latestEvents.get(conceptId));
    return decision ? [decision] : [];
  });
}

export function dueDelayedTransferDecision(
  decisions: DelayedTransferDecision[],
  reviewQueue: { id: string; conceptId: string }[]
): DelayedTransferDecision | null {
  const dueConcepts = new Set(reviewQueue.map((question) => question.conceptId));
  const severity: Record<DelayedTransferDecision['outcome'], number> = {
    'not-demonstrated': 0,
    partial: 1,
    unknown: 2,
    demonstrated: 3,
    pending: 4,
  };
  return (
    decisions
      .filter((decision) => decision.outcome !== 'pending' && dueConcepts.has(decision.conceptId))
      .sort(
        (a, b) =>
          severity[a.outcome] - severity[b.outcome] || b.createdAt.localeCompare(a.createdAt)
      )[0] ?? null
  );
}

function isEventPayload(payload: unknown, concepts: unknown): payload is Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return false;
  const fields = payload as Record<string, unknown>;
  return (
    typeof fields.conceptId === 'string' &&
    Array.isArray(concepts) &&
    concepts.includes(fields.conceptId) &&
    typeof fields.interventionId === 'string' &&
    typeof fields.interventionAt === 'string' &&
    typeof fields.reviewDueAt === 'string' &&
    typeof fields.elapsedMs === 'number' &&
    ['demonstrated', 'partial', 'not-demonstrated', 'unknown'].includes(String(fields.outcome)) &&
    ['heuristic', 'ai', 'unknown'].includes(String(fields.critiqueSource)) &&
    (fields.score === null || typeof fields.score === 'number')
  );
}

function parseDelayedTransferEvent(item: unknown): DelayedTransferEvent | null {
  if (!item || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;
  const payload = row.payload;
  if (
    row.kind !== 'delayed_transfer' ||
    typeof row.id !== 'string' ||
    typeof row.problemId !== 'string' ||
    typeof row.createdAt !== 'string' ||
    !isEventPayload(payload, row.conceptIds)
  ) {
    return null;
  }
  return {
    id: row.id,
    conceptId: payload.conceptId as string,
    reviewQuestionId: row.problemId,
    interventionId: payload.interventionId as string,
    interventionAt: payload.interventionAt as string,
    reviewDueAt: payload.reviewDueAt as string,
    elapsedMs: payload.elapsedMs as number,
    outcome: payload.outcome as DelayedTransferOutcome,
    score: payload.score as number | null,
    critiqueSource: payload.critiqueSource as DelayedTransferCritiqueSource,
    createdAt: row.createdAt,
  };
}

export function parseDelayedTransferEvents(value: unknown): DelayedTransferEvent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const event = parseDelayedTransferEvent(item);
    return event ? [event] : [];
  });
}

export function parseDelayedTransferInterventions(value: unknown): DelayedTransferIntervention[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): DelayedTransferIntervention[] => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const payload = row.payload as Record<string, unknown> | null;
    if (
      row.kind !== 'feynman' ||
      typeof payload?.interventionId !== 'string' ||
      !Array.isArray(row.conceptIds) ||
      !row.conceptIds.every((conceptId) => typeof conceptId === 'string') ||
      typeof row.createdAt !== 'string'
    ) {
      return [];
    }
    return [
      {
        id: typeof row.id === 'string' ? row.id : payload.interventionId,
        conceptIds: row.conceptIds as string[],
        interventionId: payload.interventionId,
        createdAt: row.createdAt,
      },
    ];
  });
}
