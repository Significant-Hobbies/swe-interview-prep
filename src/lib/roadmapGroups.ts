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
    title: 'Systems internals',
    subtitle: 'DB engines, language runtimes, OS/containers/compilers — mechanism-first.',
    roadmapIds: ['db-disk-first', 'runtime', 'swe-landscape'],
  },
  {
    id: 'ai',
    title: 'AI & retrieval',
    subtitle: 'Lexical search → vectors → RAG → inference infra.',
    roadmapIds: ['reset-9-day', 'retrieval-30-day', 'ai-search-infra-90-day', 'ai-infra-12-month'],
  },
  {
    id: 'math',
    title: 'Mathematics',
    subtitle: 'Probability, linear algebra, optimization — active problem solving.',
    roadmapIds: ['math-rating-climb-30d', 'prob-stats-30d', 'math-stack-12w'],
  },
];

const GROUPED_IDS = new Set(ROADMAP_GROUPS.flatMap((g) => g.roadmapIds));

/** Roadmaps not in any group (should be empty; fallback for new entries). */
export function ungroupedRoadmaps(all: Roadmap[]): Roadmap[] {
  return all.filter((r) => !GROUPED_IDS.has(r.id));
}

export function roadmapsInGroup(group: RoadmapGroup): Roadmap[] {
  return group.roadmapIds.map((id) => ROADMAP_BY_ID[id]).filter((r): r is Roadmap => Boolean(r));
}
