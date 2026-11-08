# Design exercise: Automated Debugging & Remediation

> Failure reproduction, hypothesis generation, telemetry, fault localization, minimal patches, validation, rollback, and learning. Implement designOutline() returning non-empty values for: reproduction, faultLocalization, patchVerification. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-automated-debugging-remediation

Failure reproduction, hypothesis generation, telemetry, fault localization, minimal patches, validation, rollback, and learning. Implement designOutline() returning non-empty values for: reproduction, faultLocalization, patchVerification. Each value must name a concrete mechanism or decision.

## The mechanism

Automated remediation should reproduce first, narrow the causal surface, make the smallest patch, verify the original failure and nearby behavior, then preserve evidence.

## Expected evidence

A design outline with reproduction, faultLocalization, patchVerification plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Delta Debugging](https://www.st.cs.uni-saarland.de/dd/)
- [Simplifying and Isolating Failure-Inducing Input (delta debugging, Zeller & Hildebrandt)](https://www.cs.columbia.edu/~junfeng/18sp-e6121/papers/delta-debug.pdf)
- [The Debugging Book — Statistical Debugging (fault localization)](https://www.debuggingbook.org/html/StatisticalDebugger.html)
- [The Debugging Book — Reducing Failure-Inducing Inputs](https://www.debuggingbook.org/html/DeltaDebugger.html)
- [program-repair.org — index of APR tools and benchmarks](https://program-repair.org/)
- [Study Automated Debugging & Remediation](https://learn.significanthobbies.com/curriculum/concepts/automated-debugging-remediation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-automated-debugging-remediation)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
