# Write-Ahead Log

Append-only durability log written before the data pages.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

The WAL is the database's promise: write the change to an append-only log and fsync it before touching the real data structure. A crash mid-write is recoverable by replaying the log. Durability before convenience.

## Where it matters

PostgreSQL WAL, SQLite WAL mode, every durable store and LSM engine.

## Common mistakes

- Acknowledging a write before the WAL is fsync'd
- Letting the WAL grow forever with no checkpoint/truncation
- Assuming a write() syscall means data is on disk

## Primary sources

- [PostgreSQL — Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html) (doc)

## Practice

### Build a write-ahead log

Implement an append-only WAL: append + fsync each change before acknowledging it, and replay the log on startup to recover state.

**Expected evidence:** State survives a simulated crash by replaying the log.

## Review prompts

- Why write to a WAL before updating the main data structure?
- Why is fsync required for WAL durability?

## Build evidence

- **Toy write-ahead log** — An append-only WAL with crash recovery.

## Prerequisites

- None assigned.

## Related concepts

- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree)
- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
