# Transformer Block

Pre-LayerNorm, residuals, MLP, GELU.

- Difficulty: advanced
- Tracks: AI Systems

## Mental model

A transformer block is two sublayers — multi-head attention then a position-wise MLP — each wrapped in a residual connection and layer norm. Residuals keep gradients flowing; pre-LayerNorm (norm before the sublayer) makes deep stacks train stably.


## Common mistakes

- Dropping residual connections and watching deep models fail to train
- Post-LayerNorm placement causing instability in deep stacks
- Mismatched dimensions between the attention output and the MLP

## Primary sources

- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/) (course)
- [CS336 Assignment 1 — Build a transformer block from scratch](https://github.com/stanford-cs336/assignment1-basics/tree/main) (doc)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf) (paper)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) (article)
- [The Illustrated GPT-2 — transformer block stack](https://jalammar.github.io/illustrated-gpt2/) (article)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) (article)

## Practice

### Pre-LayerNorm residual block

x=[1,2], sublayer(x)=x+[0.1,−0.1]. Write pre-norm update: x + sublayer(LayerNorm(x)). If LayerNorm is identity here, new x?

**Expected evidence:** [1.1,1.9] — residual preserves a gradient highway.

## Review prompts

- Pre-LayerNorm versus post-LayerNorm — why did deep stacks move to pre-norm?

## Build evidence

- **Synthesize: AI Models & Training** — Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head)
- [AdamW Optimizer](https://learn.significanthobbies.com/curriculum/concepts/ml-adamw)

## Related concepts

- [Training & Debugging](https://learn.significanthobbies.com/curriculum/concepts/ml-training)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
- [12-Week AI Models & Training](https://learn.significanthobbies.com/curriculum/roadmaps/ai-models-training-12w)
- [12-Week Inference & Serving](https://learn.significanthobbies.com/curriculum/roadmaps/inference-serving-12w)
- [12-Week Evaluation & AI Reliability](https://learn.significanthobbies.com/curriculum/roadmaps/ai-reliability-12w)
- [12-Week Multimodal & Spatial Computing](https://learn.significanthobbies.com/curriculum/roadmaps/multimodal-spatial-12w)
