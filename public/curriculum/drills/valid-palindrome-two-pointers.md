# Valid palindrome with two pointers

> Given a string, decide if it reads the same forwards and backwards, ignoring case and non-alphanumeric characters. Use two pointers, no extra string.

Canonical: https://learn.significanthobbies.com/curriculum/drills/valid-palindrome-two-pointers

Given a string, decide if it reads the same forwards and backwards, ignoring case and non-alphanumeric characters. Use two pointers, no extra string.

## The mechanism

Two pointers replace a nested loop with a single pass by exploiting structure — usually a sorted array or a sequence with a monotonic property. The pointers move toward or away from each other based on a comparison, so each element is visited once.

## Expected evidence

isPalindrome('A man, a plan, a canal: Panama') -> true

## Hints

- Start one pointer at each end, move inward.
- Skip non-alphanumeric characters without allocating a cleaned copy.

## Sources and practice

- [NeetCode Roadmap](https://neetcode.io/roadmap)
- [Two Pointers — USACO Guide (Silver)](https://usaco.guide/silver/two-pointers)
- [cp-algorithms — Tortoise and Hare (linked list cycle detection)](https://cp-algorithms.com/others/tortoise_and_hare.html)
- [Study Two Pointers](https://learn.significanthobbies.com/curriculum/concepts/two-pointers)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/valid-palindrome-two-pointers)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
