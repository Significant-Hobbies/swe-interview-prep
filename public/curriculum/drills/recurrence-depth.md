# Solve a divide-and-conquer recurrence

> Implement masterCase(a, b, fExp) for T(n) = a*T(n/b) + n^fExp. Let c = log_b(a). Return 'leaves' when fExp < c (leaf work dominates, T = n^c), 'balanced' when fExp === c (T = n^c log n), 'root' when fExp > c. Compare with a small tolerance — log_b(a) is floating point.

Canonical: https://learn.significanthobbies.com/curriculum/drills/recurrence-depth

Implement masterCase(a, b, fExp) for T(n) = a*T(n/b) + n^fExp. Let c = log_b(a). Return 'leaves' when fExp < c (leaf work dominates, T = n^c), 'balanced' when fExp === c (T = n^c log n), 'root' when fExp > c. Compare with a small tolerance — log_b(a) is floating point.

## The mechanism

Trust the recursive call. You verify a base case and verify that the recursive step is correct ASSUMING the call on a smaller input is correct — that is induction, and it is why tracing the whole call tree in your head is both unnecessary and the main source of confusion. Every recursion also implies a recurrence, and the Master theorem reads it off directly: T(n) = aT(n/b) + f(n) is decided by whether the work at the leaves or at the root dominates.

## Expected evidence

masterCase(2,2,1) -> 'balanced' (mergesort); masterCase(8,2,2) -> 'leaves'; masterCase(2,2,2) -> 'root'

## Hints

- log_b(a) is Math.log(a)/Math.log(b) — do not assume it is an integer.
- Use a tolerance around 1e-9 for the equality case or mergesort will misclassify.

## Sources and practice


- [Study Recursion & Induction](https://learn.significanthobbies.com/curriculum/concepts/recursion-and-induction)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/recurrence-depth)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
