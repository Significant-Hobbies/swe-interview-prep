# Number of islands

> Given a grid of '1' (land) and '0' (water), count the connected land masses (4-directionally).

Canonical: https://learn.significanthobbies.com/curriculum/drills/number-of-islands

Given a grid of '1' (land) and '0' (water), count the connected land masses (4-directionally).

## The mechanism

Most graph problems are one of a few templates: reachability/components (DFS/BFS), shortest path (BFS for unweighted, Dijkstra for weighted), ordering (topological sort), or connectivity (union-find). The skill is recognizing the template and modeling the input as nodes and edges.

## Expected evidence

A single integer — the island count.

## Hints

- Each unvisited '1' starts a new island; flood-fill it with DFS or BFS.
- Mark cells visited as you go to avoid recounting.

## Sources and practice

- [VisuAlgo — Graph Traversal](https://visualgo.net/en/dfsbfs)
- [Study Graphs](https://learn.significanthobbies.com/curriculum/concepts/graphs)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/number-of-islands)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
