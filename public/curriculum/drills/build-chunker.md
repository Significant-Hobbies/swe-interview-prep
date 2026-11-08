# Build a structure-aware chunker

> Write a chunker that splits on document structure (headings/paragraphs) with a target size and overlap, instead of fixed character cuts.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-chunker

Write a chunker that splits on document structure (headings/paragraphs) with a target size and overlap, instead of fixed character cuts.

## The mechanism

A chunk is the atomic unit of retrieval — too big and embeddings blur, too small and context is lost. Good chunking respects structure (headings, functions, paragraphs) and adds overlap so answers are not cut in half.

## Expected evidence

Chunks that respect structure and overlap at boundaries.

## Hints

- Overlap prevents losing boundary-spanning answers.
- Different document types may need different strategies.

## Sources and practice

- [Pinecone — Chunking strategies](https://www.pinecone.io/learn/chunking-strategies/)
- [Study Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-chunker)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
