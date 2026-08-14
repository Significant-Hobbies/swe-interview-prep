# Consensus

Raft, Paxos, leader election.

- Difficulty: advanced
- Tracks: Distributed Systems, System Design

## Mental model

Consensus is how a cluster agrees on one value despite crashes and network delays. Raft makes it understandable: elect a leader, replicate an append-only log, and a write commits once a majority (quorum) has it. A majority guarantees any two quorums overlap.


## Common mistakes

- Assuming consensus survives a network partition without a majority
- Confusing leader election with data replication — Raft does both
- Thinking more replicas always means more durability (it costs latency)

## Primary sources

- [The Raft Consensus Algorithm](https://raft.github.io/) (doc)

## Practice

### Leader election walkthrough

Walk through Raft leader election: timeouts, candidacy, vote granting, split votes. Trace what happens when the current leader is partitioned from a majority.

**Expected evidence:** A 3-node trace showing one election cycle, including a split-vote retry.

## Review prompts

- Why does a majority quorum give consensus its safety property?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication)

## Related concepts

- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
