# Tokenization

Splitting text into terms: lowercasing, stemming, stop words, n-grams.

- Difficulty: intro
- Tracks: Search & IR

## Mental model

Tokenization decides what counts as a 'word' for search. The same analyzer must run at index time and query time, or the query term will never match the indexed term.

## Where it matters

Elasticsearch/Lucene analyzers, Tantivy tokenizers, every lexical search engine.

## Common mistakes

- Using different analyzers for indexing and querying
- Stemming too aggressively so distinct words collide
- Dropping stop words that carry meaning in short queries

## Primary sources

- [Introduction to Information Retrieval (Manning et al.) — §2.2.1 Tokenization](https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html) (doc)
- [Let's build the GPT Tokenizer (Karpathy)](https://www.youtube.com/watch?v=zduSFxRajkE) (video)

## Practice

### Build a search tokenizer

Write a tokenizer that lowercases, splits on non-alphanumerics, removes a small stop-word set, and applies simple suffix stemming. Use the exact same function for indexing and querying.

**Expected evidence:** tokenize('The Quick Brown Foxes!') → ['quick','brown','fox']

## Review prompts

- Why must the same analyzer run at index time and query time?

## Build evidence

- **Implement BM25 search in HighSignal** — Index a corpus of articles and serve ranked keyword search using BM25.

## Prerequisites

- None assigned.

## Related concepts

- [Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index)
- [BM25](https://learn.significanthobbies.com/curriculum/concepts/bm25)
- [Tokenization (LLM)](https://learn.significanthobbies.com/curriculum/concepts/ml-tokenization)

## Learning paths

- [9-Day Reset](https://learn.significanthobbies.com/curriculum/roadmaps/reset-9-day)
- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
