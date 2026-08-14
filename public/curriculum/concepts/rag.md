# RAG

Retrieval-Augmented Generation: ground an LLM answer in retrieved context.

- Difficulty: core
- Tracks: AI Systems

## Mental model

RAG = retrieve relevant chunks, pack them into the prompt, then generate. The quality ceiling is set by retrieval — a perfect LLM cannot answer from context it never received. Most 'RAG is bad' problems are retrieval problems.

## Where it matters

Doc Q&A, support bots, code assistants, HighSignal's intelligence engine.

## Common mistakes

- Blaming the LLM when retrieval failed
- No eval set, so retrieval changes are guesswork
- Stuffing too many chunks and burying the answer
- Skipping reranking and hybrid retrieval

## Primary sources

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)](https://arxiv.org/abs/2005.11401) (paper)
- [Lilian Weng — How to Build an Open-Domain Question Answering System?](https://lilianweng.github.io/posts/2020-10-29-odqa/) (article)
- [LangChain — RAG from scratch](https://python.langchain.com/docs/tutorials/rag/) (doc)
- [Pinecone — RAG guide](https://www.pinecone.io/learn/retrieval-augmented-generation/) (article)

## Practice

### Build a minimal RAG pipeline

Chunk a small document set, embed and index it, retrieve for a query, pack context, and generate a grounded answer.

**Expected evidence:** Answers grounded in retrieved chunks, with sources.

## Review prompts

- Why is retrieval the quality ceiling of a RAG system?
- When would you choose RAG over fine-tuning?

## Build evidence

- **RAG pipeline v0** — An end-to-end retrieve → pack → generate pipeline grounded in a document corpus.
- **RAG system design doc** — An architecture doc for a production RAG system with an eval gate.

## Prerequisites

- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings)

## Related concepts

- [Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking)
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search)
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking)
- [Context Packing](https://learn.significanthobbies.com/curriculum/concepts/context-packing)

## Learning paths

- [90-Day AI Search & Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-search-infra-90-day)
- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
