# Kth largest element with a heap

> Return the k-th largest element of an unsorted array using a heap, without fully sorting.

Canonical: https://learn.significanthobbies.com/curriculum/drills/kth-largest-heap

Return the k-th largest element of an unsorted array using a heap, without fully sorting.

## The mechanism

A heap gives you the min or max in O(1) and re-balances in O(log n). Whenever a problem says "top k", "k-th largest", or "merge k sorted", a heap of size k is usually the answer — far cheaper than sorting everything.

## Expected evidence

findKthLargest([3,2,1,5,6,4], 2) -> 5

## Hints

- Keep a min-heap of size k; the root is the answer.
- If the heap exceeds k, pop the smallest.

## Sources and practice

- [VisuAlgo — Binary Heap](https://visualgo.net/en/heap)
- [Study Heap / Priority Queue](https://learn.significanthobbies.com/curriculum/concepts/heap)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/kth-largest-heap)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
