# Build an inverted index

> From a list of documents, build a term → sorted posting list map. Support a boolean AND query by intersecting posting lists. Track document frequency per term.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-inverted-index

From a list of documents, build a term → sorted posting list map. Support a boolean AND query by intersecting posting lists. Track document frequency per term.

## The mechanism

An inverted index flips documents inside out: instead of doc → terms, you store term → list of docs (postings). Query answering becomes intersecting/merging sorted posting lists.

## Expected evidence

Query 'quick fox' returns docs containing both terms, found by list intersection.

## Hints

- Keep posting lists sorted by doc id so intersection is linear.
- Store document frequency now — ranking needs it later.

## Sources and practice

- [Stanford IR Book — A first take at building an inverted index](https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html)
- [Study Inverted Index](https://learn.significanthobbies.com/curriculum/concepts/inverted-index)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-inverted-index)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
