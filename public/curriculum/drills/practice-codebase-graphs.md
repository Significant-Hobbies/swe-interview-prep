# Design exercise: Codebase Graphs

> Symbols, references, calls, imports, ownership, data flow, build targets, and graph queries over repositories. Implement designOutline() returning non-empty values for: nodeIdentity, edgeTypes, incrementalUpdate. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-codebase-graphs

Symbols, references, calls, imports, ownership, data flow, build targets, and graph queries over repositories. Implement designOutline() returning non-empty values for: nodeIdentity, edgeTypes, incrementalUpdate. Each value must name a concrete mechanism or decision.

## The mechanism

A codebase graph converts files into typed relationships. The value comes from stable symbol identity, precise edges, incremental updates, and queries tied to developer decisions.

## Expected evidence

A design outline with nodeIdentity, edgeTypes, incrementalUpdate plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [SCIP Code Intelligence Protocol](https://github.com/sourcegraph/scip)
- [SCIP — a better code indexing format than LSIF (Sourcegraph)](https://sourcegraph.com/blog/announcing-scip)
- [LSIF Specification 0.6.0](https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/)
- [Introducing stack graphs (GitHub Engineering)](https://github.blog/open-source/introducing-stack-graphs/)
- [Glean — Meta's code-fact database (Angle queries)](https://glean.software/docs/introduction/)
- [Study Codebase Graphs](https://learn.significanthobbies.com/curriculum/concepts/codebase-graphs)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-codebase-graphs)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
