# Collaboration Systems

OT, CRDT, conflict resolution.

- Difficulty: advanced
- Tracks: System Design

## Mental model

Collaborative editors pick one of two conflict-resolution models: Operational Transform (OT), which mathematically rewrites concurrent edits, or CRDTs, which use data structures that merge automatically. CRDTs handle offline well; OT is more compact on the wire. Pick by your latency and offline needs.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [A Conflict-Free Replicated JSON Datatype (Kleppmann & Beresford)](https://arxiv.org/abs/1608.03960) (paper)
- [Local-first software: you own your data, in spite of the cloud](https://martin.kleppmann.com/papers/local-first.pdf) (paper)

## Practice

### Collaborative doc editor

Design a Google-Docs-style collaborative editor for 2-50 concurrent editors. Pick a conflict resolution model (OT vs CRDT) and explain the sync protocol.

**Expected evidence:** Conflict model + a worked example of two concurrent edits being merged.

## Review prompts

- What must be true of the server for OT to be correct, and why do CRDTs not need it?


## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html)
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html)

## Related concepts

- None assigned.

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
