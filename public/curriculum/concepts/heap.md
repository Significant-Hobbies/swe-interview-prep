# Heap / Priority Queue

Top-k, k-way merge, scheduling.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

A heap gives you the min or max in O(1) and re-balances in O(log n). Whenever a problem says "top k", "k-th largest", or "merge k sorted", a heap of size k is usually the answer — far cheaper than sorting everything.


## Common mistakes

- Sorting the whole input when a size-k heap suffices
- Inverting heap polarity: top-k smallest wants a size-k max-heap (evict the largest), top-k largest wants a size-k min-heap
- Forgetting most languages give a min-heap by default

## Primary sources

- [VisuAlgo — Binary Heap](https://visualgo.net/en/heap) (doc)

## Practice

### Kth largest element with a heap

Return the k-th largest element of an unsorted array using a heap, without fully sorting.

**Expected evidence:** findKthLargest([3,2,1,5,6,4], 2) -> 5

### Top K Frequent Elements

LeetCode #347 — Top K Frequent Elements. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/top-k-frequent-elements/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Kth Largest Element in an Array

LeetCode #215 — Kth Largest Element in an Array. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/kth-largest-element-in-an-array/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Task Scheduler

LeetCode #621 — Task Scheduler. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/task-scheduler/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- A size-k heap is O(n log k) and sorting is O(n log n). When is sorting still the better choice?


## Prerequisites

- [Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing.html)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
