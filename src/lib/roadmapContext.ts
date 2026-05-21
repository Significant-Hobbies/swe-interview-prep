import roadmapContextData from '../../shared/data/roadmap-context.json';
import type { Concept } from '../hooks/useConcepts';

export interface RoadmapContext {
  track: string;
  milestone: string;
  exitCriteria: string[];
  artifacts: string[];
}

interface RoadmapContextData {
  defaultByCategory: Record<string, RoadmapContext>;
  byConceptId: Record<string, Partial<RoadmapContext>>;
}

const roadmapContext = roadmapContextData as RoadmapContextData;

export function getRoadmapContext(concept?: Concept | null): RoadmapContext | null {
  if (!concept) return null;
  const base = roadmapContext.defaultByCategory[concept.category] ?? roadmapContext.defaultByCategory.dsa;
  const override = roadmapContext.byConceptId[concept.id] ?? {};
  return {
    track: override.track ?? base.track,
    milestone: override.milestone ?? base.milestone,
    exitCriteria: override.exitCriteria ?? base.exitCriteria,
    artifacts: override.artifacts ?? base.artifacts,
  };
}
