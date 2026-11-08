# Sinusoidal position encoding

> pos=1, i=0, d=4: PE(pos,2i)=sin(pos/10000^(2i/d)). Compute the first two dims for pos=1.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-sinusoidal-position

pos=1, i=0, d=4: PE(pos,2i)=sin(pos/10000^(2i/d)). Compute the first two dims for pos=1.

## The mechanism

Embeddings turn discrete things (words, items, users) into vectors of numbers so that similar things end up close together in space. Distance and direction in that space carry meaning — that geometry is what the model learns from.

## Expected evidence

sin(1), cos(1) pattern for even/odd dims.

## Hints

- Even dims sin, odd dims cos in original paper.
- Wavelength grows with dimension index.

## Sources and practice

- [Stanford CS336 — L3 Architectures & hyperparameters (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/e9cb2488fdb53ea37f0e38924ec3a1701925cef3/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf)
- [The Illustrated GPT-2 — token & position embeddings](https://jalammar.github.io/illustrated-gpt2/)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf)
- [Study Embeddings (Transformer)](https://learn.significanthobbies.com/curriculum/concepts/ml-embeddings)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-sinusoidal-position)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
