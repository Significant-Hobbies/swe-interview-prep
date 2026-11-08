# Implement a BM25 ranker

> On top of your inverted index, implement BM25 scoring and return the top-k documents for a multi-term query.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-bm25-ranker

On top of your inverted index, implement BM25 scoring and return the top-k documents for a multi-term query.

## The mechanism

BM25 fixes TF-IDF's two flaws: term frequency saturates (the 10th occurrence adds little via the k1 parameter) and document length is normalized (the b parameter). It is still the strongest single keyword ranker and the lexical half of hybrid search.

## Expected evidence

Ranked top-k results for a query, scored by summed per-term BM25.

## Hints

- Sum per-term BM25 contributions for multi-term queries.
- Use a k-sized heap for the top-k.

## Sources and practice

- [Okapi BM25 (Wikipedia)](https://en.wikipedia.org/wiki/Okapi_BM25)
- [Elastic — Practical BM25 Part 2: The BM25 Algorithm and its Variables](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables)
- [Study BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-bm25-ranker)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
