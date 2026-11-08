# Embed a corpus and search it

> Embed a small corpus with an embedding model, embed a query, and return the nearest documents by cosine similarity.

Canonical: https://learn.significanthobbies.com/curriculum/drills/embed-and-search

Embed a small corpus with an embedding model, embed a query, and return the nearest documents by cosine similarity.

## The mechanism

An embedding model projects content into a space where 'close' means 'semantically similar'. Search becomes geometry: find the nearest vectors to the query vector.

## Expected evidence

Semantically relevant documents for a query that shares no exact keywords.

## Hints

- Normalize vectors before cosine.
- Use the same model for corpus and query.

## Sources and practice

- [MTEB: Massive Text Embedding Benchmark](https://huggingface.co/spaces/mteb/leaderboard)
- [Study Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/embed-and-search)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
