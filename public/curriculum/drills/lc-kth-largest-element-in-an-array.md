# Kth Largest Element in an Array

> LeetCode #215 — Kth Largest Element in an Array. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/kth-largest-element-in-an-array/

Canonical: https://learn.significanthobbies.com/curriculum/drills/lc-kth-largest-element-in-an-array

LeetCode #215 — Kth Largest Element in an Array. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/kth-largest-element-in-an-array/

## The mechanism

A heap gives you the min or max in O(1) and re-balances in O(log n). Whenever a problem says "top k", "k-th largest", or "merge k sorted", a heap of size k is usually the answer — far cheaper than sorting everything.

## Expected evidence

Pass all LeetCode test cases for this problem.

## Hints

- Pattern hint: heap.
- Start with brute force, then optimize time/space.
- Write down invariants before coding.

## Sources and practice

- [VisuAlgo — Binary Heap](https://visualgo.net/en/heap)
- [Study Heap / Priority Queue](https://learn.significanthobbies.com/curriculum/concepts/heap)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/lc-kth-largest-element-in-an-array)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
