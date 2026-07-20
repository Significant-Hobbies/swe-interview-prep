export interface Section {
  id: string;
  title: string;
  content: string;
  children?: Section[];
}

export interface Exercise {
  id: string;
  type: 'qa' | 'mcq' | 'flashcard';
  question: string;
  answer: string;
  options?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
  qualityScore?: number;
  qualityTier?: 'low' | 'medium' | 'high';
  qualitySignals?: string[];
  sourcePath?: string;
  sourceSection?: string;
}

export interface ParsedRepo {
  sections: Section[];
  exercises: Exercise[];
  totalItems: number;
}

type RepoFormat = 'qa' | 'visual' | 'long-form' | 'code-heavy';

export interface RepoManifestEntry {
  id: string;
  name: string;
  source: string;
  sourceBaseUrl?: string;
  description: string;
  bestFor: string;
  whyIncluded: string;
  tags: string[];
  icon: string;
  format?: RepoFormat;
  sectionCount: number;
  exerciseCount: number;
  lastFetched: string;
}

export interface LibraryManifest {
  repos: RepoManifestEntry[];
  generatedAt: string;
}
