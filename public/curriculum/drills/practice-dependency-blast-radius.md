# Design exercise: Dependency & Blast-radius Analysis

> Direct and transitive dependencies, affected targets, ownership, runtime consumers, schema impact, and change risk. Implement designOutline() returning non-empty values for: dependencyGraph, affectedSet, riskPrioritization. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-dependency-blast-radius

Direct and transitive dependencies, affected targets, ownership, runtime consumers, schema impact, and change risk. Implement designOutline() returning non-empty values for: dependencyGraph, affectedSet, riskPrioritization. Each value must name a concrete mechanism or decision.

## The mechanism

Blast radius is the set of consumers whose behavior can change. Combine dependency graphs, runtime evidence, public contracts, ownership, and test selection.

## Expected evidence

A design outline with dependencyGraph, affectedSet, riskPrioritization plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Bazel Query How-To](https://bazel.build/query/guide)
- [Build Systems à la Carte (ICFP 2018)](https://simon.peytonjones.org/build-systems-a-la-carte/)
- [Software Engineering at Google — Ch. 21: Dependency Management](https://abseil.io/resources/swe-book/html/ch21.html)
- [Software Engineering at Google — Ch. 22: Large-Scale Changes](https://abseil.io/resources/swe-book/html/ch22.html)
- [Study Dependency & Blast-radius Analysis](https://learn.significanthobbies.com/curriculum/concepts/dependency-blast-radius)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-dependency-blast-radius)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
