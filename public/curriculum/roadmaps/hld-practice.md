# HLD Practice

A 30-day sprint through high-level system design. Primitives first (load balancing, consistent hashing, consensus), then full-stack "design X" cases. End comfortable scoping requirements, capacity, storage choice, queue boundaries, and failure modes.

- Horizon: 30d
- Outcome: Be able to design X — feed, chat, ride-hailing, search — under a 45-minute clock with credible numbers.
- Tracks: System Design

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery) — Cache hierarchy, origin shield, and invalidation versus TTL at the edge.
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting) — Token bucket, leaky bucket, sliding window.
- [Rate Limiter Design](https://learn.significanthobbies.com/curriculum/concepts/rate-limiter-design) — Token bucket versus sliding window, and making a limiter work across many nodes.
- [Unique ID Generation](https://learn.significanthobbies.com/curriculum/concepts/unique-id-generation) — Snowflake, ULID, and UUIDv7 — unique ids without a central allocator.
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation) — Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping) — Separating functional from non-functional requirements and cutting scope to something buildable.
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings) — Mapping text/images into dense vectors where distance encodes meaning.
- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues) — Kafka, SQS, exactly-once vs at-least-once.
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage) — S3-style blob storage: cheap, durable, high-latency, immutable objects.
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication) — Leader-follower, multi-leader, quorum.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding) — Range/hash/geo partitioning.
- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching) — Cache-aside, write-through, eviction policies.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index) — Term → posting list mapping that powers fast keyword lookup.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf) — Term frequency × inverse document frequency weighting for relevance.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search) — Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.



## Milestone 2: Days 1-7 — Primitives

The building blocks every HLD answer relies on.

### Concepts

- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing) — L4/L7, consistent hashing, health checks.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing) — Ring, virtual nodes, rebalancing.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus) — Raft, Paxos, leader election.



## Milestone 3: Days 8-14 — Distributed components

Storage, infra, messaging — what sits behind the LB.

### Concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra) — Service discovery, orchestration.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.



## Milestone 4: Days 15-30 — Full system cases

Walk a complete "design X" with capacity, storage choice, and failure modes.

### Concepts

- [Feed Systems](https://learn.significanthobbies.com/curriculum/concepts/social-media) — Fan-out write/read, timeline.
- [Streaming Media](https://learn.significanthobbies.com/curriculum/concepts/streaming-media) — CDN, HLS, transcoding pipeline.
- [Geo Systems](https://learn.significanthobbies.com/curriculum/concepts/location-transport) — Geohash, quadtree, dispatch.
- [Collaboration Systems](https://learn.significanthobbies.com/curriculum/concepts/collaboration-productivity) — Causality, OT, CRDT merge laws, and offline conflict resolution.
- [Search Platform Design](https://learn.significanthobbies.com/curriculum/concepts/search-platform-design) — End-to-end design of a search platform: ingestion, indexing, query, ranking.
- [RAG System Design](https://learn.significanthobbies.com/curriculum/concepts/rag-system-design) — Architecting a production RAG system: ingestion, retrieval, generation, evals.
