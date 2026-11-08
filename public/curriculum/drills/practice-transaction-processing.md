# Design exercise: Transaction Processing

> ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery. Implement designOutline() returning non-empty values for: isolationLevel, concurrencyControl, commitRecovery. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-transaction-processing

ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery. Implement designOutline() returning non-empty values for: isolationLevel, concurrencyControl, commitRecovery. Each value must name a concrete mechanism or decision.

## The mechanism

A transaction provides an illusion over concurrency and failure. Isolation defines which histories are legal; logging and commit protocols decide what survives.

## Expected evidence

A design outline with isolationLevel, concurrencyControl, commitRecovery plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Study Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-transaction-processing)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
