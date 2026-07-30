# Testing Infrastructure

Unit, integration, contract, E2E, property, fuzz, hermetic environments, fixtures, sharding, and flaky-test control.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Testing infrastructure makes failures reproducible and cheap to diagnose. Layer tests by boundary, isolate dependencies, record seeds, and treat flakiness as a product defect.



## Primary sources

- [Bazel Test Encyclopedia](https://bazel.build/reference/test-encyclopedia) (doc)
- [John Hughes — Testing the Hard Stuff and Staying Sane](https://www.youtube.com/watch?v=zi0rHwfiX1Q) (video)
- [Flaky Tests at Google and How We Mitigate Them](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html) (article)
- [libFuzzer — coverage-guided fuzz testing (LLVM)](https://llvm.org/docs/LibFuzzer.html) (doc)
- [Software Engineering at Google — Ch. 14: Larger Testing](https://abseil.io/resources/swe-book/html/ch14.html) (doc)

## Practice

### Design exercise: Testing Infrastructure

Unit, integration, contract, E2E, property, fuzz, hermetic environments, fixtures, sharding, and flaky-test control. Implement designOutline() returning non-empty values for: testBoundary, hermeticEnvironment, failureDiagnostics. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with testBoundary, hermeticEnvironment, failureDiagnostics plus an explicit failure mode or trade-off.

## Review prompts

- Why is a flaky test worse than a failing one?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Static & Dynamic Analysis](https://learn.significanthobbies.com/curriculum/concepts/static-dynamic-analysis.html)

## Related concepts

- [Static & Dynamic Analysis](https://learn.significanthobbies.com/curriculum/concepts/static-dynamic-analysis.html)
- [Codebase Graphs](https://learn.significanthobbies.com/curriculum/concepts/codebase-graphs.html)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w.html)
