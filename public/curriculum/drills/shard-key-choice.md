# Pick a shard key

> Multi-tenant SaaS: shard by tenant_id vs user_id vs hash(id). Which avoids hot tenant and cross-shard admin queries?

Canonical: https://learn.significanthobbies.com/curriculum/drills/shard-key-choice

Multi-tenant SaaS: shard by tenant_id vs user_id vs hash(id). Which avoids hot tenant and cross-shard admin queries?

## The mechanism

Sharding splits one dataset across many machines so it scales past a single box. The shard key is the whole game: hash keys spread load evenly but kill range scans; range keys keep scans but invite hot spots. Re-sharding later is painful, so choose deliberately.

## Expected evidence

tenant_id co-locates tenant data; hash spreads load; user_id splits tenant across shards.

## Hints

- Hot tenant needs sub-sharding.
- Cross-shard queries are expensive.

## Sources and practice

- [Designing Data-Intensive Applications (Kleppmann) — book site](https://dataintensive.net/)
- [Notion — Herding elephants: sharding Postgres](https://www.notion.com/blog/sharding-postgres-at-notion)
- [Vitess — Sharding](https://vitess.io/docs/22.0/reference/features/sharding/)
- [Spanner: Google's Globally-Distributed Database](https://research.google/pubs/spanner-googles-globally-distributed-database-2/)
- [Study Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/shard-key-choice)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
