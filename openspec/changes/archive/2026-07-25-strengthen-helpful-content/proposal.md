## Why

The product now contains 222 concepts across 18 tracks, but most of that
curriculum is only discoverable inside the JavaScript application. The live
SEO audit reports incomplete metadata and thin crawlable content, so search
engines cannot reliably understand, index, or rank the depth and organization
of the learning OS.

## What Changes

- Generate crawlable, static curriculum pages from the canonical concepts,
  roadmaps, drills, reviews, artifacts, tracks, and coverage map.
- Publish a curriculum hub plus track, roadmap, and concept detail pages with
  useful explanations, internal navigation, canonical links, and structured
  data.
- Generate sitemap and machine-readable agent catalogs from the same source so
  all published surfaces stay synchronized.
- Strengthen homepage metadata, structured data, heading structure, and visible
  curriculum copy.
- Add integrity tests and a deterministic generation command.

## Capabilities

### New Capabilities

- `public-curriculum-discovery`: Helpful, crawlable curriculum publication for
  humans, search engines, and AI agents.

### Modified Capabilities

- None.

## Impact

- Adds a repository-local generator and generated files under `public/curriculum/`.
- Updates `index.html`, the public login experience, sitemap, `llms*.txt`,
  `index.md`, and `api-ai.json`.
- Extends build validation without adding production dependencies.
- Changes only public static discovery surfaces; authenticated learning state,
  APIs, database schema, and Socratic behavior remain unchanged.
