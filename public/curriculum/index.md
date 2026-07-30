# SWE Prep Curriculum Catalog

A public, JavaScript-free index of 250 concepts across
19 tracks and 24 sequenced roadmaps.
The active learning loop is Concept → Drill → Build → Review → Apply.

- Human curriculum hub: https://learn.significanthobbies.com/curriculum/
- Structured JSON catalog: https://learn.significanthobbies.com/curriculum/catalog.json
- Interactive learning app: https://learn.significanthobbies.com/learn

# Roadmaps

- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html) (9d) — Rebuild learning momentum by taking one concept all the way to a shipped artifact.
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html) (30d) — Build a solid foundation in both lexical and vector retrieval, ending with hybrid search.
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html) (90d) — Build a strong retrieval, vector, AI-systems, and storage foundation through HighSignal and Codevetter.
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html) (12mo) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html) (12mo) — Build a mechanism-first mental model of how disk-based DBs spend RAM, and why.
- [Runtime — what every runtime has to do](https://learn.significanthobbies.com/curriculum/roadmaps/runtime.html) (12mo) — Build one cross-cutting mental model for V8, JVM, Go, BEAM, .NET CLR, vLLM, SGLang, Cloudflare Workers, and wasmtime.
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html) (12mo) — Get a working mental model of every major systems-software domain — LLMs, DBs, streaming, game engines, containers, browsers, compilers, OS, networking, distributed, build, crypto.
- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice.html) (30d) — Build the design-rounds muscle: model state and behaviour explicitly, justify every class boundary.
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html) (30d) — Be able to design X — feed, chat, ride-hailing, search — under a 45-minute clock with credible numbers.
- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html) (30d) — Solve canonical patterns from scratch — no references, explain the invariant, add one edge-case test.
- [30-Day Math Rating Climb](https://learn.significanthobbies.com/curriculum/roadmaps/math-rating-climb-30d.html) (30d) — Raise your per-roadmap ELO by climbing from linear algebra through statistics to calculus — each week unlocks harder drills at your edge.
- [30-Day Probability & Statistics](https://learn.significanthobbies.com/curriculum/roadmaps/prob-stats-30d.html) (30d) — Active probability & statistics — solve, derive, implement. No passive video watching as a substitute for problems.
- [12-Week Active Math Stack](https://learn.significanthobbies.com/curriculum/roadmaps/math-stack-12w.html) (12mo) — Math → AI systems → distributed/data → quant tools. Active only: solve, derive, implement, simulate — never aesthetic consumption.
- [Behavioral Practice](https://learn.significanthobbies.com/curriculum/roadmaps/behavioral-practice.html) (30d) — Have a STAR-shaped story for every Amazon-style leadership principle, with one self-aware "what I would do differently".
- [12-Week Systems Foundations](https://learn.significanthobbies.com/curriculum/roadmaps/systems-foundations-12w.html) (90d) — Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation.
- [12-Week Infrastructure & Platforms](https://learn.significanthobbies.com/curriculum/roadmaps/infrastructure-platforms-12w.html) (90d) — Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads.
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html) (90d) — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure.
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html) (90d) — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation.
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html) (90d) — Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics.
- [12-Week Agent Systems](https://learn.significanthobbies.com/curriculum/roadmaps/agent-systems-12w.html) (90d) — Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control.
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html) (90d) — Build an evidence-backed evaluation and observability system for models, tools, and agents.
- [12-Week Developer Tools & Code Intelligence](https://learn.significanthobbies.com/curriculum/roadmaps/developer-tools-12w.html) (90d) — Build repository-aware tools that analyze, test, review, debug, and safely remediate code.
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w.html) (90d) — Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product.
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html) (90d) — Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI.

# Tracks and concepts

## Search & IR

Lexical retrieval beyond embeddings: tokenization, inverted indexes, BM25, ranking, hybrid search, and search evaluation.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/search-ir.html
- Concepts: 13
- Roadmaps: 4

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html) — Term → posting list mapping that powers fast keyword lookup.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf.html) — Term frequency × inverse document frequency weighting for relevance.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics.html) — Precision, recall, MRR, and nDCG for measuring retrieval quality.
- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals.html) — Building a labelled query set and harness to compare retrieval approaches.
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html) — Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking.html) — A second-stage cross-encoder pass that reorders the top-k candidates.
- [Query Rewriting](https://learn.significanthobbies.com/curriculum/concepts/query-rewriting.html) — Expanding, correcting, and normalizing queries before retrieval.
- [Search Systems](https://learn.significanthobbies.com/curriculum/concepts/search-discovery.html) — Inverted index, ranking, autocomplete at scale.
- [Top-k Pruning (WAND)](https://learn.significanthobbies.com/curriculum/concepts/top-k-pruning.html) — WAND, MaxScore, and block-max — skipping documents that cannot reach the top k.
- [Learning to Rank](https://learn.significanthobbies.com/curriculum/concepts/learning-to-rank.html) — Pointwise, pairwise, and listwise objectives — and why the metric you care about is not differentiable.
- [Click Models & Position Bias](https://learn.significanthobbies.com/curriculum/concepts/click-models.html) — Why clicks are not relevance labels, and how to debias implicit feedback.

## Mathematics

Active math only: solve, derive, implement, simulate — never aesthetic consumption. Stack: probability & statistics → linear algebra → optimization → quant bridge. No artifact, no learning.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/mathematics.html
- Concepts: 30
- Roadmaps: 3

- [Vectors & Vector Spaces](https://learn.significanthobbies.com/curriculum/concepts/vectors-and-spaces.html) — Vectors as ordered lists, dot products, norms, orthogonality, and the geometric picture of n-dimensional space.
- [Matrices & Linear Transformations](https://learn.significanthobbies.com/curriculum/concepts/matrices-and-transformations.html) — Matrix multiplication as composing linear maps: rotation, scaling, projection, and change of basis.
- [Eigenvalues & Matrix Decomposition](https://learn.significanthobbies.com/curriculum/concepts/eigenvalues-decomposition.html) — Eigenvectors as directions preserved by a transformation; eigenvalues as stretch factors; SVD as the universal factorization.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals.html) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables.html) — Discrete and continuous distributions, expectation, variance, and the law of large numbers.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics.html) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence.html) — Point estimates, standard error, confidence intervals, and what '95% confident' actually means.
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing.html) — Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.
- [Linear Regression](https://learn.significanthobbies.com/curriculum/concepts/regression-basics.html) — Fitting a line (or hyperplane) by least squares; residuals, R², and the geometry of projection.
- [Derivatives & Gradients](https://learn.significanthobbies.com/curriculum/concepts/derivatives-and-gradients.html) — Partial derivatives, the gradient vector, and reading a loss surface for descent direction.
- [Multivariable Optimization](https://learn.significanthobbies.com/curriculum/concepts/multivariable-optimization.html) — Convexity, critical points, constrained optimization, and why SGD works on non-convex losses anyway.
- [Information & Entropy](https://learn.significanthobbies.com/curriculum/concepts/information-entropy.html) — Entropy as surprise, cross-entropy as a loss, KL divergence as a distributional distance.
- [Classical Distributions](https://learn.significanthobbies.com/curriculum/concepts/classical-distributions.html) — Bernoulli, Binomial, Poisson, Normal, and Exponential — when each models the world and what to expect from them.
- [Sampling & the Central Limit Theorem](https://learn.significanthobbies.com/curriculum/concepts/sampling-and-clt.html) — Sampling distributions, standard error of the mean, and why averages become Normal as n grows.
- [A/B Testing for Engineers](https://learn.significanthobbies.com/curriculum/concepts/ab-testing-engineering.html) — Sample size, statistical power, practical significance, SRM checks, and multiple-comparison traps in product experiments.
- [Bayesian Inference](https://learn.significanthobbies.com/curriculum/concepts/bayesian-inference.html) — Priors, posteriors, credible intervals, and when Bayesian updating beats frequentist tests.
- [Maximum Likelihood Estimation](https://learn.significanthobbies.com/curriculum/concepts/maximum-likelihood.html) — Choosing parameters that make the observed data most probable; log-likelihood; connection to cross-entropy loss.
- [Covariance & Correlation](https://learn.significanthobbies.com/curriculum/concepts/covariance-correlation.html) — Covariance measures co-movement; correlation normalizes to [−1, 1]. Foundation for regression, PCA, and portfolio risk.
- [Bias, Variance & Overfitting](https://learn.significanthobbies.com/curriculum/concepts/bias-variance-overfitting.html) — Underfitting vs memorizing noise; why in-sample greatness lies.
- [Rank, Basis & Subspaces](https://learn.significanthobbies.com/curriculum/concepts/matrix-rank-basis.html) — Column space, rank, independence — why matrices are often low-rank in practice.
- [PCA & Projection](https://learn.significanthobbies.com/curriculum/concepts/pca-projection.html) — Principal components as variance-maximizing orthogonal directions; projection as subspace approximation.
- [Returns & Volatility](https://learn.significanthobbies.com/curriculum/concepts/returns-volatility.html) — Simple/log returns, realized volatility, annualization — basic quant units.
- [Stationarity & Autocorrelation](https://learn.significanthobbies.com/curriculum/concepts/stationarity-autocorrelation.html) — When series statistics are stable; memory in lags; noise vs signal.
- [Random Walks & Markov Chains](https://learn.significanthobbies.com/curriculum/concepts/random-walks-markov.html) — Markov property, random walks, transition matrices — generative story behind market efficiency intuition.
- [Sharpe, Drawdown & Portfolio Risk](https://learn.significanthobbies.com/curriculum/concepts/portfolio-risk-metrics.html) — Sharpe, max drawdown, correlation matrices — risk-adjusted comparison.
- [Momentum Backtest Discipline](https://learn.significanthobbies.com/curriculum/concepts/momentum-backtest.html) — Momentum rules, SPY/QQQ benchmarks, holdout honesty — why most backtests lie.
- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory.html) — Little's law and the utilisation curve — why latency explodes before a system runs out of capacity.
- [Curse of Dimensionality](https://learn.significanthobbies.com/curriculum/concepts/curse-of-dimensionality.html) — Why distances concentrate in high dimensions, and what that does to nearest-neighbour search.
- [Combinatorics](https://learn.significanthobbies.com/curriculum/concepts/combinatorics.html) — Counting without enumerating — permutations, combinations, inclusion-exclusion, pigeonhole.
- [Numerical Stability](https://learn.significanthobbies.com/curriculum/concepts/numerical-stability.html) — Floating point, catastrophic cancellation, and the log-sum-exp trick.

## Vector DB & ANN

Vector search engines: similarity, top-k, brute force, HNSW, IVF, quantization, metadata filtering, and recall/latency tradeoffs.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/vector-db.html
- Concepts: 12
- Roadmaps: 3

- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings.html) — Mapping text/images into dense vectors where distance encodes meaning.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity.html) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search.html) — Returning the k nearest vectors to a query, exact or approximate.
- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db.html) — Exact nearest-neighbour search by scanning every vector — the correctness baseline.
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html) — Hierarchical Navigable Small World graphs — the dominant ANN index.
- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf.html) — Cluster vectors with k-means, then search only the nearest cells (nprobe).
- [Product Quantization](https://learn.significanthobbies.com/curriculum/concepts/product-quantization.html) — Compress vectors into sub-space codebooks for tiny memory footprint.
- [Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering.html) — Combining vector search with structured predicates (tenant, date, tags).
- [Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs.html) — Reading recall-vs-latency curves to choose ANN parameters.
- [Scalar & Binary Quantization](https://learn.significanthobbies.com/curriculum/concepts/vector-quantization.html) — Shrinking vectors to int8 or single bits, and rescoring to recover the lost precision.
- [Disk-Based ANN](https://learn.significanthobbies.com/curriculum/concepts/disk-based-ann.html) — DiskANN and SPANN — serving vector indexes that do not fit in memory.
- [Index Updates & Tombstones](https://learn.significanthobbies.com/curriculum/concepts/index-updates-tombstones.html) — Deleting and updating vectors in a graph index without rebuilding it.

## AI Systems

Practical AI engineering: LLM apps, RAG, chunking, tool calling, agents, evals, and model/transformer foundations.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/ai-systems.html
- Concepts: 32
- Roadmaps: 5

- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.
- [Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking.html) — Splitting documents into retrievable units that preserve meaning.
- [Context Packing](https://learn.significanthobbies.com/curriculum/concepts/context-packing.html) — Ordering and budgeting retrieved context within the model's window.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs.html) — Forcing LLM output into a validated JSON schema.
- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling.html) — Letting an LLM invoke functions/APIs via structured calls.
- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html) — The plan → act → observe loop, with memory and stopping conditions.
- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html) — Sending each request to the cheapest model that can handle it.
- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning.html) — Treating prompts as versioned artifacts with logged inputs/outputs.
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html) — Measuring LLM output quality with datasets, graders, and LLM-as-judge.
- [ML Math Foundations](https://learn.significanthobbies.com/curriculum/concepts/ml-math.html) — Vectors, matrices, dot products, matmul, shapes.
- [Gradient Descent](https://learn.significanthobbies.com/curriculum/concepts/ml-gradient-descent.html) — Loss surfaces, learning rate, SGD steps.
- [Backpropagation](https://learn.significanthobbies.com/curriculum/concepts/ml-backprop.html) — Chain rule, autograd, forward/backward passes.
- [Softmax & Cross-Entropy](https://learn.significanthobbies.com/curriculum/concepts/ml-softmax-xent.html) — Logits to probabilities, negative log-likelihood loss.
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw.html) — Moments, weight decay, gradient clipping.
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization.html) — Byte-level, char-level, BPE, vocab design.
- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling.html) — Next-token prediction, context windows, perplexity.
- [Sampling & Decoding](https://learn.significanthobbies.com/curriculum/concepts/ml-sampling.html) — Temperature, top-k, greedy decoding.
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings.html) — Token & position embeddings, tied weights.
- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention.html) — Q/K/V, scaled dot-product, causal masking.
- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head.html) — Parallel heads, head_dim split, output projection.
- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block.html) — Pre-LayerNorm, residuals, MLP, GELU.
- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training.html) — Init, NaNs, overfit tests, gradient checks.
- [Checkpointing](https://learn.significanthobbies.com/curriculum/concepts/ml-checkpointing.html) — Weights + optimizer state, resume, dataset manifests.
- [LoRA & PEFT](https://learn.significanthobbies.com/curriculum/concepts/ml-lora.html) — Frozen base, low-rank adapters, rank/alpha.
- [RL Alignment (GRPO & Policy Gradient)](https://learn.significanthobbies.com/curriculum/concepts/ml-rl-alignment.html) — Policy gradient, advantages, GRPO/CISPO, on- vs off-policy RLHF.
- [Training Data Engineering](https://learn.significanthobbies.com/curriculum/concepts/ml-data-engineering.html) — Cleaning, dedup, JSONL tasks, memorization tests.
- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime.html) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu.html) — WGSL, compute kernels, matmul, CPU parity.
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html) — Held-out loss, baselines, hallucination, leakage.
- [Model Pre-training](https://learn.significanthobbies.com/curriculum/concepts/ml-pretraining.html) — Data mixtures, next-token objectives, scaling laws, distributed training, checkpoints, and training stability.
- [Model Quantization](https://learn.significanthobbies.com/curriculum/concepts/model-quantization.html) — Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.
- [Open-Weight Models](https://learn.significanthobbies.com/curriculum/concepts/open-weight-models.html) — Model cards, licenses, weights, tokenizers, chat templates, adapters, provenance, and reproducible packaging.

## Backend

Production backend strength: HTTP, API design, auth, rate limiting, idempotency, queues, jobs, caching, and observability.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/backend.html
- Concepts: 16
- Roadmaps: 4

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle.html) — DNS → TCP/TLS → request → response: status codes, headers, keep-alive.
- [API Keys](https://learn.significanthobbies.com/curriculum/concepts/api-keys.html) — Issuing, hashing, scoping, and rotating keys for machine clients.
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html) — Token bucket, leaky bucket, sliding window.
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html) — Idempotency keys and dedup windows for safe retries of mutations.
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html) — Backoff + jitter, poison messages, dead-letter queues.
- [Webhooks](https://learn.significanthobbies.com/curriculum/concepts/webhooks.html) — Outbound event delivery: signing, retries, idempotent receivers.
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs.html) — Offloading slow work to workers: scheduling, concurrency, visibility.
- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching.html) — Cache-aside, write-through, eviction policies.
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html) — Kafka, SQS, exactly-once vs at-least-once.
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html) — Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.
- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design.html) — REST, gRPC, versioning, pagination.
- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems.html) — OAuth2, JWT, session, RBAC.
- [Payments](https://learn.significanthobbies.com/curriculum/concepts/ecommerce-payments.html) — Idempotency, sagas, double-entry.
- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers.html) — Backoff, jitter, budgets, and breakers — retrying without turning a blip into an outage.
- [Web Security Basics](https://learn.significanthobbies.com/curriculum/concepts/web-security-basics.html) — XSS, CSRF, SQL injection, and CORS — the injection and confused-deputy bugs that keep recurring.
- [Pagination](https://learn.significanthobbies.com/curriculum/concepts/pagination.html) — Offset versus cursor pagination, stable ordering, and why deep pages get expensive.

## Databases & Storage

Storage foundations for Turbopuffer-class systems: B-trees, LSM trees, WAL, compaction, partitioning, replication, object storage.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/databases.html
- Concepts: 18
- Roadmaps: 4

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html) — The balanced, disk-friendly tree behind most relational indexes.
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree.html) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal.html) — Append-only durability log written before the data pages.
- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction.html) — Merging sorted runs to reclaim space and bound read amplification.
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage.html) — S3-style blob storage: cheap, durable, high-latency, immutable objects.
- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage.html) — Column-oriented layout for analytics: compression and vectorized scans.
- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index.html) — Extra indexes for non-primary-key lookups, and what they cost on writes.
- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval.html) — B-tree vs LSM, indexing, WAL.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html) — Range/hash/geo partitioning.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html) — Leader-follower, multi-leader, quorum.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem.html) — Strong/eventual/causal, PACELC.
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing.html) — ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.
- [Query Execution & Optimization](https://learn.significanthobbies.com/curriculum/concepts/query-execution-optimization.html) — Logical and physical plans, cardinality estimation, join ordering, indexes, vectorized execution, and spilling.
- [Data Warehouses & Lakehouses](https://learn.significanthobbies.com/curriculum/concepts/warehouses-lakehouses.html) — Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture.
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels.html) — What each isolation level actually prevents, and how MVCC delivers snapshots without read locks.
- [Join Algorithms](https://learn.significanthobbies.com/curriculum/concepts/join-algorithms.html) — Nested-loop, hash, and merge joins — and why cardinality estimates decide which one you get.
- [Normalization](https://learn.significanthobbies.com/curriculum/concepts/normalization.html) — Functional dependencies, 1NF through BCNF, and the cases where denormalising is right.
- [Buffer Pool](https://learn.significanthobbies.com/curriculum/concepts/buffer-pool.html) — The database's own page cache — why it does not simply trust the OS.

## System Design

Architecture-level thinking: low-level design, scalability, distributed systems, event-driven design, and end-to-end case studies.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/system-design.html
- Concepts: 26
- Roadmaps: 6

- [Object Modeling](https://learn.significanthobbies.com/curriculum/concepts/object-modeling.html) — Identifying classes, attributes, relationships.
- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management.html) — States, transitions, guards.
- [Strategy Pattern](https://learn.significanthobbies.com/curriculum/concepts/strategy-pattern.html) — Interchangeable algorithms.
- [Observer Pattern](https://learn.significanthobbies.com/curriculum/concepts/observer-pattern.html) — Pub/sub, event propagation.
- [Factory & Creational](https://learn.significanthobbies.com/curriculum/concepts/factory-creational.html) — Abstract factory, builder, singleton.
- [Decorator & Structural](https://learn.significanthobbies.com/curriculum/concepts/decorator-structural.html) — Decorator, adapter, composite.
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html) — Thread-safety, locks, producer-consumer.
- [Command & Chain](https://learn.significanthobbies.com/curriculum/concepts/command-chain.html) — Command, undo, chain of responsibility.
- [Booking & Inventory](https://learn.significanthobbies.com/curriculum/concepts/booking-inventory.html) — Reservation, hold-confirm, optimistic locking.
- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design.html) — Turn engines, board state, rules.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html) — L4/L7, consistent hashing, health checks.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html) — Ring, virtual nodes, rebalancing.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html) — Raft, Paxos, leader election.
- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) — Service discovery, orchestration.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.
- [Feed Systems](https://learn.significanthobbies.com/curriculum/concepts/social-media.html) — Fan-out write/read, timeline.
- [Streaming Media](https://learn.significanthobbies.com/curriculum/concepts/streaming-media.html) — CDN, HLS, transcoding pipeline.
- [Geo Systems](https://learn.significanthobbies.com/curriculum/concepts/location-transport.html) — Geohash, quadtree, dispatch.
- [Collaboration Systems](https://learn.significanthobbies.com/curriculum/concepts/collaboration-productivity.html) — OT, CRDT, conflict resolution.
- [Search Platform Design](https://learn.significanthobbies.com/curriculum/concepts/search-platform-design.html) — End-to-end design of a search platform: ingestion, indexing, query, ranking.
- [RAG System Design](https://learn.significanthobbies.com/curriculum/concepts/rag-system-design.html) — Architecting a production RAG system: ingestion, retrieval, generation, evals.
- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html) — Back-of-the-envelope QPS, storage, and bandwidth maths that sizes a design before you draw it.
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html) — Separating functional from non-functional requirements and cutting scope to something buildable.
- [Rate Limiter Design](https://learn.significanthobbies.com/curriculum/concepts/rate-limiter-design.html) — Token bucket versus sliding window, and making a limiter work across many nodes.
- [Unique ID Generation](https://learn.significanthobbies.com/curriculum/concepts/unique-id-generation.html) — Snowflake, ULID, and UUIDv7 — unique ids without a central allocator.
- [CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery.html) — Cache hierarchy, origin shield, and invalidation versus TTL at the edge.

## DSA & Implementation

Fast, clean implementation ability: arrays, graphs, trees, dynamic programming, and the core algorithmic patterns.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/dsa.html
- Concepts: 27
- Roadmaps: 1

- [Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing.html) — Hash maps, sets, frequency counting.
- [Two Pointers](https://learn.significanthobbies.com/curriculum/concepts/two-pointers.html) — Converging/diverging pointer scans.
- [Sliding Window](https://learn.significanthobbies.com/curriculum/concepts/sliding-window.html) — Variable/fixed window over sequences.
- [Stack](https://learn.significanthobbies.com/curriculum/concepts/stack.html) — LIFO, parsing, monotonic stack.
- [Binary Search](https://learn.significanthobbies.com/curriculum/concepts/binary-search.html) — Halving sorted search space, predicate search.
- [Linked List](https://learn.significanthobbies.com/curriculum/concepts/linked-list.html) — Pointer manipulation, fast/slow, reversal.
- [Trees](https://learn.significanthobbies.com/curriculum/concepts/trees.html) — Binary trees, BSTs, DFS/BFS.
- [Trie](https://learn.significanthobbies.com/curriculum/concepts/tries.html) — Prefix trees.
- [Heap / Priority Queue](https://learn.significanthobbies.com/curriculum/concepts/heap.html) — Top-k, k-way merge, scheduling.
- [Backtracking](https://learn.significanthobbies.com/curriculum/concepts/backtracking.html) — DFS with state restoration, pruning.
- [Graphs](https://learn.significanthobbies.com/curriculum/concepts/graphs.html) — BFS/DFS, topo sort, union-find.
- [Shortest Path](https://learn.significanthobbies.com/curriculum/concepts/shortest-path.html) — Dijkstra, Bellman-Ford, A*.
- [Union-Find](https://learn.significanthobbies.com/curriculum/concepts/union-find.html) — Disjoint set, path compression.
- [1D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-1d.html) — Linear state recurrences.
- [2D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-2d.html) — Grid DP, edit distance, knapsack.
- [Greedy](https://learn.significanthobbies.com/curriculum/concepts/greedy.html) — Local-optimal-as-global proofs.
- [Intervals](https://learn.significanthobbies.com/curriculum/concepts/intervals.html) — Merge, overlap, sweep line.
- [Math & Geometry](https://learn.significanthobbies.com/curriculum/concepts/math-geometry.html) — Number theory, modular, geometry.
- [Bit Manipulation](https://learn.significanthobbies.com/curriculum/concepts/bit-manipulation.html) — Bitwise ops, masks, XOR tricks.
- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis.html) — Big-O, amortised cost, and space complexity — how to argue a bound before writing code.
- [Sorting](https://learn.significanthobbies.com/curriculum/concepts/sorting.html) — Comparison sorts, stability, in-place versus extra space, and when a linear-time sort is available.
- [Prefix Sums](https://learn.significanthobbies.com/curriculum/concepts/prefix-sums.html) — Precomputed cumulative arrays that turn repeated range queries into O(1) lookups.
- [Monotonic Stack](https://learn.significanthobbies.com/curriculum/concepts/monotonic-stack.html) — A stack kept sorted so each element is pushed and popped once, answering next-greater questions in O(n).
- [String Matching](https://learn.significanthobbies.com/curriculum/concepts/string-matching.html) — Finding a pattern in text in linear time — KMP's failure function and Rabin-Karp's rolling hash.
- [Minimum Spanning Tree](https://learn.significanthobbies.com/curriculum/concepts/minimum-spanning-tree.html) — Kruskal and Prim — connecting every node at least total cost.
- [Recursion & Induction](https://learn.significanthobbies.com/curriculum/concepts/recursion-and-induction.html) — Writing recursion you can trust, and solving the recurrence it produces.
- [Quickselect](https://learn.significanthobbies.com/curriculum/concepts/quickselect.html) — Finding the k-th smallest in expected O(n) by recursing into only one partition.

## Behavioral & Communication

The interview round that is not about code: influence, conflict, ownership, prioritisation, and learning from failure.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/behavioral.html
- Concepts: 10
- Roadmaps: 1

- [Leadership](https://learn.significanthobbies.com/curriculum/concepts/leadership-and-influence.html) — Driving outcomes through others.
- [Conflict Resolution](https://learn.significanthobbies.com/curriculum/concepts/conflict-resolution.html) — Disagreement handling.
- [Decision Making](https://learn.significanthobbies.com/curriculum/concepts/problem-solving-and-decision-making.html) — Tradeoffs under uncertainty.
- [Collaboration](https://learn.significanthobbies.com/curriculum/concepts/teamwork-and-collaboration.html) — Cross-functional work.
- [Failure & Learning](https://learn.significanthobbies.com/curriculum/concepts/failure-and-learning.html) — Owning mistakes, post-mortem.
- [Communication](https://learn.significanthobbies.com/curriculum/concepts/communication.html) — Written/verbal, audience adaptation.
- [Prioritization](https://learn.significanthobbies.com/curriculum/concepts/time-management-and-prioritization.html) — Eisenhower, OKR alignment.
- [Innovation](https://learn.significanthobbies.com/curriculum/concepts/innovation-and-creativity.html) — Novel solutions, experimentation.
- [Customer Obsession](https://learn.significanthobbies.com/curriculum/concepts/customer-obsession.html) — User-centered tradeoffs.
- [Ownership](https://learn.significanthobbies.com/curriculum/concepts/ownership-and-accountability.html) — End-to-end responsibility.

## Go-to-Market

Getting a built thing in front of people: positioning, landing pages, SEO, and product analytics.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/go-to-market.html
- Concepts: 4
- Roadmaps: 1

- [Positioning](https://learn.significanthobbies.com/curriculum/concepts/positioning.html) — Naming the problem, the audience, and the alternative you beat.
- [Landing Pages](https://learn.significanthobbies.com/curriculum/concepts/landing-pages.html) — Turning a visitor into an activated user: hero, proof, single CTA.
- [SEO](https://learn.significanthobbies.com/curriculum/concepts/seo.html) — Programmatic and content SEO: intent, structure, indexability.
- [Product Analytics](https://learn.significanthobbies.com/curriculum/concepts/product-analytics.html) — Activation, retention, funnels — measuring whether the product works.

## Systems Foundations

Operating systems, networks, concurrency, hardware, runtimes, performance, security, and isolation.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/systems-foundations.html
- Concepts: 6
- Roadmaps: 1

- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design.html) — Thread-safety, locks, producer-consumer.
- [Operating System Mechanics](https://learn.significanthobbies.com/curriculum/concepts/operating-system-mechanics.html) — Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries.
- [Network Protocol Engineering](https://learn.significanthobbies.com/curriculum/concepts/network-protocol-engineering.html) — Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols.
- [Compute, Memory & Storage Hierarchy](https://learn.significanthobbies.com/curriculum/concepts/compute-memory-storage-hierarchy.html) — CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them.
- [Runtime & Performance Engineering](https://learn.significanthobbies.com/curriculum/concepts/runtime-performance-engineering.html) — Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency.
- [Security & Isolation Boundaries](https://learn.significanthobbies.com/curriculum/concepts/security-isolation-boundaries.html) — Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults.

## Infrastructure & Platforms

Cloud infrastructure, containers, CI/CD, orchestration, reliability, observability, sandboxes, and infrastructure automation.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/infrastructure-platforms.html
- Concepts: 10
- Roadmaps: 1

- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html) — Backoff + jitter, poison messages, dead-letter queues.
- [Background Jobs](https://learn.significanthobbies.com/curriculum/concepts/background-jobs.html) — Offloading slow work to workers: scheduling, concurrency, visibility.
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html) — Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.
- [Cloud Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/cloud-infrastructure.html) — Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes.
- [Containers & Kubernetes](https://learn.significanthobbies.com/curriculum/concepts/containers-kubernetes.html) — Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage.
- [CI/CD & Developer Environments](https://learn.significanthobbies.com/curriculum/concepts/cicd-developer-environments.html) — Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback.
- [Scheduling & Orchestration](https://learn.significanthobbies.com/curriculum/concepts/platform-scheduling-orchestration.html) — Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops.
- [Reliability & Fault Tolerance](https://learn.significanthobbies.com/curriculum/concepts/reliability-fault-tolerance.html) — SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design.
- [Sandboxes & Execution Environments](https://learn.significanthobbies.com/curriculum/concepts/sandbox-execution-environments.html) — Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution.
- [Infrastructure Automation](https://learn.significanthobbies.com/curriculum/concepts/infrastructure-automation.html) — Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes.

## Distributed Systems

Coordination, replication, partitioning, event systems, caching, durable workflows, consistency, and recovery.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/distributed-systems.html
- Concepts: 11
- Roadmaps: 1

- [Caching](https://learn.significanthobbies.com/curriculum/concepts/caching.html) — Cache-aside, write-through, eviction policies.
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html) — Kafka, SQS, exactly-once vs at-least-once.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html) — Range/hash/geo partitioning.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html) — Leader-follower, multi-leader, quorum.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem.html) — Strong/eventual/causal, PACELC.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html) — Raft, Paxos, leader election.
- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) — Service discovery, orchestration.
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html) — WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.
- [Event Streaming & Kafka](https://learn.significanthobbies.com/curriculum/concepts/event-streaming-kafka.html) — Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing.
- [Distributed Workflows & Temporal](https://learn.significanthobbies.com/curriculum/concepts/distributed-workflows-temporal.html) — Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows.
- [Distributed Failure Recovery](https://learn.significanthobbies.com/curriculum/concepts/distributed-failure-recovery.html) — Partial failure, timeouts, retries, deduplication, fencing, repair, anti-entropy, and disaster recovery.

## Inference & Serving

Inference engines, batching, KV caches, attention kernels, decoding, routing, hardware utilization, and serving economics.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/inference-serving.html
- Concepts: 12
- Roadmaps: 2

- [Model Routing](https://learn.significanthobbies.com/curriculum/concepts/model-routing.html) — Sending each request to the cheapest model that can handle it.
- [Browser ML Runtime](https://learn.significanthobbies.com/curriculum/concepts/ml-browser-runtime.html) — Web Workers, WASM, OPFS, TypedArrays.
- [WebGPU Compute](https://learn.significanthobbies.com/curriculum/concepts/ml-webgpu.html) — WGSL, compute kernels, matmul, CPU parity.
- [vLLM & Inference Engines](https://learn.significanthobbies.com/curriculum/concepts/inference-engines.html) — Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture.
- [Continuous Batching](https://learn.significanthobbies.com/curriculum/concepts/continuous-batching.html) — Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness.
- [KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention.html) — Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure.
- [FlashAttention & Attention Kernels](https://learn.significanthobbies.com/curriculum/concepts/flashattention-kernels.html) — IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention.
- [Speculative Decoding](https://learn.significanthobbies.com/curriculum/concepts/speculative-decoding.html) — Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation.
- [GPU Utilization](https://learn.significanthobbies.com/curriculum/concepts/gpu-utilization.html) — Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation.
- [Inference Cost & Latency Optimization](https://learn.significanthobbies.com/curriculum/concepts/inference-cost-latency.html) — Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request.
- [Local & On-device Inference](https://learn.significanthobbies.com/curriculum/concepts/local-on-device-inference.html) — llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory.
- [Inference Hardware](https://learn.significanthobbies.com/curriculum/concepts/inference-hardware.html) — GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit.

## Agent Systems

Agent loops, tools, memory, MCP, coordination, durable execution, permissions, computer use, and long-running work.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/agent-systems.html
- Concepts: 10
- Roadmaps: 1

- [Tool Calling](https://learn.significanthobbies.com/curriculum/concepts/tool-calling.html) — Letting an LLM invoke functions/APIs via structured calls.
- [Agent Loops](https://learn.significanthobbies.com/curriculum/concepts/agent-loops.html) — The plan → act → observe loop, with memory and stopping conditions.
- [Agent Memory & Context Management](https://learn.significanthobbies.com/curriculum/concepts/agent-memory-context.html) — Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting.
- [MCP & Integrations](https://learn.significanthobbies.com/curriculum/concepts/mcp-integrations.html) — Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust.
- [Multi-agent Coordination](https://learn.significanthobbies.com/curriculum/concepts/multi-agent-coordination.html) — Delegation, specialization, shared state, handoffs, arbitration, budgets, and avoiding coordination overhead.
- [Durable Agent Execution](https://learn.significanthobbies.com/curriculum/concepts/durable-agent-execution.html) — Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.
- [Agent Permissions & Sandboxing](https://learn.significanthobbies.com/curriculum/concepts/agent-permissions-sandboxing.html) — Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.
- [Browser & Computer-use Agents](https://learn.significanthobbies.com/curriculum/concepts/browser-computer-use-agents.html) — DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation.
- [Agent Communication & Interfaces](https://learn.significanthobbies.com/curriculum/concepts/agent-communication-interfaces.html) — Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status.
- [Long-running & Scheduled Agents](https://learn.significanthobbies.com/curriculum/concepts/long-running-scheduled-agents.html) — Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets.

## Evaluation & AI Reliability

LLM and agent evaluations, regression gates, failure detection, tracing, verification, human review, and quality economics.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/ai-reliability.html
- Concepts: 12
- Roadmaps: 1

- [Prompt & Version Logging](https://learn.significanthobbies.com/curriculum/concepts/prompt-versioning.html) — Treating prompts as versioned artifacts with logged inputs/outputs.
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals.html) — Measuring LLM output quality with datasets, graders, and LLM-as-judge.
- [Model Evaluation](https://learn.significanthobbies.com/curriculum/concepts/ml-evaluation.html) — Held-out loss, baselines, hallucination, leakage.
- [Coding-agent Benchmarks](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-benchmarks.html) — Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity.
- [Tool-use Evaluations](https://learn.significanthobbies.com/curriculum/concepts/tool-use-evaluations.html) — Tool selection, argument correctness, sequencing, recovery, side-effect safety, and end-state verification.
- [AI Regression Testing](https://learn.significanthobbies.com/curriculum/concepts/ai-regression-testing.html) — Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates.
- [Hallucination & Failure Detection](https://learn.significanthobbies.com/curriculum/concepts/hallucination-failure-detection.html) — Unsupported claims, citations, abstention, tool errors, constraint violations, uncertainty, and escalation.
- [Agent Observability](https://learn.significanthobbies.com/curriculum/concepts/agent-observability.html) — Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics.
- [Tracing & Replay](https://learn.significanthobbies.com/curriculum/concepts/tracing-replay.html) — Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution.
- [Evidence-backed Verification](https://learn.significanthobbies.com/curriculum/concepts/evidence-backed-verification.html) — Claims, source provenance, executable checks, screenshots, diffs, test outputs, and acceptance criteria.
- [Human Review Systems](https://learn.significanthobbies.com/curriculum/concepts/human-review-systems.html) — Review queues, risk routing, disagreement, calibration, escalation, auditability, and learning from corrections.
- [Quality, Cost & Latency Measurement](https://learn.significanthobbies.com/curriculum/concepts/quality-cost-latency-measurement.html) — Task success, calibrated quality, token and tool cost, latency distributions, reliability, and Pareto frontiers.

## Developer Tools & Code Intelligence

Code review, analysis, testing infrastructure, repository graphs, coding agents, supply-chain health, and remediation.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/developer-tools.html
- Concepts: 10
- Roadmaps: 1

- [Code Review Systems](https://learn.significanthobbies.com/curriculum/concepts/code-review-systems.html) — Diff understanding, intent, correctness, maintainability, risk ranking, review workflows, and actionable findings.
- [Static & Dynamic Analysis](https://learn.significanthobbies.com/curriculum/concepts/static-dynamic-analysis.html) — ASTs, control/data flow, abstract interpretation, symbolic execution, sanitizers, profiling, and runtime instrumentation.
- [Testing Infrastructure](https://learn.significanthobbies.com/curriculum/concepts/testing-infrastructure.html) — Unit, integration, contract, E2E, property, fuzz, hermetic environments, fixtures, sharding, and flaky-test control.
- [Codebase Graphs](https://learn.significanthobbies.com/curriculum/concepts/codebase-graphs.html) — Symbols, references, calls, imports, ownership, data flow, build targets, and graph queries over repositories.
- [Dependency & Blast-radius Analysis](https://learn.significanthobbies.com/curriculum/concepts/dependency-blast-radius.html) — Direct and transitive dependencies, affected targets, ownership, runtime consumers, schema impact, and change risk.
- [IDE & CLI Tooling](https://learn.significanthobbies.com/curriculum/concepts/ide-cli-tooling.html) — Language servers, editor protocols, terminal UX, diagnostics, completions, commands, configuration, and automation.
- [Coding Agent Systems](https://learn.significanthobbies.com/curriculum/concepts/coding-agent-systems.html) — Repository context, planning, file edits, tools, tests, sandboxes, review loops, and patch delivery.
- [Repository Intelligence](https://learn.significanthobbies.com/curriculum/concepts/repository-intelligence.html) — Structure, symbols, history, ownership, conventions, architecture, semantic search, and change-aware retrieval.
- [Software Supply-chain Health](https://learn.significanthobbies.com/curriculum/concepts/software-supply-chain-health.html) — Dependency provenance, lockfiles, SBOMs, signing, build integrity, vulnerabilities, update policy, and release attestations.
- [Automated Debugging & Remediation](https://learn.significanthobbies.com/curriculum/concepts/automated-debugging-remediation.html) — Failure reproduction, hypothesis generation, telemetry, fault localization, minimal patches, validation, rollback, and learning.

## Application Engineering

Backend, web, mobile, product analytics, UX, real-time applications, interactive systems, and distribution loops.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/application-engineering.html
- Concepts: 4
- Roadmaps: 1

- [Game/Simulation Design](https://learn.significanthobbies.com/curriculum/concepts/game-design.html) — Turn engines, board state, rules.
- [Web & Mobile Engineering](https://learn.significanthobbies.com/curriculum/concepts/web-mobile-engineering.html) — Web and native lifecycles, rendering, navigation, state, networking, offline behavior, accessibility, and release constraints.
- [UX & Interface Design](https://learn.significanthobbies.com/curriculum/concepts/ux-interface-design.html) — User goals, information architecture, interaction states, feedback, accessibility, usability testing, and design systems.
- [2D/3D Interactive Systems](https://learn.significanthobbies.com/curriculum/concepts/interactive-2d-3d-systems.html) — Scene graphs, render loops, input, animation, physics, GPU pipelines, asset loading, and performance budgets.

## Multimodal & Spatial Computing

Vision, pose, voice, generation, on-device intelligence, robotics, spatial interfaces, and human-computer interaction.

- Public page: https://learn.significanthobbies.com/curriculum/tracks/multimodal-spatial.html
- Concepts: 8
- Roadmaps: 1

- [Multimodal Models](https://learn.significanthobbies.com/curriculum/concepts/multimodal-models.html) — Joint text, image, audio, and video representations, encoders, projectors, fusion, generation, and cross-modal evaluation.
- [Vision Models](https://learn.significanthobbies.com/curriculum/concepts/vision-models.html) — Classification, detection, segmentation, embeddings, vision transformers, data augmentation, and visual evaluation.
- [Pose & Motion Tracking](https://learn.significanthobbies.com/curriculum/concepts/pose-motion-tracking.html) — Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency.
- [Voice & Audio Systems](https://learn.significanthobbies.com/curriculum/concepts/voice-audio-systems.html) — Capture, codecs, streaming, speech recognition, synthesis, turn detection, noise handling, latency, and conversational UX.
- [Image & Video Generation](https://learn.significanthobbies.com/curriculum/concepts/image-video-generation.html) — Diffusion and transformer generation, conditioning, latent spaces, control, consistency, safety, and media evaluation.
- [Robotics Systems](https://learn.significanthobbies.com/curriculum/concepts/robotics-systems.html) — Sensing, localization, mapping, planning, control, simulation, safety, real-time loops, and hardware interfaces.
- [Spatial Interfaces](https://learn.significanthobbies.com/curriculum/concepts/spatial-interfaces.html) — Coordinate systems, anchors, tracking, depth, occlusion, hand/eye input, world understanding, and spatial UI.
- [Human-Computer Interaction](https://learn.significanthobbies.com/curriculum/concepts/human-computer-interaction.html) — Human perception, cognition, motor control, interaction techniques, accessibility, evaluation, and responsible design.
