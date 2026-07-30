# Transaction Processing

ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

A transaction provides an illusion over concurrency and failure. Isolation defines which histories are legal; logging and commit protocols decide what survives.



## Primary sources

- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) (doc)

## Practice

### Design exercise: Transaction Processing

ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery. Implement designOutline() returning non-empty values for: isolationLevel, concurrencyControl, commitRecovery. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with isolationLevel, concurrencyControl, commitRecovery plus an explicit failure mode or trade-off.

## Review prompts

- Snapshot isolation prevents dirty and non-repeatable reads but is not serializable. What anomaly survives, and what fixes it?

## Build evidence

- **Toy write-ahead log** — An append-only WAL with crash recovery.

## Prerequisites

- None assigned.

## Related concepts

- None assigned.

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
