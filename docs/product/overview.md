# Product Overview

**Product:** [learn.significanthobbies.com](https://learn.significanthobbies.com)
**Slug:** `swe-interview-prep`
**Status:** Personal-use, maintenance-only (see [`STATUS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md)).

## What it is

A single-platform SWE learning OS and interview prep product covering DSA,
low-level design (LLD), system design (HLD), and behavioral practice. It
combines Monaco coding, Excalidraw diagramming, multi-provider Socratic AI
hints, deterministic systems simulations, FSRS spaced repetition, LeetCode
import, an embedded learning-library reader, and progress tracking.

Software Wars is the competitive diagnostic layer: a learner plays a short
objective Blitz battle or a solo or matched open-ended Tradeoff battle, receives
concept-level remediation, and returns to the same learning and FSRS loop.

## Why it exists

Technical interview prep is fragmented across LeetCode (coding), Excalidraw
(diagrams), ChatGPT (hints), and Anki (spaced repetition). Switching tools
breaks flow and hides progress. This product consolidates the loop into one
workspace and closes it with spaced repetition: **Concept → Drill → Build →
Review → Apply**.

## Core principle

**No learning without an artifact.** Every concept maps to drills and an
artifact the user builds. The Playground (Monaco + Excalidraw + Socratic AI +
Feynman Gate) is the build/drill workspace. Systems Lab adds a second kind of
artifact: a repaired infrastructure configuration plus a frozen prediction,
actor-owned evidence, and a causal explain-back.

## Primary destinations

The canonical navigation model in `src/data/site-navigation.ts` exposes four
learner intents. Secondary tools remain directly addressable, but discovery is
grouped under the relevant intent instead of presenting every capability as a
peer destination:

| Tab | Role |
| --- | --- |
| Dashboard | Resume recent work; see current and next learning/practice; discover available paths |
| Learn | Searchable high-level entry to concepts and learning paths |
| Practice | The Playground workspace with a selector over the complete problem inventory |
| Wars | One-minute MCQ battles and thirty-minute solo or matched engineering battles |

Dashboard resumes the learner's current loop. Learn stays deliberately
high-level, but its search and browse-all destinations cover every canonical
concept and roadmap. Practice opens directly into the Playground and keeps the
complete problem catalogue one interaction away. Wars makes the duration
choice explicit before exposing ratings, history, leaderboards, and
operational detail. Active battles and workspaces use a focused shell that
keeps account access and an exit while suppressing unrelated chrome.

Detail pages (`/concepts/:id`, `/roadmaps/:id`, `/projects/:id`, `/drills/:id`)
remain reachable through contextual hubs and Browse. `/mock`, `/playground`,
`/build`, `/labs`, `/progress`, and `/wars` remain real pages with stable deep
links. Legacy routes redirect so external links keep working: `/today` →
`/dashboard`; `/roadmaps` → `/learn`; `/concepts` → `/learn/all`; `/drills` →
`/practice/all`; `/reviews`, `/review` → `/practice/all?tab=reviews`; `/projects`
→ `/progress/all`; `/notes` → `/progress/all?tab=notes`; `/vibe-learning` →
`/playground`. See `src/App.tsx`.

No simplification is allowed to make canonical learning or practice content
search-only or unreachable. The complete catalogues, stable detail routes,
public curriculum, and generated data remain portable independently of the
four entry surfaces.

Guest Wars battles are local and explicitly unranked. Solo Tradeoff runs the
same 30-minute problem, twist, reveal, debate, and review loop against an AI
opponent using a learner-provided OpenAI-compatible key. The browser calls the
selected provider directly; the key and AI session are held in tab memory and
discarded on reload. Its artifact surface reuses the Playground's controlled
Monaco and Excalidraw tools, keeping notes, code, and diagrams together while
making all three read-only at the freeze boundary. Competitive ratings, ranked
answers, deadlines, challenge state, and live Tradeoff phases remain
server-owned. Signup is therefore an upgrade for durable state, not a play gate.

## Tracks

Nineteen learning tracks (`TRACKS` in `src/data/learning-os.ts`) preserve the
original Search/IR, mathematics, vector DB, AI, backend, databases, system
design, DSA, and product paths, then add Systems Foundations, Infrastructure &
Platforms, Distributed Systems, Inference & Serving, Agent Systems, AI
Reliability, Developer Tools & Code Intelligence, Application Engineering, and
Multimodal & Spatial Computing.

Concept content is static JSON in `src/data/concepts.json` (259 concepts). The
machine-readable contract mapping the requested eleven-domain taxonomy and its
96 named subtopics to concepts is `src/data/curriculum-coverage.json`.

Agent Systems includes a dedicated seven-build Harness Engineering roadmap,
from scoped repository instructions and reproducible environments through
durable handoffs, independent verification, lifecycle control, and measured
maker-checker automation. The structured system-design catalog contains 33
interactive cases; the additional classic batch closes gaps in IDs,
geospatial/presence/routing, queues and metrics, streaming analytics,
reservations and email, object storage, leaderboards, wallets, and exchange
matching.

## Public curriculum and SEO

The same canonical data generates a JavaScript-free publication layer at
[`/curriculum/`](https://learn.significanthobbies.com/curriculum/): one hub,
19 track pages, 26 roadmap pages, and 259 concept pages. Concept pages publish
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
practice, deterministic systems simulations, FSRS spaced repetition,
multi-provider AI hints, LeetCode import, embedded learning library, and
personal learning sessions.

The personally requested Software Wars expansion adds source-backed Blitz
battles, solo and scheduled Tradeoff battles, distinct ratings, managed
two-person media, sanitized result sharing, and concept remediation. It does
not add payments, recruiter tooling, tournaments, or unrestricted generated
ranked content.

The checked-in server-only ranked bank contains 1,200 independently audited,
active questions across 12 backend and systems topics. Every question has a
canonical primary Learn concept, four option-specific explanations, and
authoritative source metadata. The validator enforces the exact topic and
difficulty distribution, source breadth, answer-position balance, editorial
reuse checks, and complete coverage by three fixed AI profiles (3,600 stored
answers), so matches perform no model inference.

**Out of scope** (per the 2026-07-10 personal-use closure in
[`STATUS.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md)): ATS/job-application features, paid
tiers, team workspaces, new backend providers, alternate auth modes, and any
roadmap expansion beyond maintenance and personally requested workflow fixes.

## Related docs

- [`surfaces.md`](surfaces.md) — routes and API surface inventory
- [`learning-library.md`](learning-library.md) — the embedded GitHub library feature
- [`systems-lab.md`](systems-lab.md) — safe simulation boundary and learning contract
- [`../learning/harness-engineering.md`](../learning/harness-engineering.md) — the seven-build agent-harness path
- [`../knowledge/curriculum-coverage-sources.md`](../knowledge/curriculum-coverage-sources.md) — external coverage audits and native-content boundary
- [`../architecture/overview.md`](../architecture/overview.md) — how it's built
- [`../../README.md`](../../README.md) — public-facing README
