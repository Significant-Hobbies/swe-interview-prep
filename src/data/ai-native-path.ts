export type AiNativePathStageKind = 'foundation' | 'parallel' | 'synthesis';

export interface AiNativePathStage {
  id: 'foundations' | 'dsa' | 'ai-engineering' | 'system-design';
  step: '1' | '2A' | '2B' | '3';
  kind: AiNativePathStageKind;
  title: string;
  summary: string;
  roadmapId: string;
  horizon: string;
  topics: string[];
  signal?: string;
  secondary?: {
    label: string;
    to: string;
  };
}

export const AI_NATIVE_PATH_STAGES: AiNativePathStage[] = [
  {
    id: 'foundations',
    step: '1',
    kind: 'foundation',
    title: 'Understand the machine',
    summary: 'Build the mechanisms that make every later trade-off legible.',
    roadmapId: 'systems-foundations-12w',
    horizon: '12 weeks',
    topics: ['Representation', 'Memory', 'Operating systems', 'Networks'],
  },
  {
    id: 'dsa',
    step: '2A',
    kind: 'parallel',
    title: 'Reason about performance',
    summary: 'Practice decomposition, complexity, and reusable interview patterns.',
    roadmapId: 'dsa-practice',
    horizon: '30 days',
    topics: ['Patterns', 'Complexity', 'Proof', 'Implementation'],
  },
  {
    id: 'ai-engineering',
    step: '2B',
    kind: 'parallel',
    title: 'Build and judge AI systems',
    summary: 'Ship retrieval, model, agent, and serving paths with measurable quality.',
    roadmapId: 'ai-infra-12-month',
    horizon: '12 months',
    topics: ['RAG', 'Agents', 'Inference', 'Reliability'],
    signal:
      'Evaluation judgment is the differentiator: know when to accept, reject, or escalate model output.',
    secondary: {
      label: 'Open Evaluation & AI Reliability',
      to: '/roadmaps/ai-reliability-12w',
    },
  },
  {
    id: 'system-design',
    step: '3',
    kind: 'synthesis',
    title: 'Defend the design',
    summary: 'Synthesize capacity, data, failure, and AI trade-offs under interview pressure.',
    roadmapId: 'hld-practice',
    horizon: '30 days',
    topics: ['Estimation', 'Architecture', 'Failure modes', 'Trade-offs'],
    secondary: {
      label: 'Practice a popular system-design case',
      to: '/mock?kind=system-design',
    },
  },
];
