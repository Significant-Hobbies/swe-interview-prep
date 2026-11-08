# Scaled dot-product attention weights

> Q=K=[[1,0],[0,1]], V=[[1,2],[3,4]], d_k=2. Compute softmax(QKᵀ/√d_k)·V for one query row.

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-scaled-dot-attention

Q=K=[[1,0],[0,1]], V=[[1,2],[3,4]], d_k=2. Compute softmax(QKᵀ/√d_k)·V for one query row.

## The mechanism

Self-attention lets every token look at every other token and pull in what is relevant. Each token emits a query, a key, and a value; the query-key dot products (scaled, softmaxed) become weights over the values. Causal masking blocks a token from seeing the future.

## Expected evidence

Scaled scores [0.71, 0] → weights ≈ 0.67/0.33 → output ≈ [1.7, 2.7].

## Hints

- Scale before softmax.
- Apply weights to values.

## Sources and practice

- [Stanford CS336 — L6 Kernels & Triton (FlashAttention2)](https://cs336.stanford.edu/spring2025-lectures/?trace=var/traces/lecture_06.json)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)
- [Attention in transformers, visually (3Blue1Brown)](https://www.3blue1brown.com/lessons/attention)
- [Attention Is All You Need (Vaswani et al.)](https://arxiv.org/abs/1706.03762)
- [Study Self-Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-self-attention)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-scaled-dot-attention)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
