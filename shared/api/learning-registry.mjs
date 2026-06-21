/**
 * Canonical learning API surface — single source of truth for action names.
 * Local (api/learning.mjs) and production (functions/api) must stay in sync.
 */

/** BYOK / heuristic — no Turso auth required. */
export const PUBLIC_ACTIONS = ['gaps', 'critique', 'understanding', 'tag'];

/** Signed-in user required. */
export const AUTH_ACTIONS = [
  'activity',
  'concepts',
  'feynman',
  'weekly',
  'artifacts',
  'drills',
  'projects',
  'notes',
  'profile',
  'review-mastery',
  'elo',
  'imported-reviews',
];

export const LEARNING_ACTIONS = [...new Set([...PUBLIC_ACTIONS, ...AUTH_ACTIONS])].sort();

/** Actions routed through handlers/*.mjs (Express-style). */
export const HANDLER_MODULES = {
  activity: () => import('../../handlers/activity.mjs'),
  concepts: () => import('../../handlers/concepts.mjs'),
  tag: () => import('../../handlers/tag.mjs'),
  feynman: () => import('../../handlers/feynman.mjs'),
  weekly: () => import('../../handlers/weekly.mjs'),
  artifacts: () => import('../../handlers/artifacts.mjs'),
  drills: () => import('../../handlers/drills.mjs'),
  projects: () => import('../../handlers/projects.mjs'),
  notes: () => import('../../handlers/learning-notes.mjs'),
  gaps: () => import('../../handlers/gaps.mjs'),
  critique: () => import('../../handlers/critique.mjs'),
  understanding: () => import('../../handlers/understanding-check.mjs'),
  profile: () => import('../../handlers/profile.mjs'),
  'review-mastery': () => import('../../handlers/review-mastery.mjs'),
  elo: () => import('../../handlers/elo.mjs'),
  'imported-reviews': () => import('../../handlers/imported-reviews.mjs'),
};

