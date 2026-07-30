# Tracing & Replay

Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution.

- Difficulty: core
- Tracks: Evaluation & AI Reliability

## Mental model

Replay requires capturing every non-deterministic dependency: model and prompt version, context, tool results, random seeds where available, and state transitions.



## Primary sources

- [Pivot Tracing: Dynamic Causal Monitoring for Distributed Systems (SOSP '15)](https://cs.brown.edu/~rfonseca/pubs/mace15pivot.pdf) (doc)
- [USENIX Enigma 2016 — Timeless Debugging](https://www.youtube.com/watch?v=eGl6kpSajag) (video)
- [Engineering Record And Replay For Deployability (USENIX ATC '17)](https://www.usenix.org/conference/atc17/technical-sessions/presentation/ocallahan) (paper)
- [The Debugging Book — Tracing Executions](https://www.debuggingbook.org/html/Tracer.html) (doc)
- [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/) (doc)

## Practice

### Design exercise: Tracing & Replay

Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution. Implement designOutline() returning non-empty values for: capturedInputs, versionPins, replayMode. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with capturedInputs, versionPins, replayMode plus an explicit failure mode or trade-off.

## Review prompts

- What must be captured for an agent run to be replayable, and which dependency is usually missed?

## Build evidence

- **Synthesize: Evaluation & AI Reliability** — Build an evidence-backed evaluation and observability system for models, tools, and agents. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability.html)

## Related concepts

- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability.html)
- [Evidence-backed Verification](https://learn.significanthobbies.com/curriculum/concepts/evidence-backed-verification.html)

## Learning paths

- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
