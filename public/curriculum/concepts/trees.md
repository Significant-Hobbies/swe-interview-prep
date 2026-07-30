# Trees

Binary trees, BSTs, DFS/BFS.

- Difficulty: core
- Tracks: DSA & Implementation

## Mental model

A tree is recursion made concrete: almost every tree problem is "solve it for the children, then combine". DFS (pre/in/post-order) is a recursion or an explicit stack; BFS is a queue, level by level. Pick the traversal that matches what you need to combine.


## Common mistakes

- Forgetting the null/empty base case
- Using DFS when the problem is about levels or shortest depth (use BFS)
- Returning the wrong thing from recursion — separate "answer" from "info passed up"

## Primary sources

- [VisuAlgo — Binary Search Tree](https://visualgo.net/en/bst) (doc)

## Practice

### Binary tree level-order traversal

Return the values of a binary tree grouped by level, top to bottom.

**Expected evidence:** levelOrder of [3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]]

### Invert Binary Tree

LeetCode #226 — Invert Binary Tree. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/invert-binary-tree/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Maximum Depth of Binary Tree

LeetCode #104 — Maximum Depth of Binary Tree. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/maximum-depth-of-binary-tree/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Lowest Common Ancestor of a Binary Search Tree

LeetCode #235 — Lowest Common Ancestor of a Binary Search Tree. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Serialize and Deserialize Binary Tree

LeetCode #297 — Serialize and Deserialize Binary Tree. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/serialize-and-deserialize-binary-tree/

**Expected evidence:** Pass all LeetCode test cases for this problem.

### Subtree of Another Tree

LeetCode #572 — Subtree of Another Tree. Solve on LeetCode, then implement here if you want it in your drill queue. https://leetcode.com/problems/subtree-of-another-tree/

**Expected evidence:** Pass all LeetCode test cases for this problem.

## Review prompts

- In a recursive tree solution, why separate "the answer" from "the value returned to the parent"?


## Prerequisites

- [Linked List](https://learn.significanthobbies.com/curriculum/concepts/linked-list.html)

## Related concepts

- [Graphs](https://learn.significanthobbies.com/curriculum/concepts/graphs.html)

## Learning paths

- [DSA Practice](https://learn.significanthobbies.com/curriculum/roadmaps/dsa-practice.html)
