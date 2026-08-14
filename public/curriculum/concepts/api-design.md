# API Design

REST, gRPC, versioning, pagination.

- Difficulty: core
- Tracks: Backend

## Mental model

An API is a contract you cannot easily change. Design for evolution: version it, paginate every list, make errors machine-readable, and keep resources consistent.

## Where it matters

Every backend; the Codevetter and HighSignal public surfaces.

## Common mistakes

- Unpaginated list endpoints that fall over at scale
- Breaking changes without a version bump
- Inconsistent error shapes across endpoints

## Primary sources

- [API design guide (Google Cloud)](https://cloud.google.com/apis/design) (doc)

## Practice

### Design cursor pagination

List endpoint returns 10M rows. Why offset pagination fails? Sketch cursor on (created_at, id).

**Expected evidence:** Offset scans skip rows; cursor is stable under inserts.

## Review prompts

- Why should every list endpoint be paginated from day one?

## Build evidence

- **Synthesize: Application Engineering** — Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle)

## Related concepts

- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems)
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape)
