# Generate all subsets

> Return all subsets of [1,2]. Use backtracking with include/exclude choice per index.

Canonical: https://learn.significanthobbies.com/curriculum/drills/subsets-backtracking

Return all subsets of [1,2]. Use backtracking with include/exclude choice per index.

## The mechanism

Backtracking is "try a choice, recurse, undo if it does not work, try the next one." It explores all possibilities, but you cut whole branches by stopping early when you can prove they will never reach a valid answer.

## Expected evidence

[[],[1],[2],[1,2]] (order may vary).

## Hints

- Push current path at each leaf.
- Undo (pop) after exploring.

## Sources and practice

- [Backtracking (Wikipedia)](https://en.wikipedia.org/wiki/Backtracking)
- [Study Backtracking](https://learn.significanthobbies.com/curriculum/concepts/backtracking)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/subsets-backtracking)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
