# Design exercise: Data Warehouses & Lakehouses

> Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture. Implement designOutline() returning non-empty values for: storageFormat, metadataLayer, queryExecution. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-warehouses-lakehouses

Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture. Implement designOutline() returning non-empty values for: storageFormat, metadataLayer, queryExecution. Each value must name a concrete mechanism or decision.

## The mechanism

Warehouses optimize governed analytical execution; lakehouses place open table metadata over object storage. Both depend on pruning, columnar scans, and reliable metadata.

## Expected evidence

A design outline with storageFormat, metadataLayer, queryExecution plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores](https://www.vldb.org/pvldb/vol13/p3411-armbrust.pdf)
- [Study Data Warehouses & Lakehouses](https://learn.significanthobbies.com/curriculum/concepts/warehouses-lakehouses)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-warehouses-lakehouses)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
