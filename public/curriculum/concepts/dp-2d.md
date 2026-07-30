# 2D DP

Grid DP, edit distance, knapsack.

- Difficulty: advanced
- Tracks: DSA & Implementation

## Mental model

2D dynamic programming fills a table where each cell depends on a few neighbors (often the ones above and to the left). The hard part is naming the state precisely — once dp[i][j] has a clear one-sentence meaning, the recurrence usually falls out.



## Primary sources

- [Dynamic programming (Wikipedia)](https://en.wikipedia.org/wiki/Dynamic_programming) (doc)
- [MIT 6.006 L21 — DP III: Parenthesization, Edit Distance, Knapsack](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-21-dp-iii-parenthesization-edit-distance-knapsack/) (video)
- [Knapsack problem (cp-algorithms)](https://cp-algorithms.com/dynamic_programming/knapsack.html) (doc)

## Practice

### Minimum path sum in a grid

Grid [[1,3,1],[1,5,1],[4,2,1]]. Min path sum top-left to bottom-right moving only right/down?

**Expected evidence:** 7 via 1→3→1→1→1.

## Review prompts

- In edit distance, state precisely what dp[i][j] means and what the three predecessor cells correspond to.


## Prerequisites

- [1D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-1d.html)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
