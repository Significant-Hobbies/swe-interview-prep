## Why

The first case-library batch proves the structured practice loop, but it covers only eight prompts and has one public worked guide. Current 2026 interview-prep lists repeatedly converge on a small set of missing classics—video streaming, collaborative editing, notifications, crawling, caching, cloud storage, key-value storage, typeahead, ride sharing, ticketing, payments, and photo sharing—so these are the highest-leverage additions for broad interview readiness.

## What Changes

- Add twelve versioned, rubric-backed practice cases: video streaming, photo sharing, collaborative documents, notification delivery, web crawling, distributed cache, search autocomplete, cloud file storage, distributed key-value store, ride sharing, ticket booking, and payment processing.
- Give every case the existing six-stage closed-book flow, deterministic branches, failure injection, evidence rubric, stronger answer, common mistakes, follow-ups, and concept-local remediation.
- Publish six complete source-backed worked guides in the first editorial batch: video streaming, notification delivery, web crawling, cloud file storage, ride sharing, and ticket booking.
- Keep the other six cases practice-ready without emitting placeholder or thin public URLs; their guides remain a later editorial batch.
- Reorder and group the public hub by interview pattern so twenty cases are navigable without turning it into an unranked prompt dump.
- Expand generation and integrity tests so approval state, guide substance, primary sources, sitemap coverage, metadata, and Markdown mirrors remain enforced.

## Capabilities

### New Capabilities

- `popular-system-design-case-coverage`: Covers the selected twelve-case practice batch, six approved study guides, hub organization, publication quality, and discoverability requirements.

### Modified Capabilities

None. This change builds on the completed `add-system-design-case-library` implementation without changing its six-stage session, grading, or answer-visibility contracts.

## Impact

- Canonical content: `src/data/system-design-cases.ts` and its schema/catalog tests.
- Practice UI: case grouping and selection in `src/components/SystemDesignInterview.tsx`; no new route or session-state shape is expected.
- Public output: `public/system-design/`, sitemap, curriculum/agent catalogs, and generated navigation.
- Generator and tests: `scripts/generate-public-curriculum.mjs` plus publication and public-curriculum integrity tests.
- No database migration, new runtime dependency, API change, commit, deployment, or release.
