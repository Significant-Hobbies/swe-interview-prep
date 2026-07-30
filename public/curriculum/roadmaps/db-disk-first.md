# Disk-First Databases & RAM

Companion to docs/learning/db-roadmap.md. Phased link-hub roadmap from the disk-first DB PDF: RAM vs SSD, storage engines, LSM, columnar/vectorized execution, ClickHouse internals, cloud warehouses, search/vector, distributed correctness, and a synthesis project.

- Horizon: 12mo
- Outcome: Build a mechanism-first mental model of how disk-based DBs spend RAM, and why.
- Tracks: Databases & Storage, System Design

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

## Milestone 1: Prerequisites — unlock the rest of this path

Concepts the later milestones depend on. Without these the planner cannot serve the rest of this roadmap.

### Concepts

- [Normalization](https://learn.significanthobbies.com/curriculum/concepts/normalization.html) — Functional dependencies, 1NF through BCNF, and the cases where denormalising is right.
- [Buffer Pool](https://learn.significanthobbies.com/curriculum/concepts/buffer-pool.html) — The database's own page cache — why it does not simply trust the OS.
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels.html) — What each isolation level actually prevents, and how MVCC delivers snapshots without read locks.
- [Join Algorithms](https://learn.significanthobbies.com/curriculum/concepts/join-algorithms.html) — Nested-loop, hash, and merge joins — and why cardinality estimates decide which one you get.
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings.html) — Mapping text/images into dense vectors where distance encodes meaning.
- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html) — L4/L7, consistent hashing, health checks.
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf.html) — Term frequency × inverse document frequency weighting for relevance.
- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html) — Splitting text into terms: lowercasing, stemming, stop words, n-grams.
- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity.html) — Cosine, dot product, and L2 distance — how to score vector closeness.
- [Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing.html) — Ring, virtual nodes, rebalancing.
- [Top-k Vector Search](https://learn.significanthobbies.com/curriculum/concepts/topk-vector-search.html) — Returning the k nearest vectors to a query, exact or approximate.
- [Brute-Force Vector DB](https://learn.significanthobbies.com/curriculum/concepts/brute-force-vector-db.html) — Exact nearest-neighbour search by scanning every vector — the correctness baseline.



## Milestone 2: Phase 0-1 — Thesis + hardware

Frame active state vs stored data; understand CPU cache, DRAM, NVMe, page cache, mmap.

### Concepts

- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval.html) — B-tree vs LSM, indexing, WAL.



## Milestone 3: Phase 2 — Disk-oriented storage engines

Pages, B+trees, WAL, buffer pools, recovery.

### Concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html) — The balanced, disk-friendly tree behind most relational indexes.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal.html) — Append-only durability log written before the data pages.
- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval.html) — B-tree vs LSM, indexing, WAL.
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing.html) — ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.

### Build evidence

- **Toy write-ahead log** — An append-only WAL with crash recovery.

## Milestone 4: Phase 3 — LSM and SSD-first design

Memtables, SSTables, Bloom filters, compaction, read/write/space amplification.

### Concepts

- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree.html) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction.html) — Merging sorted runs to reclaim space and bound read amplification.



## Milestone 5: Phase 4-5 — Columnar execution + ClickHouse

Vectorized execution, projection/filter pushdown, external operators, MergeTree internals.

### Concepts

- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage.html) — Column-oriented layout for analytics: compression and vectorized scans.
- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index.html) — Extra indexes for non-primary-key lookups, and what they cost on writes.
- [Query Execution & Optimization](https://learn.significanthobbies.com/curriculum/concepts/query-execution-optimization.html) — Logical and physical plans, cardinality estimation, join ordering, indexes, vectorized execution, and spilling.

### Build evidence

- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Milestone 6: Phase 6 — Cloud warehouses

Storage/compute separation, shuffle, slots/warehouses, result caching.

### Concepts

- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage.html) — S3-style blob storage: cheap, durable, high-latency, immutable objects.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html) — Range/hash/geo partitioning.
- [Data Warehouses & Lakehouses](https://learn.significanthobbies.com/curriculum/concepts/warehouses-lakehouses.html) — Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture.

### Build evidence

- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Milestone 7: Phase 7 — Search + vector DBs

Inverted indexes, BM25, HNSW, IVF, PQ, DiskANN, recall/latency/memory tradeoff.

### Concepts

- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html) — Term → posting list mapping that powers fast keyword lookup.
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html) — The standard lexical ranking function: TF saturation + IDF + length normalization.
- [HNSW](https://learn.significanthobbies.com/curriculum/concepts/hnsw.html) — Hierarchical Navigable Small World graphs — the dominant ANN index.
- [IVF (Inverted File)](https://learn.significanthobbies.com/curriculum/concepts/ivf.html) — Cluster vectors with k-means, then search only the nearest cells (nprobe).
- [Recall / Latency Tradeoffs](https://learn.significanthobbies.com/curriculum/concepts/recall-latency-tradeoffs.html) — Reading recall-vs-latency curves to choose ANN parameters.



## Milestone 8: Phase 8 — Distributed correctness

Replication, Raft/Paxos, MVCC across nodes, 2PC, serializability.

### Concepts

- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html) — Leader-follower, multi-leader, quorum.
- [Consensus](https://learn.significanthobbies.com/curriculum/concepts/consensus.html) — Raft, Paxos, leader election.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem.html) — Strong/eventual/causal, PACELC.
- [Distributed Infra](https://learn.significanthobbies.com/curriculum/concepts/distributed-infra.html) — Service discovery, orchestration.



## Milestone 9: Phase 9 — Synthesis project

Ship one of: low-RAM benchmark, ch-lowram CLI, spill-first OLAP engine, or disk-backed vector search.

### Concepts
