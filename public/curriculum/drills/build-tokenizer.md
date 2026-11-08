# Build a search tokenizer

> Write a tokenizer that lowercases, splits on non-alphanumerics, removes a small stop-word set, and applies simple suffix stemming. Use the exact same function for indexing and querying.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-tokenizer

Write a tokenizer that lowercases, splits on non-alphanumerics, removes a small stop-word set, and applies simple suffix stemming. Use the exact same function for indexing and querying.

## The mechanism

Tokenization decides what counts as a 'word' for search. The same analyzer must run at index time and query time, or the query term will never match the indexed term.

## Expected evidence

tokenize('The Quick Brown Foxes!') → ['quick','brown','fox']

## Hints

- The analyzer must be symmetric across index and query time.
- Keep stop words minimal — they hurt short queries.

## Sources and practice

- [Introduction to Information Retrieval (Manning et al.) — §2.2.1 Tokenization](https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html)
- [Let's build the GPT Tokenizer (Karpathy)](https://www.youtube.com/watch?v=zduSFxRajkE)
- [Study Tokenization](https://learn.significanthobbies.com/curriculum/concepts/tokenization)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-tokenizer)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
