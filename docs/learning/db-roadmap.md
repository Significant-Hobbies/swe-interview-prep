# Database Learning Roadmap — Disk-First Mental Model

← [Learning OS index](./index.md)

Source PDF: `db_ram_disk_first_roadmap.pdf` (June 2026). Link hub — almost
every concept has an authoritative source; go there, not here. Last source
audit: **2026-06-15**.

Thesis: **stored data is cheap, active state is expensive.** RAM goes to
buffer pools, hash tables, sort buffers, decompressed vectors, concurrency
multipliers — not "the data."

For every system, answer: what's on disk, what must live in RAM, what's
optional cache, what spills, what's sequential vs random, what's compressed,
what expands at runtime, what multiplies with concurrency, what it optimizes
for, what it sacrifices.

---

## Scope — what's in, what's out, why

**In scope.** Disk-first internals: how storage engines lay bytes on disk,
how they spend RAM, how query execution turns plans into operators that
spill, how distributed correctness layers on top. Mechanism-first across
~10 system families.

**Out of scope.** The practitioner side — writing SQL, modeling data,
tuning indexes for a specific workload, operating a production database,
plus the non-relational families beyond a name. The PDF this roadmap
distills sets up the internals frame; for the practitioner side see *What
this roadmap doesn't cover* immediately below.

**Who this is for.** Someone who wants the mental model of how a database
*works*, not how to use one day-to-day. If you want to be effective with
Postgres tomorrow, the *What this roadmap doesn't cover* links are where
you should be.

---

## Single best starting points

