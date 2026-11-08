# Calculate a BM25 score by hand

> Given tf, df, N, document length, average document length, k1=1.2 and b=0.75, compute the BM25 score of a query term for a document.

Canonical: https://learn.significanthobbies.com/curriculum/drills/calculate-bm25-score

Given tf, df, N, document length, average document length, k1=1.2 and b=0.75, compute the BM25 score of a query term for a document.

## The mechanism

BM25 fixes TF-IDF's two flaws: term frequency saturates (the 10th occurrence adds little via the k1 parameter) and document length is normalized (the b parameter). It is still the strongest single keyword ranker and the lexical half of hybrid search.

## Expected evidence

A numeric score; verify TF saturation by checking the 10th occurrence adds little.

## Hints

- Score = IDF · (tf·(k1+1)) / (tf + k1·(1 - b + b·dl/avgdl)).
- b controls length normalization; k1 controls TF saturation.

## Sources and practice

- [Okapi BM25 (Wikipedia)](https://en.wikipedia.org/wiki/Okapi_BM25)
- [Elastic — Practical BM25 Part 2: The BM25 Algorithm and its Variables](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables)
- [Study BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/calculate-bm25-score)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
