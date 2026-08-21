import type { PaperLearningContract } from '../data/paper-contracts';

const DAY_MS = 86_400_000;

export interface PaperRotationSelection {
  paper: PaperLearningContract;
  index: number;
  poolSize: number;
  reason: string;
}

function utcDayNumber(now: Date): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / DAY_MS);
}

export function selectRotatingPaper(
  papers: PaperLearningContract[],
  options: { now?: Date; conceptId?: string } = {}
): PaperRotationSelection | null {
  const eligible = papers
    .filter(
      (paper) =>
        paper.availability === 'available' &&
        (!options.conceptId || paper.conceptIds.includes(options.conceptId))
    )
    .sort((left, right) => left.id.localeCompare(right.id));

  if (eligible.length === 0) return null;

  const index = utcDayNumber(options.now ?? new Date()) % eligible.length;
  const paper = eligible[index];
  return {
    paper,
    index,
    poolSize: eligible.length,
    reason: options.conceptId
      ? `Today's source is the rotating paper for this concept (${index + 1} of ${eligible.length}).`
      : `Today's source is ${index + 1} of ${eligible.length} in the available paper rotation.`,
  };
}
