# Spot the update anomaly

> Implement violatesThirdNF(columns, key, dependencies) -> boolean. `dependencies` is [{determinant: string[], dependent: string}]. Report a 3NF violation when a dependency's determinant is NOT a superset of the key AND its dependent is not itself part of the key — i.e. a non-key attribute determined by something other than the whole key.

Canonical: https://learn.significanthobbies.com/curriculum/drills/find-the-anomaly

Implement violatesThirdNF(columns, key, dependencies) -> boolean. `dependencies` is [{determinant: string[], dependent: string}]. Report a 3NF violation when a dependency's determinant is NOT a superset of the key AND its dependent is not itself part of the key — i.e. a non-key attribute determined by something other than the whole key.

## The mechanism

Normalisation removes update anomalies by making every fact live in exactly one place: if a non-key column depends on something other than the whole key, an update has to touch several rows and can leave them disagreeing. Third normal form is 'every non-key attribute depends on the key, the whole key, and nothing but the key'. Denormalisation is the deliberate reintroduction of duplication to avoid a join — legitimate when reads dominate and you own the write path that keeps copies consistent, indefensible when it is an accident.

## Expected evidence

key ['orderId'], dep {determinant:['customerId'], dependent:'customerCity'} -> true (transitive dependency)

## Hints

- A determinant containing every key column is fine — that is just the key determining an attribute.
- A dependent that is part of the key is a different normal-form question; treat it as not a 3NF violation here.

## Sources and practice


- [Study Normalization](https://learn.significanthobbies.com/curriculum/concepts/normalization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/find-the-anomaly)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
