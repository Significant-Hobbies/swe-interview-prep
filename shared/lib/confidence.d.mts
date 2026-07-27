export interface ConfidenceRow {
  stability?: number | null;
  last_review?: string | Date | null;
}

export function masteryConfidence(row: ConfidenceRow | null | undefined, now?: Date): number;
