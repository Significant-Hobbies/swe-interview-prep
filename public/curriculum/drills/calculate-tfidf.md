# Calculate a TF-IDF score by hand

> Given term counts per document and document frequencies, compute the TF-IDF weight of a term in a document. Use dampened TF (1 + log tf) and IDF = log(N / df).

Canonical: https://learn.significanthobbies.com/curriculum/drills/calculate-tfidf

Given term counts per document and document frequencies, compute the TF-IDF weight of a term in a document. Use dampened TF (1 + log tf) and IDF = log(N / df).

## The mechanism

TF-IDF says a term matters more when it appears often in a document (TF) but is rare across the corpus (IDF). It is the conceptual ancestor of BM25.

## Expected evidence

A single numeric weight, higher for frequent-here-but-rare-overall terms.

## Hints

- IDF rewards rarity across the corpus.
- Dampen raw term frequency.

## Sources and practice

- [Introduction to Information Retrieval (Manning et al.) — §6.2.2 Tf-idf weighting](https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html)
- [Study TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/calculate-tfidf)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
