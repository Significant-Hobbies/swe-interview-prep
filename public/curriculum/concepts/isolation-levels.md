# Isolation Levels & MVCC

What each isolation level actually prevents, and how MVCC delivers snapshots without read locks.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

An isolation level is a contract about which anomalies you are willing to see, not a dial labelled 'safety'. Read Committed still allows non-repeatable reads; Snapshot Isolation gives every transaction a consistent point-in-time view and still permits write skew, because two transactions can each read a state the other is about to invalidate. MVCC is the implementation trick that makes those snapshots cheap — writers create new versions instead of overwriting, so readers never block writers, at the cost of version storage and vacuum.

## Where it matters

Every 'why did this row change under me' incident, and the reason booking and inventory systems need explicit locking.

## Common mistakes

- Reading a vendor's level name as the standard's — Oracle and PostgreSQL 'Serializable' historically meant different guarantees
- Assuming Snapshot Isolation prevents all anomalies; write skew survives it and needs SELECT FOR UPDATE or true serializability
- Forgetting MVCC's cost: long-running readers pin old versions and bloat the table
- Raising the isolation level to fix a bug whose real cause is a missing constraint

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Detect write skew under snapshot isolation

Two transactions each read the same snapshot and then write DIFFERENT rows based on what they read — snapshot isolation permits this, and the invariant breaks. Implement wouldSkew(t1, t2) where each transaction is { reads: string[], writes: string[] }. Return true when they are a write-skew risk: their read sets overlap, at least one transaction writes a row the OTHER read, and they write disjoint rows. Return false otherwise.

**Expected evidence:** wouldSkew({reads:['a','b'],writes:['a']},{reads:['a','b'],writes:['b']}) -> true

## Review prompts

- Two on-call engineers each check 'is anyone else on duty?', both see one other person, and both go off duty. Snapshot isolation did not stop it. Why not, and what does?


## Prerequisites

- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing)

## Related concepts

- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication)
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
