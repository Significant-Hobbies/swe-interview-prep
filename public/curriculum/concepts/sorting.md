# Sorting

Comparison sorts, stability, in-place versus extra space, and when a linear-time sort is available.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Comparison sorting cannot beat O(n log n) because n! orderings need log2(n!) comparisons to distinguish — so a faster sort must stop comparing and exploit structure in the keys, which is what counting and radix sort do. The practical choice is rarely the asymptote: it is stability (does equal-key order survive?) and space (can you afford the merge buffer?).

## Where it matters

Sorting is the setup step for most interval, two-pointer, and greedy solutions — getting stability or the comparator wrong silently corrupts the result rather than crashing.

## Common mistakes

- Assuming the language's sort is stable — it is in JS and Python, it is not for primitives in many others
- Sorting numbers with a default lexicographic comparator, so 10 sorts before 9
- Reaching for a linear-time sort without a bounded key range, where it is slower than comparison sorting
- Sorting inside a loop when one sort before the loop would do

## Primary sources

- [MIT 6.006 — Lecture 3: Sets and Sorting](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-3-sets-and-sorting/) (video)
- [MIT 6.006 — Lecture 5: Linear Sorting](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-5-linear-sorting/) (video)
- [USACO Guide — Introduction to Sorting](https://usaco.guide/bronze/intro-sorting) (doc)

## Practice

### Stable sort by one key

Implement sortByScore(rows) returning rows ordered by descending numeric `score`, with the original relative order preserved for equal scores (a stable sort). Do not mutate the input.

**Expected evidence:** Equal scores keep input order: [a:5, b:3, c:5] -> [a:5, c:5, b:3]

## Review prompts

- You sort records by score, then by date, expecting both orderings to hold. Why does this only work if the sort is stable, and what breaks if it is not?


## Prerequisites

- [Complexity Analysis](https://learn.significanthobbies.com/curriculum/concepts/complexity-analysis)

## Related concepts

- [Binary Search](https://learn.significanthobbies.com/curriculum/concepts/binary-search)
- [Heap / Priority Queue](https://learn.significanthobbies.com/curriculum/concepts/heap)
- [Intervals](https://learn.significanthobbies.com/curriculum/concepts/intervals)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
