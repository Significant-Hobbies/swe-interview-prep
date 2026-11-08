# Design exercise: FlashAttention & Attention Kernels

> IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention. Implement designOutline() returning non-empty values for: memoryTraffic, tiling, numericalStability. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-flashattention-kernels

IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention. Implement designOutline() returning non-empty values for: memoryTraffic, tiling, numericalStability. Each value must name a concrete mechanism or decision.

## The mechanism

FlashAttention is exact attention reorganized around the memory hierarchy. Tiling and fusion reduce expensive HBM traffic without materializing the full attention matrix.

## Expected evidence

A design outline with memoryTraffic, tiling, numericalStability plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135)
- [Study FlashAttention & Attention Kernels](https://learn.significanthobbies.com/curriculum/concepts/flashattention-kernels)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-flashattention-kernels)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
