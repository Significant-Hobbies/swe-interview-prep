## Context

The app renders tracks from `TRACKS`, concepts and practice relationships from
static JSON, and roadmap groups from `src/lib/roadmapGroups.ts`. Mastery and
FSRS state are keyed by concept ID, so IDs are the compatibility boundary.
Every known track must own at least three concepts, every concept must link an
editorial drill and review question, and roadmap references are integrity
checked.

The requested taxonomy contains 96 named subtopics across eleven domains.
Search/IR, mathematics, vector databases, DSA, product, backend, databases,
system design, and the existing AI concepts remain valuable and must not be
collapsed merely to make the top-level counts match.

## Goals / Non-Goals

**Goals:**

- Make every requested subtopic traceable to one or more concept IDs.
- Give missing high-level domains explicit tracks and selectable roadmaps.
- Reuse and reclassify existing concepts instead of creating synonyms.
- Ensure every new concept participates in drills, reviews, concept packs, and
  at least one roadmap.
- Preserve all existing IDs and saved learning state.
- Keep future coverage auditable through a machine-readable matrix and tests.

**Non-Goals:**

- Replacing the nine existing tracks or rewriting their content.
- Teaching every subfield to research-specialist depth in one change.
- Adding runtime dependencies, APIs, storage, auth, or deployment behavior.
- Moving or renaming `docs/learning/*.md`.
- Generating article bodies or copying external source material.

## Decisions

### Add nine tracks instead of replacing the current taxonomy

Add `systems-foundations`, `infrastructure-platforms`,
`distributed-systems`, `inference-serving`, `agent-systems`,
`ai-reliability`, `developer-tools`, `application-engineering`, and
`multimodal-spatial`.

The existing `databases`, `ai-systems`, `backend`, `system-design`, and
`product` tracks continue to cover the remaining requested categories.
Search/IR, vector DB, mathematics, and DSA remain first-class because they are
already deep, personally useful curricula.

Alternative considered: replace the existing tracks with exactly eleven.
Rejected because it would make saved mastery groupings drift, flatten strong
specialist paths, and force unrelated subjects into broad buckets.

### Reclassify existing concepts by primary tag, preserving secondary tags

Where an existing concept is the canonical lesson for a requested domain, its
new track becomes `tags[0]` and the old group remains in `tags`. Concept IDs,
prerequisites, drills, review questions, and artifacts remain unchanged.

Alternative considered: duplicate concepts under each new track. Rejected
because duplicate FSRS cards and mastery records would teach the same thing
twice.

### Use a machine-readable coverage matrix

Add `src/data/curriculum-coverage.json` with all eleven requested categories,
their named subtopics, and the concept IDs that satisfy each subtopic. Tests
will require every mapped concept to exist and every topic to have coverage.

This file is the taxonomy contract; prose docs summarize it but do not
duplicate every mapping.

### Add an idempotent editorial expansion script

Add `scripts/expand-learning-domains.mjs` containing the curated new concept,
drill, review-question, artifact, roadmap, reclassification, and coverage
definitions. The script merges by stable ID, sorts only appended material, and
fails on conflicting existing definitions. It can be rerun without duplicates.

This is preferable to hand-editing several thousand JSON lines independently,
because cross-file IDs are generated from one reviewed registry and existing
integrity tests remain authoritative.

### One roadmap and synthesis artifact per new track

Each new roadmap uses a 12-week horizon with three milestones:
foundations, production mechanisms, and verification/synthesis. Each finishes
with a capstone artifact that requires measurable success criteria rather than
passive reading.

The existing AI Systems track also receives a dedicated AI Models & Training
roadmap. Its sequence runs model foundations → pre-training and fine-tuning →
post-training and evaluation, closing a gap that a survey-only grouping would
leave unresolved.

### Keep resources concise and canonical

Every new concept receives at least one primary official, course, paper, or
widely accepted engineering source. The existing concept-pack generator adds
the linked problem and explain-back prompt; unavailable media slots remain
honest gaps.

## Risks / Trade-offs

- **Track count grows from 9 to 18** → Group roadmaps into scannable curriculum
  families and rely on existing searchable catalog navigation.
- **A broad expansion can become shallow** → Require a drill, review prompt,
  roadmap placement, canonical resource, and synthesis artifact for every new
  concept.
- **Primary-tag changes alter track rollups** → Preserve concept IDs and old
  tags; only grouping changes, not mastery data.
- **Generated data can drift from the registry** → Make the expansion script
  idempotent and add explicit coverage and cross-file tests.
- **External links can age** → Prefer stable official/course/paper URLs and
  keep normal documentation link-audit practices.

## Migration Plan

1. Add tracks and the curated expansion registry.
2. Run the registry script once to merge concepts, drills, review questions,
   artifacts, roadmaps, and the coverage matrix.
3. Regenerate concept packs with the existing pipeline.
4. Update roadmap groups and canonical documentation.
5. Run focused taxonomy tests, docs validation, typecheck, and build.

Rollback is a normal source revert. No persisted concept IDs are removed and no
data migration is required.

## Open Questions

None. The user explicitly delegated track-versus-augmentation judgment, and
the additive approach preserves current learning investments.
