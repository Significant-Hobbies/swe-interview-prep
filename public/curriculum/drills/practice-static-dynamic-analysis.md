# Design exercise: Static & Dynamic Analysis

> ASTs, control/data flow, abstract interpretation, symbolic execution, sanitizers, profiling, and runtime instrumentation. Implement designOutline() returning non-empty values for: programModel, analysisRule, runtimeEvidence. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-static-dynamic-analysis

ASTs, control/data flow, abstract interpretation, symbolic execution, sanitizers, profiling, and runtime instrumentation. Implement designOutline() returning non-empty values for: programModel, analysisRule, runtimeEvidence. Each value must name a concrete mechanism or decision.

## The mechanism

Static analysis reasons over possible executions; dynamic analysis observes actual executions. Combining them trades breadth for concrete evidence.

## Expected evidence

A design outline with programModel, analysisRule, runtimeEvidence plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Lessons from Building Static Analysis Tools at Google (CACM 2018)](https://research.google/pubs/lessons-from-building-static-analysis-tools-at-google/)
- [Easy Abstract Interpretation with SPARTA (Strange Loop 2019)](https://www.youtube.com/watch?v=_fA7vkVJhF8)
- [Software Engineering at Google — Ch. 20: Static Analysis](https://abseil.io/resources/swe-book/html/ch20.html)
- [AddressSanitizer (Clang docs) — dynamic analysis](https://clang.llvm.org/docs/AddressSanitizer.html)
- [Study Static & Dynamic Analysis](https://learn.significanthobbies.com/curriculum/concepts/static-dynamic-analysis)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-static-dynamic-analysis)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
