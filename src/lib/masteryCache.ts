import type { MasteryRow } from './fsrs';

// Reuse verified account reads between routes, never an unscoped local record.
let cached: { userId: string; rows: Record<string, MasteryRow> } | undefined;
let generation = 0;

export function clearMasteryCache(): void {
  cached = undefined;
  generation++;
}

export function masteryCacheGeneration(): number {
  return generation;
}

export function readMasteryCache(userId: string): Record<string, MasteryRow> | undefined {
  return cached?.userId === userId ? cached.rows : undefined;
}

export function writeMasteryCache(
  userId: string,
  rows: Record<string, MasteryRow>,
  startedGeneration: number
): void {
  // A response that outlives sign-out must not repopulate the previous session.
  if (startedGeneration === generation) cached = { userId, rows };
}
