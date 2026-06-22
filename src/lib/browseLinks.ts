export interface BrowseDestination {
  id: string;
  to: string;
  label: string;
  /** Short description; counts appended in the UI when available. */
  blurb: string;
}

export const BROWSE_DESTINATIONS: BrowseDestination[] = [
  {
    id: 'explore',
    to: '/explore',
    label: 'Explore all',
    blurb: 'Full catalog — 14 roadmaps, no setup',
  },
  {
    id: 'concepts',
    to: '/learn/all',
    label: 'All concepts',
    blurb: 'Search and filter by track',
  },
  {
    id: 'drills',
    to: '/practice/all',
    label: 'All drills',
    blurb: 'Editorial reps + LeetCode stubs',
  },
  {
    id: 'reviews',
    to: '/practice/all?tab=reviews',
    label: 'Reviews',
    blurb: 'FSRS recall queue',
  },
  {
    id: 'docs',
    to: '/learning',
    label: 'Docs',
    blurb: 'Long-form roadmaps',
  },
  {
    id: 'build',
    to: '/build',
    label: 'Build Lab',
    blurb: 'Artifact scaffolds',
  },
  {
    id: 'playground',
    to: '/playground',
    label: 'Playground',
    blurb: 'Monaco + diagrams',
  },
  {
    id: 'projects',
    to: '/progress/all',
    label: 'Projects',
    blurb: 'Shipped work log',
  },
  {
    id: 'notes',
    to: '/progress/all?tab=notes',
    label: 'Notes',
    blurb: 'Learning journal',
  },
  {
    id: 'mock',
    to: '/mock',
    label: 'Mock',
    blurb: 'Timed interview reps',
  },
];