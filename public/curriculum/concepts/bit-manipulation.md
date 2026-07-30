# Bit Manipulation

Bitwise ops, masks, XOR tricks.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Bits give you three superpowers: a bitmask is an O(1) set, XOR cancels duplicates, and checking power-of-2 is a single AND. Two tricks worth memorizing: n & (n-1) clears the lowest set bit, and XOR-ing equal values gives zero.



## Primary sources

- [Bitwise operation (Wikipedia)](https://en.wikipedia.org/wiki/Bitwise_operation) (doc)

## Practice

### Find the single number (XOR)

Every element appears twice except one. Find it in O(n) time, O(1) space.

**Expected evidence:** xor all → 5 for [4,1,2,1,4].

### Single Number

LeetCode #136 — Single Number. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/single-number/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Sum of Two Integers

LeetCode #371 — Sum of Two Integers. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/sum-of-two-integers/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Reverse Bits

LeetCode #190 — Reverse Bits. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/reverse-bits/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- Why does `n & (n - 1)` clear the lowest set bit, and what two things does that give you?


## Prerequisites

- None assigned.

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
