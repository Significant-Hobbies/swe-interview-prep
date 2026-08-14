# Graphs

BFS/DFS, topo sort, union-find.

- Difficulty: advanced
- Tracks: DSA & Implementation

## Mental model

Most graph problems are one of a few templates: reachability/components (DFS/BFS), shortest path (BFS for unweighted, Dijkstra for weighted), ordering (topological sort), or connectivity (union-find). The skill is recognizing the template and modeling the input as nodes and edges.


## Common mistakes

- No visited set — revisiting nodes and looping forever
- Using DFS for shortest path on an unweighted graph instead of BFS
- Not handling disconnected components

## Primary sources

- [VisuAlgo — Graph Traversal](https://visualgo.net/en/dfsbfs) (doc)

## Practice

### Number of islands

Given a grid of '1' (land) and '0' (water), count the connected land masses (4-directionally).

**Expected evidence:** A single integer — the island count.

### Number of Islands

LeetCode #200 — Number of Islands. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/number-of-islands/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Course Schedule

LeetCode #207 — Course Schedule. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/course-schedule/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- In BFS, do you mark a node visited when you enqueue it or when you dequeue it — and why does it matter?


## Prerequisites

- [Trees](https://learn.significanthobbies.com/curriculum/concepts/trees)

## Related concepts

- [Shortest Path](https://learn.significanthobbies.com/curriculum/concepts/shortest-path)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice)
