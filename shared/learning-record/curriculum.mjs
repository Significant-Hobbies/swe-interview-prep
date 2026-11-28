import catalogData from '../../public/curriculum/catalog.json' with { type: 'json' };
import casesData from '../../public/system-design/catalog.json' with { type: 'json' };
import conceptsData from '../../src/data/concepts.json' with { type: 'json' };
import drillsData from '../../src/data/drills.json' with { type: 'json' };
import reviewQuestionsData from '../../src/data/review-questions.json' with { type: 'json' };

import { decodeCursor, encodeCursor, invalid, notFound, slugify } from './schema.mjs';

export const PRODUCT_ORIGIN = 'https://learn.significanthobbies.com';

const CONCEPTS = conceptsData.concepts ?? [];
export const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
const DRILLS_BY_CONCEPT = new Map();
for (const drill of drillsData.drills ?? []) {
  if (!DRILLS_BY_CONCEPT.has(drill.conceptId)) DRILLS_BY_CONCEPT.set(drill.conceptId, []);
  DRILLS_BY_CONCEPT.get(drill.conceptId).push(drill);
}
const QUESTIONS_BY_CONCEPT = new Map();
for (const question of reviewQuestionsData.reviewQuestions ?? []) {
  if (!QUESTIONS_BY_CONCEPT.has(question.conceptId))
    QUESTIONS_BY_CONCEPT.set(question.conceptId, []);
  QUESTIONS_BY_CONCEPT.get(question.conceptId).push(question);
}
const TRACKS = catalogData.tracks ?? [];
export const TRACK_IDS = new Set(TRACKS.map((track) => track.id));
const ROADMAPS = catalogData.roadmaps ?? [];
const CASES = casesData.cases ?? [];
const WHITESPACE = /\s+/u;
const DIFFICULTY_RANK = { intro: 0, core: 1, advanced: 2 };
const DEPENDENTS = new Map();
for (const concept of CONCEPTS) {
  for (const prerequisite of concept.prerequisites ?? []) {
    if (!DEPENDENTS.has(prerequisite)) DEPENDENTS.set(prerequisite, []);
    DEPENDENTS.get(prerequisite).push(concept.id);
  }
}

export function conceptUrl(conceptId) {
  return `${PRODUCT_ORIGIN}/curriculum/concepts/${conceptId}`;
}

export function domainOf(concept) {
  return concept?.tags?.[0] ?? null;
}

function suggestions(value) {
  const needle = slugify(value);
  if (!needle) return [];
  const parts = needle.split('-');
  return CONCEPTS.map((concept) => {
    const haystack = `${concept.id} ${slugify(concept.name)}`;
    return { id: concept.id, score: parts.filter((part) => haystack.includes(part)).length };
  })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5)
    .map((candidate) => candidate.id);
}

/** Throws an actionable error naming close matches for unknown concept ids. */
export function requireConceptIds(ids, field = 'conceptIds') {
  const unknown = (ids ?? []).filter((id) => !CONCEPT_BY_ID.has(id));
  if (unknown.length) {
    throw invalid(
      `Unknown curriculum concept id(s) in ${field}: ${unknown.join(', ')}. Use search_curriculum to find ids, or record the subject as a free-text topic.`,
      { unknown, suggestions: Object.fromEntries(unknown.map((id) => [id, suggestions(id)])) }
    );
  }
  return ids ?? [];
}

export function conceptSummary(concept) {
  return {
    id: concept.id,
    name: concept.name,
    description: concept.description,
    domain: domainOf(concept),
    tags: concept.tags ?? [],
    difficulty: concept.difficulty,
    prerequisites: concept.prerequisites ?? [],
    url: conceptUrl(concept.id),
  };
}

function drillSummary(drill) {
  return {
    id: drill.id,
    title: drill.title,
    type: drill.type,
    difficulty: drill.difficulty,
    prompt: drill.prompt,
    practiceUrl: `${PRODUCT_ORIGIN}/drills/${drill.id}`,
  };
}

function questionSummary(question) {
  return {
    id: question.id,
    type: question.type,
    difficulty: question.difficulty,
    prompt: question.question,
  };
}

function learningObjectives(concept) {
  const objectives = [];
  if (concept.mentalModel) objectives.push(`Explain the mental model: ${concept.mentalModel}`);
  for (const mistake of concept.commonMistakes || []) objectives.push(`Avoid: ${mistake}`);
  if (concept.realWorldUsage) objectives.push(`Relate it to real use: ${concept.realWorldUsage}`);
  return objectives;
}

