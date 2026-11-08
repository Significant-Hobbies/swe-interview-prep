# Search in a rotated sorted array

> A sorted array was rotated at an unknown pivot. Find a target's index in O(log n).

Canonical: https://learn.significanthobbies.com/curriculum/drills/search-rotated-array

A sorted array was rotated at an unknown pivot. Find a target's index in O(log n).

## The mechanism

Binary search is not about sorted arrays — it is about a monotonic predicate. If you can phrase the answer as "the smallest x for which condition(x) is true", you can binary-search the answer space, halving it each step.

## Expected evidence

search([4,5,6,7,0,1,2], 0) -> 4

## Hints

- At each step one half is still sorted — identify which.
- Decide whether the target lies in the sorted half, then recurse there.

## Sources and practice

- [Binary search algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_algorithm)
- [Study Binary Search](https://learn.significanthobbies.com/curriculum/concepts/binary-search)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/search-rotated-array)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
