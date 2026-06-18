// Central data module for the SWE Learning OS.
// Static content lives in JSON; mutable user state lives in localStorage / DB.
import artifactsData from './artifacts.json';
import conceptsData from './concepts.json';
import drillsData from './drills.json';
import externalResourcesData from './external-resources.json';
import projectsData from './projects.json';
import reviewQuestionsData from './review-questions.json';
import roadmapsData from './roadmaps.json';

export type TrackId =
  | 'search-ir'
  | 'vector-db'
  | 'ai-systems'
  | 'backend'
  | 'databases'
  | 'system-design'
  | 'dsa'
  | 'product';

export type Difficulty = 'intro' | 'core' | 'advanced';

// Concept lifecycle status — derived from mastery/activity, not stored in JSON.
export type ConceptStatus =
  | 'not-started'
  | 'learning'
  | 'drilling'
  | 'building'
  | 'review'
  | 'mastered';

export type ArtifactStatus = 'todo' | 'building' | 'shipped';
export type DrillStatus = 'unsolved' | 'attempted' | 'solved';
export type ProjectStatus = 'planned' | 'active' | 'guided' | 'AI-managed' | 'paused' | 'done' | 'archived';

export interface Track {
  id: TrackId;
  title: string;
  short: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  primary: boolean;
}

export interface Resource {
  title: string;
  url: string;
  type: 'doc' | 'article' | 'paper' | 'video' | 'course';
}

export interface Concept {
  id: string;
  name: string;
  /** Flat labels. First entry is the "primary group" used for color / icon. */
  tags: string[];
  /** Roadmap IDs whose milestones include this concept. Derived from roadmaps.json. */
  roadmaps: string[];
  difficulty: Difficulty;
  priority: number;
  prerequisites: string[];
  related: string[];
  description: string;
  mentalModel?: string;
  commonMistakes?: string[];
  realWorldUsage?: string;
  projectApplications?: string[];
  artifacts?: string[];
  drills?: string[];
  reviewQuestions?: string[];
  resources?: Resource[];
}

export interface Milestone {
  title: string;
  goal: string;
  concepts: string[];
  drills: string[];
  artifacts: string[];
}

export interface Roadmap {
  id: string;
  title: string;
  horizon: '9d' | '30d' | '90d' | '12mo';
  goal: string;
  description: string;
  tracks: TrackId[];
  milestones: Milestone[];
}

export interface Artifact {
  id: string;
  title: string;
  type: string;
  difficulty: Difficulty;
  concepts: string[];
  projects: string[];
  description: string;
  successCriteria: string[];
  deliverables: string[];
}

export interface Drill {
  id: string;
  title: string;
  conceptId: string;
  type: string;
  difficulty: Difficulty;
  prompt: string;
  expectedOutput: string;
  hints: string[];
  solutionNotes: string;
}

export interface Project {
  id: string;
  name: string;
  lane: string;
  status: ProjectStatus;
  purpose: string;
  tracks: TrackId[];
  milestones: string[];
  nextAction: string;
  repo: string;
}

export interface ReviewQuestion {
  id: string;
  conceptId: string;
  type: 'recall' | 'explain' | 'compare' | 'implement' | 'design';
  difficulty: Difficulty;
  question: string;
  answer: string;
}

// The 8 "known groups" — top-level tags the UI gives a color/icon/title.
// Any tag not in this list renders as a plain text chip.
export const TRACKS: Track[] = [
  {
    id: 'search-ir',
    title: 'Search & IR',
    short: 'Search',
    description: 'Lexical retrieval beyond embeddings: tokenization, inverted indexes, BM25, ranking, hybrid search, and search evaluation.',
    icon: 'Search',
    color: 'purple',
    order: 1,
    primary: true,
  },
  {
    id: 'vector-db',
    title: 'Vector DB & ANN',
    short: 'Vectors',
    description: 'Vector search engines: similarity, top-k, brute force, HNSW, IVF, quantization, metadata filtering, and recall/latency tradeoffs.',
    icon: 'Boxes',
    color: 'fuchsia',
    order: 2,
    primary: true,
  },
  {
    id: 'ai-systems',
    title: 'AI Systems',
    short: 'AI',
    description: 'Practical AI engineering: LLM apps, RAG, chunking, tool calling, agents, evals, and model/transformer foundations.',
    icon: 'Sparkles',
    color: 'cyan',
    order: 3,
    primary: true,
  },
  {
    id: 'backend',
    title: 'Backend',
    short: 'Backend',
    description: 'Production backend strength: HTTP, API design, auth, rate limiting, idempotency, queues, jobs, caching, and observability.',
    icon: 'Server',
    color: 'emerald',
    order: 4,
    primary: true,
  },
  {
    id: 'databases',
    title: 'Databases & Storage',
    short: 'Storage',
    description: 'Storage foundations for Turbopuffer-class systems: B-trees, LSM trees, WAL, compaction, partitioning, replication, object storage.',
    icon: 'Database',
    color: 'amber',
    order: 5,
    primary: false,
  },
  {
    id: 'system-design',
    title: 'System Design',
    short: 'Design',
    description: 'Architecture-level thinking: low-level design, scalability, distributed systems, event-driven design, and end-to-end case studies.',
    icon: 'Network',
    color: 'orange',
    order: 6,
    primary: false,
  },
  {
    id: 'dsa',
    title: 'DSA & Implementation',
    short: 'DSA',
    description: 'Fast, clean implementation ability: arrays, graphs, trees, dynamic programming, and the core algorithmic patterns.',
    icon: 'Binary',
    color: 'blue',
    order: 7,
    primary: false,
  },
  {
    id: 'product',
    title: 'Product & Distribution',
    short: 'Product',
    description: 'Stay close to the market: positioning, landing pages, SEO, analytics, and the behavioral/communication foundation.',
    icon: 'Rocket',
    color: 'rose',
    order: 8,
    primary: false,
  },
];
export const CONCEPTS: Concept[] = (conceptsData as any).concepts;
export const ROADMAPS: Roadmap[] = (roadmapsData as any).roadmaps;
export const ARTIFACTS: Artifact[] = (artifactsData as any).artifacts;
export const DRILLS: Drill[] = (drillsData as any).drills;
export const PROJECTS: Project[] = (projectsData as any).projects;
export const REVIEW_QUESTIONS: ReviewQuestion[] = (reviewQuestionsData as any).reviewQuestions;

