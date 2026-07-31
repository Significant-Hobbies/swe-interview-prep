---
target: Systems Lab catalog and runner
total_score: 33
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
timestamp: 2026-07-31T02-15-42Z
slug: src-pages-systemslabrunner-tsx
---
# Systems Lab design critique

## Design-specificity verdict

The Systems Lab is strongly product-specific. Prediction freezing, deterministic
transitions, actor-owned evidence, configuration repair, and explain-back form a
coherent learning mechanism rather than a generic dashboard. The surface also
preserves the Engineering Workbench language: low-glare black, restrained
signals, compact state labels, and evidence-first hierarchy.

## Heuristic score

| Heuristic | Score | Finding |
| --- | ---: | --- |
| System visibility | 3/4 | Stage and state feedback are strong; the long page has no persistent whole-flow orientation. |
| Real-world match | 4/4 | Mechanism-specific language and independent truth planes are excellent. |
| User control | 3/4 | Step, finish, reset, retry, and replay controls are strong. |
| Consistency | 4/4 | Faithful to the tracked Engineering Workbench system. |
| Error prevention | 4/4 | Prediction and configuration gates prevent accidental progress. |
| Recognition | 3/4 | Distant stages require recalling relationships across a long page. |
| Efficiency | 3/4 | Multiple execution modes help, but replay sharing interrupts the core sequence. |
| Minimalism | 3/4 | Visually restrained, structurally long. |
| Error recovery | 3/4 | Retry, stale-attempt, and replay feedback are explicit. |
| Help and documentation | 3/4 | Context and provenance are strong; fidelity labels become clear late. |
| **Total** | **33/40** | **Pass** |

## Priority issues

- P0: none.
- P1: none.
- P2: The six-stage loop lacks persistent orientation, and replay sharing sits
  between execution and evidence inspection.
- P2: The selected evidence state needed a programmatic selected state and an
  announced detail update. This was resolved during polish.
- P2: Catalog progress counted attempts instead of unique completed scenarios.
  This was resolved during polish.
- P3: Fidelity labels such as source verified are precise but explained only
  in the later provenance section.

## Positive findings

- Responsive hierarchy remains clear at 390, 768, and 1440 pixels with no
  horizontal overflow.
- Prediction, configuration, execution, evidence, and explanation remain
  distinct without collapsing independent system states.
- Semantic color is scarce and always paired with text.
- Principal controls meet the 44-pixel target and use visible focus styling.
- Copy is explicit about safety, causality, mastery gates, and observation-only
  replay.

## Questions

- Would a compact sticky stage summary improve orientation enough to justify
  adding chrome to this deliberately focused workbench?
- Should replay sharing move after evidence inspection in a future refinement,
  or is reproducibility intentionally part of the execution stage?
