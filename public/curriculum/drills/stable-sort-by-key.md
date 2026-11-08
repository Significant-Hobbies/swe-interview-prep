# Stable sort by one key

> Implement sortByScore(rows) returning rows ordered by descending numeric `score`, with the original relative order preserved for equal scores (a stable sort). Do not mutate the input.

Canonical: https://learn.significanthobbies.com/curriculum/drills/stable-sort-by-key

Implement sortByScore(rows) returning rows ordered by descending numeric `score`, with the original relative order preserved for equal scores (a stable sort). Do not mutate the input.

## The mechanism

Comparison sorting cannot beat O(n log n) because n! orderings need log2(n!) comparisons to distinguish — so a faster sort must stop comparing and exploit structure in the keys, which is what counting and radix sort do. The practical choice is rarely the asymptote: it is stability (does equal-key order survive?) and space (can you afford the merge buffer?).

## Expected evidence

Equal scores keep input order: [a:5, b:3, c:5] -> [a:5, c:5, b:3]

## Hints

- Decorate each row with its original index, then break ties on that index.
- A comparator returning 0 for ties does not guarantee stability in every runtime — make the tie-break explicit.

## Sources and practice

- [MIT 6.006 — Lecture 3: Sets and Sorting](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-3-sets-and-sorting/)
- [MIT 6.006 — Lecture 5: Linear Sorting](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-5-linear-sorting/)
- [USACO Guide — Introduction to Sorting](https://usaco.guide/bronze/intro-sorting)
- [Study Sorting](https://learn.significanthobbies.com/curriculum/concepts/sorting)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/stable-sort-by-key)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
