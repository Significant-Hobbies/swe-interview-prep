# CAP under partition

> Network split isolates two DB nodes. Choose CP or AP for payment ledger vs social likes feed.

Canonical: https://learn.significanthobbies.com/curriculum/drills/cap-partition-choice

Network split isolates two DB nodes. Choose CP or AP for payment ledger vs social likes feed.

## The mechanism

During a network partition you must choose: stay Consistent (reject requests that cannot be confirmed) or stay Available (serve possibly-stale data). CAP only bites during a partition; PACELC adds the everyday tradeoff — Else, Latency vs Consistency.

## Expected evidence

Ledger: CP (reject writes); likes: AP (allow divergence + merge).

## Hints

- Partition forces C vs A tradeoff.
- PACELC extends for normal case.

## Sources and practice

- [CAP theorem (Wikipedia)](https://en.wikipedia.org/wiki/CAP_theorem)
- [Study CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/cap-partition-choice)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
