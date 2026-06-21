// Map learning docs → concept ids for FSRS updates after comprehension checks.

export const DOC_CONCEPT_MAP: Record<string, string[]> = {
  index: [],
  'db-roadmap': ['b-tree', 'wal'],
  'runtime-roadmap': [],
  'swe-landscape': [],
  'system-design': ['rate-limiting', 'caching', 'load-balancing', 'api-design'],
  'interview-prep': [],
  'ml-case-studies': ['rag', 'vector-similarity'],
};

export function conceptsForDoc(slug: string): string[] {
  return DOC_CONCEPT_MAP[slug] ?? [];
}

/** Map quiz/explain grade 0–100 → FSRS rating. */
export function gradeToFsrsRating(grade: number): 'again' | 'hard' | 'good' | 'easy' {
  if (grade >= 90) return 'easy';
  if (grade >= 75) return 'good';
  if (grade >= 55) return 'hard';
  return 'again';
}