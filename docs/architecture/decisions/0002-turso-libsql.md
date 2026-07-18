# ADR 0002: Turso (libSQL) for the database

Date: 2026-03
Status: Accepted

## Context

The product previously used Supabase PostgreSQL (see
[`../../archive/migration-supabase-to-turso.md`](../../archive/migration-supabase-to-turso.md)).
The data model is per-user rows keyed by `user_id` + `problem_id`/`concept_id`
with no complex joins or cross-user aggregations. The serverless backend
needed a DB that works cleanly with Cloudflare Pages Functions and the
`nodejs_compat` flag.

## Decision

Use Turso (libSQL/SQLite) via `@libsql/client`. Schema is auto-initialized on
first cold start with `CREATE TABLE IF NOT EXISTS` — no migration runner.

## Alternatives considered

- **Supabase Postgres.** Prior path. Rejected to drop a second vendor and
  because the data model does not need Postgres features.
- **Cloudflare D1.** Viable, but Turso was chosen for fleet consistency and
  the libSQL client's ergonomics with the existing handler code.

## Consequences

- Schema changes must be **additive only** and backwards-compatible across
  deploys (no migration runner). Source of truth: `shared/db/schema.mjs`,
  mirrored by hand in `functions/api/[[path]].js`.
- Parameterized SQL throughout (no string interpolation) — verified in the
  2026-03-29 security audit.
- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are required runtime secrets.
