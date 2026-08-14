# Databases & Storage

Storage foundations for Turbopuffer-class systems: B-trees, LSM trees, WAL, compaction, partitioning, replication, object storage.

This track contains 18 connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day) — Build a strong retrieval, vector, AI-systems, and storage foundation through HighSignal and Codevetter.
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month) — Reach the depth to design and reason about systems like Turbopuffer, and ship them through HighSignal and Codevetter.
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first) — Build a mechanism-first mental model of how disk-based DBs spend RAM, and why.
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape) — Get a working mental model of every major systems-software domain — LLMs, DBs, streaming, game engines, containers, browsers, compilers, OS, networking, distributed, build, crypto.

## Concepts

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree) (core) — The balanced, disk-friendly tree behind most relational indexes.
- [LSM Tree](https://learn.significanthobbies.com/curriculum/concepts/lsm-tree) (advanced) — Log-structured merge tree: write-optimized storage via sorted runs.
- [Write-Ahead Log](https://learn.significanthobbies.com/curriculum/concepts/wal) (core) — Append-only durability log written before the data pages.
- [Compaction](https://learn.significanthobbies.com/curriculum/concepts/compaction) (advanced) — Merging sorted runs to reclaim space and bound read amplification.
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage) (core) — S3-style blob storage: cheap, durable, high-latency, immutable objects.
- [Columnar Storage](https://learn.significanthobbies.com/curriculum/concepts/columnar-storage) (advanced) — Column-oriented layout for analytics: compression and vectorized scans.
- [Secondary Indexes](https://learn.significanthobbies.com/curriculum/concepts/secondary-index) (core) — Extra indexes for non-primary-key lookups, and what they cost on writes.
- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval) (advanced) — B-tree vs LSM, indexing, WAL.
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding) (advanced) — Range/hash/geo partitioning.
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication) (advanced) — Leader-follower, multi-leader, quorum.
- [CAP & Consistency Models](https://learn.significanthobbies.com/curriculum/concepts/cap-theorem) (advanced) — Strong/eventual/causal, PACELC.
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing) (core) — ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.
- [Query Execution & Optimization](https://learn.significanthobbies.com/curriculum/concepts/query-execution-optimization) (core) — Logical and physical plans, cardinality estimation, join ordering, indexes, vectorized execution, and spilling.
- [Data Warehouses & Lakehouses](https://learn.significanthobbies.com/curriculum/concepts/warehouses-lakehouses) (core) — Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture.
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels) (core) — What each isolation level actually prevents, and how MVCC delivers snapshots without read locks.
- [Join Algorithms](https://learn.significanthobbies.com/curriculum/concepts/join-algorithms) (core) — Nested-loop, hash, and merge joins — and why cardinality estimates decide which one you get.
- [Normalization](https://learn.significanthobbies.com/curriculum/concepts/normalization) (core) — Functional dependencies, 1NF through BCNF, and the cases where denormalising is right.
- [Buffer Pool](https://learn.significanthobbies.com/curriculum/concepts/buffer-pool) (core) — The database's own page cache — why it does not simply trust the OS.
