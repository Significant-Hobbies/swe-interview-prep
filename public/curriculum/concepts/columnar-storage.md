# Columnar Storage

Column-oriented layout for analytics: compression and vectorized scans.

- Difficulty: advanced
- Tracks: Databases & Storage

## Mental model

A column store groups data by column instead of by row. Reading one column out of many becomes very fast (great for analytics), but writing or updating a single row gets slower. Pick row-stores for transactions, column-stores for analytics.



## Primary sources

- [Apache Parquet — File format](https://parquet.apache.org/docs/file-format/) (doc)

## Practice

### Columnar vs row store

Analytics query: SELECT avg(price) FROM sales WHERE date>2024. Which store wins and why?

**Expected evidence:** Columnar — reads only price+date columns, better compression.

## Review prompts

- Why does a column store compress so much better than a row store on the same data?


## Prerequisites

- [B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree.html)

## Related concepts

- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
