# Group Anagrams

> LeetCode #49 — Group Anagrams. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/group-anagrams/

Canonical: https://learn.significanthobbies.com/curriculum/drills/lc-group-anagrams

LeetCode #49 — Group Anagrams. Solve on LeetCode, then implement here if you want it in your drill queue.

https://leetcode.com/problems/group-anagrams/

## The mechanism

A hash map trades memory for time: it turns an O(n) scan for "have I seen this?" into an O(1) lookup. Most array problems that feel quadratic collapse to linear once you ask what you would store in a map keyed by value, complement, or frequency.

## Expected evidence

Pass all LeetCode test cases for this problem.

## Hints

- Pattern hint: array hashing.
- Start with brute force, then optimize time/space.
- Write down invariants before coding.

## Sources and practice

- [Hash table (Wikipedia)](https://en.wikipedia.org/wiki/Hash_table)
- [Study Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/lc-group-anagrams)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
