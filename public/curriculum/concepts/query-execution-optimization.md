# Query Execution & Optimization

Logical and physical plans, cardinality estimation, join ordering, indexes, vectorized execution, and spilling.

- Difficulty: core
- Tracks: Databases & Storage

## Mental model

A query optimizer searches physical plans using imperfect estimates. Execution quality depends on access paths, join order, memory budgets, and fallback under estimation error.



## Primary sources

- [Architecture of a Database System](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf) (paper)

## Practice

### Design exercise: Query Execution & Optimization

Logical and physical plans, cardinality estimation, join ordering, indexes, vectorized execution, and spilling. Implement designOutline() returning non-empty values for: logicalPlan, costModel, physicalExecution. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with logicalPlan, costModel, physicalExecution plus an explicit failure mode or trade-off.

## Review prompts

- The plan looks reasonable but the query is slow. What estimate is usually wrong, and why does it compound?

## Build evidence

- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Prerequisites

- None assigned.

## Related concepts

- None assigned.

## Learning paths

- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
