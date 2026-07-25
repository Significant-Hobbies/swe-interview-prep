## Context

The canonical curriculum lives in checked-in JSON and TypeScript data. The SPA
renders it well for active learners, but crawlers and visitors without
JavaScript see only a small homepage shell and a minimal agent brief. Existing
agent endpoints pass the fleet S-tier protocol checks, yet they describe only
the product shell rather than the curriculum.

The publication layer must not create a second editorial source of truth,
change authenticated routes, or add a runtime service.

## Goals / Non-Goals

**Goals:**

- Make all tracks, roadmaps, and concepts useful and readable without
  JavaScript or authentication.
- Keep public pages synchronized deterministically with canonical curriculum
  data.
- Give search and AI systems complete sitemap, catalog, metadata, and
  structured-data signals.
- Improve the visible homepage explanation for first-time human visitors.

**Non-Goals:**

- Server-side rendering the SPA.
- Publishing private progress, notes, Reader content, or answer keys.
- Replacing the interactive learning routes.
- Adding analytics, external services, or production dependencies.

## Decisions

1. **Generate a separate `/curriculum/` publication tree.** The generator
   writes one hub, 18 track pages, 24 roadmap pages, and 222 concept pages.
   Keeping these URLs separate avoids intercepting existing SPA routes such as
   `/concepts/:id`.

2. **Generate from canonical checked-in data.** Concepts, roadmaps, drills,
   reviews, artifacts, tracks, and the coverage map are inputs. Generated
   pages are never hand-edited and the generator is safe to rerun.

3. **Publish both HTML and machine-readable summaries.** Static HTML provides
   human and search-engine value; `catalog.md` and `catalog.json` give agents a
   compact inventory without forcing them to execute JavaScript.

4. **Use semantic HTML and per-page JSON-LD.** Concept pages use
   `LearningResource`, roadmap pages use `Course`, and collection pages use
   `CollectionPage`/`ItemList`. Every page has a title, description, canonical
   URL, Open Graph fields, one H1, section headings, and internal navigation.

5. **Regenerate discovery surfaces together.** The generator owns the
   curriculum entries in sitemap and updates public agent catalogs so count
   and URL drift is testable.

6. **Run generation before production builds.** Generated files remain
   checked in for review and direct hosting, while the build command verifies
   they can be reproduced.

## Risks / Trade-offs

- **Generated-file volume** → Keep HTML small, share one CSS file, and test
  exact page counts rather than reviewing each page manually.
- **Duplicate content with SPA routes** → Use unique `/curriculum/` canonicals
  and link interactive practice as a separate action.
- **Stale generated output** → Run generation during build and add integrity
  tests comparing output with source IDs.
- **Sitemap growth** → The resulting few hundred URLs remain well below
  sitemap limits and are directly tied to substantive pages.
- **Publishing sensitive material** → Publish editorial descriptions, mental
  models, resources, and review prompts only; exclude user state and private
  learning-source bodies.

## Migration Plan

1. Generate and validate the static publication tree locally.
2. Deploy alongside existing SPA assets; no database or API migration.
3. Smoke the hub, representative detail pages, sitemap, and agent catalog.
4. Roll back using the previous Cloudflare Pages deployment if discovery
   surfaces fail; interactive SPA routes are unchanged.

## Open Questions

None. The target is strong technical and on-page SEO for a content-rich
learning product, with agent catalogs retained as a complementary discovery
surface.
