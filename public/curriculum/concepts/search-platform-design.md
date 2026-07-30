# Search Platform Design

End-to-end design of a search platform: ingestion, indexing, query, ranking.

- Difficulty: advanced
- Tracks: System Design

## Mental model

A search platform splits into an ingestion/indexing path (durable, batchy, write-optimized) and a query path (low-latency, cacheable, read-optimized). Segment files, an object-storage tier, and an eval harness tie them together.


## Common mistakes

- Designing the query path before the indexing path
- No segment/compaction story for updates
- Forgetting evals as part of the architecture

## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Elasticsearch — Near real-time search](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search) (doc)
- [Apache Lucene — release documentation](https://lucene.apache.org/core/documentation.html) (doc)
- [Elasticsearch — Learning To Rank (LTR)](https://www.elastic.co/docs/solutions/search/ranking/learning-to-rank-ltr) (doc)

## Practice

### Search platform end-to-end

Design a product search platform: ingestion → analyzer → inverted index → query parser → ranking → result page. Identify where you would add a learned ranker.

**Expected evidence:** Pipeline diagram + the index update strategy (full rebuild vs near-real-time).

## Review prompts

- Why split a search platform into an indexing path and a query path?

## Build evidence

- **Search platform design doc** — An architecture doc for a search platform: ingestion, indexing, query, ranking.

## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html)
- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html)
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage.html)

## Related concepts

- [Search Systems](https://learn.significanthobbies.com/curriculum/concepts/search-discovery.html)
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
