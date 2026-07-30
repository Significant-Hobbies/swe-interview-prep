# Union-Find

Disjoint set, path compression.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Union-Find tracks which items are in the same group with two operations: union(a, b) merges two groups, find(a) returns the group id. With path compression and union by rank, both run in essentially constant time. Use it whenever the question is "are these two in the same group?"



## Primary sources

- [VisuAlgo — Union-Find Disjoint Sets](https://visualgo.net/en/ufds) (doc)

## Practice

### Union-find component count

n=5, edges [[0,1],[1,2],[3,4]]. How many connected components after unions?

**Expected evidence:** 2 components.

## Review prompts

- What do path compression and union by rank each contribute, and why is one alone not enough?


## Prerequisites

- [Graphs](https://learn.significanthobbies.com/curriculum/concepts/graphs.html)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
