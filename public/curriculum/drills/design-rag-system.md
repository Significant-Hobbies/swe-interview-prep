# Production RAG pipeline

> Design a RAG system: doc ingestion → chunking → embedding → vector index, plus query-time retrieval → rerank → LLM. Identify the 3 most likely quality regressions.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-rag-system

Design a RAG system: doc ingestion → chunking → embedding → vector index, plus query-time retrieval → rerank → LLM. Identify the 3 most likely quality regressions.

## The mechanism

RAG system design is two pipelines and a contract: an offline ingestion pipeline (chunk → embed → index) and an online query pipeline (retrieve → rerank → pack → generate), bound by an eval harness that gates every change.

## Expected evidence

Pipeline + the evals you would run on every change.

## Hints

- Chunking dominates retrieval quality more than embeddings do.
- Eval the retriever and the generator separately.

## Sources and practice

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)](https://arxiv.org/abs/2005.11401)
- [Anthropic — Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Ragas: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217)
- [Study RAG System Design](https://learn.significanthobbies.com/curriculum/concepts/rag-system-design)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-rag-system)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
