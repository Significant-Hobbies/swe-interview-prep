# Static & Dynamic Analysis

ASTs, control/data flow, abstract interpretation, symbolic execution, sanitizers, profiling, and runtime instrumentation.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Static analysis reasons over possible executions; dynamic analysis observes actual executions. Combining them trades breadth for concrete evidence.



## Primary sources

- [CodeQL Documentation](https://codeql.github.com/docs/) (doc)
- [Lessons from Building Static Analysis Tools at Google (CACM 2018)](https://research.google/pubs/lessons-from-building-static-analysis-tools-at-google/) (paper)
- [Easy Abstract Interpretation with SPARTA (Strange Loop 2019)](https://www.youtube.com/watch?v=_fA7vkVJhF8) (video)
- [Software Engineering at Google — Ch. 20: Static Analysis](https://abseil.io/resources/swe-book/html/ch20.html) (doc)
- [AddressSanitizer (Clang docs) — dynamic analysis](https://clang.llvm.org/docs/AddressSanitizer.html) (doc)

## Practice

### Design exercise: Static & Dynamic Analysis

ASTs, control/data flow, abstract interpretation, symbolic execution, sanitizers, profiling, and runtime instrumentation. Implement designOutline() returning non-empty values for: programModel, analysisRule, runtimeEvidence. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with programModel, analysisRule, runtimeEvidence plus an explicit failure mode or trade-off.

## Review prompts

- Static analysis has false positives and dynamic analysis has false negatives. Explain why each is structural, not a tool defect.

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Code Review Systems](https://learn.significanthobbies.com/curriculum/concepts/code-review-systems)

## Related concepts

- [Code Review Systems](https://learn.significanthobbies.com/curriculum/concepts/code-review-systems)
- [Testing Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/testing-infrastructure)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w)
