# Dijkstra shortest path

> Weighted graph: 0—1—2 with weights 1 and 4, and 0—2 weight 10. Shortest 0→2?

Canonical: https://learn.significanthobbies.com/curriculum/drills/dijkstra-shortest-path

Weighted graph: 0—1—2 with weights 1 and 4, and 0—2 weight 10. Shortest 0→2?

## The mechanism

Pick the algorithm by the graph: BFS for unweighted, Dijkstra when weights are non-negative, Bellman-Ford if weights can be negative, A* when you have a heuristic estimating distance to the goal. Using the wrong one gives wrong answers or wasted time.

## Expected evidence

Cost 5 via node 1.

## Hints

- Min-heap on tentative distance.
- Skip stale heap entries.

## Sources and practice

- [VisuAlgo — Single-Source Shortest Paths](https://visualgo.net/en/sssp)
- [Study Shortest Path](https://learn.significanthobbies.com/curriculum/concepts/shortest-path)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/dijkstra-shortest-path)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
