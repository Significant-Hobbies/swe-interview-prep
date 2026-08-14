# Embeddings (Transformer)

Token & position embeddings, tied weights.

- Difficulty: core
- Tracks: AI Systems

## Mental model

Embeddings turn discrete things (words, items, users) into vectors of numbers so that similar things end up close together in space. Distance and direction in that space carry meaning — that geometry is what the model learns from.



## Primary sources

- [Stanford CS336 — L3 Architectures & hyperparameters (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/e9cb2488fdb53ea37f0e38924ec3a1701925cef3/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf) (paper)
- [The Illustrated GPT-2 — token & position embeddings](https://jalammar.github.io/illustrated-gpt2/) (article)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) (article)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf) (paper)

## Practice

### Sinusoidal position encoding

pos=1, i=0, d=4: PE(pos,2i)=sin(pos/10000^(2i/d)). Compute the first two dims for pos=1.

**Expected evidence:** sin(1), cos(1) pattern for even/odd dims.

## Review prompts

- Self-attention is permutation-equivariant — shuffle the tokens and the output shuffles with them. What does that force the embedding layer to do, and why?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Language Modeling](https://learn.significanthobbies.com/curriculum/concepts/ml-language-modeling)

## Related concepts

- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention)
- [Embeddings](https://learn.significanthobbies.com/curriculum/concepts/embeddings)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
