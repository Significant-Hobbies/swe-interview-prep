# Longest substring without repeats

> Find the length of the longest substring with no repeating characters using a variable-size sliding window.

Canonical: https://learn.significanthobbies.com/curriculum/drills/longest-substring-sliding-window

Find the length of the longest substring with no repeating characters using a variable-size sliding window.

## The mechanism

A sliding window maintains a contiguous range and an aggregate (sum, count, max) as it moves. Expand the right edge to include elements; shrink the left edge when a constraint breaks. Each element enters and leaves the window at most once — O(n).

## Expected evidence

lengthOfLongestSubstring('abcabcbb') -> 3

## Hints

- Expand the right edge; on a duplicate, shrink the left edge until the window is valid again.
- Track the last index of each character.

## Sources and practice

- [NeetCode Roadmap](https://neetcode.io/roadmap)
- [Sliding Window — USACO Guide (Gold)](https://usaco.guide/gold/sliding-window)
- [Minimum Stack / Minimum Queue — the O(n) sliding-window minimum](https://cp-algorithms.com/data_structures/stack_queue_modification.html)
- [Study Sliding Window](https://learn.significanthobbies.com/curriculum/concepts/sliding-window)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/longest-substring-sliding-window)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
