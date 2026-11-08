# B-tree page split

> Page holds 4 keys, insert 5th triggers split. After split how many keys in each page (order 5)?

Canonical: https://learn.significanthobbies.com/curriculum/drills/b-tree-split

Page holds 4 keys, insert 5th triggers split. After split how many keys in each page (order 5)?

## The mechanism

A B-tree is a wide, shallow tree sized to disk pages: each node holds many keys so the tree stays ~3-4 levels deep even for billions of rows. Reads are fast and in-place; writes do random page updates.

## Expected evidence

2 keys in left, 2 in right, median promoted.

## Hints

- Split keeps tree balanced.
- Fanout controls height.

## Sources and practice

- [CMU 15-445 — Tree indexes](https://15445.courses.cs.cmu.edu/fall2023/notes/08-trees.pdf)
- [Study B-Tree](https://learn.significanthobbies.com/curriculum/concepts/b-tree)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/b-tree-split)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
