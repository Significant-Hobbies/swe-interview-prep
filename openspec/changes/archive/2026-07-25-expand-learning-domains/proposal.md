## Why

The learning OS has deep search, database, runtime, backend, and interview
content, but the user's target curriculum spans eleven broader systems and
AI-native domains. Several of those domains are currently only survey links or
project references, so they cannot be selected as coherent paths or practiced
through the Concept → Drill → Build → Review → Apply loop.

## What Changes

- Add nine additive learning tracks: Systems Foundations, Infrastructure &
  Platforms, Distributed Systems, Inference & Serving, Agent Systems, AI
  Reliability, Developer Tools & Code Intelligence, Application Engineering,
  and Multimodal & Spatial Computing.
- Preserve every existing track ID and concept ID so saved mastery, review
  schedules, routes, and links remain valid.
- Reclassify existing concepts into the new tracks when they already teach the
  requested subject, retaining their previous domain tags as secondary tags.
- Add concepts for the requested subtopics that are not currently taught,
  including Temporal workflows, OpenTelemetry, infrastructure automation,
  inference optimization, agent memory and durable execution, tool-use and
  coding-agent evaluation, repository intelligence, mobile/voice engineering,
  and robotics/spatial interfaces.
- Give every added concept an editorial drill, review question, curated
  starting resource, and generated concept pack.
- Add one sequenced roadmap and one synthesis artifact for each new track,
  plus a dedicated AI Models & Training path within the existing AI track.
- Update learning navigation and canonical documentation so the expanded
  curriculum is discoverable and its scope is accurately described.
- Add taxonomy coverage assertions preventing these domains from silently
  regressing.

## Capabilities

### New Capabilities

- `expanded-learning-domains`: A backward-compatible, drill-backed curriculum
  covering the eleven requested systems, AI, developer-tooling, application,
  and multimodal domains.

### Modified Capabilities

None. This repository has no existing OpenSpec capabilities.

## Impact

- Curriculum data: `src/data/learning-os.ts`, `concepts.json`, `drills.json`,
  `review-questions.json`, `artifacts.json`, `roadmaps.json`, and generated
  `concept-packs.json`.
- Navigation and grouping: roadmap grouping and learning-page counts/copy.
- Tests: taxonomy integrity and explicit requested-domain coverage.
- Documentation: product overview, learning index, project status, and the
  durable learning notes.
- No API, database schema, authentication, dependency, or deployment changes.
