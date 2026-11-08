# Binary tree level-order traversal

> Return the values of a binary tree grouped by level, top to bottom.

Canonical: https://learn.significanthobbies.com/curriculum/drills/level-order-traversal

Return the values of a binary tree grouped by level, top to bottom.

## The mechanism

A tree is recursion made concrete: almost every tree problem is "solve it for the children, then combine". DFS (pre/in/post-order) is a recursion or an explicit stack; BFS is a queue, level by level. Pick the traversal that matches what you need to combine.

## Expected evidence

levelOrder of [3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]]

## Hints

- Levels mean BFS — use a queue.
- Process the queue one level at a time by capturing its size before the loop.

## Sources and practice

- [VisuAlgo — Binary Search Tree](https://visualgo.net/en/bst)
- [Study Trees](https://learn.significanthobbies.com/curriculum/concepts/trees)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/level-order-traversal)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
