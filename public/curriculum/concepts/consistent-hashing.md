# Consistent Hashing

Ring, virtual nodes, rebalancing.

- Difficulty: advanced
- Tracks: System Design

## Mental model

Consistent hashing maps both servers and keys onto a ring so that when you add or remove a server, only about 1/N of the keys move (instead of nearly all of them). Use "virtual nodes" — multiple ring positions per server — to spread load evenly.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Consistent Hashing and Random Trees (Karger et al., STOC 1997)](https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf) (paper)
- [Consistent Hashing with Bounded Loads (Google Research)](https://research.google/blog/consistent-hashing-with-bounded-loads/) (article)
- [Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) (paper)

## Practice

### Consistent-hash key router

Design a key router for a sharded cache using consistent hashing with virtual nodes. Show how add/remove of a node redistributes keys.

**Expected evidence:** Ring diagram + the algorithm for routing a key + the % of keys that move when N→N+1 nodes.

## Review prompts

- The ring already limits key movement to about 1/N. So why are virtual nodes needed?


## Prerequisites

- [Load Balancing](https://learn.significanthobbies.com/curriculum/concepts/load-balancing.html)

## Related concepts

- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html)

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
- [Disk-First Databases & RAM](https://learn.significanthobbies.com/curriculum/roadmaps/db-disk-first.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html)
