# Pack and unpack a Snowflake id

> Implement pack(timestampMs, machineId, sequence) and unpack(id) for a 64-bit Snowflake layout: 41 bits timestamp (ms since a custom epoch), 10 bits machine id, 12 bits sequence. Use BigInt. pack must throw when machineId or sequence exceeds its field.

Canonical: https://learn.significanthobbies.com/curriculum/drills/snowflake-id-layout

Implement pack(timestampMs, machineId, sequence) and unpack(id) for a 64-bit Snowflake layout: 41 bits timestamp (ms since a custom epoch), 10 bits machine id, 12 bits sequence. Use BigInt. pack must throw when machineId or sequence exceeds its field.

## The mechanism

A database sequence is a coordination point, so distributed id schemes buy independence by partitioning the id space: Snowflake spends bits on a timestamp, a machine id, and a per-millisecond counter, so two nodes cannot collide without sharing a machine id. Time-ordered prefixes are the second reason to care — random UUIDv4 keys scatter writes across a B-tree and destroy insert locality, whereas UUIDv7 and ULID sort by creation time and keep inserts at the right edge of the index.

## Expected evidence

unpack(pack(1700000000000n, 42n, 7n)) -> { timestampMs: 1700000000000n, machineId: 42n, sequence: 7n }

## Hints

- Shift the timestamp left by 22, the machine id by 12, then OR in the sequence.
- Field widths are what bound the design: 10 bits is 1024 machines, 12 bits is 4096 ids per machine per millisecond.

## Sources and practice


- [Study Unique ID Generation](https://learn.significanthobbies.com/curriculum/concepts/unique-id-generation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/snowflake-id-layout)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
