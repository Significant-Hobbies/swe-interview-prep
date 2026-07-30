# CAP & Consistency Models

Strong/eventual/causal, PACELC.

- Difficulty: advanced
- Tracks: Distributed Systems, Databases & Storage

## Mental model

During a network partition you must choose: stay Consistent (reject requests that cannot be confirmed) or stay Available (serve possibly-stale data). CAP only bites during a partition; PACELC adds the everyday tradeoff — Else, Latency vs Consistency.


## Common mistakes

- Thinking you "pick 2 of 3" at all times — the choice only applies during a partition
- Calling a system "CA" — partitions are not optional in a distributed system
- Ignoring the latency-vs-consistency tradeoff that exists even with no partition

## Primary sources

- [CAP theorem (Wikipedia)](https://en.wikipedia.org/wiki/CAP_theorem) (doc)

## Practice

### CAP under partition

Network split isolates two DB nodes. Choose CP or AP for payment ledger vs social likes feed.

**Expected evidence:** Ledger: CP (reject writes); likes: AP (allow divergence + merge).

## Review prompts

- What does PACELC add that CAP leaves out, and why does it describe real systems better?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html)

## Related concepts

- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html)
