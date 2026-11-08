# Amortised growth of a dynamic array

> Implement pushCount(n): build a dynamic array by pushing n items, doubling capacity when full (starting at capacity 1), and return the TOTAL number of element copies performed. This is the sum that makes push O(1) amortised — for n=8 the copies are 1+2+4 = 7.

Canonical: https://learn.significanthobbies.com/curriculum/drills/analyse-amortised-growth

Implement pushCount(n): build a dynamic array by pushing n items, doubling capacity when full (starting at capacity 1), and return the TOTAL number of element copies performed. This is the sum that makes push O(1) amortised — for n=8 the copies are 1+2+4 = 7.

## The mechanism

A complexity bound is a claim about growth, not speed: it says how the work scales as n grows, so constants and hardware drop out. Amortised cost is a separate claim — that an expensive step is rare enough to average down over a sequence, which is why a dynamic array's push is O(1) amortised despite occasionally copying everything. Space is the third axis and the one people forget: recursion depth is memory.

## Expected evidence

pushCount(8) -> 7, pushCount(1) -> 0, pushCount(100) -> 127

## Hints

- You only copy at the moment capacity is exhausted, and you copy everything currently stored.
- Capacities go 1, 2, 4, 8 … so the copies form a geometric series that sums to less than n.

## Sources and practice

- [MIT 6.006 — Lecture 1: Algorithms and Computation](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-1-algorithms-and-computation/)
- [USACO Guide — Time Complexity](https://usaco.guide/bronze/time-comp)
- [Jeff Erickson, Algorithms — appendix: Solving Recurrences (PDF)](https://jeffe.cs.illinois.edu/teaching/algorithms/notes/99-recurrences.pdf)
- [Study Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/analyse-amortised-growth)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
