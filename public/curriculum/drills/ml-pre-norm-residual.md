# Pre-LayerNorm residual block

> x=[1,2], sublayer(x)=x+[0.1,−0.1]. Write pre-norm update: x + sublayer(LayerNorm(x)). If LayerNorm is identity here, new x?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-pre-norm-residual

x=[1,2], sublayer(x)=x+[0.1,−0.1]. Write pre-norm update: x + sublayer(LayerNorm(x)). If LayerNorm is identity here, new x?

## The mechanism

A transformer block is two sublayers — multi-head attention then a position-wise MLP — each wrapped in a residual connection and layer norm. Residuals keep gradients flowing; pre-LayerNorm (norm before the sublayer) makes deep stacks train stably.

## Expected evidence

[1.1,1.9] — residual preserves a gradient highway.

## Hints

- Pre-norm: normalize before sublayer.
- Output = x + f(norm(x)).

## Sources and practice

- [Stanford CS336 — Language Modeling from Scratch (course)](https://cs336.stanford.edu/spring2025/)
- [CS336 Assignment 1 — Build a transformer block from scratch](https://github.com/stanford-cs336/assignment1-basics/tree/main)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [The Illustrated GPT-2 — transformer block stack](https://jalammar.github.io/illustrated-gpt2/)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)
- [Study Transformer Block](https://learn.significanthobbies.com/curriculum/concepts/ml-transformer-block)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-pre-norm-residual)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
