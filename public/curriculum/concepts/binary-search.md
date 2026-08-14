# Binary Search

Halving sorted search space, predicate search.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Binary search is not about sorted arrays — it is about a monotonic predicate. If you can phrase the answer as "the smallest x for which condition(x) is true", you can binary-search the answer space, halving it each step.


## Common mistakes

- Infinite loops from a wrong mid update or loop condition
- Searching values when you should search the answer space
- Integer overflow in `(lo + hi) / 2` — use `lo + (hi - lo) / 2`

## Primary sources

- [Binary search algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm) (doc)

## Practice

### Search in a rotated sorted array

A sorted array was rotated at an unknown pivot. Find a target's index in O(log n).

**Expected evidence:** search([4,5,6,7,0,1,2], 0) -> 4

### Binary Search

LeetCode #792 — Binary Search. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/binary-search/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- What property must hold before you can binary-search the answer space, and how do you check it?


## Prerequisites

- [Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
