# Read-your-writes under lag

> Write to primary, read replica 200ms later, lag 500ms. User sees stale read. Two fixes?

Canonical: https://learn.significanthobbies.com/curriculum/drills/replication-lag-read

Write to primary, read replica 200ms later, lag 500ms. User sees stale read. Two fixes?

## The mechanism

Replication keeps copies of data on multiple nodes for durability and read scaling. Single-leader is simple but the leader is a write bottleneck; multi-leader and leaderless trade simplicity for availability. The core tension is replication lag — followers are always slightly behind.

## Expected evidence

Read-after-write from primary; session stickiness; sync quorum for critical reads.

## Hints

- Async replication = eventual consistency.
- Route recent keys to leader.

## Sources and practice

- [Designing Data-Intensive Applications (Kleppmann) — book site](https://dataintensive.net/)
- [In Search of an Understandable Consensus Algorithm (Raft, extended)](https://raft.github.io/raft.pdf)
- [Chain Replication for Supporting High Throughput and Availability (OSDI 04)](https://www.usenix.org/conference/osdi-04/chain-replication-supporting-high-throughput-and-availability)
- [PostgreSQL — High Availability, Load Balancing, and Replication](https://www.postgresql.org/docs/current/high-availability.html)
- [Study Replication](https://learn.significanthobbies.com/curriculum/concepts/replication)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/replication-lag-read)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
