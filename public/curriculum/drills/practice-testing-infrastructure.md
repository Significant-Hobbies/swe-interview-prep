# Design exercise: Testing Infrastructure

> Unit, integration, contract, E2E, property, fuzz, hermetic environments, fixtures, sharding, and flaky-test control. Implement designOutline() returning non-empty values for: testBoundary, hermeticEnvironment, failureDiagnostics. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-testing-infrastructure

Unit, integration, contract, E2E, property, fuzz, hermetic environments, fixtures, sharding, and flaky-test control. Implement designOutline() returning non-empty values for: testBoundary, hermeticEnvironment, failureDiagnostics. Each value must name a concrete mechanism or decision.

## The mechanism

Testing infrastructure makes failures reproducible and cheap to diagnose. Layer tests by boundary, isolate dependencies, record seeds, and treat flakiness as a product defect.

## Expected evidence

A design outline with testBoundary, hermeticEnvironment, failureDiagnostics plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Bazel Test Encyclopedia](https://bazel.build/reference/test-encyclopedia)
- [John Hughes — Testing the Hard Stuff and Staying Sane](https://www.youtube.com/watch?v=zi0rHwfiX1Q)
- [Flaky Tests at Google and How We Mitigate Them](https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html)
- [libFuzzer — coverage-guided fuzz testing (LLVM)](https://llvm.org/docs/LibFuzzer.html)
- [Software Engineering at Google — Ch. 14: Larger Testing](https://abseil.io/resources/swe-book/html/ch14.html)
- [Study Testing Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/testing-infrastructure)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-testing-infrastructure)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
