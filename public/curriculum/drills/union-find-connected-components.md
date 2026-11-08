# Union-find component count

> n=5, edges [[0,1],[1,2],[3,4]]. How many connected components after unions?

Canonical: https://learn.significanthobbies.com/curriculum/drills/union-find-connected-components

n=5, edges [[0,1],[1,2],[3,4]]. How many connected components after unions?

## The mechanism

Union-Find tracks which items are in the same group with two operations: union(a, b) merges two groups, find(a) returns the group id. With path compression and union by rank, both run in essentially constant time. Use it whenever the question is "are these two in the same group?"

## Expected evidence

2 components.

## Hints

- Union by rank/path compression.
- Count distinct roots.

## Sources and practice

- [VisuAlgo — Union-Find Disjoint Sets](https://visualgo.net/en/ufds)
- [Study Union-Find](https://learn.significanthobbies.com/curriculum/concepts/union-find)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/union-find-connected-components)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
