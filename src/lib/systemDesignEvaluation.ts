import type { RubricDimension, SystemDesignCase } from '../data/system-design-case-schema';
import type { MasteryRating } from './fsrs';
import type { SystemDesignAttempt } from './systemDesignSession';

type SystemDesignReadinessBand =
  | 'interview-ready'
  | 'strong-with-gaps'
  | 'developing'
  | 'rebuild-foundations';

interface SystemDesignDimensionReview {
  dimensionId: string;
  label: string;
  score: 0 | 1 | 2 | 3;
  weight: number;
  evidence: string[];
  missing: string[];
  anchor: string;
}

interface SystemDesignRemediation {
  concepts: { conceptId: string; rating: MasteryRating; dimensionId: string }[];
  drillIds: string[];
}

export interface SystemDesignReview {
  overallScore: number;
  readinessBand: SystemDesignReadinessBand;
  dimensions: SystemDesignDimensionReview[];
  verdict: string;
  strongerAnswer: string;
  followUps: string[];
  remediation: SystemDesignRemediation;
  generator: 'deterministic' | 'ai';
  warning?: string;
}

export interface SystemDesignAiReview {
  dimensions: {
    dimensionId: string;
    score: 0 | 1 | 2 | 3;
    evidence: string[];
  }[];
  verdict: string;
}

function answersForDimension(attempt: SystemDesignAttempt, dimension: RubricDimension) {
  return dimension.stageIds
    .map((stageId) => attempt.answers[stageId]?.answer ?? '')
    .filter(Boolean)
    .join('\n');
}

function containsSignal(answer: string, signal: string) {
  return answer.toLocaleLowerCase().includes(signal.toLocaleLowerCase());
}

function evidenceExcerpt(answer: string, signal: string) {
  const parts = answer
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const match = parts.find((part) => containsSignal(part, signal));
  if (!match) return '';
  return match.length > 180 ? `${match.slice(0, 177)}…` : match;
}

function scoreDimension(answer: string, dimension: RubricDimension): 0 | 1 | 2 | 3 {
  const hits = dimension.evidenceSignals.filter((signal) => containsSignal(answer, signal)).length;
  if (hits === 0) return 0;
  const ratio = hits / dimension.evidenceSignals.length;
  let score: 0 | 1 | 2 | 3 = ratio < 0.34 ? 1 : ratio < 0.7 ? 2 : 3;
  if (dimension.misconceptionSignals.some((signal) => containsSignal(answer, signal))) score = 1;
  return score;
}

function readinessBand(overallScore: number): SystemDesignReadinessBand {
  if (overallScore >= 85) return 'interview-ready';
  if (overallScore >= 70) return 'strong-with-gaps';
  if (overallScore >= 50) return 'developing';
  return 'rebuild-foundations';
}

function overallScore(dimensions: SystemDesignDimensionReview[]) {
  return Math.round(
    dimensions.reduce((total, dimension) => total + (dimension.score / 3) * dimension.weight, 0) *
      100
  );
}

function remediationFromDimensions(
  caseDefinition: SystemDesignCase,
  dimensions: SystemDesignDimensionReview[]
): SystemDesignRemediation {
  const conceptRatings = new Map<
    string,
    { conceptId: string; rating: MasteryRating; dimensionId: string }
  >();
  const drillIds = new Set<string>();
  for (const result of dimensions) {
    if (result.score >= 2) continue;
    const dimension = caseDefinition.rubricDimensions.find(
      (candidate) => candidate.id === result.dimensionId
    );
    if (!dimension) continue;
    const rating: MasteryRating = result.score === 0 ? 'again' : 'hard';
    for (const conceptId of dimension.conceptIds) {
      const existing = conceptRatings.get(conceptId);
      if (!existing || (existing.rating === 'hard' && rating === 'again')) {
        conceptRatings.set(conceptId, { conceptId, rating, dimensionId: dimension.id });
      }
    }
    for (const drillId of dimension.drillIds) drillIds.add(drillId);
  }
  return { concepts: [...conceptRatings.values()], drillIds: [...drillIds] };
}

