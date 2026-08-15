import { ROADMAP_BY_ID, type Roadmap } from '../data/learning-os';

export interface RoadmapGroup {
  id: string;
  title: string;
  subtitle: string;
  roadmapIds: string[];
}

/** Featured picks — interview + systems topics that were buried in the flat list. */
export const FEATURED_ROADMAP_PICKS: {
  id: string;
  label: string;
  docSlug?: string;
}[] = [
  { id: 'lld-practice', label: 'LLD', docSlug: 'system-design' },
  { id: 'hld-practice', label: 'HLD', docSlug: 'system-design' },
  { id: 'dsa-practice', label: 'DSA' },
  { id: 'behavioral-practice', label: 'Behavioral' },
  { id: 'db-disk-first', label: 'Databases', docSlug: 'db-roadmap' },
  { id: 'runtime', label: 'Runtime', docSlug: 'runtime-roadmap' },
  { id: 'swe-landscape', label: 'OS & landscape', docSlug: 'swe-landscape' },
  { id: 'ai-models-training-12w', label: 'AI training' },
  { id: 'inference-serving-12w', label: 'Inference' },
  { id: 'trace-a-tensor', label: 'Tensor lifecycle' },
  { id: 'agent-systems-12w', label: 'Agents' },
  { id: 'harness-engineering', label: 'Harnesses' },
  { id: 'developer-tools-12w', label: 'Devtools' },
];

export const ROADMAP_GROUPS: RoadmapGroup[] = [
  {
    id: 'interview',
    title: 'Interview prep',
    subtitle: 'Design rounds, algorithms, and behavioral — scoped 30-day sprints.',
    roadmapIds: ['lld-practice', 'hld-practice', 'dsa-practice', 'behavioral-practice'],
  },
  {
    id: 'systems',
    title: 'Systems & platforms',
    subtitle:
      'Hardware, runtimes, infrastructure, distributed systems, and storage — mechanism-first.',
    roadmapIds: [
      'systems-foundations-12w',
      'infrastructure-platforms-12w',
      'distributed-systems-12w',
      'db-disk-first',
      'runtime',
      'swe-landscape',
    ],
  },
  {
    id: 'ai',
    title: 'AI-native systems',
    subtitle: 'Retrieval, model training, inference, agents, evaluation, and reliability.',
    roadmapIds: [
      'reset-9-day',
      'retrieval-30-day',
      'ai-search-infra-90-day',
      'ai-infra-12-month',
      'ai-models-training-12w',
      'inference-serving-12w',
      'trace-a-tensor',
      'agent-systems-12w',
      'ai-reliability-12w',
    ],
  },
  {
    id: 'math',
    title: 'Mathematics',
    subtitle: 'Probability, linear algebra, optimization — active problem solving.',
    roadmapIds: ['math-rating-climb-30d', 'prob-stats-30d', 'math-stack-12w'],
  },
  {
    id: 'software-building',
    title: 'Software building',
    subtitle:
      'Developer tools, repository intelligence, complete applications, and product delivery.',
    roadmapIds: ['developer-tools-12w', 'harness-engineering', 'application-engineering-12w'],
  },
  {
    id: 'human-interfaces',
    title: 'Multimodal & spatial',
    subtitle:
      'Vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI.',
    roadmapIds: ['multimodal-spatial-12w'],
  },
];

export function roadmapsInGroup(group: RoadmapGroup): Roadmap[] {
  return group.roadmapIds.map((id) => ROADMAP_BY_ID[id]).filter((r): r is Roadmap => Boolean(r));
}