/** Full concept without answers, reference solutions or grader expectations. */
function conceptDetail(concept) {
  const drills = DRILLS_BY_CONCEPT.get(concept.id) || [];
  const questions = QUESTIONS_BY_CONCEPT.get(concept.id) || [];
  return {
    ...conceptSummary(concept),
    priority: concept.priority || null,
    related: concept.related || [],
    dependents: DEPENDENTS.get(concept.id) || [],
    roadmapIds: concept.roadmaps || [],
    mentalModel: concept.mentalModel || null,
    learningObjectives: learningObjectives(concept),
    commonMistakes: concept.commonMistakes || [],
    realWorldUsage: concept.realWorldUsage || null,
    resources: concept.resources || [],
    exercises: drills.map(drillSummary),
    assessmentQuestions: questions.map(questionSummary),
    answerPolicy: 'Review answers, expected outputs and reference solutions are never returned.',
  };
}

function searchText(item) {
  const fields = [
    item.id,
    item.name,
    item.title,
    item.description,
    item.goal,
    item.prompt,
    item.tags,
    item.category,
  ];
  return JSON.stringify(fields.filter(Boolean)).toLowerCase();
}

function matchesQuery(item, query) {
  if (!query) return true;
  const haystack = searchText(item);
  return query
    .toLowerCase()
    .split(WHITESPACE)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function page(items, args) {
  const limit = args.limit || 20;
  const offset = decodeCursor(args.cursor);
  const slice = items.slice(offset, offset + limit);
  const next = offset + slice.length;
  return {
    items: slice,
    total: items.length,
    nextCursor: items.length > next ? encodeCursor(next) : null,
  };
}

function caseSummary(item) {
  return {
    kind: 'system-design-case',
    id: item.id,
    title: item.title,
    category: item.category,
    difficulty: item.difficulty ?? null,
    prompt: item.prompt,
    conceptIds: item.conceptIds ?? [],
    url: item.guideUrl ?? item.practiceUrl ?? null,
  };
}

const COLLECTION_SEARCH = {
  track: (args) =>
    TRACKS.filter((track) => matchesQuery(track, args.q)).map((track) => ({
      kind: 'track',
      ...track,
    })),
  roadmap: (args) =>
    ROADMAPS.filter((roadmap) => matchesQuery(roadmap, args.q)).map((roadmap) => ({
      kind: 'roadmap',
      ...roadmap,
    })),
  'system-design-case': (args) =>
    CASES.filter(
      (item) =>
        matchesQuery(item, args.q) &&
        (!args.difficulty || item.difficulty === args.difficulty) &&
        (!args.domain || item.category === args.domain)
    ).map(caseSummary),
};

/** Predicates for each concept filter; each returns true when the concept passes. */
function conceptFilters(args, knowledge) {
  if (args.prerequisiteOf) requireConceptIds([args.prerequisiteOf], 'prerequisiteOf');
  if (args.requires) requireConceptIds([args.requires], 'requires');
  const prerequisitesOf = args.prerequisiteOf
    ? new Set(CONCEPT_BY_ID.get(args.prerequisiteOf).prerequisites ?? [])
    : null;
  const minimum = args.minDifficulty ? DIFFICULTY_RANK[args.minDifficulty] : null;
  const known = (concept) =>
    ['advanced', 'expert'].includes(knowledge.get(concept.id)?.assessed_level);
  return [
    (concept) => matchesQuery(concept, args.q),
    (concept) => !args.difficulty || concept.difficulty === args.difficulty,
    (concept) => minimum === null || (DIFFICULTY_RANK[concept.difficulty] ?? 0) >= minimum,
    (concept) => !args.domain || (concept.tags ?? []).includes(args.domain),
    (concept) => !args.requires || (concept.prerequisites ?? []).includes(args.requires),
    (concept) => !prerequisitesOf || prerequisitesOf.has(concept.id),
    (concept) => !args.excludeKnown || !known(concept),
  ];
}

function conceptOrder(args) {
  const weight = args.minDifficulty ? 1 : 0;
  return (a, b) =>
    ((DIFFICULTY_RANK[b.difficulty] ?? 0) - (DIFFICULTY_RANK[a.difficulty] ?? 0)) * weight ||
    (b.priority ?? 0) - (a.priority ?? 0) ||
    a.id.localeCompare(b.id);
}

/**
 * Curriculum search with topic, difficulty and prerequisite filters. The
 * knowledge map (subject key to state) lets callers hide subjects already known.
 */
export function searchCurriculum(args, knowledge = new Map()) {
  const collection = COLLECTION_SEARCH[args.kind ?? 'concept'];
  if (collection) return page(collection(args), args);
  const filters = conceptFilters(args, knowledge);
  const concepts = CONCEPTS.filter((concept) => filters.every((passes) => passes(concept)))
    .sort(conceptOrder(args))
    .map((concept) => ({
      kind: 'concept',
      ...conceptSummary(concept),
      learnerLevel: knowledge.get(concept.id)?.assessed_level ?? 'unassessed',
    }));
  return page(concepts, args);
}

export function getCurriculumItem(kind, id) {
  if (kind === 'concept') {
    const concept = CONCEPT_BY_ID.get(id);
    if (!concept) requireConceptIds([id], 'id');
    return { kind, ...conceptDetail(concept) };
  }
  const collection = { track: TRACKS, roadmap: ROADMAPS, 'system-design-case': CASES }[kind];
  const item = collection?.find((candidate) => candidate.id === id);
  if (!item) throw notFound(`No ${kind} with id "${id}". Use search_curriculum to find ids.`);
  return { kind, ...item };
}

/**
 * A ready-to-review concepts.json entry for a curriculum gap, following the
 * fields that src/data/concepts.test.ts requires.
 */
const OPTIONAL_PROPOSAL_FIELDS = ['mentalModel', 'commonMistakes', 'resources'];

function proposalDomain(tags, gap) {
  const tagged = tags.find((tag) => TRACK_IDS.has(tag));
  if (tagged) return tagged;
  const related = [...(gap.relatedConceptIds || []), ...(gap.prerequisiteConceptIds || [])];
  return related.map((conceptId) => domainOf(CONCEPT_BY_ID.get(conceptId))).find(Boolean) || null;
}

function proposalProblems(id, domain) {
  const problems = [];
  if (CONCEPT_BY_ID.has(id)) problems.push(`Concept id "${id}" already exists; extend it instead.`);
  if (!domain) problems.push('tags[0] must be an existing track id; pass proposedConcept.tags.');
  return problems;
}

function proposedConceptEntry(gap) {
  const proposal = { difficulty: 'core', priority: 3, ...(gap.proposedConcept || {}) };
  const id = slugify(proposal.id || gap.topic);
  const tags = (proposal.tags || []).filter(Boolean);
  const domain = proposalDomain(tags, gap);
  const optional = Object.fromEntries(
    OPTIONAL_PROPOSAL_FIELDS.filter((key) => proposal[key]).map((key) => [key, proposal[key]])
  );
  return {
    entry: {
      id,
      name: proposal.name || gap.topic,
      tags: domain ? [domain, ...tags.filter((tag) => tag !== domain)] : tags,
      roadmaps: [],
      difficulty: proposal.difficulty,
      priority: proposal.priority,
      prerequisites: gap.prerequisiteConceptIds || [],
      related: gap.relatedConceptIds || [],
      description: proposal.description || gap.description,
      ...optional,
    },
    problems: proposalProblems(id, domain),
  };
}

export function contributionGuide(gap) {
  const { entry, problems } = proposedConceptEntry(gap);
  const branch = `curriculum/${entry.id || 'gap'}`;
  return {
    repository: 'Significant-Hobbies/swe-interview-prep',
    baseBranch: 'main',
    suggestedBranch: branch,
    file: 'src/data/concepts.json',
    change: 'Append `entry` to the `concepts` array (keep the file formatted with Biome).',
    entry,
    problems,
    validation: [
      'pnpm test -- src/data/concepts.test.ts',
      'pnpm generate:public-curriculum',
      'pnpm lint',
    ],
    pullRequest: {
      title: `Add ${entry.name} to the curriculum`,
      body: [
        `Curriculum gap: ${gap.topic} (${gap.gapKind}).`,
        '',
        gap.description,
        '',
        gap.learningObjectives?.length
          ? `Learning objectives:\n${gap.learningObjectives.map((item) => `- ${item}`).join('\n')}`
          : '',
      ]
        .join('\n')
        .trim(),
    },
    note: 'Learning continues without this change being merged. After opening the PR, call update_curriculum_gap with prUrl and status "pr-opened".',
  };
}
