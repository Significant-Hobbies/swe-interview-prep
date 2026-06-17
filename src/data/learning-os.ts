// Central data module for the SWE Learning OS.
// Static content lives in JSON; mutable user state lives in localStorage / DB.
import artifactsData from './artifacts.json';
import conceptsData from './concepts.json';
import drillsData from './drills.json';
import projectsData from './projects.json';
import reviewQuestionsData from './review-questions.json';
import roadmapsData from './roadmaps.json';
import tracksData from './tracks.json';

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
  /** @deprecated Use tags[]. Retained until ELO migrates off per-track keying. */
  category: string;
  /** @deprecated Use tags[0]. Same value as tags[0] today. */
  track: TrackId;
  /** @deprecated Use tags[1]. Same value as tags[1] today. */
  subtrack: string;
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

export const TRACKS: Track[] = (tracksData as any).tracks;
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

export function conceptsByTrack(track: TrackId): Concept[] {
  return CONCEPTS.filter(c => c.track === track);
}

// --- Tag-first taxonomy ----------------------------------------------------
// New mental model: concepts have tags[] + roadmaps[]. The 8 "tracks" are now
// just known top-level tags with display metadata. Use these helpers in new
// code; conceptsByTrack remains as a thin wrapper for unmigrated callers.

/** Tags that the UI knows about — gives them a color + icon + title. */
export const KNOWN_GROUP_TAGS: TrackId[] = TRACKS.map(t => t.id as TrackId);

/** Display metadata for a tag, if the UI knows about it. */
export function groupForTag(tag: string): Track | undefined {
  return TRACK_BY_ID[tag];
}

/** A concept's primary display group — first tag the UI knows about. */
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
