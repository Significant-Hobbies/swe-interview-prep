# Minimum path sum in a grid

> Grid [[1,3,1],[1,5,1],[4,2,1]]. Min path sum top-left to bottom-right moving only right/down?

Canonical: https://learn.significanthobbies.com/curriculum/drills/grid-min-path-dp

Grid [[1,3,1],[1,5,1],[4,2,1]]. Min path sum top-left to bottom-right moving only right/down?

## The mechanism

2D dynamic programming fills a table where each cell depends on a few neighbors (often the ones above and to the left). The hard part is naming the state precisely — once dp[i][j] has a clear one-sentence meaning, the recurrence usually falls out.

## Expected evidence

7 via 1→3→1→1→1.

## Hints

- dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).
- Can roll to 1D array.

## Sources and practice

- [Dynamic programming (Wikipedia)](https://en.wikipedia.org/wiki/Dynamic_programming)
- [MIT 6.006 L21 — DP III: Parenthesization, Edit Distance, Knapsack](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-21-dp-iii-parenthesization-edit-distance-knapsack/)
- [Knapsack problem (cp-algorithms)](https://cp-algorithms.com/dynamic_programming/knapsack.html)
- [Study 2D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-2d)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/grid-min-path-dp)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
