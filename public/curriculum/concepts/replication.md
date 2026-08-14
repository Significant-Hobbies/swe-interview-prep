# Replication

Leader-follower, multi-leader, quorum.

- Difficulty: advanced
- Tracks: Distributed Systems, Databases & Storage

## Mental model

Replication keeps copies of data on multiple nodes for durability and read scaling. Single-leader is simple but the leader is a write bottleneck; multi-leader and leaderless trade simplicity for availability. The core tension is replication lag — followers are always slightly behind.


## Common mistakes

- Reading from a follower and seeing stale data ("read your own writes" violation)
- Assuming failover is instant and lossless
- Ignoring replication lag in capacity and correctness planning

## Primary sources

- [Designing Data-Intensive Applications (Kleppmann) — book site](https://dataintensive.net/) (course)
- [In Search of an Understandable Consensus Algorithm (Raft, extended)](https://raft.github.io/raft.pdf) (paper)
- [Chain Replication for Supporting High Throughput and Availability (OSDI 04)](https://www.usenix.org/conference/osdi-04/chain-replication-supporting-high-throughput-and-availability) (paper)
- [PostgreSQL — High Availability, Load Balancing, and Replication](https://www.postgresql.org/docs/current/high-availability.html) (doc)

## Practice

### Read-your-writes under lag

Write to primary, read replica 200ms later, lag 500ms. User sees stale read. Two fixes?

**Expected evidence:** Read-after-write from primary; session stickiness; sync quorum for critical reads.

## Review prompts

- A user updates their profile and the next page shows the old value. Name the guarantee that is missing and two ways to provide it.

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- None assigned.

## Related concepts

- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem)
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w)
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
