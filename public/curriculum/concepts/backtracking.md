# Backtracking

DFS with state restoration, pruning.

- Difficulty: advanced
- Tracks: DSA & Implementation

## Mental model

Backtracking is "try a choice, recurse, undo if it does not work, try the next one." It explores all possibilities, but you cut whole branches by stopping early when you can prove they will never reach a valid answer.



## Primary sources

- [Backtracking (Wikipedia)](https://en.wikipedia.org/wiki/Backtracking) (doc)

## Practice

### Generate all subsets

Return all subsets of [1,2]. Use backtracking with include/exclude choice per index.

**Expected evidence:** [[],[1],[2],[1,2]] (order may vary).

### Word Search

LeetCode #79 — Word Search. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/word-search/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Permutations

LeetCode #46 — Permutations. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/permutations/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- What exactly has to be undone after a recursive call returns, and what breaks if you forget?


## Prerequisites

- [Trees](https://learn.significanthobbies.com/curriculum/concepts/trees)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
