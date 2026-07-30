# Unique ID Generation

Snowflake, ULID, and UUIDv7 — unique ids without a central allocator.

- Difficulty: core
- Tracks: System Design

## Mental model

A database sequence is a coordination point, so distributed id schemes buy independence by partitioning the id space: Snowflake spends bits on a timestamp, a machine id, and a per-millisecond counter, so two nodes cannot collide without sharing a machine id. Time-ordered prefixes are the second reason to care — random UUIDv4 keys scatter writes across a B-tree and destroy insert locality, whereas UUIDv7 and ULID sort by creation time and keep inserts at the right edge of the index.

## Where it matters

Primary keys at scale, idempotency keys, and any id generated before a write reaches the database.

## Common mistakes

- Using random UUIDv4 as a clustered primary key, causing page splits and index fragmentation
- Ignoring clock skew and rollback — Snowflake ids collide or go backwards if the clock moves
- Leaking information: a sequential id exposes volume, and a timestamped one exposes creation time
- Assuming machine ids assign themselves; duplicated worker ids are the classic Snowflake outage

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Pack and unpack a Snowflake id

Implement pack(timestampMs, machineId, sequence) and unpack(id) for a 64-bit Snowflake layout: 41 bits timestamp (ms since a custom epoch), 10 bits machine id, 12 bits sequence. Use BigInt. pack must throw when machineId or sequence exceeds its field.

**Expected evidence:** unpack(pack(1700000000000n, 42n, 7n)) -> { timestampMs: 1700000000000n, machineId: 42n, sequence: 7n }

## Review prompts

- Switching a primary key from random UUIDv4 to UUIDv7 improved write throughput without any schema change. Why?


## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)

## Related concepts

- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html)
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
