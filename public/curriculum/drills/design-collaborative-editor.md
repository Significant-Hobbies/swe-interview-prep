# Collaborative doc editor

> Design a Google-Docs-style collaborative editor for 2-50 concurrent editors. Define how clients represent causality, choose OT or a specific CRDT family, explain the sync protocol, and work through two concurrent edits delivered in opposite orders.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-collaborative-editor

Design a Google-Docs-style collaborative editor for 2-50 concurrent editors. Define how clients represent causality, choose OT or a specific CRDT family, explain the sync protocol, and work through two concurrent edits delivered in opposite orders.

## The mechanism

Collaborative state needs an explicit notion of causality and a deterministic reconciliation rule. OT transforms concurrent operations against an agreed history; CRDTs design state or operations around algebraic merge laws so replicas converge despite reordering and duplication. Neither is universally simpler: choose from offline requirements, metadata and tombstone cost, server coordination, undo semantics, and the data structures the product needs.

## Expected evidence

Causality model + conflict algorithm + a worked merge showing that replicas reach the intended document state.

## Hints

- Name the invariant you need before choosing OT or a CRDT: convergence alone is not the same as preserving user intent.
- Account for metadata growth, tombstones or garbage collection, offline duration, undo, and cursor presence.

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
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-collaborative-editor)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
