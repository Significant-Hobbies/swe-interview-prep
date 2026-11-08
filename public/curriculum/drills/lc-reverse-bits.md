# Reverse Bits

> LeetCode #190 — Reverse Bits. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/reverse-bits/

Canonical: https://learn.significanthobbies.com/curriculum/drills/lc-reverse-bits

LeetCode #190 — Reverse Bits. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/reverse-bits/

## The mechanism

Bits give you three superpowers: a bitmask is an O(1) set, XOR cancels duplicates, and checking power-of-2 is a single AND. Two tricks worth memorizing: n & (n-1) clears the lowest set bit, and XOR-ing equal values gives zero.

## Expected evidence

Pass all LeetCode test cases for this problem.

## Hints

- Pattern hint: bit manipulation.
- Start with brute force, then optimize time/space.
- Write down invariants before coding.

## Sources and practice

- [Bitwise operation (Wikipedia)](https://en.wikipedia.org/wiki/Bitwise_operation)
- [Study Bit Manipulation](https://learn.significanthobbies.com/curriculum/concepts/bit-manipulation)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/lc-reverse-bits)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
