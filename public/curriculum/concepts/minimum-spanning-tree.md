# Minimum Spanning Tree

Kruskal and Prim — connecting every node at least total cost.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

Both algorithms are the same greedy argument from different ends: the cut property says the lightest edge crossing any cut is safe, so Kruskal takes globally cheapest edges and uses union-find to reject cycles, while Prim grows one component and takes the cheapest edge leaving it. An MST minimises TOTAL weight, which is not the same as minimising any individual path — the MST route between two nodes can be far worse than their shortest path.

## Where it matters

Network and cable layout, clustering by single linkage, and approximation algorithms for touring problems.

## Common mistakes

- Expecting MST paths to be shortest paths — different objective entirely
- Running Kruskal without union-find, so cycle checks dominate the runtime
- Assuming the MST is unique; it is only unique when all edge weights differ
- Applying it to a directed graph, where the problem becomes arborescence and needs a different algorithm

## Primary sources

- Use the linked roadmap context and practice prompt.

## Practice

### Total weight of a minimum spanning tree

Implement mstWeight(n, edges) where edges are [u, v, w] on nodes 0..n-1. Return the total weight of a minimum spanning tree, or -1 if the graph is not connected. Use Kruskal with union-find.

**Expected evidence:** mstWeight(4, [[0,1,1],[1,2,2],[0,2,4],[2,3,3]]) -> 6

## Review prompts

- Someone proposes routing traffic along the MST because it is the cheapest set of edges. What is wrong with that reasoning?


## Prerequisites

- [Union-Find](https://learn.significanthobbies.com/curriculum/concepts/union-find.html)

## Related concepts

- [Shortest Path](https://learn.significanthobbies.com/curriculum/concepts/shortest-path.html)
- [Greedy](https://learn.significanthobbies.com/curriculum/concepts/greedy.html)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
