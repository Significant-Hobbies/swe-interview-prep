import { MOCK_PROMPTS, type MockKind, type MockPrompt } from '../data/mock-prompts';
import type { MasteryEntry } from '../hooks/useConcepts';
import { COMPANY_BY_ID } from './companies';
import type { LearnerProfile } from './profile';

export function mocksForConcept(conceptId: string): MockPrompt[] {
  return MOCK_PROMPTS.filter(p => p.conceptIds?.includes(conceptId));
}

export function recommendMockPrompts(
  profile: LearnerProfile,
  mastery: Record<string, MasteryEntry>,
  limit = 3,
): MockPrompt[] {
  const kindBias: MockKind = profile.targetCompany
    ? (COMPANY_BY_ID[profile.targetCompany]?.mockKindBias ?? 'technical')
    : 'technical';

  const urgent = profile.interviewHorizonDays != null && profile.interviewHorizonDays <= 21;

  const scored = MOCK_PROMPTS.map(prompt => {
    let score = 0;
    if (prompt.kind === kindBias) score += 3;
    if (urgent && prompt.kind === 'system-design') score += 1;
    if (urgent && prompt.kind === 'behavioral') score += 1;

    for (const conceptId of prompt.conceptIds ?? []) {
      const conf = mastery[conceptId]?.confidence ?? 0;
      if (conf < 0.35) score += 4;
      else if (conf < 0.55) score += 2;
      else if (conf < 0.75) score += 1;
    }

    return { prompt, score };
  });

  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.prompt.title.localeCompare(b.prompt.title))
    .slice(0, limit)
    .map(x => x.prompt);
}

/** FSRS rating from rubric self-check coverage. */
export function mockRatingFromRubric(checked: number, total: number): 'again' | 'hard' | 'good' | 'easy' {
  if (total <= 0) return 'good';
  const ratio = checked / total;
  if (ratio >= 0.9) return 'easy';
  if (ratio >= 0.65) return 'good';
  if (ratio >= 0.35) return 'hard';
  return 'again';
}