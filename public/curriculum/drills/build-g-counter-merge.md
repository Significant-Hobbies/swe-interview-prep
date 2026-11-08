# Make three replicas converge

> Implement mergeGCounter(left, right) and valueGCounter(state). A grow-only counter stores one non-negative count per replica; merge takes the maximum count for every replica, and value sums the merged counts. Your merge must converge when updates arrive in different orders and remain unchanged when the same state is delivered twice.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-g-counter-merge

Implement mergeGCounter(left, right) and valueGCounter(state). A grow-only counter stores one non-negative count per replica; merge takes the maximum count for every replica, and value sums the merged counts. Your merge must converge when updates arrive in different orders and remain unchanged when the same state is delivered twice.

## The mechanism

Collaborative state needs an explicit notion of causality and a deterministic reconciliation rule. OT transforms concurrent operations against an agreed history; CRDTs design state or operations around algebraic merge laws so replicas converge despite reordering and duplication. Neither is universally simpler: choose from offline requirements, metadata and tombstone cost, server coordination, undo semantics, and the data structures the product needs.

## Expected evidence

Three independently updated replicas converge to the same {a:2,b:3,c:4} state and value 9 regardless of merge order.

## Hints

- Treat a missing replica entry as zero.
- Per-key maximum makes merge commutative, associative, and idempotent.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [A Conflict-Free Replicated JSON Datatype (Kleppmann & Beresford)](https://arxiv.org/abs/1608.03960)
- [Local-first software: you own your data, in spite of the cloud](https://martin.kleppmann.com/papers/local-first.pdf)
- [CRDT.tech — introduction and glossary](https://crdt.tech/)
- [Awesome CRDT — curated bibliography and implementations](https://github.com/alangibson/awesome-crdt)
- [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)
- [A comprehensive study of Convergent and Commutative Replicated Data Types](https://hal.inria.fr/inria-00555588/document)
- [Collaborative Text Editing with Eg-walker: Better, Faster, Smaller](https://arxiv.org/abs/2409.14252)
- [Why CRDT did not work out for xi-editor](https://github.com/xi-editor/xi-editor/issues/1187#issuecomment-491473599)
- [Study Collaboration Systems](https://learn.significanthobbies.com/curriculum/concepts/collaboration-productivity)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-g-counter-merge)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
