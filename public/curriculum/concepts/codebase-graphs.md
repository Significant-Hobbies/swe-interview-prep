# Codebase Graphs

Symbols, references, calls, imports, ownership, data flow, build targets, and graph queries over repositories.

- Difficulty: core
- Tracks: Developer Tools & Code Intelligence

## Mental model

A codebase graph converts files into typed relationships. The value comes from stable symbol identity, precise edges, incremental updates, and queries tied to developer decisions.



## Primary sources

- [SCIP Code Intelligence Protocol](https://github.com/sourcegraph/scip) (doc)
- [SCIP — a better code indexing format than LSIF (Sourcegraph)](https://sourcegraph.com/blog/announcing-scip) (article)
- [LSIF Specification 0.6.0](https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/) (doc)
- [Introducing stack graphs (GitHub Engineering)](https://github.blog/open-source/introducing-stack-graphs/) (article)
- [Glean — Meta's code-fact database (Angle queries)](https://glean.software/docs/introduction/) (doc)

## Practice

### Design exercise: Codebase Graphs

Symbols, references, calls, imports, ownership, data flow, build targets, and graph queries over repositories. Implement designOutline() returning non-empty values for: nodeIdentity, edgeTypes, incrementalUpdate. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with nodeIdentity, edgeTypes, incrementalUpdate plus an explicit failure mode or trade-off.

## Review prompts

- Why is stable symbol identity the hard part of a codebase graph, rather than parsing?

## Build evidence

- **Synthesize: Developer Tools & Code Intelligence** — Build repository-aware tools that analyze, test, review, debug, and safely remediate code. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Testing Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/testing-infrastructure.html)

## Related concepts

- [Testing Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/testing-infrastructure.html)
- [Dependency & Blast-radius Analysis](https://learn.significanthobbies.com/curriculum/concepts/dependency-blast-radius.html)

## Learning paths

- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w.html)
