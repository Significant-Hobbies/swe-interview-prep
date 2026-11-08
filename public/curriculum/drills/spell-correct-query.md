# Spell-correct a search query

> Query "javascrpt react hooks" → suggest correction using edit distance ≤2 against vocab ["javascript","react","hooks","python"].

Canonical: https://learn.significanthobbies.com/curriculum/drills/spell-correct-query

Query "javascrpt react hooks" → suggest correction using edit distance ≤2 against vocab ["javascript","react","hooks","python"].

## The mechanism

Query rewriting cleans up what the user typed before you look it up in the index: fix spelling, expand synonyms, drop stop words, classify intent. Doing this once up front is what makes the rest of the pipeline work — never trust the raw query.

## Expected evidence

javascript react hooks.

## Hints

- Rewrite before retrieval.
- Keep original as fallback.

## Sources and practice

- [Introduction to Information Retrieval (Manning et al.) — §9.2 Query expansion](https://nlp.stanford.edu/IR-book/html/htmledition/query-expansion-1.html)
- [Study Query Rewriting](https://learn.significanthobbies.com/curriculum/concepts/query-rewriting)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/spell-correct-query)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
