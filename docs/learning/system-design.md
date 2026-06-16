---
title: System design — LLD + HLD
audited: 2026-06-16
---

# System design

The two halves of "design X" interviews and real engineering work:

- **Low-Level Design (LLD)** — class-level OO modelling, design patterns, the "design a parking lot / elevator / Splitwise" round.
- **High-Level Design (HLD)** — component-level architecture, capacity, tradeoffs, the "design Twitter / Uber / a chat system" round.

They overlap. Most senior+ "design X" interviews start at HLD and drill into LLD when the interviewer wants to see your OO judgement on a hot path. Prepare them as one body of work, not two.

This doc replaces the older separate `lld.md` and `hld.md` pages.

## How to prepare (the actual loop)

1. **Internalise the loop, not the answers.** [HelloInterview — System Design in a Hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction) is the best single explainer of what an interviewer is grading. Re-read once a week before a loop.
2. **Read [The System Design Primer (Donne Martin)](https://github.com/donnemartin/system-design-primer)** end-to-end once. Most-starred technical repo on GitHub for a reason — it's the topic map.
3. **Re-read [Designing Data-Intensive Applications (Kleppmann)](https://dataintensive.net/)** every 12 months. Most "design X" answers are DDIA chapters dressed in a use case.
4. **Re-read [Refactoring.guru — Design Patterns](https://refactoring.guru/design-patterns)** once. Re-implement Strategy, Observer, Factory, State from memory.
5. **Solve 5 LLD problems + 8 HLD problems** end-to-end. The catalogues are below. Write each up as a one-page doc.
6. **Memorise [latency numbers (Jeff Dean / Norvig)](https://gist.github.com/jboner/2841832)** yearly.

---

# Part 1 — Low-Level Design

Object-oriented design at the class & component level. Tests two things: (1) you can pick the right pattern without reaching for inheritance by reflex, (2) you can carve a small system into classes whose responsibilities don't leak.

Memorising 23 GoF patterns is the trap. Solving five real problems end-to-end is the cure.

## Patterns to know

Every pattern below has a one-page write-up at [refactoring.guru/design-patterns](https://refactoring.guru/design-patterns) — best free reference. Source layout from Atul Kumar's [LLD sheet](https://www.linkedin.com/in/atul-kumar-58727488/).

### Behavioural

Strategy · Observer · Chain of Responsibility · State · Command · Interpreter · Iterator · Mediator · Memento · Template Method · Visitor · Null Object.

### Creational

Factory Method · Abstract Factory · Builder · Prototype · Singleton (mostly anti-pattern in 2026).

### Structural

Decorator · Proxy · Composite · Adapter · Bridge · Façade · Flyweight.

### Principles

- **SOLID** — [refactoring.guru — SOLID](https://refactoring.guru/design-patterns/solid-principles) · [Robert Martin's papers](https://web.archive.org/web/20180706093910/http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod). Most "design X" answers are SOLID violations dressed up.
- **Composition over inheritance** — the GoF book's actual thesis. Re-read [the preface](https://en.wikipedia.org/wiki/Design_Patterns) yearly.

## LLD practice problems

| Problem | Why it's classic |
|---|---|
| Parking Lot | Opener. Vehicle/Spot/Floor hierarchy, Strategy for pricing, Observer for events |
| Tic-Tac-Toe | Teaches you to push state out of the controller |
| Vending Machine | State machine without `switch` |
| ATM | State + Chain of Responsibility (transaction routing) |
| Elevator System | Multi-elevator scheduling — State, Observer, Strategy |
| Notify-Me Button | Observer in five lines |
| Pizza Billing | Decorator end-to-end |
| Logging System | Chain of Responsibility (level-based handlers) |
| Snakes & Ladders | State + Strategy on a deterministic board |
| Chess | Composite (board), Strategy (piece movement), Memento (undo) |
| File System | Composite (directory tree), Visitor (search), Proxy (lazy load) |
| Splitwise (+ Simplify) | Graph reduction + clean OO |
| Cache mechanism / LRU | [LeetCode 146](https://leetcode.com/problems/lru-cache/) — write three times |
| BookMyShow with concurrency | Reservation locks, optimistic vs pessimistic |
| Car booking (Ola/Uber) | Strategy (matching), Observer (lifecycle), State (ride) |
| Hotel Booking | Inventory + reservation + cancellation policy |
| Library Management | Relational modelling under OO veneer |
| Meeting Scheduler | Interval trees, conflict detection — [LeetCode 253](https://leetcode.com/problems/meeting-rooms-ii/) is the core |
| Stock Exchange / order book | The hardest one. Read [LMAX disruptor talk](https://www.infoq.com/presentations/LMAX/) once a year |
| Calendar Application | Events × recurrence × attendees. [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) is the spec. |
| Payment system | Idempotency, state machine, Saga. [Stripe — idempotent requests](https://stripe.com/blog/idempotency) |
| Chat-based system | Observer (delivery), Adapter (per-transport), State (lifecycle) |
| Rate Limiter | Token bucket / leaky bucket / sliding window. Bridges into HLD |

## LLD curated repos

- [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns) — every pattern, one repo, with READMEs
- [prasadgujar/low-level-design-primer](https://github.com/prasadgujar/low-level-design-primer) — awesome-LLD index
- [Aditya-Diwakar/LLDProblems](https://github.com/Aditya-Diwakar/LLDProblems) — common questions in Java
- [Refactoring Guru — code examples](https://refactoring.guru/design-patterns/examples) — 10 languages per pattern

---

# Part 2 — High-Level Design

System architecture, capacity, tradeoffs. Senior+ interviews live here.

**The loop, every time:** clarify requirements → sketch capacity → pick components → draw the boxes → talk about failure modes.

## HLD topic coverage

Source layout from Atul Kumar's [HLD sheet](https://www.linkedin.com/in/atul-kumar-58727488/).

### Networking & protocols

TCP, UDP, WebSocket, HTTP/1.1 vs 2 vs 3, gRPC, QUIC.

- [High Performance Browser Networking (Ilya Grigorik, free online)](https://hpbn.co/) — every protocol in one book.
- [Cloudflare blog — HTTP/3 series](https://blog.cloudflare.com/http-3-from-root-to-tip/)

### Consistency & CAP

CAP, PACELC, eventual consistency, linearisability, causal consistency.

- [You can't sacrifice partition tolerance (Coda Hale)](https://codahale.com/you-cant-sacrifice-partition-tolerance/) — only CAP post worth reading.
- [Jepsen — Consistency map](https://jepsen.io/consistency)
- [Aphyr — Strong consistency models](https://aphyr.com/posts/313-strong-consistency-models)

### Microservices patterns

Decomposition · SAGA · Strangler Fig · CQRS · sidecar · API gateway.

- [microservices.io (Chris Richardson)](https://microservices.io/) — the canonical taxonomy
- [Strangler Fig — Martin Fowler](https://martinfowler.com/bliki/StranglerFigApplication.html)

### Capacity & estimation

- [System Design Primer — Powers of two table](https://github.com/donnemartin/system-design-primer#powers-of-two-table) — memorise
- [DDIA ch. 2](https://dataintensive.net/) — throughput, latency, percentiles

### Consistent hashing

How a request gets to a server when servers come and go.

- [Karger et al. (1997, original paper)](https://www.cs.princeton.edu/courses/archive/spr11/cos461/docs/lec22-consistent-hashing.pdf)
- [Discord — Consistent hashing in Elixir](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users)

### KV stores, SQL vs NoSQL

- [Dynamo paper (2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) — read yearly
- [DDIA ch. 2 + 3](https://dataintensive.net/)
- [Redis architecture](https://redis.io/docs/about/) · [RocksDB FAQ](https://github.com/facebook/rocksdb/wiki/RocksDB-FAQ)
- [Use The Index, Luke](https://use-the-index-luke.com/) — for the SQL side

### Rate limiting

Token bucket, leaky bucket, sliding window.

- [Cloudflare — Counting things, a lot of different things](https://blog.cloudflare.com/counting-things-a-lot-of-different-things/)
- [Stripe — Scaling rate limiters](https://stripe.com/blog/rate-limiters)

### Messaging & queues

Kafka, RabbitMQ, SQS.

- [Kafka — The Definitive Guide (free O'Reilly)](https://www.confluent.io/resources/kafka-the-definitive-guide/)
- [DDIA ch. 11](https://dataintensive.net/) — stream processing
- [Kafka original paper (LinkedIn)](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/09/Kafka.pdf)

### Proxies, gateways, CDN

- [NGINX — what is a reverse proxy?](https://www.nginx.com/resources/glossary/reverse-proxy-server/)
- [Envoy architecture](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/intro/arch_overview)
- [Cloudflare — How a CDN works](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/)

### Storage types & file systems

Block / file / object (S3), RAID. GFS, HDFS, Ceph.

- [AWS — Object vs file vs block](https://aws.amazon.com/compare/the-difference-between-block-file-object-storage/)
- [S3 architecture (SIGMOD 2023)](https://www.amazon.science/publications/the-s3-storage-architecture)
- [GFS paper (SOSP 2003)](https://research.google/pubs/the-google-file-system/)
- [HDFS Architecture Guide](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)

### Bloom filter, Merkle tree, gossip

- [Bloom filters animated (Less Bytes)](https://llimllib.github.io/bloomfilter-tutorial/)
- [Merkle trees in Bitcoin (Antonopoulos)](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch09.asciidoc#merkle-trees)
- [Cassandra — Gossip protocol](https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html#gossip)

### Caching

Cache invalidation, eviction, write-through vs write-back, cache-aside.

- [Cache invalidation is hard (Karlton / Fowler)](https://martinfowler.com/bliki/TwoHardThings.html)
- [Discord — How we store trillions of messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)

### Scaling databases

Sharding (horizontal & vertical), partitioning, replication, leader election, indexing.

- [DDIA ch. 5–7](https://dataintensive.net/) — the whole "Distributed Data" part
- [Vitess — sharding overview (YouTube's engine)](https://vitess.io/docs/overview/whatisvitess/)
- [Raft paper](https://raft.github.io/raft.pdf) — for leader election
- For the deep version, follow this project's [Disk-First DB roadmap](./db-roadmap.md)

## HLD practice problems

Solve 8–10 of these end-to-end. Don't watch a video solution before attempting.

| Problem | Why it's classic | Worked solution |
|---|---|---|
| URL shortener / TinyURL | Hashing, KV store, sharding 101 | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/bitly) |
| WhatsApp / chat | WebSockets, fan-out, presence, E2E | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/whatsapp) |
| Rate limiter | Centralised vs distributed | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/rate-limiter) |
| Search autocomplete | Trie, prefix index, frequency ranking | [System Design Primer](https://github.com/donnemartin/system-design-primer) |
| Notification system | Pub/sub, multi-channel, retries, idempotency | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/notifications) |
| Pastebin | Same shape as URL shortener; warm-up | [SDP — Pastebin](https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md) |
| Twitter | Fanout-on-write vs read for celebrity problem | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/twitter) |
| Dropbox / Google Drive | Block-level dedup, sync, conflict resolution | [HelloInterview — Google Drive](https://www.hellointerview.com/learn/system-design/answer-keys/google-drive) |
| Instagram | Photo CDN, feed ranking, story expiry | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/instagram) |
| YouTube | Video transcoding, CDN, recommendation API | [SDP](https://github.com/donnemartin/system-design-primer) |
| Web crawler | URL frontier, dedup, politeness | [SDP — web crawler](https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/web_crawler/README.md) |
| Facebook News Feed | Fanout strategy, edge cases (celebrity, churn) | [Facebook eng blog](https://engineering.fb.com/category/data-infrastructure/) |
| Ticketmaster | Reservation locks, fair queueing, anti-bot | [HelloInterview](https://www.hellointerview.com/learn/system-design/answer-keys/ticketmaster) |
| NearbyFriends / Yelp | Geohash / quadtree / R-tree, real-time location | [HelloInterview — Tinder](https://www.hellointerview.com/learn/system-design/answer-keys/tinder) · [Uber H3](https://www.uber.com/blog/h3/) |
| Uber / Lyft | Driver matching, ETAs, surge pricing | [HelloInterview — Uber](https://www.hellointerview.com/learn/system-design/answer-keys/uber) |
| Payment system | Idempotency, double-spend, saga | [Stripe — idempotency](https://stripe.com/blog/idempotency) · [Uber payments](https://www.uber.com/blog/payments-overview/) |
| Distributed cache | Consistent hashing, eviction, hot keys | [Discord scale](https://discord.com/blog/how-discord-scaled-elixir-to-5-000-000-concurrent-users) |
| Ad-bidding (RTB) | <100 ms p99, budget pacing, fraud | [Google RTB docs](https://developers.google.com/authorized-buyers/rtb/start) |

---

# References (one is enough)

Read these once, refer to them often:

- **[Designing Data-Intensive Applications (Kleppmann)](https://dataintensive.net/)** — the one book to read. Re-read yearly.
- **[System Design Interview Vol 1 + 2 (Alex Xu)](https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF)** — for the catalogue of solutions.
- **[HelloInterview — System Design](https://www.hellointerview.com/learn/system-design)** — best modern explanations + walkthroughs.
- **[System Design Primer (Donne Martin)](https://github.com/donnemartin/system-design-primer)** — the topic map.
- **[ByteByteGo](https://bytebytego.com/)** — Alex Xu's video / newsletter version.
- **[Refactoring.guru — Design Patterns](https://refactoring.guru/design-patterns)** — the LLD reference.
- **[microservices.io (Richardson)](https://microservices.io/)** — for service-decomposition patterns.
- **[InfoQ Architecture](https://www.infoq.com/architecture-design/)** — real-world write-ups.

## Companion docs in this project

- [SE Landscape](./swe-landscape.md) — broader survey including the System Design domain.
- [Disk-First DB roadmap](./db-roadmap.md) — deep version of the "scaling databases" topic.
- [Runtime roadmap](./runtime-roadmap.md) — the runtime side of any system.
- [ML system design case studies](./ml-case-studies.md) — 450 production write-ups when ML is the system.
- [Interview prep](./interview-prep.md) — where to apply once you can design.

## Maintenance notes

- HelloInterview answer-key URLs stable since their late-2024 reorganisation.
- Dynamo, GFS, Raft paper URLs are publisher-hosted and stable.
- Donne Martin repo URL is the source of truth; mirrors rot.
- refactoring.guru URLs haven't moved since 2018.
