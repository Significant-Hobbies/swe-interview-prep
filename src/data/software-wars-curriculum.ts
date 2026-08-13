import conceptsData from './concepts.json';
import roadmapsData from './roadmaps.json';
import { PREVIEW_QUESTIONS, type PreviewQuestion } from './software-wars-preview';

const CONCEPTS = conceptsData.concepts;
const ROADMAPS = roadmapsData.roadmaps;
const TRACKS = [
  ['search-ir', 'Search & IR'],
  ['mathematics', 'Mathematics'],
  ['vector-db', 'Vector DB & ANN'],
  ['ai-systems', 'AI Systems'],
  ['backend', 'Backend'],
  ['databases', 'Databases & Storage'],
  ['system-design', 'System Design'],
  ['dsa', 'Data Structures & Algorithms'],
  ['behavioral', 'Behavioral'],
  ['go-to-market', 'Go to Market'],
  ['systems-foundations', 'Systems Foundations'],
  ['infrastructure-platforms', 'Infrastructure & Platforms'],
  ['distributed-systems', 'Distributed Systems'],
  ['inference-serving', 'Inference & Serving'],
  ['agent-systems', 'Agent Systems'],
  ['ai-reliability', 'AI Reliability'],
  ['developer-tools', 'Developer Tools'],
  ['application-engineering', 'Application Engineering'],
  ['multimodal-spatial', 'Multimodal & Spatial'],
] as const;

export type WarsCurriculumSection = 'track' | 'roadmap' | 'concept';

export interface WarsCurriculumItem {
  id: string;
  title: string;
  trackIds: string[];
  conceptCount: number;
  candidateCount: number;
  activeCount: number;
  playable: boolean;
  learnPath: string;
}

export interface WarsCurriculumManifest {
  minimumPlayableQuestions: number;
  totals: { tracks: number; roadmaps: number; concepts: number };
  tracks: WarsCurriculumItem[];
  roadmaps: WarsCurriculumItem[];
  concepts: WarsCurriculumItem[];
}

const MINIMUM_PLAYABLE_QUESTIONS = 5;
const trackIds = new Set<string>(TRACKS.map(([id]) => id));

function coverage(conceptIds: Set<string>) {
  const count = PREVIEW_QUESTIONS.filter(({ conceptId }) => conceptIds.has(conceptId)).length;
  return {
    candidateCount: count,
    activeCount: count,
    playable: count >= MINIMUM_PLAYABLE_QUESTIONS,
  };
}

export function buildPreviewWarsCurriculum(): WarsCurriculumManifest {
  const concepts = CONCEPTS.map((concept) => ({
    id: concept.id,
    title: concept.name,
    trackIds: concept.tags.filter((tag) => trackIds.has(tag)),
    conceptCount: 1,
    learnPath: `/concepts/${encodeURIComponent(concept.id)}`,
    ...coverage(new Set([concept.id])),
  }));

  const roadmaps = ROADMAPS.map((roadmap) => {
    const conceptIds = new Set(roadmap.milestones.flatMap(({ concepts: ids }) => ids));
    return {
      id: roadmap.id,
      title: roadmap.title,
      trackIds: roadmap.tracks,
      conceptCount: conceptIds.size,
      learnPath: `/roadmaps/${encodeURIComponent(roadmap.id)}`,
      ...coverage(conceptIds),
    };
  });

  const tracks = TRACKS.map(([trackId, title]) => {
    const conceptIds = new Set(
      CONCEPTS.filter(({ tags }) => tags.includes(trackId)).map(({ id }) => id)
    );
    return {
      id: trackId,
      title,
      trackIds: [trackId],
      conceptCount: conceptIds.size,
      learnPath: `/learn/all#track-${encodeURIComponent(trackId)}`,
      ...coverage(conceptIds),
    };
  });

  return {
    minimumPlayableQuestions: MINIMUM_PLAYABLE_QUESTIONS,
    totals: { tracks: tracks.length, roadmaps: roadmaps.length, concepts: concepts.length },
    tracks,
    roadmaps,
    concepts,
  };
}

export function previewQuestionMatchesQueue(
  question: PreviewQuestion,
  queueType: WarsCurriculumSection,
  queueId: string
) {
  if (queueType === 'concept') return question.conceptId === queueId;
  if (queueType === 'track') {
    return CONCEPTS.find(({ id }) => id === question.conceptId)?.tags.includes(queueId);
  }
  const roadmap = ROADMAPS.find(({ id }) => id === queueId);
  return roadmap?.milestones.some(({ concepts }) => concepts.includes(question.conceptId)) ?? false;
}
