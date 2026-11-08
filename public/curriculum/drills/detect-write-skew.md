# Detect write skew under snapshot isolation

> Two transactions each read the same snapshot and then write DIFFERENT rows based on what they read — snapshot isolation permits this, and the invariant breaks. Implement wouldSkew(t1, t2) where each transaction is { reads: string[], writes: string[] }. Return true when they are a write-skew risk: their read sets overlap, at least one transaction writes a row the OTHER read, and they write disjoint rows. Return false otherwise.

Canonical: https://learn.significanthobbies.com/curriculum/drills/detect-write-skew

Two transactions each read the same snapshot and then write DIFFERENT rows based on what they read — snapshot isolation permits this, and the invariant breaks. Implement wouldSkew(t1, t2) where each transaction is { reads: string[], writes: string[] }. Return true when they are a write-skew risk: their read sets overlap, at least one transaction writes a row the OTHER read, and they write disjoint rows. Return false otherwise.

## The mechanism

An isolation level is a contract about which anomalies you are willing to see, not a dial labelled 'safety'. Read Committed still allows non-repeatable reads; Snapshot Isolation gives every transaction a consistent point-in-time view and still permits write skew, because two transactions can each read a state the other is about to invalidate. MVCC is the implementation trick that makes those snapshots cheap — writers create new versions instead of overwriting, so readers never block writers, at the cost of version storage and vacuum.

## Expected evidence

wouldSkew({reads:['a','b'],writes:['a']},{reads:['a','b'],writes:['b']}) -> true

## Hints

- Disjoint writes are what makes it invisible to first-committer-wins conflict detection.
- The danger sign is a write landing on a row the other transaction based its decision on.

## Sources and practice


- [Study Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/detect-write-skew)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
