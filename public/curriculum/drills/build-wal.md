# Build a write-ahead log

> Implement an append-only WAL: append + fsync each change before acknowledging it, and replay the log on startup to recover state.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-wal

Implement an append-only WAL: append + fsync each change before acknowledging it, and replay the log on startup to recover state.

## The mechanism

The WAL is the database's promise: write the change to an append-only log and fsync it before touching the real data structure. A crash mid-write is recoverable by replaying the log. Durability before convenience.

## Expected evidence

State survives a simulated crash by replaying the log.

## Hints

- fsync before you acknowledge the write.
- Checkpoint so the log does not grow forever.

## Sources and practice

- [PostgreSQL — Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html)
- [Study Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-wal)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
