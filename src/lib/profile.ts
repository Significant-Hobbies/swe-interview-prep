// Learner profile — drives session sizing, roadmap blend, and modality mix.

export type ExperienceLevel = 'student' | 'mid' | 'senior';
export type ModalityKind = 'review' | 'drill' | 'build' | 'learn';

export interface ModalityWeights {
  review: number;
  drill: number;
  build: number;
  learn: number;
}

export interface LearnerProfile {
  experience: ExperienceLevel;
  /** Days until target interview; null = no deadline. */
  interviewHorizonDays: number | null;
  minutesPerDay: 15 | 30 | 45 | 90;
  /** Roadmap id → weight (need not sum to 1; normalized at use). */
  roadmapWeights: Record<string, number>;
  modalityWeights: ModalityWeights;
  skipConceptIds: string[];
  /** Daily email digest (reviews due + session ready). */
  digestEmail?: boolean;
  /** Browser push reminders (requires permission + subscription). */
  pushEnabled?: boolean;
  onboardingVersion: number;
  updatedAt?: string;
}

export const PROFILE_VERSION = 3;

export const DEFAULT_MODALITY_WEIGHTS: ModalityWeights = {
  review: 0.22,
  drill: 0.42,
  build: 0.24,
  learn: 0.12,
};

export const DEFAULT_PROFILE: LearnerProfile = {
  experience: 'mid',
  interviewHorizonDays: null,
  minutesPerDay: 45,
  roadmapWeights: { 'ai-search-infra-90-day': 1 },
  modalityWeights: { ...DEFAULT_MODALITY_WEIGHTS },
  skipConceptIds: [],
  digestEmail: false,
  pushEnabled: false,
  onboardingVersion: PROFILE_VERSION,
};

export function normalizeModalityWeights(w: ModalityWeights): ModalityWeights {
  const sum = w.review + w.drill + w.build + w.learn;
  if (sum <= 0) return { ...DEFAULT_MODALITY_WEIGHTS };
  return {
    review: w.review / sum,
    drill: w.drill / sum,
    build: w.build / sum,
    learn: w.learn / sum,
  };
}

export function normalizeRoadmapWeights(weights: Record<string, number>): Record<string, number> {
  const entries = Object.entries(weights).filter(([, v]) => v > 0);
  if (!entries.length) return { 'ai-search-infra-90-day': 1 };
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  return Object.fromEntries(entries.map(([k, v]) => [k, v / sum]));
}

/** Boost drill/review when interview is soon. */
export function adjustWeightsForHorizon(
  weights: ModalityWeights,
  horizonDays: number | null
): ModalityWeights {
  if (horizonDays == null || horizonDays > 60) return weights;
  const urgency = horizonDays <= 14 ? 1.35 : horizonDays <= 30 ? 1.2 : 1.1;
  return normalizeModalityWeights({
    review: weights.review * urgency,
    drill: weights.drill * urgency,
    build: weights.build * 0.85,
    learn: weights.learn * 0.9,
  });
}

export function experienceLabel(e: ExperienceLevel): string {
  return e === 'student' ? 'Student / new grad' : e === 'senior' ? 'Senior+' : 'Mid-level';
}

export function minutesLabel(m: number): string {
  return m === 15
    ? '15 min · quick rep'
    : m === 30
      ? '30 min · focused'
      : m === 90
        ? '90 min · deep'
        : '45 min · standard';
}

/** ELO offset so drill picker matches experience level. */
export function experienceEloOffset(e: ExperienceLevel): number {
  if (e === 'student') return -200;
  if (e === 'senior') return 200;
  return 0;
}

/** Shift modality mix toward learn for students, drill for seniors. */
export function adjustWeightsForExperience(
  weights: ModalityWeights,
  experience: ExperienceLevel
): ModalityWeights {
  if (experience === 'student') {
    return normalizeModalityWeights({
      review: weights.review * 0.9,
      drill: weights.drill * 0.85,
      build: weights.build * 0.9,
      learn: weights.learn * 1.3,
    });
  }
  if (experience === 'senior') {
    return normalizeModalityWeights({
      review: weights.review * 1.05,
      drill: weights.drill * 1.15,
      build: weights.build * 1.1,
      learn: weights.learn * 0.8,
    });
  }
  return weights;
}
