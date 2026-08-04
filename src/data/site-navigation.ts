export interface SiteNavItem {
  id: string;
  to: string;
  label: string;
  reloadDocument?: boolean;
}

export interface BrowseNavItem extends SiteNavItem {
  /** Short description; counts can be appended by richer browse surfaces. */
  blurb: string;
}

export const PRIMARY_NAV_ITEMS: SiteNavItem[] = [
  { id: 'today', to: '/today', label: 'Today' },
  { id: 'learn', to: '/learn', label: 'Learn' },
  { id: 'practice', to: '/practice', label: 'Practice' },
  { id: 'mock', to: '/mock', label: 'Mock' },
  { id: 'playground', to: '/playground', label: 'Playground' },
  { id: 'progress', to: '/progress', label: 'Progress' },
];

export const BROWSE_NAV_ITEMS: BrowseNavItem[] = [
  {
    id: 'curriculum',
    to: '/curriculum/',
    label: 'Curriculum',
    reloadDocument: true,
    blurb: 'Public tracks, roadmaps, and concept guides',
  },
  {
    id: 'system-design-cases',
    to: '/system-design/',
    label: 'System design cases',
    reloadDocument: true,
    blurb: 'Staged interview cases and worked guides',
  },
  {
    id: 'sources',
    to: '/sources',
    label: 'Learning sources',
    blurb: 'News, projects, papers, and saved reading',
  },
  {
    id: 'library',
    to: '/library',
    label: 'Repository library',
    blurb: '12 embedded GitHub learning repositories',
  },
  {
    id: 'explore',
    to: '/explore',
    label: 'Explore all',
    blurb: 'Full roadmap catalog, no setup',
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
    blurb: 'Editorial reps and LeetCode stubs',
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
    id: 'changelog',
    to: '/changelog',
    label: 'Changelog',
    blurb: 'Meaningful product releases',
  },
  {
    id: 'build',
    to: '/build',
    label: 'Build Lab',
    blurb: 'Artifact scaffolds',
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
];

export const SITE_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...BROWSE_NAV_ITEMS];
