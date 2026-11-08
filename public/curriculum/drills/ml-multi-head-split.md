# Split embedding across heads

> d_model=512, h=8. What is head_dim? If you project Q to 512 dims total, how many dims per head?

Canonical: https://learn.significanthobbies.com/curriculum/drills/ml-multi-head-split

d_model=512, h=8. What is head_dim? If you project Q to 512 dims total, how many dims per head?

## The mechanism

Attention lets each token in a sentence look at every other token and weight how relevant each one is. "Multi-head" runs several of these attention passes in parallel so the model can track different kinds of relationships at once (e.g. grammar, references, position).

## Expected evidence

head_dim = 512/8 = 64.

## Hints

- head_dim = d_model / num_heads.
- Each head runs attention in its own subspace.

## Sources and practice

- [Stanford CS336 — L3 Architectures & hyperparameters (Spring 2025)](https://github.com/stanford-cs336/spring2025-lectures/blob/e9cb2488fdb53ea37f0e38924ec3a1701925cef3/nonexecutable/2025%20Lecture%203%20-%20architecture.pdf)
- [CS224n — Self-Attention & Transformers (Stanford)](https://web.stanford.edu/class/cs224n/readings/cs224n-self-attention-transformers-2023_draft.pdf)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)
- [Study Multi-Head Attention](https://learn.significanthobbies.com/curriculum/concepts/ml-multi-head)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/ml-multi-head-split)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
