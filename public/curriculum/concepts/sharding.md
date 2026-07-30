# Sharding

Range/hash/geo partitioning.

- Difficulty: advanced
- Tracks: Distributed Systems, Databases & Storage

## Mental model

Sharding splits one dataset across many machines so it scales past a single box. The shard key is the whole game: hash keys spread load evenly but kill range scans; range keys keep scans but invite hot spots. Re-sharding later is painful, so choose deliberately.


## Common mistakes

- A shard key that creates a hot shard (e.g. sharding by date)
- Cross-shard joins and transactions, which are slow or impossible
- No plan for re-sharding as data grows

## Primary sources

- [Designing Data-Intensive Applications (Kleppmann) — book site](https://dataintensive.net/) (course)
- [Notion — Herding elephants: sharding Postgres](https://www.notion.com/blog/sharding-postgres-at-notion) (article)
- [Vitess — Sharding](https://vitess.io/docs/22.0/reference/features/sharding/) (doc)
- [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database-2/) (paper)

## Practice

### Pick a shard key

Multi-tenant SaaS: shard by tenant_id vs user_id vs hash(id). Which avoids hot tenant and cross-shard admin queries?

**Expected evidence:** tenant_id co-locates tenant data; hash spreads load; user_id splits tenant across shards.

## Review prompts

- Why is changing the shard key later so much harder than choosing a different index?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html)

## Related concepts

- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html)

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
