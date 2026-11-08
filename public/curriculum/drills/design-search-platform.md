# Search platform end-to-end

> Design a product search platform: ingestion → analyzer → inverted index → query parser → ranking → result page. Identify where you would add a learned ranker.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-search-platform

Design a product search platform: ingestion → analyzer → inverted index → query parser → ranking → result page. Identify where you would add a learned ranker.

## The mechanism

A search platform splits into an ingestion/indexing path (durable, batchy, write-optimized) and a query path (low-latency, cacheable, read-optimized). Segment files, an object-storage tier, and an eval harness tie them together.

## Expected evidence

Pipeline diagram + the index update strategy (full rebuild vs near-real-time).

## Hints

- Recall first, precision second — bad recall is unrecoverable downstream.
- Two-stage ranking: cheap recall, expensive rerank.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Elasticsearch — Near real-time search](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search)
- [Apache Lucene — release documentation](https://lucene.apache.org/core/documentation.html)
- [Elasticsearch — Learning To Rank (LTR)](https://www.elastic.co/docs/solutions/search/ranking/learning-to-rank-ltr)
- [Study Search Platform Design](https://learn.significanthobbies.com/curriculum/concepts/search-platform-design)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-search-platform)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
