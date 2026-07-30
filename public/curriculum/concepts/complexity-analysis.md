# Complexity Analysis

Big-O, amortised cost, and space complexity — how to argue a bound before writing code.

- Difficulty: intro
- Tracks: DSA & Implementation

## Mental model

A complexity bound is a claim about growth, not speed: it says how the work scales as n grows, so constants and hardware drop out. Amortised cost is a separate claim — that an expensive step is rare enough to average down over a sequence, which is why a dynamic array's push is O(1) amortised despite occasionally copying everything. Space is the third axis and the one people forget: recursion depth is memory.

## Where it matters

Every interview asks for it, and it is the argument you make in a code review when someone adds a nested lookup inside a loop.

## Common mistakes

- Reporting the complexity of the loop you can see and missing the one inside the library call (sort, includes, string concat)
- Calling an amortised bound a worst-case bound — a single push can still be O(n)
- Ignoring recursion depth, so an O(n) algorithm quietly uses O(n) stack
- Adding complexities of sequential phases instead of taking the max, or multiplying nested loops that do not actually nest over the same n

## Primary sources

- [MIT 6.006 — Lecture 1: Algorithms and Computation](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-1-algorithms-and-computation/) (video)
- [USACO Guide — Time Complexity](https://usaco.guide/bronze/time-comp) (doc)
- [Jeff Erickson, Algorithms — appendix: Solving Recurrences (PDF)](https://jeffe.cs.illinois.edu/teaching/algorithms/notes/99-recurrences.pdf) (paper)

## Practice

### Amortised growth of a dynamic array

Implement pushCount(n): build a dynamic array by pushing n items, doubling capacity when full (starting at capacity 1), and return the TOTAL number of element copies performed. This is the sum that makes push O(1) amortised — for n=8 the copies are 1+2+4 = 7.

**Expected evidence:** pushCount(8) -> 7, pushCount(1) -> 0, pushCount(100) -> 127

## Review prompts

- A dynamic array's push is O(1) amortised, yet one push can still take O(n). What does the amortised bound actually promise, and when is it the wrong bound to quote?


## Prerequisites

- None assigned.

## Related concepts

- [Sorting](https://learn.significanthobbies.com/curriculum/concepts/sorting.html)
- [Binary Search](https://learn.significanthobbies.com/curriculum/concepts/binary-search.html)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
