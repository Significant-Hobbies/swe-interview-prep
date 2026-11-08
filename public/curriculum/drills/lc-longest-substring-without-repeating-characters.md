# Longest Substring Without Repeating Characters

> LeetCode #3 — Longest Substring Without Repeating Characters. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/longest-substring-without-repeating-characters/

Canonical: https://learn.significanthobbies.com/curriculum/drills/lc-longest-substring-without-repeating-characters

LeetCode #3 — Longest Substring Without Repeating Characters. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/longest-substring-without-repeating-characters/

## The mechanism

A sliding window maintains a contiguous range and an aggregate (sum, count, max) as it moves. Expand the right edge to include elements; shrink the left edge when a constraint breaks. Each element enters and leaves the window at most once — O(n).

## Expected evidence

Pass all LeetCode test cases for this problem.

## Hints

- Pattern hint: sliding window.
- Start with brute force, then optimize time/space.
- Write down invariants before coding.

## Sources and practice

- [NeetCode Roadmap](https://neetcode.io/roadmap)
- [Sliding Window — USACO Guide (Gold)](https://usaco.guide/gold/sliding-window)
- [Minimum Stack / Minimum Queue — the O(n) sliding-window minimum](https://cp-algorithms.com/data_structures/stack_queue_modification.html)
- [Study Sliding Window](https://learn.significanthobbies.com/curriculum/concepts/sliding-window)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/lc-longest-substring-without-repeating-characters)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
