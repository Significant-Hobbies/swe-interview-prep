# House robber (1D DP)

> Given values along a line, pick a non-adjacent subset with maximum sum.

Canonical: https://learn.significanthobbies.com/curriculum/drills/house-robber-dp

Given values along a line, pick a non-adjacent subset with maximum sum.

## The mechanism

Dynamic programming is recursion with the repeated work cached. Define the state (what does dp[i] mean?), the recurrence (how does dp[i] build on earlier states?), and the base case. 1D DP means the state is a single index along a sequence.

## Expected evidence

rob([2,7,9,3,1]) -> 12

## Hints

- Define dp[i] = best sum using houses 0..i.
- dp[i] = max(dp[i-1], dp[i-2] + value[i]).

## Sources and practice

- [Dynamic programming (Wikipedia)](https://en.wikipedia.org/wiki/Dynamic_programming)
- [Algorithms (Erickson) — Ch. 3: Dynamic Programming](https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf)
- [MIT 6.006 L15 — Dynamic Programming Part 1 (SRTBOT, Fib, DAGs, Bowling)](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-15-dynamic-programming-part-1-srtbot-fib-dags-bowling/)
- [Longest increasing subsequence (cp-algorithms)](https://cp-algorithms.com/sequences/longest_increasing_subsequence.html)
- [Study 1D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-1d)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/house-robber-dp)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
