# Query Rewriting

Expanding, correcting, and normalizing queries before retrieval.

- Difficulty: core
- Tracks: Search & IR

## Mental model

Query rewriting cleans up what the user typed before you look it up in the index: fix spelling, expand synonyms, drop stop words, classify intent. Doing this once up front is what makes the rest of the pipeline work — never trust the raw query.



## Primary sources

- [Introduction to Information Retrieval (Manning et al.) — §9.2 Query expansion](https://nlp.stanford.edu/IR-book/html/htmledition/query-expansion-1.html) (doc)

## Practice

### Spell-correct a search query

Query "javascrpt react hooks" → suggest correction using edit distance ≤2 against vocab ["javascript","react","hooks","python"].

**Expected evidence:** javascript react hooks.

## Review prompts

- Synonym expansion improves recall but precision drops. What is the mechanism, and what is the usual mitigation?


## Prerequisites

- [Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization.html)

## Related concepts

- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search.html)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html)

## Learning paths

- No roadmap is assigned yet.
