# Design cursor pagination

> List endpoint returns 10M rows. Why offset pagination fails? Sketch cursor on (created_at, id).

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-paginated-api

List endpoint returns 10M rows. Why offset pagination fails? Sketch cursor on (created_at, id).

## The mechanism

An API is a contract you cannot easily change. Design for evolution: version it, paginate every list, make errors machine-readable, and keep resources consistent.

## Expected evidence

Offset scans skip rows; cursor is stable under inserts.

## Hints

- Opaque cursor encodes position.
- Consistent sort key required.

## Sources and practice

- [API design guide (Google Cloud)](https://cloud.google.com/apis/design)
- [Study API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-paginated-api)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
