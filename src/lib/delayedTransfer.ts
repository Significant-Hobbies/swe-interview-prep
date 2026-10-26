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
  outcome: DelayedTransferOutcome | 'pending';
  score: number | null;
  critiqueSource: DelayedTransferCritiqueSource;
  createdAt: string;
}

export function continueAfterOptionalMeasurement<T>(
  measure: (() => Promise<unknown>) | null,
  continueAction: () => T | Promise<T>
): T | Promise<T> {
  if (measure) {
    try {
      void Promise.resolve(measure()).catch(() => {});
    } catch {
      // Optional measurement cannot veto the existing review flow.
    }
  }
  return continueAction();
}

export function classifyDelayedTransfer(
  critique: Critique | null,
  source: DelayedTransferCritiqueSource
): { outcome: DelayedTransferOutcome; score: number | null; critiqueSource: DelayedTransferCritiqueSource } {
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

export function latestUnresolvedDelayedTransfer(
  events: DelayedTransferEvent[],
  interventions: DelayedTransferIntervention[] = []
): DelayedTransferDecision | null {
  const latestInterventionByConcept = new Map<string, DelayedTransferIntervention>();
  for (const intervention of interventions) {
    for (const conceptId of intervention.conceptIds) {
      const current = latestInterventionByConcept.get(conceptId);
      if (!current || intervention.createdAt > current.createdAt) {
        latestInterventionByConcept.set(conceptId, intervention);
      }
    }
  }

  const latestByConcept = new Map<string, DelayedTransferEvent>();
  for (const event of events) {
    const current = latestByConcept.get(event.conceptId);
    if (
      !current ||
      event.interventionAt > current.interventionAt ||
      (event.interventionAt === current.interventionAt && event.createdAt > current.createdAt)
    ) {
      latestByConcept.set(event.conceptId, event);
    }
  }

  const decisions: DelayedTransferDecision[] = [];
  for (const [conceptId, intervention] of latestInterventionByConcept) {
    const event = latestByConcept.get(conceptId);
    if (event && event.interventionId === intervention.interventionId) {
      if (event.outcome !== 'demonstrated') decisions.push(event);
      continue;
    }
    decisions.push({
      conceptId,
      reviewQuestionId: null,
      interventionId: intervention.interventionId,
      interventionAt: intervention.createdAt,
      outcome: 'pending',
      score: null,
      critiqueSource: 'unknown',
      createdAt: intervention.createdAt,
    });
  }
  return decisions.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function parseDelayedTransferEvents(value: unknown): DelayedTransferEvent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): DelayedTransferEvent[] => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const payload = row.payload as Record<string, unknown> | null;
    const concepts = row.conceptIds;
    if (
      row.kind !== 'delayed_transfer' ||
      typeof row.id !== 'string' ||
      typeof row.problemId !== 'string' ||
      !Array.isArray(concepts) ||
      typeof payload?.conceptId !== 'string' ||
      !concepts.includes(payload.conceptId) ||
      typeof payload.interventionId !== 'string' ||
      typeof payload.interventionAt !== 'string' ||
      typeof payload.reviewDueAt !== 'string' ||
      typeof payload.elapsedMs !== 'number' ||
      !['demonstrated', 'partial', 'not-demonstrated', 'unknown'].includes(String(payload.outcome)) ||
      !['heuristic', 'ai', 'unknown'].includes(String(payload.critiqueSource)) ||
      (payload.score !== null && typeof payload.score !== 'number') ||
      typeof row.createdAt !== 'string'
    ) {
      return [];
    }
    return [{
      id: row.id,
      conceptId: payload.conceptId,
      reviewQuestionId: row.problemId,
      interventionId: payload.interventionId,
      interventionAt: payload.interventionAt,
      reviewDueAt: payload.reviewDueAt,
      elapsedMs: payload.elapsedMs,
      outcome: payload.outcome as DelayedTransferOutcome,
      score: payload.score as number | null,
      critiqueSource: payload.critiqueSource as DelayedTransferCritiqueSource,
      createdAt: row.createdAt,
    }];
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
    return [{
      id: typeof row.id === 'string' ? row.id : payload.interventionId,
      conceptIds: row.conceptIds as string[],
      interventionId: payload.interventionId,
      createdAt: row.createdAt,
    }];
  });
}
