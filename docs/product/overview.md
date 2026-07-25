# Product Overview

**Product:** [learn.significanthobbies.com](https://learn.significanthobbies.com)
**Slug:** `swe-interview-prep`
**Status:** Personal-use, maintenance-only (see [`STATUS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md)).

## What it is

A single-platform SWE learning OS and interview prep product covering DSA,
low-level design (LLD), system design (HLD), and behavioral practice. It
combines Monaco coding, Excalidraw diagramming, multi-provider Socratic AI
hints, FSRS spaced repetition, LeetCode import, an embedded learning-library
reader, and progress tracking.

## Why it exists

Technical interview prep is fragmented across LeetCode (coding), Excalidraw
(diagrams), ChatGPT (hints), and Anki (spaced repetition). Switching tools
breaks flow and hides progress. This product consolidates the loop into one
workspace and closes it with spaced repetition: **Concept → Drill → Build →
Review → Apply**.

## Core principle

**No learning without an artifact.** Every concept maps to drills and an
artifact the user builds. The Playground (Monaco + Excalidraw + Socratic AI +
Feynman Gate) is the build/drill workspace.

## Primary tabs

The primary nav (`PRIMARY_NAV` in `src/components/Layout.tsx`) has six tabs
plus a Docs link:

| Tab | Role |
| --- | --- |
| Today | Home / daily session hub (the index route) |
| Learn | Roadmap journey + concepts across the tracks |
| Practice | Drills + spaced-repetition reviews |
| Mock | Timed mock interview |
| Playground | Monaco/Excalidraw build surface with Socratic AI companion |
| Progress | Mastery rollups + notes |

Detail pages (`/concepts/:id`, `/roadmaps/:id`, `/projects/:id`, `/drills/:id`)
are reachable from inside the tabs. `/today` and `/build` (BuildLab) are real
pages. Legacy routes redirect so external links keep working: `/dashboard` →
`/today`; `/roadmaps` → `/learn`; `/concepts` → `/learn/all`; `/drills` →
`/practice`; `/reviews`, `/review` → `/practice/all?tab=reviews`; `/projects`
→ `/progress/all`; `/notes` → `/progress/all?tab=notes`; `/vibe-learning` →
`/playground`. See `src/App.tsx`.

## Tracks

Eighteen learning tracks (`TRACKS` in `src/data/learning-os.ts`) preserve the
original Search/IR, mathematics, vector DB, AI, backend, databases, system
design, DSA, and product paths, then add Systems Foundations, Infrastructure &
Platforms, Distributed Systems, Inference & Serving, Agent Systems, AI
Reliability, Developer Tools & Code Intelligence, Application Engineering, and
Multimodal & Spatial Computing.

Concept content is static JSON in `src/data/concepts.json` (222 concepts). The
machine-readable contract mapping the requested eleven-domain taxonomy and its
96 named subtopics to concepts is `src/data/curriculum-coverage.json`.

## Public curriculum and SEO

The same canonical data generates a JavaScript-free publication layer at
[`/curriculum/`](https://learn.significanthobbies.com/curriculum/): one hub,
18 track pages, 24 roadmap pages, and 222 concept pages. Concept pages publish
the editorial explanation, mental model, primary resources, practice direction,
review prompts, and build criteria while keeping progress, notes, saved Reader
content, and review answers private.

`scripts/generate-public-curriculum.mjs` owns these generated surfaces,
`public/curriculum/catalog.md` and `catalog.json`, the curriculum sitemap
entries, and the public agent catalog counts. `pnpm build` runs the generator
before Vite so checked-in publication output cannot silently drift from the
learning data.

## Scope

**In scope:** DSA, LLD, HLD, systems and platform engineering, databases and
distributed systems, AI models/training/inference/agents/reliability, developer
tools, application engineering, multimodal/spatial systems, behavioral
practice, FSRS spaced repetition, multi-provider AI hints, LeetCode import,
embedded learning library, and personal learning sessions.

**Out of scope** (per the 2026-07-10 personal-use closure in
[`STATUS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md)): ATS/job-application features, paid
tiers, team workspaces, new backend providers, alternate auth modes, and any
roadmap expansion beyond maintenance and personally requested workflow fixes.

## Related docs

- [`surfaces.md`](surfaces.md) — routes and API surface inventory
- [`learning-library.md`](learning-library.md) — the embedded GitHub library feature
- [`../architecture/overview.md`](../architecture/overview.md) — how it's built
- [`../../README.md`](../../README.md) — public-facing README
