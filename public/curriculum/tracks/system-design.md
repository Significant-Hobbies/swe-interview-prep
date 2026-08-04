# System Design

Architecture-level thinking: low-level design, scalability, distributed systems, event-driven design, and end-to-end case studies.

This track contains 26 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html) — Build a mechanism-first mental model of how disk-based DBs spend RAM, and why.
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime.html) — Build one cross-cutting mental model for V8, JVM, Go, BEAM, .NET CLR, vLLM, SGLang, Cloudflare Workers, and wasmtime.
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html) — Get a working mental model of every major systems-software domain — LLMs, DBs, streaming, game engines, containers, browsers, compilers, OS, networking, distributed, build, crypto.
- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html) — Build the design-rounds muscle: model state and behaviour explicitly, justify every class boundary.
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html) — Be able to design X — feed, chat, ride-hailing, search — under a 45-minute clock with credible numbers.

## Concepts

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html) (core) — Identifying classes, attributes, relationships.
- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management.html) (core) — States, transitions, guards.
- [Strategy Pattern](https://learn.significanthobbies.com/curriculum/concepts/strategy-pattern.html) (core) — Interchangeable algorithms.
- [Observer Pattern](https://learn.significanthobbies.com/curriculum/concepts/observer-pattern.html) (core) — Pub/sub, event propagation.
- [Factory & Creational](https://learn.significanthobbies.com/curriculum/concepts/factory-creational.html) (core) — Abstract factory, builder, singleton.
- [Decorator & Structural](https://learn.significanthobbies.com/curriculum/concepts/decorator-structural.html) (core) — Decorator, adapter, composite.
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html) (advanced) — Thread-safety, locks, producer-consumer.
- [Command & Chain](https://learn.significanthobbies.com/curriculum/concepts/command-chain.html) (core) — Command, undo, chain of responsibility.
- [Booking & Inventory](https://learn.significanthobbies.com/curriculum/concepts/booking-inventory.html) (advanced) — Reservation, hold-confirm, optimistic locking.
- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design.html) (core) — Turn engines, board state, rules.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html) (core) — L4/L7, consistent hashing, health checks.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html) (advanced) — Ring, virtual nodes, rebalancing.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html) (advanced) — Raft, Paxos, leader election.
- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) (advanced) — Service discovery, orchestration.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html) (core) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.
- [Feed Systems](https://learn.significanthobbies.com/curriculum/concepts/social-media.html) (core) — Fan-out write/read, timeline.
- [Streaming Media](https://learn.significanthobbies.com/curriculum/concepts/streaming-media.html) (core) — CDN, HLS, transcoding pipeline.
- [Geo Systems](https://learn.significanthobbies.com/curriculum/concepts/location-transport.html) (core) — Geohash, quadtree, dispatch.
- [Collaboration Systems](https://learn.significanthobbies.com/curriculum/concepts/collaboration-productivity.html) (advanced) — Causality, OT, CRDT merge laws, and offline conflict resolution.
- [Search Platform Design](https://learn.significanthobbies.com/curriculum/concepts/search-platform-design.html) (advanced) — End-to-end design of a search platform: ingestion, indexing, query, ranking.
- [RAG System Design](https://learn.significanthobbies.com/curriculum/concepts/rag-system-design.html) (advanced) — Architecting a production RAG system: ingestion, retrieval, generation, evals.
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html) (core) — Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html) (core) — Separating functional from non-functional requirements and cutting scope to something buildable.
- [Rate Limiter Design](https://learn.significanthobbies.com/curriculum/concepts/rate-limiter-design.html) (core) — Token bucket versus sliding window, and making a limiter work across many nodes.
- [Unique ID Generation](https://learn.significanthobbies.com/curriculum/concepts/unique-id-generation.html) (core) — Snowflake, ULID, and UUIDv7 — unique ids without a central allocator.
- [CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery.html) (core) — Cache hierarchy, origin shield, and invalidation versus TTL at the edge.
