# Geo Systems

Geohash, quadtree, dispatch.

- Difficulty: core
- Tracks: System Design

## Mental model

Geo systems need a spatial index (geohash, S2, quadtree) to answer "nearest" queries quickly. Driver-location updates are write-heavy, so the storage has to handle that. Remember: nearest in distance is not always best in ETA — match on the metric that actually matters.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [H3 — hexagonal hierarchical spatial index (Uber)](https://h3geo.org/docs/) (doc)
- [S2 Cells — cell hierarchy (S2Geometry)](https://s2geometry.io/devguide/s2cell_hierarchy) (doc)
- [Redis GEOADD — geohash-backed geo index](https://redis.io/docs/latest/commands/geoadd/) (doc)

## Practice

### Ride-sharing dispatch

Design driver-rider matching: rider requests, dispatch finds the nearest available driver, ETA + price quoted, ride lifecycle. Address geo-indexing and surge.

**Expected evidence:** Geo index choice (geohash / S2 / quadtree) + the dispatch decision loop.

## Review prompts

- Why can a geohash prefix search miss the true nearest neighbour?


## Prerequisites

- [Capacity Estimation](https://learn.significanthobbies.com/curriculum/concepts/capacity-estimation.html)
- [Requirements Scoping](https://learn.significanthobbies.com/curriculum/concepts/requirements-scoping.html)
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding.html)

## Related concepts

- None assigned.

## Learning paths

- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
