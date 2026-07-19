# ADR 0008: Embedded GitHub learning library

Date: 2026-02
Status: Accepted

## Context

Interview-prep content is scattered across dozens of GitHub repos. Sending
users out to browse them breaks the in-app loop. The original design doc is
archived at
[`library-embedded-repos-design.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/archive/plans/2026-02-17-library-embedded-repos-design.md).

## Decision

Embed maintained open-source repositories into the app via a `/library` route
with repo-specific adapters that parse each repo's structure into normalized
content. Content is pre-processed at build time by `scripts/fetch-library.mjs`
into `src/data/library/`, lazy-loaded per repo, and presented in two modes:
Read (markdown browser) + Practice (extracted Q&A, MCQs, flashcards). V1
shipped 12 repos; the inclusion standard and current list live in
[`../../product/learning-library.md`](../../product/learning-library.md).

## Alternatives considered

- **Link out to repos.** Rejected: breaks the loop and the in-app review
  integration.
- **Hand-curated content.** Rejected: too much editorial overhead; the
  generator + inclusion standard is maintainable.

## Consequences

- Generated content under `src/data/library/` must only be changed through
  the config (`scripts/library.config.json`) or generator
  (`scripts/fetch-library.mjs`) — never hand-edited.
- A weekly GitHub Actions job refreshes the library on Mondays 06:00 UTC
  (see [`../../operations/jobs/library-refresh.md`](../../operations/jobs/library-refresh.md)).
- A failed or empty upstream parse retains the previous generated source
  instead of silently dropping it.
