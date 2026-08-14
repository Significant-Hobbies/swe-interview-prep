# Data Warehouses & Lakehouses

Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

Warehouses optimize governed analytical execution; lakehouses place open table metadata over object storage. Both depend on pruning, columnar scans, and reliable metadata.



## Primary sources

- [Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores](https://www.vldb.org/pvldb/vol13/p3411-armbrust.pdf) (paper)

## Practice

### Design exercise: Data Warehouses & Lakehouses

Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture. Implement designOutline() returning non-empty values for: storageFormat, metadataLayer, queryExecution. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with storageFormat, metadataLayer, queryExecution plus an explicit failure mode or trade-off.

## Review prompts

- What does an open table format (Iceberg, Delta) add on top of Parquet files in object storage?

## Build evidence

- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Prerequisites

- None assigned.

## Related concepts

- None assigned.

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
