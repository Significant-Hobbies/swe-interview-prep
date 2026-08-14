# Self-Attention

Q/K/V, scaled dot-product, causal masking.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

Self-attention lets every token look at every other token and pull in what is relevant. Each token emits a query, a key, and a value; the query-key dot products (scaled, softmaxed) become weights over the values. Causal masking blocks a token from seeing the future.


## Common mistakes

- Forgetting the 1/sqrt(d_k) scaling, which destabilizes the softmax
- Omitting the causal mask in a decoder, leaking future tokens
- Confusing the query/key/value roles

## Primary sources

- [Stanford CS336 — L6 Kernels & Triton (FlashAttention2)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_06.json) (course)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf) (paper)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) (article)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) (article)
- [Attention in transformers, visually (3Blue1Brown)](https://www.3blue1brown.com/lessons/attention) (video)
- [Attention Is All You Need (Vaswani et al.)](https://arxiv.org/abs/1706.03762) (paper)

## Practice

### Scaled dot-product attention weights

Q=K=[[1,0],[0,1]], V=[[1,2],[3,4]], d_k=2. Compute softmax(QKᵀ/√d_k)·V for one query row.

**Expected evidence:** Uniform weights 0.5/0.5 → output [2,3].

## Review prompts

- Why divide the query-key dot product by sqrt(d_k)?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings)

## Related concepts

- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
