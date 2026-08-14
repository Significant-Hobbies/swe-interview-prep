# Chunking

Splitting documents into retrievable units that preserve meaning.

- Difficulty: core
- Tracks: AI Systems

## Mental model

A chunk is the atomic unit of retrieval — too big and embeddings blur, too small and context is lost. Good chunking respects structure (headings, functions, paragraphs) and adds overlap so answers are not cut in half.

## Where it matters

Every RAG ingestion pipeline.

## Common mistakes

- Fixed character splits that cut sentences mid-thought
- Zero overlap, so boundary-spanning answers are lost
- One chunk strategy for every document type

## Primary sources

- [Pinecone — Chunking strategies](https://www.pinecone.io/learn/chunking-strategies/) (article)

## Practice

### Build a structure-aware chunker

Write a chunker that splits on document structure (headings/paragraphs) with a target size and overlap, instead of fixed character cuts.

**Expected evidence:** Chunks that respect structure and overlap at boundaries.

## Review prompts

- What is the tradeoff in choosing chunk size?

## Build evidence

- **RAG pipeline v0** — An end-to-end retrieve → pack → generate pipeline grounded in a document corpus.

## Prerequisites

- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag)

## Related concepts

- [Context Packing](https://learn.significanthobbies.com/curriculum/concepts/context-packing)
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
