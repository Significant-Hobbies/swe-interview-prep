# Normalization

Functional dependencies, 1NF through BCNF, and the cases where denormalising is right.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

Normalisation removes update anomalies by making every fact live in exactly one place: if a non-key column depends on something other than the whole key, an update has to touch several rows and can leave them disagreeing. Third normal form is 'every non-key attribute depends on the key, the whole key, and nothing but the key'. Denormalisation is the deliberate reintroduction of duplication to avoid a join — legitimate when reads dominate and you own the write path that keeps copies consistent, indefensible when it is an accident.

## Where it matters

Schema review, and the reason a denormalised read model needs an owner for its write path.

## Common mistakes

- Denormalising for performance before measuring whether the join was ever the problem
- Duplicating a value with no mechanism to keep the copies in sync, so they silently diverge
- Treating normal forms as a purity contest rather than a defence against anomalies
- Normalising append-only analytical tables where update anomalies cannot occur

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Spot the update anomaly

Implement violatesThirdNF(columns, key, dependencies) -> boolean. `dependencies` is [{determinant: string[], dependent: string}]. Report a 3NF violation when a dependency's determinant is NOT a superset of the key AND its dependent is not itself part of the key — i.e. a non-key attribute determined by something other than the whole key.

**Expected evidence:** key ['orderId'], dep {determinant:['customerId'], dependent:'customerCity'} -> true (transitive dependency)

## Review prompts

- When is denormalising a schema a legitimate engineering decision rather than a shortcut, and what must you own if you do it?


## Prerequisites

- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing)

## Related concepts

- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index)
- [Join Algorithms](https://learn.significanthobbies.com/curriculum/concepts/join-algorithms)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
