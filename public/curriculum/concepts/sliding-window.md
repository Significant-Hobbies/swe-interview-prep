# Sliding Window

Variable/fixed window over sequences.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

A sliding window maintains a contiguous range and an aggregate (sum, count, max) as it moves. Expand the right edge to include elements; shrink the left edge when a constraint breaks. Each element enters and leaves the window at most once — O(n).


## Common mistakes

- Recomputing the aggregate from scratch instead of updating incrementally
- Shrinking with an `if` when a `while` is needed to restore the invariant
- Confusing fixed-size and variable-size window templates

## Primary sources

- [NeetCode Roadmap](https://neetcode.io/roadmap) (course)
- [Sliding Window — USACO Guide (Gold)](https://usaco.guide/gold/sliding-window) (doc)
- [Minimum Stack / Minimum Queue — the O(n) sliding-window minimum](https://cp-algorithms.com/data_structures/stack_queue_modification.html) (doc)

## Practice

### Longest substring without repeats

Find the length of the longest substring with no repeating characters using a variable-size sliding window.

**Expected evidence:** lengthOfLongestSubstring('abcabcbb') -> 3

### Longest Substring Without Repeating Characters

LeetCode #3 — Longest Substring Without Repeating Characters. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/longest-substring-without-repeating-characters/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- Why must the shrink step be a `while` loop rather than an `if`?


## Prerequisites

- [Two Pointers](https://learn.significanthobbies.com/curriculum/concepts/two-pointers)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
