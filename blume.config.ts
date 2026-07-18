import { defineConfig } from 'blume';

/**
 * Blume configuration for the swe-interview-prep documentation site.
 *
 * Blume is ONLY the presentation and search layer. The committed Markdown
 * under docs/ is the source of truth; this config renders it. Generated
 * runtime files (.blume/, .blume-verify/) and output (dist-docs/) are
 * gitignored.
 *
 * docs/learning/ is excluded because it is product content: the SPA
 * Vite-globs those files at build time and serves them at /learning/:slug.
 * Publishing them again here would duplicate the canonical serving path.
 * docs/archive/ is excluded from the published site because it is
 * historical reference material, not current documentation.
 *
 * To preview locally:  pnpm add -D blume  &&  pnpm docs:build
 */
export default defineConfig({
  title: 'SWE Interview Prep — Docs',
  description:
    'SWE learning OS with FSRS spaced repetition, drills, and feedback. Architecture, decisions, development, and operations docs.',
  content: {
    root: 'docs',
    exclude: ['**/_*', '**/.*', 'learning/**', 'archive/**'],
  },
  deployment: {
    output: 'static',
    site: 'https://docs.significanthobbies.com',
  },
  ai: {
    llmsTxt: true,
  },
  seo: {
    og: { enabled: true },
    sitemap: true,
    robots: true,
    structuredData: true,
  },
});
