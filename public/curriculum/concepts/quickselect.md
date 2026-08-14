# Quickselect

Finding the k-th smallest in expected O(n) by recursing into only one partition.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Quicksort recurses into both halves; quickselect knows which half holds the answer and discards the other, so the work is n + n/2 + n/4 … which sums to O(n) rather than O(n log n). The catch is that the guarantee is only expected: adversarial or already-sorted input with a naive pivot degrades to O(n²), which is what randomised pivots and median-of-medians exist to prevent.

## Where it matters

Median and percentile computation, top-k without full ordering, and the selection step inside median-of-medians.

## Common mistakes

- Quoting O(n) as worst case — it is expected; the worst case is quadratic without a good pivot rule
- Reaching for a full sort when only one order statistic is needed
- Off-by-one between the k-th smallest and index k after partitioning
- Using a size-k heap for large k, where quickselect is cheaper, or quickselect for streaming data, where it does not apply

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### k-th smallest by quickselect

Implement kthSmallest(nums, k) returning the k-th smallest (k is 1-based) using quickselect — partition, then recurse into only ONE side. Do not sort the array and do not mutate the caller's input.

**Expected evidence:** kthSmallest([7,10,4,3,20,15], 3) -> 7

## Review prompts

- Quickselect is O(n) and quicksort is O(n log n) despite the same partition step. Where does the log factor go, and why is the O(n) only expected?


## Prerequisites

- [Sorting](https://learn.significanthobbies.com/curriculum/concepts/sorting)

## Related concepts

- [Heap / Priority Queue](https://learn.significanthobbies.com/curriculum/concepts/heap)
- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
