# Design exercise: Tracing & Replay

> Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution. Implement designOutline() returning non-empty values for: capturedInputs, versionPins, replayMode. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-tracing-replay

Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution. Implement designOutline() returning non-empty values for: capturedInputs, versionPins, replayMode. Each value must name a concrete mechanism or decision.

## The mechanism

Replay requires capturing every non-deterministic dependency: model and prompt version, context, tool results, random seeds where available, and state transitions.

## Expected evidence

A design outline with capturedInputs, versionPins, replayMode plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Pivot Tracing: Dynamic Causal Monitoring for Distributed Systems (SOSP '15)](https://cs.brown.edu/~rfonseca/pubs/mace15pivot.pdf)
- [USENIX Enigma 2016 — Timeless Debugging](https://www.youtube.com/watch?v=eGl6kpSajag)
- [Engineering Record And Replay For Deployability (USENIX ATC '17)](https://www.usenix.org/conference/atc17/technical-sessions/presentation/ocallahan)
- [The Debugging Book — Tracing Executions](https://www.debuggingbook.org/html/Tracer.html)
- [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Study Tracing & Replay](https://learn.significanthobbies.com/curriculum/concepts/tracing-replay)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-tracing-replay)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
