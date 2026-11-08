# Skip documents that cannot reach the top k

> Implement prune(docs, upperBounds, k) where docs is [{id, terms:[termName], score}] and upperBounds maps term -> max possible contribution. Walk docs in order maintaining a top-k heap; BEFORE scoring a document, skip it when the sum of its terms' upper bounds is <= the current k-th best score. Return { top: ids of the top k by score descending, scored: how many documents you actually scored }.

Canonical: https://learn.significanthobbies.com/curriculum/drills/wand-threshold-skip

Implement prune(docs, upperBounds, k) where docs is [{id, terms:[termName], score}] and upperBounds maps term -> max possible contribution. Walk docs in order maintaining a top-k heap; BEFORE scoring a document, skip it when the sum of its terms' upper bounds is <= the current k-th best score. Return { top: ids of the top k by score descending, scored: how many documents you actually scored }.

## The mechanism

Scoring every posting is wasted work when you only need the top k: once the heap holds k results, any document whose best possible score cannot exceed the current threshold can be skipped without computing it. WAND does this by keeping a per-term upper bound and advancing pointers past documents whose summed bounds fall short; block-max sharpens it by storing a maximum per block rather than per term, so the bound is tight enough to skip far more. This is safe pruning — the top k is identical to the exhaustive answer, only faster.

## Expected evidence

Pruning must not change the top k — only how many documents were scored.

## Hints

- The threshold is the k-th best score so far, and it is 0 (skip nothing) until the heap holds k documents.
- Use <= so a document that can only tie is skipped; ties do not displace an existing result.

## Sources and practice


- [Study Top-k Pruning (WAND)](https://learn.significanthobbies.com/curriculum/concepts/top-k-pruning)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/wand-threshold-skip)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
