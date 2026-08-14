# 90-Day AI Search & Infrastructure

The core roadmap. Three months that move from retrieval basics to ANN, RAG, and the storage foundations behind systems like Turbopuffer.

- Horizon: 90d
- Outcome: Build a strong retrieval, vector, AI-systems, and storage foundation through HighSignal and Codevetter.
- Tracks: Search & IR, Vector DB & ANN, AI Systems, Databases & Storage

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Learning to Rank](https://learn.significanthobbies.com/curriculum/concepts/learning-to-rank) — Pointwise, pairwise, and listwise objectives — and why the metric you care about is not differentiable.
- [Scalar & Binary Quantization](https://learn.significanthobbies.com/curriculum/concepts/vector-quantization) — Shrinking vectors to int8 or single bits, and rescoring to recover the lost precision.
- [Disk-Based ANN](https://learn.significanthobbies.com/curriculum/concepts/disk-based-ann) — DiskANN and SPANN — serving vector indexes that do not fit in memory.
- [Index Updates & Tombstones](https://learn.significanthobbies.com/curriculum/concepts/index-updates-tombstones) — Deleting and updating vectors in a graph index without rebuilding it.
- [Top-k Pruning (WAND)](https://learn.significanthobbies.com/curriculum/concepts/top-k-pruning) — WAND, MaxScore, and block-max — skipping documents that cannot reach the top k.
- [Descriptive Statistics](https://learn.significanthobbies.com/curriculum/concepts/descriptive-statistics) — Summarizing data: mean, median, variance, correlation, and when each summary lies.
- [Probability Fundamentals](https://learn.significanthobbies.com/curriculum/concepts/probability-fundamentals) — Sample spaces, conditional probability, independence, and Bayes' rule for updating beliefs.
- [Random Variables & Distributions](https://learn.significanthobbies.com/curriculum/concepts/random-variables) — Discrete and continuous distributions, expectation, variance, and the law of large numbers.
- [Ranking Metrics](https://learn.significanthobbies.com/curriculum/concepts/ranking-metrics) — Precision, recall, MRR, and nDCG for measuring retrieval quality.
- [Structured Outputs](https://learn.significanthobbies.com/curriculum/concepts/structured-outputs) — Forcing LLM output into a validated JSON schema.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf) — Term frequency × inverse document frequency weighting for relevance.
- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Estimation & Confidence Intervals](https://learn.significanthobbies.com/curriculum/concepts/estimation-confidence) — Point estimates, standard error, confidence intervals, and what '95% confident' actually means.
- [Hypothesis Testing](https://learn.significanthobbies.com/curriculum/concepts/hypothesis-testing) — Null and alternative hypotheses, p-values, significance, power, and Type I/II errors.
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search) — Returning the k nearest vectors to a query, exact or approximate.



## Milestone 2: Month 1 — Retrieval and evaluation

Lexical + vector retrieval, hybrid search, evals.

### Concepts

- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index) — Term → posting list mapping that powers fast keyword lookup.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings) — Mapping text/images into dense vectors where distance encodes meaning.
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search) — Fusing lexical (BM25) and vector retrieval, usually via reciprocal rank fusion.
- [Search Evals](https://learn.significanthobbies.com/curriculum/concepts/search-evals) — Building a labelled query set and harness to compare retrieval approaches.

### Build evidence

- **Implement BM25 search in HighSignal** — Index a corpus of articles and serve ranked keyword search using BM25.
- **Hybrid search v0 in HighSignal** — Combine BM25 and vector retrieval with reciprocal rank fusion.
- **Search eval harness** — A reusable harness that scores any retriever against a labelled query set.

## Milestone 3: Month 2 — Vector databases and ANN

Brute force, HNSW, filtering, recall/latency tradeoffs.

### Concepts

- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db) — Exact nearest-neighbour search by scanning every vector — the correctness baseline.
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw) — Hierarchical Navigable Small World graphs — the dominant ANN index.
- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf) — Cluster vectors with k-means, then search only the nearest cells (nprobe).
- [Metadata Filtering](https://learn.significanthobbies.com/curriculum/concepts/metadata-filtering) — Combining vector search with structured predicates (tenant, date, tags).
- [Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs) — Reading recall-vs-latency curves to choose ANN parameters.

### Build evidence

- **Brute-force vector index** — An exact nearest-neighbour index — the recall=1.0 baseline.
- **Metadata filtering for vector search** — Add structured predicate filtering to vector search.
- **Recall / latency benchmark dashboard** — Plot recall vs latency for ANN parameter sweeps against the brute-force baseline.

## Milestone 4: Month 3 — AI systems and storage

RAG with evals, plus the storage foundations underneath.

### Concepts

- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag) — Retrieval-Augmented Generation: ground an LLM answer in retrieved context.
- [Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking) — Splitting documents into retrievable units that preserve meaning.
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking) — A second-stage cross-encoder pass that reorders the top-k candidates.
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals) — Measuring LLM output quality with datasets, graders, and LLM-as-judge.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal) — Append-only durability log written before the data pages.
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage) — S3-style blob storage: cheap, durable, high-latency, immutable objects.

### Build evidence

- **RAG pipeline v0** — An end-to-end retrieve → pack → generate pipeline grounded in a document corpus.
- **LLM eval harness** — A dataset + grader harness that scores LLM output on every prompt/model change.
- **Toy write-ahead log** — An append-only WAL with crash recovery.
- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.
