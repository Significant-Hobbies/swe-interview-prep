# TF-IDF

Term frequency × inverse document frequency weighting for relevance.

- Difficulty: core
- Tracks: Search & IR

## Mental model

TF-IDF says a term matters more when it appears often in a document (TF) but is rare across the corpus (IDF). It is the conceptual ancestor of BM25.

## Where it matters

Baseline ranking, feature input to learning-to-rank models.

## Common mistakes

- Ignoring document length so long docs always win
- Using raw counts instead of dampened term frequency

## Primary sources

- [Introduction to Information Retrieval (Manning et al.) — §6.2.2 Tf-idf weighting](https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html) (doc)

## Practice

### Calculate a TF-IDF score by hand

Given term counts per document and document frequencies, compute the TF-IDF weight of a term in a document. Use dampened TF (1 + log tf) and IDF = log(N / df).

**Expected evidence:** A single numeric weight, higher for frequent-here-but-rare-overall terms.

## Review prompts

- What does the IDF factor accomplish in TF-IDF?


## Prerequisites

- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index.html)

## Related concepts

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25.html)

## Learning paths

- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day.html)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day.html)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day.html)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
