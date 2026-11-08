# Browse vs search metrics

> Discovery feed: which metric — CTR, dwell time, or nDCG@10? Pick one for homepage browse, one for keyword search, justify in one line each.

Canonical: https://learn.significanthobbies.com/curriculum/drills/browse-vs-search-metrics

Discovery feed: which metric — CTR, dwell time, or nDCG@10? Pick one for homepage browse, one for keyword search, justify in one line each.

## The mechanism

A search system is a pipeline, not a scoring function: analyze -> inverted index -> cheap candidate retrieval -> expensive reranking -> serve. The first stage decides what the good ranker is ever allowed to see, so recall lost there cannot be recovered later. Autocomplete is a separate prefix index with its own latency budget, not a query against the main index.

## Expected evidence

Browse: dwell/engagement; search: nDCG/precision@k.

## Hints

- Discovery has weak intent.
- Keyword search has explicit relevance labels.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Stanford IR Book — A first take at building an inverted index](https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html)
- [Stanford IR Book — Wildcard queries (permuterm / k-gram indexes)](https://nlp.stanford.edu/IR-book/html/htmledition/wildcard-queries-1.html)
- [Elasticsearch — search_as_you_type field](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/search-as-you-type)
- [Study Search Systems](https://learn.significanthobbies.com/curriculum/concepts/search-discovery)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/browse-vs-search-metrics)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
