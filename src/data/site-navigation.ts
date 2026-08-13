export interface SiteNavItem {
  id: string;
  to: string;
  label: string;
  reloadDocument?: boolean;
}

export interface BrowseNavItem extends SiteNavItem {
  /** Short description; counts can be appended by richer browse surfaces. */
  blurb: string;
  group: 'learn' | 'practice' | 'progress' | 'product';
  menu?: true;
}

export const PRIMARY_NAV_ITEMS: SiteNavItem[] = [
  { id: 'dashboard', to: '/dashboard', label: 'Dashboard' },
  { id: 'learn', to: '/learn', label: 'Learn' },
  { id: 'practice', to: '/practice', label: 'Practice' },
  { id: 'wars', to: '/wars', label: 'Wars' },
];

export const BROWSE_NAV_ITEMS: BrowseNavItem[] = [
  {
    id: 'curriculum',
    to: '/curriculum/',
    label: 'Curriculum',
    reloadDocument: true,
    blurb: 'Public tracks, roadmaps, and concept guides',
    group: 'learn',
    menu: true,
  },
  {
    id: 'system-design-cases',
    to: '/system-design/',
    label: 'System design cases',
    reloadDocument: true,
    blurb: 'Staged interview cases and worked guides',
    group: 'learn',
  },
  {
    id: 'sources',
    to: '/sources',
    label: 'Learning sources',
    blurb: 'News, projects, papers, and saved reading',
    group: 'learn',
    menu: true,
  },
  {
    id: 'library',
    to: '/library',
    label: 'Repository library',
    blurb: '12 embedded GitHub learning repositories',
    group: 'learn',
    menu: true,
  },
  {
    id: 'explore',
    to: '/explore',
    label: 'Explore all',
    blurb: 'Full roadmap catalog, no setup',
    group: 'learn',
  },
  {
    id: 'concepts',
    to: '/learn/all',
    label: 'All concepts',
    blurb: 'Search and filter by track',
    group: 'learn',
  },
  {
    id: 'drills',
    to: '/practice/all',
    label: 'All drills',
    blurb: 'Editorial reps and LeetCode stubs',
    group: 'practice',
  },
  {
    id: 'reviews',
    to: '/practice/all?tab=reviews',
    label: 'Reviews',
    blurb: 'FSRS recall queue',
    group: 'practice',
  },
  {
    id: 'docs',
    to: '/learning',
    label: 'Docs',
    blurb: 'Long-form roadmaps',
    group: 'learn',
  },
  {
    id: 'changelog',
    to: '/changelog',
    label: 'Changelog',
    blurb: 'Meaningful product releases',
    group: 'product',
    menu: true,
  },
  {
    id: 'build',
    to: '/build',
    label: 'Build Lab',
    blurb: 'Artifact scaffolds',
    group: 'practice',
  },
  {
    id: 'projects',
    to: '/progress/all',
    label: 'Projects',
    blurb: 'Shipped work log',
    group: 'progress',
    menu: true,
  },
  {
    id: 'notes',
    to: '/progress/all?tab=notes',
    label: 'Notes',
    blurb: 'Learning journal',
    group: 'progress',
    menu: true,
  },
  {
    id: 'mock',
    to: '/mock',
    label: 'Mock interviews',
    blurb: 'Technical, system-design, and behavioral rehearsal',
    group: 'practice',
  },
  {
    id: 'playground',
    to: '/playground',
    label: 'Playground',
    blurb: 'Code, diagram, and explain-back workspace',
    group: 'practice',
    menu: true,
  },
  {
    id: 'systems-labs',
    to: '/labs',
    label: 'Systems Labs',
    blurb: 'Deterministic infrastructure simulations',
    group: 'practice',
  },
];

export const BROWSE_NAV_GROUPS = [
  { id: 'learn', label: 'Learn' },
  { id: 'practice', label: 'Practice' },
  { id: 'progress', label: 'Progress' },
  { id: 'product', label: 'Product' },
] as const;

export const SITE_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...BROWSE_NAV_ITEMS];
