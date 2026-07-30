# Evidence-backed Verification

Claims, source provenance, executable checks, screenshots, diffs, test outputs, and acceptance criteria.

- Difficulty: core
- Tracks: Evaluation & AI Reliability

## Mental model

Verification turns an agent claim into inspectable evidence. Match each acceptance criterion to a source, command, artifact, or observed state and keep inference separate.



## Primary sources

- [RARR: Researching and Revising What Language Models Say, Using Language Models](https://arxiv.org/abs/2210.08726) (paper)
- [Enabling Large Language Models to Generate Text with Citations (ALCE)](https://arxiv.org/abs/2305.14627) (paper)
- [Google Testing Blog — Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html) (article)

## Practice

### Design exercise: Evidence-backed Verification

Claims, source provenance, executable checks, screenshots, diffs, test outputs, and acceptance criteria. Implement designOutline() returning non-empty values for: acceptanceCriteria, evidence, inferenceBoundary. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with acceptanceCriteria, evidence, inferenceBoundary plus an explicit failure mode or trade-off.

## Review prompts

- What separates evidence from an assertion when an agent reports "the tests pass"?

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Tracing & Replay](https://learn.significanthobbies.com/curriculum/concepts/tracing-replay.html)

## Related concepts

- [Tracing & Replay](https://learn.significanthobbies.com/curriculum/concepts/tracing-replay.html)
- [Human Review Systems](https://learn.significanthobbies.com/curriculum/concepts/human-review-systems.html)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
