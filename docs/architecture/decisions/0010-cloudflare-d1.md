# ADR 0010: Cloudflare D1 for relational persistence

Date: 2026-08
Status: Accepted
Supersedes: [ADR 0002](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/architecture/decisions/0002-turso-libsql.md)

## Context

The application and API already run on Cloudflare Pages, while relational
state lived in Turso. That split required a second provider, two database
secrets, a runtime client package, and duplicated request-time schema setup.
The existing handlers depend on a small `execute({ sql, args })` result shape,
not on libSQL-specific SQL features.

## Decision

Use one project-owned Cloudflare D1 database bound to Pages Functions as `DB`.
Keep the handler API stable through `shared/db/d1-client.mjs`, which adapts D1
prepared statements to `{ rows, rowsAffected }`. Apply ordered SQL migrations
from `migrations/d1/`; request handlers do not initialize or alter schema.

Local Pages development uses an isolated local D1 binding. Remote migrations,
data import, binding changes, and deployment remain explicit operator actions.

## Alternatives considered

- Keep Turso: least code change, but retains cross-provider credentials and
  operational drift.
- Rewrite every handler directly to the D1 API: removes the adapter but creates
  a broad, behavior-risking change across auth and learning state.
- Dual-write during migration: adds partial-failure and reconciliation paths to
  every mutation for a small single-owner database.

## Consequences

- `@libsql/client`, `TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN` are no longer
  application requirements after cutover.
- D1 migrations become the schema source of truth.
- The final production snapshot must be imported and verified during a bounded
  write freeze before the Pages binding is switched.
- The Turso database remains unchanged and rollback-held until separately
  approved for retirement.
