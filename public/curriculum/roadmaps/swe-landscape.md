# The Software Engineering Landscape (2026)

Companion to docs/learning/swe-landscape.md. One milestone per domain, each a link hub to canonical sources. Pick 2-3 milestones to go deep on; treat the rest as vocabulary.

- Horizon: 12mo
- Outcome: Get a working mental model of every major systems-software domain — LLMs, DBs, streaming, game engines, containers, browsers, compilers, OS, networking, distributed, build, crypto.
- Tracks: System Design, Databases & Storage, AI Systems, Backend

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching) — Cache-aside, write-through, eviction policies.
- [CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery) — Cache hierarchy, origin shield, and invalidation versus TTL at the edge.
- [Pagination](https://learn.significanthobbies.com/curriculum/concepts/pagination) — Offset versus cursor pagination, stable ordering, and why deep pages get expensive.
- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory) — Little's law and the utilisation curve — why latency explodes before a system runs out of capacity.
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing) — ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels) — What each isolation level actually prevents, and how MVCC delivers snapshots without read locks.
- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers) — Backoff, jitter, budgets, and breakers — retrying without turning a blip into an outage.
- [Web Security Basics](https://learn.significanthobbies.com/curriculum/concepts/web-security-basics) — XSS, CSRF, SQL injection, and CORS — the injection and confused-deputy bugs that keep recurring.
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation) — Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping) — Separating functional from non-functional requirements and cutting scope to something buildable.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora) — Frozen base, low-rank adapters, rank/alpha.
- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design) — REST, gRPC, versioning, pagination.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing) — Ring, virtual nodes, rebalancing.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings) — Mapping text/images into dense vectors where distance encodes meaning.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency) — Idempotency keys and dedup windows for safe retries of mutations.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head) — Parallel heads, head_dim split, output projection.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization) — Byte-level, char-level, BPE, vocab design.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training) — Init, NaNs, overfit tests, gradient checks.
- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling) — Identifying classes, attributes, relationships.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs) — Forcing LLM output into a validated JSON schema.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing) — Weights + optimizer state, resume, dataset manifests.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math) — Vectors, matrices, dot products, matmul, shapes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent) — Logits to probabilities, negative log-likelihood loss.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent) — Loss surfaces, learning rate, SGD steps.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling) — Next-token prediction, context windows, perplexity.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop) — Chain rule, autograd, forward/backward passes.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings) — Token & position embeddings, tied weights.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw) — Moments, weight decay, gradient clipping.



## Milestone 2: LLMs and inference engines

Transformers end-to-end, KV cache, paged attention, quantization.

### Concepts

- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention) — Q/K/V, scaled dot-product, causal masking.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block) — Pre-LayerNorm, residuals, MLP, GELU.
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling) — Temperature, top-k, greedy decoding.
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing) — Sending each request to the cheapest model that can handle it.
- [RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment) — Policy gradient, advantages, GRPO/CISPO, on- vs off-policy RLHF.



## Milestone 3: Databases and storage engines

B-trees, LSM, WAL, MVCC, columnar — see the dedicated DB roadmap.

### Concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree) — The balanced, disk-friendly tree behind most relational indexes.
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal) — Append-only durability log written before the data pages.
- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage) — Column-oriented layout for analytics: compression and vectorized scans.



## Milestone 4: Streaming and event systems

Append-only logs, partitions, watermarks, stateful stream processing.

### Concepts

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues) — Kafka, SQS, exactly-once vs at-least-once.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq) — Backoff + jitter, poison messages, dead-letter queues.



## Milestone 5: Game engines and real-time graphics

Fixed-step loops, ECS, render pipelines, GPU command buffers.

### Concepts

- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design) — Turn engines, board state, rules.
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design) — Thread-safety, locks, producer-consumer.



## Milestone 6: Containers and orchestration

Linux namespaces, cgroups, OCI runtimes, Kubernetes scheduling.

### Concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra) — Service discovery, orchestration.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing) — L4/L7, consistent hashing, health checks.



## Milestone 7: Browsers (Chromium, Firefox, Servo)

Parser, layout, JS engine, compositor, sandboxing, WebAssembly.

### Concepts

- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu) — WGSL, compute kernels, matmul, CPU parity.



## Milestone 8: Compilers and language runtimes

Lexer → parser → AST → IR → optimization → codegen; GC, JIT.

### Concepts

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management) — States, transitions, guards.
- [Strategy Pattern](https://learn.significanthobbies.com/curriculum/concepts/strategy-pattern) — Interchangeable algorithms.



## Milestone 9: Operating systems and kernels

Processes, virtual memory, schedulers, file systems, syscalls.

### Concepts

- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design) — Thread-safety, locks, producer-consumer.



## Milestone 10: Networking and protocols

TCP/IP, TLS, HTTP/2 and HTTP/3, QUIC, BGP.

### Concepts

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing) — L4/L7, consistent hashing, health checks.



## Milestone 11: Distributed systems

Consensus, replication, 2PC, gossip, vector clocks.

### Concepts

- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus) — Raft, Paxos, leader election.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem) — Strong/eventual/causal, PACELC.
- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra) — Service discovery, orchestration.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding) — Range/hash/geo partitioning.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication) — Leader-follower, multi-leader, quorum.



## Milestone 12: Build systems and developer tooling

Incremental builds, content-addressed caches, LSP, tree-sitter.

### Concepts





## Milestone 13: Cryptography (applied)

Primitives, signatures, AEAD, TLS, MLS, ZKPs.

### Concepts

- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems) — OAuth2, JWT, session, RBAC.
