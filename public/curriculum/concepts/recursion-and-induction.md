# Recursion & Induction

Writing recursion you can trust, and solving the recurrence it produces.

- Difficulty: intro
- Tracks: DSA & Implementation

## Mental model

Trust the recursive call. You verify a base case and verify that the recursive step is correct ASSUMING the call on a smaller input is correct — that is induction, and it is why tracing the whole call tree in your head is both unnecessary and the main source of confusion. Every recursion also implies a recurrence, and the Master theorem reads it off directly: T(n) = aT(n/b) + f(n) is decided by whether the work at the leaves or at the root dominates.

## Where it matters

Tree and graph traversal, divide-and-conquer, parsers, and every dynamic-programming formulation before it is memoised.

## Common mistakes

- Tracing execution instead of trusting the inductive hypothesis, then getting lost three levels deep
- A base case that does not actually terminate every path — off-by-one on the shrink step
- Recursing without shrinking the input, or shrinking it in a way that skips the base case
- Ignoring stack depth: an O(n) recursion on a million elements overflows where a loop would not

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Solve a divide-and-conquer recurrence

Implement masterCase(a, b, fExp) for T(n) = a*T(n/b) + n^fExp. Let c = log_b(a). Return 'leaves' when fExp c. Compare with a small tolerance — log_b(a) is floating point.

**Expected evidence:** masterCase(2,2,1) -> 'balanced' (mergesort); masterCase(8,2,2) -> 'leaves'; masterCase(2,2,2) -> 'root'

## Review prompts

- You are three levels deep tracing a recursive call and have lost the thread. What is the argument that makes tracing unnecessary, and what must you check instead?


## Prerequisites

- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis.html)

## Related concepts

- [1D DP](https://learn.significanthobbies.com/curriculum/concepts/dp-1d.html)
- [Backtracking](https://learn.significanthobbies.com/curriculum/concepts/backtracking.html)
- [Trees](https://learn.significanthobbies.com/curriculum/concepts/trees.html)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
