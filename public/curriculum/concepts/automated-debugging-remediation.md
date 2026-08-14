# Automated Debugging & Remediation

Failure reproduction, hypothesis generation, telemetry, fault localization, minimal patches, validation, rollback, and learning.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Automated remediation should reproduce first, narrow the causal surface, make the smallest patch, verify the original failure and nearby behavior, then preserve evidence.



## Primary sources

- [Delta Debugging](https://www.st.cs.uni-saarland.de/dd/) (doc)
- [Simplifying and Isolating Failure-Inducing Input (delta debugging, Zeller & Hildebrandt)](https://www.cs.columbia.edu/~junfeng/18sp-e6121/papers/delta-debug.pdf) (paper)
- [The Debugging Book — Statistical Debugging (fault localization)](https://www.debuggingbook.org/html/StatisticalDebugger.html) (doc)
- [The Debugging Book — Reducing Failure-Inducing Inputs](https://www.debuggingbook.org/html/DeltaDebugger.html) (doc)
- [program-repair.org — index of APR tools and benchmarks](https://program-repair.org/) (doc)

## Practice

### Design exercise: Automated Debugging & Remediation

Failure reproduction, hypothesis generation, telemetry, fault localization, minimal patches, validation, rollback, and learning. Implement designOutline() returning non-empty values for: reproduction, faultLocalization, patchVerification. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with reproduction, faultLocalization, patchVerification plus an explicit failure mode or trade-off.

## Review prompts

- Why must reproduction come before hypothesis generation in an automated repair loop?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Software Supply-chain Health](https://learn.significanthobbies.com/curriculum/concepts/software-supply-chain-health)

## Related concepts

- [Software Supply-chain Health](https://learn.significanthobbies.com/curriculum/concepts/software-supply-chain-health)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w)
