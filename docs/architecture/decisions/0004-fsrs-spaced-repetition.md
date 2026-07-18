# ADR 0004: FSRS spaced repetition for concept mastery

Date: 2026-04
Status: Accepted

## Context

The product's core thesis is "no learning without an artifact" and the loop
Concept → Drill → Build → Review → Apply. Forgetting curves destroy
unreviewed material; a spaced-repetition system had to track per-concept
mastery and decay it over time so the dashboard can surface the weakest
concept next.

## Decision

Use `ts-fsrs` (FSRS scheduling) with per-user per-concept state stored in the
`concept_mastery` Turso table. Confidence formula:
`(1 + elapsed/(9×stability))^-1`. Mastery decays over time. The Feynman Gate
grades explain-backs 0–100 and maps gaps onto `again`/`hard` FSRS ratings.

## Alternatives considered

- **SM-2 (Anki-style).** The earlier `user_progress` table used SM-2 columns
  (`ease`, `interval`, `repetitions`). FSRS is a better-calibrated successor
  and `ts-fsrs` is the canonical TS implementation.
- **Per-problem SR only.** Rejected: the loop is concept-level, not
  problem-level. Problems are drills that update concept mastery.

## Consequences

- Concept mastery is DB-backed and **requires Google sign-in**. Guests get
  localStorage for artifacts/drills/projects/notes but not FSRS reviews.
- The auto-tagger (`useTagger`) and Feynman Gate both feed into `concept_mastery`,
  so AI-graded depth and explain-backs both move mastery.
- The "next weakest concept" card on BuildLab is the visible closure of the
  loop.
