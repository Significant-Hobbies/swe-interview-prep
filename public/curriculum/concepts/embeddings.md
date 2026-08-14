# Embeddings

Mapping text/images into dense vectors where distance encodes meaning.

- Difficulty: core
- Tracks: Vector DB & ANN

## Mental model

An embedding model projects content into a space where 'close' means 'semantically similar'. Search becomes geometry: find the nearest vectors to the query vector.

## Where it matters

OpenAI/Cohere/Voyage embedding APIs, semantic search, RAG retrieval.

## Common mistakes

- Comparing vectors from two different embedding models
- Forgetting to normalize when using cosine similarity
- Ignoring the model's max input length and silently truncating

## Primary sources

- [MTEB: Massive Text Embedding Benchmark](https://huggingface.co/spaces/mteb/leaderboard) (article)

## Practice

### Embed a corpus and search it

Embed a small corpus with an embedding model, embed a query, and return the nearest documents by cosine similarity.

**Expected evidence:** Semantically relevant documents for a query that shares no exact keywords.

## Review prompts

- What does 'distance' mean in an embedding space?

## Build evidence

- **RAG pipeline v0** — An end-to-end retrieve → pack → generate pipeline grounded in a document corpus.

## Prerequisites

- None assigned.

## Related concepts

- [Vector Similarity](https://learn.significanthobbies.com/curriculum/concepts/vector-similarity)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag)
- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings)

## Learning paths

- [30-Day Retrieval Basics](https://learn.significanthobbies.com/curriculum/roadmaps/retrieval-30-day)
- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