- **Course (notes + slides + project)** — [CMU 15-445/645 Fall 2025](https://15445.courses.cs.cmu.edu/fall2025/schedule.html) · [YouTube playlist](https://www.youtube.com/playlist?list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq) · [CMU 15-721 Advanced (Spring 2024)](https://15721.courses.cs.cmu.edu/spring2024/schedule.html)
- **Survey talks** — [What Goes Around Comes Around (Stonebraker & Hellerstein)](https://15721.courses.cs.cmu.edu/spring2024/papers/01-history/whatgoesaround-stonebraker.pdf) · [Architecture of a Database System (Hellerstein et al., FnTDB 2007)](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf) · [Database Internals talk index (Petrov)](https://www.databass.dev/talks)
- **Practitioner blogs to subscribe to** — [Murat Demirbas](http://muratbuffalo.blogspot.com/) · [Marc Brooker](https://brooker.co.za/blog/) · [Aphyr](https://aphyr.com/) · [Heidi Howard's consensus reading list](https://heidihoward.github.io/distributed-consensus-reading-list/) · [Stratos Idreos publications](https://stratos.seas.harvard.edu/publications)

---

## What this roadmap doesn't cover — read these instead

This is a **disk-first internals** lens — RAM, storage engines, execution.
It deliberately skips most of the SQL / data modeling / operations side of
databases. For each of those, here is the single best external resource.

### SQL itself (joins, window functions, CTEs)
- [SQLBolt](https://sqlbolt.com/) — interactive in-browser tutorial; fastest zero-to-joins
- [Markus Winand — modern-sql.com](https://modern-sql.com/) — canonical reference for window functions, recursive CTEs, FILTER, what changed since SQL-92
- [Mode SQL Tutorial](https://mode.com/sql-tutorial/) — analyst-flavored walkthrough

### Relational theory and normalization
- [db-book.com (Silberschatz/Korth/Sudarshan, 7e)](https://www.db-book.com/) — chapters + slides on relational algebra + 1NF–BCNF
- [Stanford CS145 — Normalization notes (Ullman)](http://infolab.stanford.edu/~ullman/fcdb/aut07/2006/lecture_notes/06-Normalization.html) · [Relational Algebra notes](http://infolab.stanford.edu/~ullman/fcdb/aut07/2006/lecture_notes/02-relational-algebra.html)

### OLTP transactions and isolation levels
- [Kleppmann — Hermitage: Testing the "I" in ACID](https://martin.kleppmann.com/2014/11/25/hermitage-testing-the-i-in-acid.html) · [test repo](https://github.com/ept/hermitage) — concrete SQL distinguishing RC/RR/SI/SSI
- [Aphyr — Strong consistency models](https://aphyr.com/posts/313-strong-consistency-models) · [jepsen.io/consistency](https://jepsen.io/consistency/models)
- [PostgreSQL docs — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) · [Bailis et al. — HAT (VLDB 2014)](https://www.bailis.org/papers/hat-vldb2014-extended.pdf)

### Query optimization and EXPLAIN
- [Bruce Momjian — Explaining the Postgres Query Optimizer](https://momjian.us/main/presentations/internals.html) — canonical EXPLAIN walkthroughs
- [pganalyze blog (Lukas Fittl)](https://pganalyze.com/blog) — ongoing posts on plan caching, statistics, query tuning

### Indexing strategies in practice
- [Markus Winand — Use The Index, Luke!](https://use-the-index-luke.com/) — canonical free book on composite / covering / partial / expression indexes; engine-portable

### Data modeling (ER, dimensional, JSONB)
- [Kimball Group — Dimensional Modeling Techniques (PDF)](https://www.kimballgroup.com/wp-content/uploads/2013/08/2013.09-Kimball-Dimensional-Modeling-Techniques11.pdf) — condensed technique catalog
- [dbt blog — Building a Kimball model with dbt](https://docs.getdbt.com/blog/kimball-dimensional-model) — modern analytics-engineering take

### Schema migrations and online DDL
- [ankane/strong_migrations README](https://github.com/ankane/strong_migrations) — every unsafe migration + its safe rewrite
- [github/gh-ost](https://github.com/github/gh-ost) — triggerless online schema migration for MySQL
- [Stripe — Zero-downtime data migrations at 99.999% uptime](https://stripe.dev/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations)

### Replication topologies and HA
- [PostgreSQL — High Availability docs](https://www.postgresql.org/docs/current/different-replication-solutions.html) — sync/async, logical, PITR, failover comparison
- [Vitess docs](https://vitess.io/docs/) — sharded MySQL ops at scale

### DB operations (vacuum, pooling, slow queries)
- [Crunchy Bridge — Vacuum & autovacuum](https://docs.crunchybridge.com/guides/vacuum-and-autovacuum) · [Tuning autovacuum](https://docs.crunchybridge.com/guides/tuning-autovacuum)
- [PgBouncer docs](https://www.pgbouncer.org/) — connection pooling
- [pganalyze blog](https://pganalyze.com/blog) — slow query analysis, pg_stat_*

### Graph databases
- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/) · [GraphAcademy — Graph Data Modeling Fundamentals](https://graphacademy.neo4j.com/) — property graph model + traversal
- [openCypher.org](https://opencypher.org/) — bridge to ISO/IEC 39075 GQL

### Time-series internals
- [Fabian Reinartz — Writing a Time Series Database from Scratch](https://fabxc.org/tsdb/) — canonical Prometheus TSDB design post
- [VictoriaMetrics blog — high-cardinality](https://victoriametrics.com/blog/categories/high-cardinality/) — production cardinality / retention / downsampling

### Wide-column DBs (Cassandra / Scylla)
- [ScyllaDB University — Data Modeling course](https://university.scylladb.com/courses/data-modeling/) — free, covers partition/clustering keys, tombstones, anti-patterns
- [ScyllaDB Docs — Data Modeling Best Practices](https://docs.scylladb.com/stable/get-started/data-modeling/best-practices.html)

### Document DBs (MongoDB)
- [MongoDB University — M001 Basics](https://learn.mongodb.com/learning-paths/introduction-to-mongodb) · [M320 Data Modeling](https://learn.mongodb.com/courses/m320-mongodb-data-modeling)
- [WiredTiger Architecture Guide](https://source.wiredtiger.com/develop/arch-index.html) — storage engine internals

### Cloud DB operations
- [Amazon Aurora — SIGMOD 2017 paper](https://www.amazon.science/publications/amazon-aurora-design-considerations-for-high-throughput-cloud-native-relational-databases) — log-is-the-database architecture
- [AWS Builders' Library](https://aws.amazon.com/builders-library/) — operational patterns
- [Cloud Spanner docs](https://cloud.google.com/spanner/docs) — TrueTime, global SQL

### ORMs and data access patterns
- [Martin Fowler — PoEAA catalog](https://martinfowler.com/eaaCatalog/) — Identity Map, Unit of Work, Lazy Load, Repository, Data Mapper

For everything else (LLMs, streaming, containers, OS, networking, etc.) see
[The Software Engineering Landscape](./swe-landscape.md).

---

## Phase 0 — Frame the thesis

- [Marc Brooker — What Does a Database for SSDs Look Like? (Dec 2025)](https://brooker.co.za/blog/2025/12/15/database-for-ssd.html) ★ best modern Phase-0 anchor
- [The 5-minute rule for trading memory for disk accesses (Gray & Putzolu, 1987)](https://www.hpl.hp.com/techreports/tandem/TR-86.1.pdf)
- [The Five-Minute Rule Thirty Years Later (Appuswamy, Borovica-Gajic, Graefe, Ailamaki — ADMS 2017)](https://renata.borovica-gajic.com/data/adms2017_5minuterule.pdf)
- [Latency numbers every programmer should know](https://gist.github.com/jboner/2841832)
- [Marc Brooker — Surprising Economics of Load-Balanced Systems (2020)](https://brooker.co.za/blog/2020/08/06/erlang.html) — M/M/c queue mental model

## Phase 1 — Hardware and OS memory

- [What Every Programmer Should Know About Memory (Drepper, 2007)](https://akkadia.org/drepper/cpumemory.pdf) — dated on NUMA/PMEM, still irreplaceable
- [SQLite mmap docs](https://sqlite.org/mmap.html)
- [Are You Sure You Want to Use MMAP in Your Database? (Crotty et al., CIDR 2022)](https://db.cs.cmu.edu/mmap-cidr2022/)
- [LeanStore: storage engine for NVMe SSDs (VLDB 2024)](https://www.vldb.org/pvldb/vol17/p4536-leis.pdf)
- [Efficient IO with io_uring (Axboe paper)](https://kernel.dk/io_uring.pdf)
- [LWN — What's new with io_uring in 6.10 (Axboe, 2024)](https://lwn.net/Articles/974341/)
- [Lord of the io_uring tutorial (unixism)](https://unixism.net/loti/) — hands-on companion to Axboe's design paper
- [Cloudflare — Missing manuals: io_uring worker pool](https://blog.cloudflare.com/missing-manuals-io_uring-worker-pool/) — under-documented gotcha
- [Glauber Costa — Modern storage is plenty fast, it is the APIs that are bad (p99 2021)](https://www.p99conf.io/2021/09/16/modern-storage-is-plenty-fast-it-is-the-apis-that-are-bad/)
- [Brendan Gregg — perf one-liners](https://www.brendangregg.com/perf.html)

## Phase 2 — Disk-oriented storage engines

- [CMU 15-445 Fall 2025 — Memory & Disk Management notes](https://15445.courses.cs.cmu.edu/fall2025/notes/04-bufferpool.pdf)
- [CMU 15-445 Fall 2025 — Storage Part II](https://15445.courses.cs.cmu.edu/fall2025/notes/05-storage2.pdf) — slotted pages, tuple layout, log-structured
- [Modern B-Tree Techniques (Graefe survey)](https://w6113.github.io/files/papers/btreesurvey-graefe.pdf)
- [The Ubiquitous B-Tree (Comer, 1979)](https://dl.acm.org/doi/10.1145/356770.356776)
- [SQLite architecture](https://sqlite.org/arch.html) · [file format](https://sqlite.org/fileformat.html) · [WAL design doc](https://sqlite.org/wal.html)
- [Postgres internals — Suzuki (free online, read by chapter; covers up to PG 18)](https://www.interdb.jp/pg/)
- [InnoDB architecture overview](https://dev.mysql.com/doc/refman/8.0/en/innodb-architecture.html)
- [ARIES recovery paper (Mohan et al.)](https://web.stanford.edu/class/cs345d-01/rl/aries.pdf)

In this codebase: [[b-tree]], [[wal]], [[storage-retrieval]].

## Phase 3 — LSM and SSD-first design

- [The Log-Structured Merge-Tree (O'Neil, 1996)](https://www.cs.umb.edu/~poneil/lsmtree.pdf)
- [LSM-based Storage Techniques: A Survey (Luo & Carey, VLDB 2020)](https://arxiv.org/pdf/1812.07527.pdf)
- [How to Grow an LSM-tree? Bridging Theory and Practice (2025)](https://arxiv.org/pdf/2504.17178) — modern tuning theory; updates Monkey/Dostoevsky
- [RocksDB — Architecture Guide](https://github.com/facebook/rocksdb/wiki/Rocksdb-Architecture-Guide) · [Tuning guide](https://github.com/facebook/rocksdb/wiki/RocksDB-Tuning-Guide) · [Leveled Compaction](https://github.com/facebook/rocksdb/wiki/Leveled-Compaction)
- [Pebble: A RocksDB-Inspired KV Store (Cockroach Labs blog, 2020)](https://www.cockroachlabs.com/blog/pebble-rocksdb-kv-store/) — history
- [Value separation in Pebble v25.4 (Cockroach Labs, Jan 2026)](https://www.cockroachlabs.com/blog/value-separation-pebble-optimization/) — current state
- [Value separation in CockroachDB 25.3 (Cockroach Labs)](https://www.cockroachlabs.com/blog/value-separation-cockroachdb-25-3-improved-performance/) — production-side companion
- [Monkey: optimal Bloom filter tuning (Dayan, SIGMOD 2017)](https://stratos.seas.harvard.edu/files/stratos/files/monkeykeyvaluestore.pdf)
- [Dostoevsky: better space-amp tradeoffs (Dayan & Idreos, SIGMOD 2018)](https://stratos.seas.harvard.edu/files/stratos/files/dostoevsky.pdf)
- [bLSM paper (Sears & Ramakrishnan, SIGMOD 2012)](https://www.eecs.harvard.edu/~margo/cs265/papers/sears-2012.pdf)

In this codebase: [[lsm-tree]], [[compaction]].

## Phase 4 — Analytical execution (columnar, vectorized)

- [Design and Implementation of Modern Column-Oriented Database Systems (Abadi/Boncz/Idreos/Madden, FnTDB 2013)](https://www.cs.umd.edu/~abadi/papers/abadi-column-stores.pdf) — the survey that subsumes C-Store + X100 commentary
- [C-Store paper (Stonebraker et al., VLDB 2005)](https://www.cs.umb.edu/~poneil/CStore.pdf)
- [MonetDB/X100: Hyper-Pipelining Query Execution (Boncz, Zukowski, Nes — CIDR 2005)](https://www.cidrdb.org/cidr2005/papers/P19.pdf)
- [Morsel-Driven Parallelism (Leis et al., SIGMOD 2014)](https://db.in.tum.de/~leis/papers/morsels.pdf) — load-bearing for any vectorized engine
- [DuckDB: an Embeddable Analytical Database (SIGMOD 2019 demo)](https://dl.acm.org/doi/10.1145/3299869.3320212) — the canonical DuckDB paper
- [DuckDB memory management (blog)](https://duckdb.org/2024/07/09/memory-management.html)
- [DuckDB workload tuning (docs)](https://duckdb.org/docs/stable/guides/performance/how_to_tune_workloads)
- [DuckDB — Querying Parquet with Precision](https://duckdb.org/2021/06/25/querying-parquet.html)
- [DuckDB — Push-based execution (media)](https://duckdb.org/media/push-based-execution-in-duckdb/)
- [DuckDB — Lightweight Compression (FSST/dict/RLE)](https://duckdb.org/2022/10/28/lightweight-compression)
- [ALP: Adaptive Lossless Floating-Point compression (DuckDB writeup, SIGMOD 2023)](https://duckdb.org/science/alp/)
- [FastLanes file format (DuckDB)](https://duckdb.org/library/fastlanes/) — successor research to Parquet
- [Photon: Databricks vectorized engine (SIGMOD 2022)](https://www.databricks.com/wp-content/uploads/2022/07/Photon-SIGMOD-2022.pdf)
- [Velox paper (Meta, PVLDB 2022)](https://research.facebook.com/file/884135262739906/Velox-Meta-s-Unified-Execution-Engine.pdf)
- [Apache Arrow columnar format spec](https://arrow.apache.org/docs/format/Columnar.html)
- [Apache Parquet file format spec](https://parquet.apache.org/docs/file-format/)
- [Apache Iceberg v3 spec](https://iceberg.apache.org/spec/) — open table format = table stakes
- [Daniel Lemire — bitpacking benchmarks (2012)](https://lemire.me/blog/2012/03/06/how-fast-is-bit-packing/) · [simdcomp source](https://github.com/fast-pack/simdcomp)

In this codebase: [[columnar-storage]], [[secondary-index]].

## Phase 5 — ClickHouse internals

- [The ClickHouse paper (VLDB 2024)](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)
- [VLDB 2024 talk video — Alexey Milovidov](https://clickhouse.com/videos/vldb-2024-clickhouse)
- [Academic overview (ClickHouse docs)](https://clickhouse.com/docs/academic_overview) — curated reading list version of the paper
- [MergeTree engine docs](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree)
- [Query complexity / spill settings](https://clickhouse.com/docs/operations/settings/query-complexity)
- [Low-resource tips](https://clickhouse.com/docs/operations/tips)
- [Sparse primary index deep dive (blog)](https://clickhouse.com/blog/clickhouse-primary-keys)
- [Projections (blog)](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
- [Materialized views vs projections (docs)](https://clickhouse.com/docs/managing-data/materialized-views-versus-projections)
- [Altinity — MergeTree Storage / Merges / Replication (slides, 2023)](https://altinity.com/wp-content/uploads/2023/11/ClickHouse-Data-Management-Internals-MergeTree-Storage-Merges-Replication-2023-11-15.pdf)
- [Altinity KB — Merge performance and OPTIMIZE FINAL](https://kb.altinity.com/engines/mergetree-table-engine-family/merge-performance-final-optimize-by/)
- [ClickHouse source — `src/Storages/MergeTree/`](https://github.com/ClickHouse/ClickHouse/tree/master/src/Storages/MergeTree)

## Phase 6 — Cloud warehouses

- [Dremel paper (Melnik et al., VLDB 2010)](https://research.google/pubs/pub36632/)
- [Dremel: A Decade of Interactive SQL (Melnik et al., VLDB 2020)](https://research.google/pubs/pub49489/)
- [Inside Capacitor, BigQuery's columnar storage format (Pasumansky, blog)](https://cloud.google.com/blog/products/bigquery/inside-capacitor-bigquerys-next-generation-columnar-storage-format)
- [BigLake: BigQuery's evolution toward a multi-cloud lakehouse (SIGMOD 2024)](https://research.google/pubs/biglake-bigquerys-evolution-toward-a-multi-cloud-lakehouse/)
- [Procella (VLDB 2019)](https://research.google/pubs/pub48388/) — Google's serving + analytical engine
- [BigQuery introduction](https://cloud.google.com/bigquery/docs/introduction)
- [BigQuery explained — 5-part blog series](https://cloud.google.com/blog/products/data-analytics/new-blog-series-bigquery-explained-overview)
- [The Snowflake Elastic Data Warehouse (Dageville et al., SIGMOD 2016)](https://event.cwi.nl/lsde/papers/p215-dageville-snowflake.pdf)
- [Pruning in Snowflake — Working Smarter, Not Harder (SIGMOD 2025)](https://2025.sigmod.org/sigmod_industry_papers.shtml) — newest Snowflake first-party paper
- [Snowflake — micro-partitions and clustering](https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions)
- [Amazon Redshift Re-invented (SIGMOD 2022)](https://assets.amazon.science/d3/26/0c89c11241a0a5b0fbf1c4c5cd6f/amazon-redshift-re-invented.pdf)
- [Databricks Lakehouse (CIDR 2021)](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf) · [Delta Lake paper (VLDB 2020)](https://www.vldb.org/pvldb/vol13/p3411-armbrust.pdf)

## Phase 7 — Search engines and vector DBs

- [Lucene 10.x file formats](https://lucene.apache.org/core/10_2_0/core/org/apache/lucene/codecs/lucene103/package-summary.html) (re-pin yearly via [downloads index](https://lucene.apache.org/core/downloads.html))
- [Robertson & Zaragoza — The Probabilistic Relevance Framework: BM25 and Beyond (FnTIR 2009)](https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf) — canonical BM25 reference
- [Tantivy architecture](https://github.com/quickwit-oss/tantivy/blob/main/ARCHITECTURE.md) · [Quickwit storage layer](https://quickwit.io/docs/main-concepts/storage)
- [HNSW paper (Malkov & Yashunin, 2016)](https://arxiv.org/abs/1603.09320)
- [Faiss paper](https://arxiv.org/abs/1702.08734) · [Faiss tutorial](https://github.com/facebookresearch/faiss/wiki/Getting-started)
- [ScaNN paper (Guo et al., ICML 2020)](https://arxiv.org/abs/1908.10396) · [Google announcement](https://research.google/blog/announcing-scann-efficient-vector-similarity-search/) · [SOAR follow-up (NeurIPS 2023)](https://research.google/blog/soar-new-algorithms-for-even-faster-vector-search-with-scann/)
- [DiskANN paper (NeurIPS 2019)](https://proceedings.neurips.cc/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html)
- [FreshDiskANN paper](https://arxiv.org/abs/2105.09613) · [SPANN paper (NeurIPS 2021)](https://arxiv.org/abs/2111.08566)
- [SPFresh: Incremental in-place ANN (SOSP 2023)](https://www.microsoft.com/en-us/research/wp-content/uploads/2023/08/SPFresh_SOSP.pdf)
- [Qdrant — Filterable HNSW](https://qdrant.tech/articles/filtrable-hnsw/) · [Qdrant 2025 recap (GPU HNSW build)](https://qdrant.tech/blog/2025-recap/)
- [Lance v2 columnar format (LanceDB blog)](https://blog.lancedb.com/lance-v2/)
- [Turbopuffer architecture (rewritten Mar 2026)](https://turbopuffer.com/blog/turbopuffer) · [Turbopuffer tradeoffs](https://turbopuffer.com/docs/tradeoffs)
- [Pinecone — Faiss / ANN series](https://www.pinecone.io/learn/series/faiss/)

## Phase 8 — Distributed correctness

- [MIT 6.5840 schedule + papers](https://pdos.csail.mit.edu/6.824/) · [lecture videos](https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB)
- [Heidi Howard — Distributed Consensus Reading List](https://heidihoward.github.io/distributed-consensus-reading-list/) — curated map of Paxos/Raft variants
- [Raft paper](https://raft.github.io/raft.pdf) · [Raft visualizer](https://raft.github.io/)
- [Paxos Made Simple (Lamport)](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)
- [Viewstamped Replication Revisited (Liskov & Cowling, 2012)](http://pmg.csail.mit.edu/papers/vr-revisited.pdf) — TigerBeetle's consensus basis
- [Lamport — TLA+ video course](https://lamport.azurewebsites.net/video/videos.html)
- [Spanner paper (OSDI 2012)](https://research.google/pubs/pub39966/) · [Spanner SQL (SIGMOD 2017)](https://research.google/pubs/pub46103/)
- [CockroachDB SQL paper (SIGMOD 2020)](https://www.cockroachlabs.com/guides/2020-sigmod-paper/) · [CRDB architecture](https://www.cockroachlabs.com/docs/stable/architecture/overview)
- [FoundationDB SIGMOD 2021 paper](https://www.foundationdb.org/files/fdb-paper.pdf) · [SIGMOD Record 2022 retrospective](https://sigmodrecord.org/publications/sigmodRecord/2203/pdfs/08_fdb-zhou.pdf) · [FDB simulation testing](https://apple.github.io/foundationdb/testing.html)
- [Calvin paper (SIGMOD 2012)](http://cs.yale.edu/homes/thomson/publications/calvin-sigmod12.pdf)
- [Marc Brooker — Consensus is Harder Than It Looks (2020)](https://brooker.co.za/blog/2020/10/05/consensus.html)
- [Marc Brooker — Snapshot Isolation vs Serializability (Dec 2024)](https://brooker.co.za/blog/2024/12/18/serializability.html)
- [Marc Brooker — Aurora DSQL vignettes (Dec 2024, 5-part)](https://brooker.co.za/blog/2024/12/03/aurora-dsql.html)
- [Werner Vogels — Just make it scale: an Aurora DSQL story (May 2025)](https://www.allthingsdistributed.com/2025/05/just-make-it-scale-an-aurora-dsql-story.html)
- [TigerBeetle ARCHITECTURE.md](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/ARCHITECTURE.md) · [TIGER_STYLE](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md)
- [Jepsen TigerBeetle 0.16.11 analysis (June 2025)](https://jepsen.io/analyses/tigerbeetle-0.16.11) · [all Jepsen analyses](https://jepsen.io/analyses)

In this codebase: [[sharding]], [[replication]], [[cap-theorem]], [[consensus]].

## Phase 9 — Synthesis project

Pick exactly one (PDF's Project A, B, C, or D). Publish with benchmarks and a
paragraph explaining where RAM went.

---

## Recommended study order (10 systems → read the source)

| # | System | Canonical source |
|---|--------|-----------------|
| 1 | SQLite | [arch](https://sqlite.org/arch.html) · [src](https://github.com/sqlite/sqlite) |
| 2 | DuckDB | [SIGMOD 2019 demo](https://dl.acm.org/doi/10.1145/3299869.3320212) · [why-duckdb research](https://duckdb.org/why_duckdb#research) · [src](https://github.com/duckdb/duckdb) |
| 3 | RocksDB / Pebble | [Architecture Guide](https://github.com/facebook/rocksdb/wiki/Rocksdb-Architecture-Guide) · [pebble](https://github.com/cockroachdb/pebble) |
| 4 | Postgres | [interdb internals](https://www.interdb.jp/pg/) · [src](https://github.com/postgres/postgres) |
| 5 | ClickHouse | [VLDB 2024 paper](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) · [src](https://github.com/ClickHouse/ClickHouse) |
| 6 | BigQuery | [Dremel](https://research.google/pubs/pub36632/) + [Capacitor](https://cloud.google.com/blog/products/bigquery/inside-capacitor-bigquerys-next-generation-columnar-storage-format) + [BigLake SIGMOD 2024](https://research.google/pubs/biglake-bigquerys-evolution-toward-a-multi-cloud-lakehouse/) |
| 7 | Lucene / Tantivy | [Lucene 10.x file format](https://lucene.apache.org/core/10_2_0/core/org/apache/lucene/codecs/lucene103/package-summary.html) · [tantivy arch](https://github.com/quickwit-oss/tantivy/blob/main/ARCHITECTURE.md) |
| 8 | DiskANN / Qdrant | [DiskANN](https://proceedings.neurips.cc/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html) · [qdrant docs](https://qdrant.tech/documentation/) |
| 9 | CockroachDB / FoundationDB | [CRDB SIGMOD 2020](https://www.cockroachlabs.com/guides/2020-sigmod-paper/) · [FDB SIGMOD 2021](https://www.foundationdb.org/files/fdb-paper.pdf) |
| 10 | Redis | [redis docs](https://redis.io/docs/latest/) · [antirez blog](http://antirez.com/) |

## Cheat sheets

**RAM-hungry query shapes:** high-cardinality GROUP BY · large hash JOIN ·
ORDER BY without LIMIT · exact DISTINCT · SELECT * · many concurrent heavy
queries.

**SSD-friendly patterns:** sequential scans over columnar files · append-only
writes / immutable segments · partition pruning · chunked execution · external
operators that spill · materialized summaries.

**Final instruction (from the PDF):** for every database you study, run one
benchmark and write one paragraph explaining exactly where RAM went.

---

## References (heavier reads — for when an article isn't enough)

Books and full courses. Don't block the roadmap on these; use them when an
article above has whetted your appetite.

- *Designing Data-Intensive Applications* (Kleppmann) — [site](https://dataintensive.net/)
- *Database Internals* (Petrov) — [site](https://www.databass.dev/)
- *Transaction Processing: Concepts and Techniques* (Gray & Reuter)
- *Readings in Database Systems, 5th ed* — Red Book — [free online](http://www.redbook.io/)
- *Architecture of a Database System* (Hellerstein/Stonebraker/Hamilton) — [paper](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf)
- CMU 15-445 / 15-721 — full courses (linked at top)
- MIT 6.5840 Distributed Systems — full course (linked in Phase 8)

---

## Maintenance notes

- CMU 15-445 URLs rotate yearly — re-pin each fall.
- Lucene codec URLs rotate per major version (currently 10.x / `lucene103`) — re-pin via the downloads index.
- Drepper "What Every Programmer Should Know About Memory" is dated on NUMA/PMEM but has no successor; keep.
- *The Morning Paper* (acolyer.org) is **inactive since Feb 2021** — use Murat Demirbas / Marc Brooker / Heidi Howard's lists instead.
- If your URL fails: try the Wayback Machine before deleting.
