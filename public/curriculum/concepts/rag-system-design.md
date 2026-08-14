# RAG System Design

Architecting a production RAG system: ingestion, retrieval, generation, evals.

- Difficulty: advanced
- Tracks: System Design

## Mental model

RAG system design is two pipelines and a contract: an offline ingestion pipeline (chunk → embed → index) and an online query pipeline (retrieve → rerank → pack → generate), bound by an eval harness that gates every change.


## Common mistakes

- No offline/online separation
- No eval gate, so quality regresses silently
- Ignoring freshness and re-indexing

## Primary sources

- [Building Effective AI Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/building-effective-agents) (article)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)](https://arxiv.org/abs/2005.11401) (paper)
- [Anthropic — Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) (article)
- [Ragas: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217) (paper)

## Practice

### Production RAG pipeline

Design a RAG system: doc ingestion → chunking → embedding → vector index, plus query-time retrieval → rerank → LLM. Identify the 3 most likely quality regressions.

**Expected evidence:** Pipeline + the evals you would run on every change.

## Review prompts

- What are the two pipelines in a RAG system, and what binds them?

## Build evidence

- **RAG system design doc** — An architecture doc for a production RAG system with an eval gate.

## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping)
- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag)
- [Hybrid Search](https://learn.significanthobbies.com/curriculum/concepts/hybrid-search)

## Related concepts

- [Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking)
- [LLM Evals](https://learn.significanthobbies.com/curriculum/concepts/llm-evals)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice)
