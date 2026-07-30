# Context Packing

Ordering and budgeting retrieved context within the model's window.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

Context is a budget. Models attend unevenly (lost-in-the-middle), so order matters: put the strongest evidence at the edges, dedupe, and cut before you overflow.


## Common mistakes

- Filling the whole window because it is available
- Ignoring position effects on attention

## Primary sources

- [Lost in the Middle (Liu et al.)](https://arxiv.org/abs/2307.03172) (paper)

## Practice

### Pack chunks into context budget

Budget 800 tokens. Chunks A=300,B=400,C=250 relevance [0.9,0.85,0.7]. Greedy pack by relevance until full. Which included?

**Expected evidence:** A+B=700; C does not fit entirely — include partial or skip per policy.

## Review prompts

- What is the 'lost in the middle' effect and how do you mitigate it?


## Prerequisites

- [Chunking](https://learn.significanthobbies.com/curriculum/concepts/chunking.html)

## Related concepts

- [RAG](https://learn.significanthobbies.com/curriculum/concepts/rag.html)
- [Reranking](https://learn.significanthobbies.com/curriculum/concepts/reranking.html)

## Learning paths

- No roadmap is assigned yet.
