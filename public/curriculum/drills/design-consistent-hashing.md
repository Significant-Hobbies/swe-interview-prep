# Consistent-hash key router

> Design a key router for a sharded cache using consistent hashing with virtual nodes. Show how add/remove of a node redistributes keys.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-consistent-hashing

Design a key router for a sharded cache using consistent hashing with virtual nodes. Show how add/remove of a node redistributes keys.

## The mechanism

Consistent hashing maps both servers and keys onto a ring so that when you add or remove a server, only about 1/N of the keys move (instead of nearly all of them). Use "virtual nodes" — multiple ring positions per server — to spread load evenly.

## Expected evidence

Ring diagram + the algorithm for routing a key + the % of keys that move when N→N+1 nodes.

## Hints

- Without vnodes the distribution is lumpy.
- Hash the node id with k different seeds for vnodes.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Consistent Hashing and Random Trees (Karger et al., STOC 1997)](https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf)
- [Consistent Hashing with Bounded Loads (Google Research)](https://research.google/blog/consistent-hashing-with-bounded-loads/)
- [Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf)
- [Study Consistent Hashing](https://learn.significanthobbies.com/curriculum/concepts/consistent-hashing)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-consistent-hashing)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
