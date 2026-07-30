# 1D DP

Linear state recurrences.

- Difficulty: advanced
- Tracks: DSA & Implementation

## Mental model

Dynamic programming is recursion with the repeated work cached. Define the state (what does dp[i] mean?), the recurrence (how does dp[i] build on earlier states?), and the base case. 1D DP means the state is a single index along a sequence.


## Common mistakes

- Starting to code before clearly defining what dp[i] represents
- Wrong iteration order so a state is read before it is computed
- Missing or wrong base cases

## Primary sources

- [Dynamic programming (Wikipedia)](https://en.wikipedia.org/wiki/Dynamic_programming) (doc)
- [Algorithms (Erickson) — Ch. 3: Dynamic Programming](https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf) (doc)
- [MIT 6.006 L15 — Dynamic Programming Part 1 (SRTBOT, Fib, DAGs, Bowling)](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-15-dynamic-programming-part-1-srtbot-fib-dags-bowling/) (video)
- [Longest increasing subsequence (cp-algorithms)](https://cp-algorithms.com/sequences/longest_increasing_subsequence.html) (doc)

## Practice

### House robber (1D DP)

Given values along a line, pick a non-adjacent subset with maximum sum.

**Expected evidence:** rob([2,7,9,3,1]) -> 12

### Best Time to Buy and Sell Stock

LeetCode #121 — Best Time to Buy and Sell Stock. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/best-time-to-buy-and-sell-stock/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Maximum Subarray

LeetCode #53 — Maximum Subarray. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/maximum-subarray/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Climbing Stairs

LeetCode #70 — Climbing Stairs. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/climbing-stairs/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Coin Change

LeetCode #322 — Coin Change. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/coin-change/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### House Robber

LeetCode #198 — House Robber. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/house-robber/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Jump Game

LeetCode #55 — Jump Game. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/jump-game/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Non-overlapping Intervals

LeetCode #435 — Non-overlapping Intervals. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/non-overlapping-intervals/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- The recurrence looks right but the answers are wrong. What is the first thing to check about iteration order?


## Prerequisites

- [Arrays & Hashing](https://learn.significanthobbies.com/curriculum/concepts/array-hashing.html)

## Related concepts

- [2D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-2d.html)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
