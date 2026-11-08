# Total weight of a minimum spanning tree

> Implement mstWeight(n, edges) where edges are [u, v, w] on nodes 0..n-1. Return the total weight of a minimum spanning tree, or -1 if the graph is not connected. Use Kruskal with union-find.

Canonical: https://learn.significanthobbies.com/curriculum/drills/kruskal-mst-weight

Implement mstWeight(n, edges) where edges are [u, v, w] on nodes 0..n-1. Return the total weight of a minimum spanning tree, or -1 if the graph is not connected. Use Kruskal with union-find.

## The mechanism

Both algorithms are the same greedy argument from different ends: the cut property says the lightest edge crossing any cut is safe, so Kruskal takes globally cheapest edges and uses union-find to reject cycles, while Prim grows one component and takes the cheapest edge leaving it. An MST minimises TOTAL weight, which is not the same as minimising any individual path — the MST route between two nodes can be far worse than their shortest path.

## Expected evidence

mstWeight(4, [[0,1,1],[1,2,2],[0,2,4],[2,3,3]]) -> 6

## Hints

- Sort edges by weight, then add an edge only when its endpoints are in different components.
- A spanning tree on n nodes has exactly n-1 edges — if you finish with fewer, the graph was disconnected.

## Sources and practice


- [Study Minimum Spanning Tree](https://learn.significanthobbies.com/curriculum/concepts/minimum-spanning-tree)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/kruskal-mst-weight)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
