# Fleet Learning Tour

This tour maps the genuine technical depth buried across fleet projects into a
navigable curriculum. The target audience is you — the person who built these
things — coming back after weeks away and wanting to re-derive *why* a choice
was made or trace a concept from first principles to deployed code. It is not
documentation for outsiders.

Each track is a thematic grouping of fleet projects that share a learning
thread. Within each track, every project entry is one section: a one-line
"what", a one-line "why it's interesting", and links to the project's canonical
reference docs (decisions, lessons, retros, external references). Nothing is
re-explained here that already has a home elsewhere.

The existing `TINYGPT_LEARNING_PATH.md` in this `docs/` directory covers the
ML-from-scratch curriculum in depth and integrates with the FSRS deck. This
tour is the wider map that puts TinyGPT in context alongside the rest of the
fleet.

## Tracks

| Track | Theme | Projects |
|-------|-------|----------|
| [ML / AI Internals](ml-track.md) | Model mechanics, inference infra, multi-LLM routing | tinygpt, researchPapers, high-signal, looptv, email-manager |
| [Systems / Non-standard Runtimes](systems-track.md) | Rust CLI, Rocket, Swift/SwiftUI, CF Durable Objects | port-whisperer, event-forecast, pace, free-ai |
| [Web Platform Deep Cuts](web-platform.md) | R3F + physics, vector DB on edge, browser extensions, MapLibre, DO + Containers | ai-game, starboard, reader, open-historia, saas-maker |

## FSRS integration

See [fsrs-deck-plan.md](fsrs-deck-plan.md) for a plan to surface decisions and
lessons as spaced-repetition cards inside this project's existing study UI.

## Navigation convention

All relative links in these tour files point to files that were verified to
exist at the time of writing (2026-06-13). Relative path root is
`swe-interview-prep/docs/learning-tour/`, so sibling fleet projects are three
`../` hops up to the fleet root, then into the target project.
