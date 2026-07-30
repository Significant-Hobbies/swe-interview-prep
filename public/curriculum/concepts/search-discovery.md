# Search Systems

Inverted index, ranking, autocomplete at scale.

- Difficulty: core
- Tracks: Search & IR

## Mental model

A search system is a pipeline, not a scoring function: analyze -> inverted index -> cheap candidate retrieval -> expensive reranking -> serve. The first stage decides what the good ranker is ever allowed to see, so recall lost there cannot be recovered later. Autocomplete is a separate prefix index with its own latency budget, not a query against the main index.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Stanford IR Book — A first take at building an inverted index](https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html) (doc)
- [Stanford IR Book — Wildcard queries (permuterm / k-gram indexes)](https://nlp.stanford.edu/IR-book/html/htmledition/wildcard-queries-1.html) (doc)
- [Elasticsearch — search_as_you_type field](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/search-as-you-type) (doc)

## Practice

### Browse vs search metrics

Discovery feed: which metric — CTR, dwell time, or nDCG@10? Pick one for homepage browse, one for keyword search, justify in one line each.

**Expected evidence:** Browse: dwell/engagement; search: nDCG/precision@k.

## Review prompts

- Why can recall lost in candidate generation never be recovered by a better ranker?

## Build evidence

- **Search platform design doc** — An architecture doc for a search platform: ingestion, indexing, query, ranking.

## Prerequisites

- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html)
- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval.html)

## Related concepts

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html)
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html)

## Learning paths

- No roadmap is assigned yet.