export const TRACK_BY_ID: Record<string, Track> = Object.fromEntries(TRACKS.map(t => [t.id, t]));
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map(c => [c.id, c]));
export const ROADMAP_BY_ID: Record<string, Roadmap> = Object.fromEntries(ROADMAPS.map(r => [r.id, r]));
export const ARTIFACT_BY_ID: Record<string, Artifact> = Object.fromEntries(ARTIFACTS.map(a => [a.id, a]));
export const DRILL_BY_ID: Record<string, Drill> = Object.fromEntries(DRILLS.map(d => [d.id, d]));
export const PROJECT_BY_ID: Record<string, Project> = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
export const REVIEW_QUESTION_BY_ID: Record<string, ReviewQuestion> = Object.fromEntries(
  REVIEW_QUESTIONS.map(q => [q.id, q]),
);

// --- Tag-first taxonomy ----------------------------------------------------
// Concepts have tags[] + roadmaps[]. The 8 "tracks" are just known top-level
// tags with display metadata; TrackId remains as the type for those known
// group IDs (used by Roadmap.tracks and Project.tracks).

/** Tags that the UI knows about — gives them a color + icon + title. */
export const KNOWN_GROUP_TAGS: TrackId[] = TRACKS.map(t => t.id as TrackId);

/** Display metadata for a tag, if the UI knows about it. */
export function groupForTag(tag: string): Track | undefined {
  return TRACK_BY_ID[tag];
}

/**
 * A concept's primary display group — first tag the UI knows about.
 * Convention: tags[0] is the primary-group slot; the migration script
 * preserves that, and any future tag editor should keep it.
 */
export function primaryGroup(concept: Concept): Track | undefined {
  for (const t of concept.tags) {
    const g = TRACK_BY_ID[t];
    if (g) return g;
  }
  return undefined;
}

/** Every concept tagged with this tag (group tag or otherwise). */
export function conceptsByTag(tag: string): Concept[] {
  return CONCEPTS.filter(c => c.tags.includes(tag));
}

/** Every concept in a roadmap, by id. */
export function conceptsInRoadmap(roadmapId: string): Concept[] {
  return CONCEPTS.filter(c => c.roadmaps.includes(roadmapId));
}

export function drillsForConcept(conceptId: string): Drill[] {
  return DRILLS.filter(d => d.conceptId === conceptId);
}

export function reviewQuestionsForConcept(conceptId: string): ReviewQuestion[] {
  return REVIEW_QUESTIONS.filter(q => q.conceptId === conceptId);
}

export function artifactsForConcept(conceptId: string): Artifact[] {
  return ARTIFACTS.filter(a => a.concepts.includes(conceptId));
}

export function artifactsForProject(projectId: string): Artifact[] {
  return ARTIFACTS.filter(a => a.projects.includes(projectId));
}

export function conceptsForProject(projectId: string): Concept[] {
  return CONCEPTS.filter(c => (c.projectApplications || []).includes(projectId));
}

export function sortedTracks(): Track[] {
  return [...TRACKS].sort((a, b) => a.order - b.order);
}

/** Every distinct concept id referenced across a roadmap's milestones. */
export function roadmapConceptIds(roadmap: Roadmap): string[] {
  const ids = new Set<string>();
  for (const m of roadmap.milestones) for (const c of m.concepts) ids.add(c);
  return [...ids];
}

// --- External resources (harvested from curated public lists) --------------
// Source repos preserved in `_meta.source` for attribution. Re-run
// `node scripts/harvest-developer-y.mjs` to refresh.

export interface ExternalResource {
  title: string;
  url: string;
  kind: 'video' | 'course' | 'paper' | 'link';
  source: string;
}

interface ExternalResourcesFile {
  _meta: { source: string[]; generated_by: string; cap_per_tag: number };
  byTag: Record<string, ExternalResource[]>;
}

export const EXTERNAL_RESOURCES = externalResourcesData as ExternalResourcesFile;

/** Resources for a single tag, in curated order. */
export function externalResourcesForTag(tag: string): ExternalResource[] {
  return EXTERNAL_RESOURCES.byTag[tag] ?? [];
}

/**
 * Merge resources across multiple tags, dedupe by URL, preserve order
 * within the first tag that contributed each URL.
 */
export function externalResourcesForTags(tags: string[]): ExternalResource[] {
  const out: ExternalResource[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    for (const r of externalResourcesForTag(tag)) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      out.push(r);
    }
  }
  return out;
}

/** Every tag that has at least one curated external resource. */
export function tagsWithExternalResources(): string[] {
  return Object.keys(EXTERNAL_RESOURCES.byTag).sort();
}
