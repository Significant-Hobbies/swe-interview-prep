# Arrays & Hashing

Hash maps, sets, frequency counting.

- Difficulty: intro
- Tracks: DSA & Implementation

## Mental model

A hash map trades memory for time: it turns an O(n) scan for "have I seen this?" into an O(1) lookup. Most array problems that feel quadratic collapse to linear once you ask what you would store in a map keyed by value, complement, or frequency.


## Common mistakes

- Reaching for nested loops before asking "what would a hash map key on?"
- Mutating a collection while iterating it
- Forgetting hash maps have no order — sort separately if order matters

## Primary sources

- [Hash table (Wikipedia)](https://en.wikipedia.org/wiki/Hash_table) (doc)

## Practice

### Two Sum with a hash map

Given an array of integers and a target, return the indices of the two numbers that add to the target. Solve it in a single pass.

**Expected evidence:** twoSum([2,7,11,15], 9) -> [0,1]

### Two Sum

LeetCode #1 — Two Sum. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/two-sum/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Contains Duplicate

LeetCode #217 — Contains Duplicate. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/contains-duplicate/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Product of Array Except Self

LeetCode #238 — Product of Array Except Self. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/product-of-array-except-self/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Group Anagrams

LeetCode #49 — Group Anagrams. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/group-anagrams/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Merge Intervals

LeetCode #56 — Merge Intervals. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/merge-intervals/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Rotting Oranges

LeetCode #1036 — Rotting Oranges. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/rotting-oranges/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- You need to know whether any two numbers in an array sum to a target. What do you key the hash map on, and what does that buy you?


## Prerequisites

- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis)

## Related concepts

- [Two Pointers](https://learn.significanthobbies.com/curriculum/concepts/two-pointers)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
