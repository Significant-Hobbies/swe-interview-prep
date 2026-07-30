# Dependency & Blast-radius Analysis

Direct and transitive dependencies, affected targets, ownership, runtime consumers, schema impact, and change risk.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

Blast radius is the set of consumers whose behavior can change. Combine dependency graphs, runtime evidence, public contracts, ownership, and test selection.



## Primary sources

- [Bazel Query How-To](https://bazel.build/query/guide) (doc)
- [Build Systems à la Carte (ICFP 2018)](https://simon.peytonjones.org/build-systems-a-la-carte/) (paper)
- [Software Engineering at Google — Ch. 21: Dependency Management](https://abseil.io/resources/swe-book/html/ch21.html) (doc)
- [Software Engineering at Google — Ch. 22: Large-Scale Changes](https://abseil.io/resources/swe-book/html/ch22.html) (doc)

## Practice

### Design exercise: Dependency & Blast-radius Analysis

Direct and transitive dependencies, affected targets, ownership, runtime consumers, schema impact, and change risk. Implement designOutline() returning non-empty values for: dependencyGraph, affectedSet, riskPrioritization. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with dependencyGraph, affectedSet, riskPrioritization plus an explicit failure mode or trade-off.

## Review prompts

- Why is the static dependency graph an upper bound on blast radius, and what narrows it?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Codebase Graphs](https://learn.significanthobbies.com/curriculum/concepts/codebase-graphs.html)

## Related concepts

- [Codebase Graphs](https://learn.significanthobbies.com/curriculum/concepts/codebase-graphs.html)
- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence.html)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w.html)
