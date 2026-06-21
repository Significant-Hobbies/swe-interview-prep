// Company study profiles — bias roadmap blend and mock style.
import type { MockKind } from '../data/mock-prompts';

export type CompanyId =
  | 'google'
  | 'meta'
  | 'amazon'
  | 'openai'
  | 'stripe'
  | 'startup'
  | 'general';

export interface CompanyPreset {
  id: CompanyId;
  label: string;
  description: string;
  roadmapWeights: Record<string, number>;
  mockKindBias: MockKind;
}

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    id: 'google',
    label: 'Google / DeepMind',
    description: 'Heavy systems + ML infra. Search, evals, scale.',
    roadmapWeights: {
      'ai-search-infra-90-day': 0.45,
      'math-stack-12w': 0.25,
      'prob-stats-30d': 0.15,
    },
    mockKindBias: 'technical',
  },
  {
    id: 'meta',
    label: 'Meta',
    description: 'Product infra at scale — ranking, retrieval, velocity.',
    roadmapWeights: {
      'ai-search-infra-90-day': 0.4,
      'reset-9-day': 0.2,
      'math-stack-12w': 0.2,
    },
    mockKindBias: 'system-design',
  },
  {
    id: 'amazon',
    label: 'Amazon',
    description: 'Operational excellence — system design + behavioral bar.',
    roadmapWeights: {
      'ai-search-infra-90-day': 0.35,
      'math-stack-12w': 0.25,
      'prob-stats-30d': 0.2,
    },
    mockKindBias: 'system-design',
  },
  {
    id: 'openai',
    label: 'OpenAI / Anthropic',
    description: 'RAG, evals, inference — ship artifacts fast.',
    roadmapWeights: {
      'ai-search-infra-90-day': 0.55,
      'prob-stats-30d': 0.2,
      'reset-9-day': 0.15,
    },
    mockKindBias: 'technical',
  },
  {
    id: 'stripe',
    label: 'Stripe / fintech',
    description: 'API design, reliability, crisp communication.',
    roadmapWeights: {
      'ai-search-infra-90-day': 0.3,
      'math-stack-12w': 0.3,
      'prob-stats-30d': 0.25,
    },
    mockKindBias: 'behavioral',
  },
  {
    id: 'startup',
    label: 'Early-stage startup',
    description: 'Breadth + ship. Short horizon, build-heavy.',
    roadmapWeights: {
      'reset-9-day': 0.4,
      'ai-search-infra-90-day': 0.35,
    },
    mockKindBias: 'technical',
  },
  {
    id: 'general',
    label: 'General / no target',
    description: 'Balanced — no company-specific bias.',
    roadmapWeights: {},
    mockKindBias: 'technical',
  },
];

export const COMPANY_BY_ID = Object.fromEntries(
  COMPANY_PRESETS.map(c => [c.id, c]),
) as Record<CompanyId, CompanyPreset>;

/** Blend profile roadmap weights with company preset (company adds, doesn't replace). */
export function blendRoadmapWeights(
  profileWeights: Record<string, number>,
  companyId: CompanyId | null | undefined,
): Record<string, number> {
  if (!companyId || companyId === 'general') return profileWeights;
  const preset = COMPANY_BY_ID[companyId];
  if (!preset?.roadmapWeights || !Object.keys(preset.roadmapWeights).length) {
    return profileWeights;
  }
  const merged: Record<string, number> = { ...profileWeights };
  for (const [rid, w] of Object.entries(preset.roadmapWeights)) {
    merged[rid] = (merged[rid] ?? 0) + w;
  }
  if (!Object.keys(merged).length) return profileWeights;
  return merged;
}