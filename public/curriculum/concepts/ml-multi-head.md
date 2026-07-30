# Multi-Head Attention

Parallel heads, head_dim split, output projection.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

Attention lets each token in a sentence look at every other token and weight how relevant each one is. "Multi-head" runs several of these attention passes in parallel so the model can track different kinds of relationships at once (e.g. grammar, references, position).



## Primary sources

- [Stanford CS336 — L3 Architectures & hyperparameters (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/e9cb2488fdb53ea37f0e38924ec3a1701925cef3/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf) (paper)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf) (paper)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) (article)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) (article)

## Practice

### Split embedding across heads

d_model=512, h=8. What is head_dim? If you project Q to 512 dims total, how many dims per head?

**Expected evidence:** head_dim = 512/8 = 64.

## Review prompts

- Multi-head attention splits d_model into h heads rather than running h full-width attentions. What does that buy?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention.html)

## Related concepts

- [Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block.html)

## Learning paths

- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w.html)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w.html)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w.html)
