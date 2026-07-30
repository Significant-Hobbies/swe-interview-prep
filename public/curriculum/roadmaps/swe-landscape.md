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

- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching.html) — Cache-aside, write-through, eviction policies.
- [CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery.html) — Cache hierarchy, origin shield, and invalidation versus TTL at the edge.
- [Pagination](https://learn.significanthobbies.com/curriculum/concepts/pagination.html) — Offset versus cursor pagination, stable ordering, and why deep pages get expensive.
- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory.html) — Little's law and the utilisation curve — why latency explodes before a system runs out of capacity.
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing.html) — ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels.html) — What each isolation level actually prevents, and how MVCC delivers snapshots without read locks.
- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers.html) — Backoff, jitter, budgets, and breakers — retrying without turning a blip into an outage.
- [Web Security Basics](https://learn.significanthobbies.com/curriculum/concepts/web-security-basics.html) — XSS, CSRF, SQL injection, and CORS — the injection and confused-deputy bugs that keep recurring.
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html) — Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html) — Separating functional from non-functional requirements and cutting scope to something buildable.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora.html) — Frozen base, low-rank adapters, rank/alpha.
- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design.html) — REST, gRPC, versioning, pagination.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html) — Ring, virtual nodes, rebalancing.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings.html) — Mapping text/images into dense vectors where distance encodes meaning.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html) — Idempotency keys and dedup windows for safe retries of mutations.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head.html) — Parallel heads, head_dim split, output projection.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization.html) — Byte-level, char-level, BPE, vocab design.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training.html) — Init, NaNs, overfit tests, gradient checks.
- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html) — Identifying classes, attributes, relationships.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs.html) — Forcing LLM output into a validated JSON schema.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing.html) — Weights + optimizer state, resume, dataset manifests.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html) — Vectors, matrices, dot products, matmul, shapes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent.html) — Logits to probabilities, negative log-likelihood loss.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html) — Loss surfaces, learning rate, SGD steps.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling.html) — Next-token prediction, context windows, perplexity.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop.html) — Chain rule, autograd, forward/backward passes.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings.html) — Token & position embeddings, tied weights.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw.html) — Moments, weight decay, gradient clipping.



## Milestone 2: LLMs and inference engines

Transformers end-to-end, KV cache, paged attention, quantization.

### Concepts

- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention.html) — Q/K/V, scaled dot-product, causal masking.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block.html) — Pre-LayerNorm, residuals, MLP, GELU.
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling.html) — Temperature, top-k, greedy decoding.
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html) — Sending each request to the cheapest model that can handle it.
- [RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment.html) — Policy gradient, advantages, GRPO/CISPO, on- vs off-policy RLHF.



## Milestone 3: Databases and storage engines

B-trees, LSM, WAL, MVCC, columnar — see the dedicated DB roadmap.

### Concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html) — The balanced, disk-friendly tree behind most relational indexes.
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree.html) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal.html) — Append-only durability log written before the data pages.
- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage.html) — Column-oriented layout for analytics: compression and vectorized scans.



## Milestone 4: Streaming and event systems

Append-only logs, partitions, watermarks, stateful stream processing.

### Concepts

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html) — Kafka, SQS, exactly-once vs at-least-once.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html) — Backoff + jitter, poison messages, dead-letter queues.



## Milestone 5: Game engines and real-time graphics

Fixed-step loops, ECS, render pipelines, GPU command buffers.

### Concepts

- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design.html) — Turn engines, board state, rules.
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html) — Thread-safety, locks, producer-consumer.



## Milestone 6: Containers and orchestration

Linux namespaces, cgroups, OCI runtimes, Kubernetes scheduling.

### Concepts

- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) — Service discovery, orchestration.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html) — L4/L7, consistent hashing, health checks.



## Milestone 7: Browsers (Chromium, Firefox, Servo)

Parser, layout, JS engine, compositor, sandboxing, WebAssembly.

### Concepts

- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime.html) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu.html) — WGSL, compute kernels, matmul, CPU parity.



## Milestone 8: Compilers and language runtimes

Lexer → parser → AST → IR → optimization → codegen; GC, JIT.

### Concepts

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management.html) — States, transitions, guards.
- [Strategy Pattern](https://learn.significanthobbies.com/curriculum/concepts/strategy-pattern.html) — Interchangeable algorithms.



## Milestone 9: Operating systems and kernels

Processes, virtual memory, schedulers, file systems, syscalls.

### Concepts

- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html) — Thread-safety, locks, producer-consumer.



## Milestone 10: Networking and protocols

TCP/IP, TLS, HTTP/2 and HTTP/3, QUIC, BGP.

### Concepts

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle.html) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html) — L4/L7, consistent hashing, health checks.



## Milestone 11: Distributed systems

Consensus, replication, 2PC, gossip, vector clocks.

### Concepts

- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html) — Raft, Paxos, leader election.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem.html) — Strong/eventual/causal, PACELC.
- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) — Service discovery, orchestration.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html) — Range/hash/geo partitioning.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html) — Leader-follower, multi-leader, quorum.



## Milestone 12: Build systems and developer tooling

Incremental builds, content-addressed caches, LSP, tree-sitter.

### Concepts





## Milestone 13: Cryptography (applied)

Primitives, signatures, AEAD, TLS, MLS, ZKPs.

### Concepts

- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems.html) — OAuth2, JWT, session, RBAC.
