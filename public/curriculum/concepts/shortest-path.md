# Shortest Path

Dijkstra, Bellman-Ford, A*.

- Difficulty: advanced
- Tracks: DSA & Implementation

## Mental model

Pick the algorithm by the graph: BFS for unweighted, Dijkstra when weights are non-negative, Bellman-Ford if weights can be negative, A* when you have a heuristic estimating distance to the goal. Using the wrong one gives wrong answers or wasted time.



## Primary sources

- [VisuAlgo — Single-Source Shortest Paths](https://visualgo.net/en/sssp) (doc)

## Practice

### Dijkstra shortest path

Weighted graph: 0—1—2 with weights 1 and 4, and 0—2 weight 10. Shortest 0→2?

**Expected evidence:** Cost 5 via node 1.

## Review prompts

- Why does Dijkstra give wrong answers on negative edges when Bellman-Ford does not?


## Prerequisites

- [Graphs](https://learn.significanthobbies.com/curriculum/concepts/graphs.html)
- [Heap / Priority Queue](https://learn.significanthobbies.com/curriculum/concepts/heap.html)

## Related concepts

- None assigned.

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
