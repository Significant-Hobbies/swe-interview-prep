# Design exercise: Speculative Decoding

> Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation. Implement designOutline() returning non-empty values for: draftStrategy, verification, acceptanceRate. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-speculative-decoding

Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation. Implement designOutline() returning non-empty values for: draftStrategy, verification, acceptanceRate. Each value must name a concrete mechanism or decision.

## The mechanism

A cheap draft proposes several tokens and the target model verifies them in parallel. Speedup depends on acceptance rate and verification cost while preserving the target distribution.

## Expected evidence

A design outline with draftStrategy, verification, acceptanceRate plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192)
- [Study Speculative Decoding](https://learn.significanthobbies.com/curriculum/concepts/speculative-decoding)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-speculative-decoding)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
