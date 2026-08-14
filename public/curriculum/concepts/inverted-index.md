# Inverted Index

Term → posting list mapping that powers fast keyword lookup.

- Difficulty: core
- Tracks: Search & IR

## Mental model

An inverted index flips documents inside out: instead of doc → terms, you store term → list of docs (postings). Query answering becomes intersecting/merging sorted posting lists.

## Where it matters

Lucene, Tantivy, PostgreSQL GIN indexes, every full-text search system.

## Common mistakes

- Storing postings unsorted, making intersection O(n*m)
- Forgetting document frequency, which ranking later needs
- Not separating the dictionary from the postings on disk

## Primary sources

- [Stanford IR Book — A first take at building an inverted index](https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html) (doc)

## Practice

### Build an inverted index

From a list of documents, build a term → sorted posting list map. Support a boolean AND query by intersecting posting lists. Track document frequency per term.

**Expected evidence:** Query 'quick fox' returns docs containing both terms, found by list intersection.

## Review prompts

- How does an inverted index differ from a forward index, and why is it faster for search?

## Build evidence

- **Implement BM25 search in HighSignal** — Index a corpus of articles and serve ranked keyword search using BM25.
- **Object-storage-backed index** — Store index segments in object storage with a hot in-memory cache.

## Prerequisites

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization)

## Related concepts

- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25)
- [TF-IDF](https://learn.significanthobbies.com/curriculum/concepts/tf-idf)
- [Search Systems](https://learn.significanthobbies.com/curriculum/concepts/search-discovery)

## Learning paths

- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
