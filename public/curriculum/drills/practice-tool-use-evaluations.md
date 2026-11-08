# Design exercise: Tool-use Evaluations

> Tool selection, argument correctness, sequencing, recovery, side-effect safety, and end-state verification. Implement designOutline() returning non-empty values for: toolChoice, trajectory, endState. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-tool-use-evaluations

Tool selection, argument correctness, sequencing, recovery, side-effect safety, and end-state verification. Implement designOutline() returning non-empty values for: toolChoice, trajectory, endState. Each value must name a concrete mechanism or decision.

## The mechanism

Tool-use evals grade the entire trajectory: correct tool, valid arguments, efficient sequence, safe handling of errors, and verified final state. Scope: this card owns grading the TRAJECTORY — tool choice, argument correctness, sequencing, error recovery, and verified end state. Grading the final text is `llm-evals`; the SWE-bench-style environment-plus-verifier setup is `coding-agent-benchmarks`.

## Expected evidence

A design outline with toolChoice, trajectory, endState plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [τ-bench: A Benchmark for Tool-Agent-User Interaction](https://arxiv.org/abs/2406.12045)
- [Study Tool-use Evaluations](https://learn.significanthobbies.com/curriculum/concepts/tool-use-evaluations)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-tool-use-evaluations)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
