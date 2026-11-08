# Design exercise: KV Caching & PagedAttention

> Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure. Implement designOutline() returning non-empty values for: cacheSizing, pageMapping, evictionPolicy. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-kv-cache-paged-attention

Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure. Implement designOutline() returning non-empty values for: cacheSizing, pageMapping, evictionPolicy. Each value must name a concrete mechanism or decision.

## The mechanism

The KV cache trades memory for avoided recomputation. PagedAttention maps logical token blocks to non-contiguous physical pages so variable-length requests waste less memory.

## Expected evidence

A design outline with cacheSizing, pageMapping, evictionPolicy plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://arxiv.org/abs/2309.06180)
- [Study KV Caching & PagedAttention](https://learn.significanthobbies.com/curriculum/concepts/kv-cache-paged-attention)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-kv-cache-paged-attention)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
