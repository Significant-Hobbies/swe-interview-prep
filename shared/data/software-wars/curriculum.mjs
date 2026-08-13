import conceptsData from '../../../src/data/concepts.json' with { type: 'json' };
import roadmapsData from '../../../src/data/roadmaps.json' with { type: 'json' };

export const WARS_MINIMUM_PLAYABLE_QUESTIONS = 5;

export const canonicalConcepts = Object.freeze(conceptsData.concepts);
export const canonicalRoadmaps = Object.freeze(roadmapsData.roadmaps);
export const canonicalTrackIds = Object.freeze([
  ...new Set(canonicalRoadmaps.flatMap(({ tracks }) => tracks)),
]);

const conceptById = new Map(canonicalConcepts.map((concept) => [concept.id, concept]));
const roadmapById = new Map(canonicalRoadmaps.map((roadmap) => [roadmap.id, roadmap]));
const canonicalTrackIdSet = new Set(canonicalTrackIds);

export function findCanonicalConcept(conceptId) {
  return conceptById.get(conceptId) ?? null;
}

export function resolveWarsQueueConceptIds(queueType, queueId) {
  if (queueType === 'concept') return conceptById.has(queueId) ? new Set([queueId]) : null;
  if (queueType === 'roadmap') {
    const roadmap = roadmapById.get(queueId);
    if (!roadmap) return null;
    return new Set(roadmap.milestones.flatMap(({ concepts }) => concepts));
  }
  if (queueType === 'track') {
    if (!canonicalTrackIdSet.has(queueId)) return null;
    return new Set(
      canonicalConcepts.filter(({ tags }) => tags.includes(queueId)).map(({ id }) => id)
    );
  }
  return null;
}

function questionCounts(questions, conceptIds) {
  const scoped = questions.filter(({ primaryConceptId }) => conceptIds.has(primaryConceptId));
  return {
    candidateCount: new Set(scoped.map(({ contentKey }) => contentKey)).size,
    activeCount: new Set(
      scoped.filter(({ status }) => status === 'active').map(({ contentKey }) => contentKey)
    ).size,
  };
}

function withReadiness(counts) {
  return {
    ...counts,
    playable: counts.activeCount >= WARS_MINIMUM_PLAYABLE_QUESTIONS,
  };
}

export function buildWarsCurriculumManifest(questions) {
  const concepts = canonicalConcepts.map((concept) => {
    const counts = questionCounts(questions, new Set([concept.id]));
    return {
      id: concept.id,
      name: concept.name,
      trackIds: concept.tags.filter((tag) => canonicalTrackIdSet.has(tag)),
      roadmapIds: concept.roadmaps,
      learnPath: `/concepts/${encodeURIComponent(concept.id)}`,
      ...withReadiness(counts),
    };
  });

  const roadmaps = canonicalRoadmaps.map((roadmap) => {
    const conceptIds = resolveWarsQueueConceptIds('roadmap', roadmap.id);
    return {
      id: roadmap.id,
      title: roadmap.title,
      trackIds: roadmap.tracks,
      conceptCount: conceptIds.size,
      learnPath: `/roadmaps/${encodeURIComponent(roadmap.id)}`,
      ...withReadiness(questionCounts(questions, conceptIds)),
    };
  });

  const tracks = canonicalTrackIds.map((trackId) => {
    const conceptIds = resolveWarsQueueConceptIds('track', trackId);
    return {
      id: trackId,
      conceptCount: conceptIds.size,
      learnPath: `/learn/all#track-${encodeURIComponent(trackId)}`,
      ...withReadiness(questionCounts(questions, conceptIds)),
    };
  });

  return Object.freeze({
    minimumPlayableQuestions: WARS_MINIMUM_PLAYABLE_QUESTIONS,
    totals: {
      tracks: tracks.length,
      roadmaps: roadmaps.length,
      concepts: concepts.length,
    },
    tracks: Object.freeze(tracks),
    roadmaps: Object.freeze(roadmaps),
    concepts: Object.freeze(concepts),
  });
}
