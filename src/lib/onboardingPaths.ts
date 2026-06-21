import { ROADMAP_BY_ID } from '../data/learning-os';
import { ROADMAP_GROUPS } from './roadmapGroups';

export interface OnboardingPath {
  id: string;
  title: string;
  subtitle: string;
  horizon: string;
  emoji: string;
}

export interface OnboardingPathGroup {
  id: string;
  title: string;
  subtitle: string;
  paths: OnboardingPath[];
}

const HORIZON_LABEL: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

const EMOJI: Record<string, string> = {
  'lld-practice': '🏗️',
  'hld-practice': '🌐',
  'dsa-practice': '🧩',
  'behavioral-practice': '💬',
  'db-disk-first': '💾',
  runtime: '⚙️',
  'swe-landscape': '🗺️',
  'reset-9-day': '⚡',
  'retrieval-30-day': '📚',
  'ai-search-infra-90-day': '🔍',
  'ai-infra-12-month': '🚀',
  'math-rating-climb-30d': '📈',
  'prob-stats-30d': '📊',
  'math-stack-12w': '🧮',
};

export const DEFAULT_ONBOARDING_PATH_ID = 'ai-search-infra-90-day';

export const ONBOARDING_PATH_GROUPS: OnboardingPathGroup[] = ROADMAP_GROUPS.map(group => ({
  id: group.id,
  title: group.title,
  subtitle: group.subtitle,
  paths: group.roadmapIds.map(id => {
    const roadmap = ROADMAP_BY_ID[id];
    return {
      id,
      title: roadmap?.title ?? id,
      subtitle: roadmap?.goal ?? '',
      horizon: roadmap ? (HORIZON_LABEL[roadmap.horizon] ?? roadmap.horizon) : '',
      emoji: EMOJI[id] ?? '📍',
    };
  }),
}));

export const ONBOARDING_PATHS: OnboardingPath[] = ONBOARDING_PATH_GROUPS.flatMap(g => g.paths);