# Concurrent bank transfers

> Design transfer(from, to, amount) that is safe under concurrent calls. Address deadlock from circular locking, isolation, and what happens if one side fails mid-write.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-bank-account-locking

Design transfer(from, to, amount) that is safe under concurrent calls. Address deadlock from circular locking, isolation, and what happens if one side fails mid-write.

## The mechanism

Concurrency bugs are usually not "add more locks." They are about having a clear discipline for which locks you take, in what order, and for how long. Often the cheapest fix is a single database transaction or a single-writer design.

## Expected evidence

Locking order rule + pseudocode for the transfer + how you would test for deadlock.

## Hints

- Always acquire locks in a globally consistent order (e.g. by account id).
- Use a single transaction; rollback on failure.

## Sources and practice

- [Concurrency (Wikipedia)](https://en.wikipedia.org/wiki/Concurrency_(computer_science))
- [Study Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-bank-account-locking)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