function buildReview(
  caseDefinition: SystemDesignCase,
  dimensions: SystemDesignDimensionReview[],
  generator: 'deterministic' | 'ai',
  verdict?: string
): SystemDesignReview {
  const score = overallScore(dimensions);
  const band = readinessBand(score);
  return {
    overallScore: score,
    readinessBand: band,
    dimensions,
    verdict:
      verdict ??
      ({
        'interview-ready': 'The answer is coherent, measurable, and resilient under follow-up.',
        'strong-with-gaps':
          'The core design works, with a small number of important gaps to close.',
        developing:
          'The answer has useful pieces but needs a tighter chain from assumptions to trade-offs.',
        'rebuild-foundations':
          'Rebuild the requirements and capacity model before adding more architecture.',
      }[band] as string),
    strongerAnswer: caseDefinition.strongerAnswer,
    followUps: caseDefinition.followUps.map((followUp) => followUp.prompt),
    remediation: remediationFromDimensions(caseDefinition, dimensions),
    generator,
  };
}

export function evaluateSystemDesignAttempt(
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt
): SystemDesignReview {
  const dimensions = caseDefinition.rubricDimensions.map((dimension) => {
    const answer = answersForDimension(attempt, dimension);
    const score = scoreDimension(answer, dimension);
    const matched = dimension.evidenceSignals.filter((signal) => containsSignal(answer, signal));
    const evidence = [
      ...new Set(matched.map((signal) => evidenceExcerpt(answer, signal)).filter(Boolean)),
    ];
    return {
      dimensionId: dimension.id,
      label: dimension.label,
      score,
      weight: dimension.weight,
      evidence,
      missing: dimension.evidenceSignals.filter((signal) => !containsSignal(answer, signal)),
      anchor:
        dimension.anchors.find((candidate) => candidate.score === score)?.description ??
        'No scoring anchor.',
    } satisfies SystemDesignDimensionReview;
  });
  return buildReview(caseDefinition, dimensions, 'deterministic');
}

function allSubmittedText(attempt: SystemDesignAttempt) {
  return Object.values(attempt.answers)
    .map((submission) => submission?.answer ?? '')
    .join('\n')
    .toLocaleLowerCase();
}

export function validateSystemDesignAiReview(
  value: unknown,
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt
): SystemDesignAiReview | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<SystemDesignAiReview>;
  if (!Array.isArray(candidate.dimensions) || typeof candidate.verdict !== 'string') return null;
  const expectedIds = new Set(caseDefinition.rubricDimensions.map((dimension) => dimension.id));
  if (candidate.dimensions.length !== expectedIds.size) return null;
  const seen = new Set<string>();
  const answer = allSubmittedText(attempt);
  for (const dimension of candidate.dimensions) {
    if (
      !dimension ||
      typeof dimension.dimensionId !== 'string' ||
      !expectedIds.has(dimension.dimensionId) ||
      seen.has(dimension.dimensionId) ||
      !Number.isInteger(dimension.score) ||
      dimension.score < 0 ||
      dimension.score > 3 ||
      !Array.isArray(dimension.evidence) ||
      !dimension.evidence.every(
        (quote) =>
          typeof quote === 'string' &&
          quote.length > 0 &&
          answer.includes(quote.toLocaleLowerCase())
      )
    ) {
      return null;
    }
    seen.add(dimension.dimensionId);
  }
  return candidate as SystemDesignAiReview;
}

function mergeSystemDesignAiReview(
  caseDefinition: SystemDesignCase,
  local: SystemDesignReview,
  ai: SystemDesignAiReview
): SystemDesignReview {
  const dimensions = local.dimensions.map((localDimension) => {
    const aiDimension = ai.dimensions.find(
      (candidate) => candidate.dimensionId === localDimension.dimensionId
    );
    if (!aiDimension) return localDimension;
    const rubric = caseDefinition.rubricDimensions.find(
      (candidate) => candidate.id === localDimension.dimensionId
    );
    return {
      ...localDimension,
      score: aiDimension.score,
      evidence: aiDimension.evidence,
      anchor:
        rubric?.anchors.find((candidate) => candidate.score === aiDimension.score)?.description ??
        localDimension.anchor,
    };
  });
  return buildReview(caseDefinition, dimensions, 'ai', ai.verdict);
}

export async function evaluateSystemDesignWithOptionalAi(
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt,
  requestAi?: () => Promise<unknown>
): Promise<SystemDesignReview> {
  const local = evaluateSystemDesignAttempt(caseDefinition, attempt);
  if (!requestAi) return local;
  try {
    const raw = await requestAi();
    const ai = validateSystemDesignAiReview(raw, caseDefinition, attempt);
    if (!ai) {
      return {
        ...local,
        warning: 'AI critique was invalid; deterministic evidence was preserved.',
      };
    }
    return mergeSystemDesignAiReview(caseDefinition, local, ai);
  } catch {
    return {
      ...local,
      warning: 'AI critique was unavailable; deterministic evidence was preserved.',
    };
  }
}
