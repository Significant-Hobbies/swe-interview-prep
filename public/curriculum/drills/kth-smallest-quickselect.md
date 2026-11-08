# k-th smallest by quickselect

> Implement kthSmallest(nums, k) returning the k-th smallest (k is 1-based) using quickselect — partition, then recurse into only ONE side. Do not sort the array and do not mutate the caller's input.

Canonical: https://learn.significanthobbies.com/curriculum/drills/kth-smallest-quickselect

Implement kthSmallest(nums, k) returning the k-th smallest (k is 1-based) using quickselect — partition, then recurse into only ONE side. Do not sort the array and do not mutate the caller's input.

## The mechanism

Quicksort recurses into both halves; quickselect knows which half holds the answer and discards the other, so the work is n + n/2 + n/4 … which sums to O(n) rather than O(n log n). The catch is that the guarantee is only expected: adversarial or already-sorted input with a naive pivot degrades to O(n²), which is what randomised pivots and median-of-medians exist to prevent.

## Expected evidence

kthSmallest([7,10,4,3,20,15], 3) -> 7

## Hints

- After partitioning, compare k against the size of the left partition to decide which side can possibly hold the answer.
- Recursing into both sides makes this quicksort — the whole saving is discarding one.

## Sources and practice


- [Study Quickselect](https://learn.significanthobbies.com/curriculum/concepts/quickselect)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/kth-smallest-quickselect)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
