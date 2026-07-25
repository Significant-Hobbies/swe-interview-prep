export interface ConfidenceRow {
  stability?: number | null;
  last_review?: string | Date | null;
}

export const TARGET_STABILITY_DAYS: number;
export function retrievability(row: ConfidenceRow | null | undefined, now?: Date): number;
export function durability(row: ConfidenceRow | null | undefined): number;
export function masteryConfidence(row: ConfidenceRow | null | undefined, now?: Date): number;
