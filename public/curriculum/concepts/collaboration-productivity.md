# Collaboration Systems

Causality, OT, CRDT merge laws, and offline conflict resolution.

- Difficulty: advanced
- Tracks: System Design

## Mental model

Collaborative state needs an explicit notion of causality and a deterministic reconciliation rule. OT transforms concurrent operations against an agreed history; CRDTs design state or operations around algebraic merge laws so replicas converge despite reordering and duplication. Neither is universally simpler: choose from offline requirements, metadata and tombstone cost, server coordination, undo semantics, and the data structures the product needs.

## Where it matters

Collaborative editors, offline-first applications, replicated JSON documents, multi-device state sync, geo-replicated counters and sets, and local-first productivity tools.

## Common mistakes

- Treating replica convergence as proof that concurrent edits preserve user intent
- Calling CRDTs coordination-free while ignoring causal delivery, metadata compaction, tombstone garbage collection, or membership changes
- Assuming every OT design requires one central server, or that every CRDT design has the same wire and storage costs
- Replicating ephemeral cursor and presence state through the durable document history

## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [A Conflict-Free Replicated JSON Datatype (Kleppmann & Beresford)](https://arxiv.org/abs/1608.03960) (paper)
- [Local-first software: you own your data, in spite of the cloud](https://martin.kleppmann.com/papers/local-first.pdf) (paper)
- [CRDT.tech — introduction and glossary](https://crdt.tech/) (doc)
- [Awesome CRDT — curated bibliography and implementations](https://github.com/alangibson/awesome-crdt) (doc)
- [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) (paper)
- [A comprehensive study of Convergent and Commutative Replicated Data Types](https://hal.inria.fr/inria-00555588/document) (paper)
- [Collaborative Text Editing with Eg-walker: Better, Faster, Smaller](https://arxiv.org/abs/2409.14252) (paper)
- [Why CRDT did not work out for xi-editor](https://github.com/xi-editor/xi-editor/issues/1187#issuecomment-491473599) (article)

## Practice

### Make three replicas converge

Implement mergeGCounter(left, right) and valueGCounter(state). A grow-only counter stores one non-negative count per replica; merge takes the maximum count for every replica, and value sums the merged counts. Your merge must converge when updates arrive in different orders and remain unchanged when the same state is delivered twice.

**Expected evidence:** Three independently updated replicas converge to the same {a:2,b:3,c:4} state and value 9 regardless of merge order.

### Collaborative doc editor

Design a Google-Docs-style collaborative editor for 2-50 concurrent editors. Define how clients represent causality, choose OT or a specific CRDT family, explain the sync protocol, and work through two concurrent edits delivered in opposite orders.

**Expected evidence:** Causality model + conflict algorithm + a worked merge showing that replicas reach the intended document state.

## Review prompts

- Why is convergence alone insufficient when choosing OT or a CRDT for collaborative editing?


## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html)
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html)
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html)
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem.html)

## Related concepts

- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
