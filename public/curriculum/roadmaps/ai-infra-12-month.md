# 12-Month Advanced AI Infrastructure

The long arc. A year of compounding depth across search, vector databases, AI systems, backend, storage, and system design — measured in shipped artifacts and project features.

- Horizon: 12mo
- Outcome: Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.
- Tracks: Search & IR, Vector DB & ANN, AI Systems, Backend, Databases & Storage, System Design

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html) — Vectors, matrices, dot products, matmul, shapes.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Numerical Stability](https://learn.significanthobbies.com/curriculum/concepts/numerical-stability.html) — Floating point, catastrophic cancellation, and the log-sum-exp trick.
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html) — Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html) — Separating functional from non-functional requirements and cutting scope to something buildable.
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings.html) — Mapping text/images into dense vectors where distance encodes meaning.
- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle.html) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs.html) — Forcing LLM output into a validated JSON schema.
- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling.html) — Letting an LLM invoke functions/APIs via structured calls.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity.html) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html) — Term → posting list mapping that powers fast keyword lookup.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf.html) — Term frequency × inverse document frequency weighting for relevance.
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search.html) — Returning the k nearest vectors to a query, exact or approximate.
- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db.html) — Exact nearest-neighbour search by scanning every vector — the correctness baseline.



## Milestone 2: Q1 — Retrieval and vector foundations

Complete the 90-day AI search/infra roadmap.

### Concepts

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html) — Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html) — Hierarchical Navigable Small World graphs — the dominant ANN index.
- [Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering.html) — Combining vector search with structured predicates (tenant, date, tags).
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.

### Build evidence

- **Hybrid search v0 in HighSignal** — Combine BM25 and vector retrieval with reciprocal rank fusion.
- **Brute-force vector index** — An exact nearest-neighbour index — the recall=1.0 baseline.
- **RAG pipeline v0** — An end-to-end retrieve → pack → generate pipeline grounded in a document corpus.

## Milestone 3: Q2 — Production backend depth

API platform strength: keys, limits, idempotency, queues, observability.

### Concepts

- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design.html) — REST, gRPC, versioning, pagination.
- [API Keys](https://learn.significanthobbies.com/curriculum/concepts/api-keys.html) — Issuing, hashing, scoping, and rotating keys for machine clients.
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html) — Token bucket, leaky bucket, sliding window.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html) — Idempotency keys and dedup windows for safe retries of mutations.
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html) — Backoff + jitter, poison messages, dead-letter queues.
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html) — Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.

### Build evidence

- **Reusable API key system** — Issue, hash, scope, and rotate API keys for machine clients.
- **Reusable rate limiter** — A token-bucket rate limiter usable as middleware.
- **Job queue with retries and DLQ** — A background job queue with backoff, jitter, and a dead-letter queue.
- **Structured logging package** — A structured logger with a request correlation id.

## Milestone 4: Q3 — Storage systems

Build the storage foundations behind a Turbopuffer-class system.

### Concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html) — The balanced, disk-friendly tree behind most relational indexes.
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree.html) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal.html) — Append-only durability log written before the data pages.
- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction.html) — Merging sorted runs to reclaim space and bound read amplification.
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage.html) — S3-style blob storage: cheap, durable, high-latency, immutable objects.
- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage.html) — Column-oriented layout for analytics: compression and vectorized scans.

### Build evidence

- **Toy write-ahead log** — An append-only WAL with crash recovery.
- **Toy LSM tree** — A minimal LSM storage engine: memtable, SSTables, compaction.
- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Milestone 5: Q4 — System design and synthesis

Turn the depth into architecture-level design and a real prototype.

### Concepts

- [Search Platform Design](https://learn.significanthobbies.com/curriculum/concepts/search-platform-design.html) — End-to-end design of a search platform: ingestion, indexing, query, ranking.
- [RAG System Design](https://learn.significanthobbies.com/curriculum/concepts/rag-system-design.html) — Architecting a production RAG system: ingestion, retrieval, generation, evals.
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html) — Sending each request to the cheapest model that can handle it.
- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html) — The plan → act → observe loop, with memory and stopping conditions.

### Build evidence

- **Search platform design doc** — An architecture doc for a search platform: ingestion, indexing, query, ranking.
- **RAG system design doc** — An architecture doc for a production RAG system with an eval gate.
- **Model router** — Route each request to the cheapest model that passes evals for that request class.
