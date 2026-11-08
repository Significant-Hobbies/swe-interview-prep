# Build a minimal RAG pipeline

> Chunk a small document set, embed and index it, retrieve for a query, pack context, and generate a grounded answer.

Canonical: https://learn.significanthobbies.com/curriculum/drills/build-rag-pipeline

Chunk a small document set, embed and index it, retrieve for a query, pack context, and generate a grounded answer.

## The mechanism

RAG = retrieve relevant chunks, pack them into the prompt, then generate. The quality ceiling is set by retrieval — a perfect LLM cannot answer from context it never received. Most 'RAG is bad' problems are retrieval problems.

## Expected evidence

Answers grounded in retrieved chunks, with sources.

## Hints

- Retrieval quality is the ceiling — debug retrieval first.
- Keep the eval set fixed.

## Sources and practice

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)](https://arxiv.org/abs/2005.11401)
- [Lilian Weng — How to Build an Open-Domain Question Answering System?](https://lilianweng.github.io/posts/2020-10-29-odqa/)
- [LangChain — RAG from scratch](https://python.langchain.com/docs/tutorials/rag/)
- [Pinecone — RAG guide](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Study RAG](https://learn.significanthobbies.com/curriculum/concepts/rag)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/build-rag-pipeline)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
