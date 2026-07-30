# Two Pointers

Converging/diverging pointer scans.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Two pointers replace a nested loop with a single pass by exploiting structure — usually a sorted array or a sequence with a monotonic property. The pointers move toward or away from each other based on a comparison, so each element is visited once.


## Common mistakes

- Using two pointers on unsorted data when the technique needs order
- Off-by-one errors at the start/end conditions
- Moving the wrong pointer and skipping valid pairs

## Primary sources

- [NeetCode Roadmap](https://neetcode.io/roadmap) (course)
- [Two Pointers — USACO Guide (Silver)](https://usaco.guide/silver/two-pointers) (doc)
- [cp-algorithms — Tortoise and Hare (linked list cycle detection)](https://cp-algorithms.com/others/tortoise_and_hare.html) (doc)

## Practice

### Valid palindrome with two pointers

Given a string, decide if it reads the same forwards and backwards, ignoring case and non-alphanumeric characters. Use two pointers, no extra string.

**Expected evidence:** isPalindrome('A man, a plan, a canal: Panama') -> true

### Valid Palindrome

LeetCode #125 — Valid Palindrome. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/valid-palindrome/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### 3Sum

LeetCode #15 — 3Sum. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/3sum/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- On a sorted array, why can a two-pointer scan discard many candidate pairs at once instead of one at a time?


## Prerequisites

- [Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing.html)

## Related concepts

- [Sliding Window](https://learn.significanthobbies.com/curriculum/concepts/sliding-window.html)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
