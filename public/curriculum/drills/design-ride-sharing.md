# Ride-sharing dispatch

> Design driver-rider matching: rider requests, dispatch finds the nearest available driver, ETA + price quoted, ride lifecycle. Address geo-indexing and surge.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-ride-sharing

Design driver-rider matching: rider requests, dispatch finds the nearest available driver, ETA + price quoted, ride lifecycle. Address geo-indexing and surge.

## The mechanism

Geo systems need a spatial index (geohash, S2, quadtree) to answer "nearest" queries quickly. Driver-location updates are write-heavy, so the storage has to handle that. Remember: nearest in distance is not always best in ETA — match on the metric that actually matters.

## Expected evidence

Geo index choice (geohash / S2 / quadtree) + the dispatch decision loop.

## Hints

- Nearest is rarely best — factor ETA, not just distance.
- Driver state updates are write-heavy; pick a store that handles that.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [H3 — hexagonal hierarchical spatial index (Uber)](https://h3geo.org/docs/)
- [S2 Cells — cell hierarchy (S2Geometry)](https://s2geometry.io/devguide/s2cell_hierarchy)
- [Redis GEOADD — geohash-backed geo index](https://redis.io/docs/latest/commands/geoadd/)
- [Study Geo Systems](https://learn.significanthobbies.com/curriculum/concepts/location-transport)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-ride-sharing)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
