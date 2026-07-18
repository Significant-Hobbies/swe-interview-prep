# ADR 0001: Cloudflare Pages + Functions over Vercel

Date: 2026-03
Status: Accepted

## Context

The product started on a Vercel + Supabase stack (see
[`migration-supabase-to-turso.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/archive/migration-supabase-to-turso.md)).
As the SPA and its serverless backend grew, the operator wanted a single
hosting provider for both the static frontend and the API, with lower
operational overhead and no second vendor for edge functions. The fleet
standard had also consolidated on Cloudflare.

## Decision

Host the frontend as a Cloudflare Pages static site (`vite build → dist/`)
and the backend as Pages Functions in a single catch-all
(`functions/api/[[path]].js`). Deploy on push to `main` via GitHub Actions
using `wrangler pages deploy`.

## Alternatives considered

- **Vercel + serverless functions.** Prior path. Rejected to consolidate on
  one provider and align with the fleet. The old Vercel migration notes are
  explicitly stale — do not guide new work from them.
- **Workers + separate Pages site.** Rejected: Pages Functions share the
  same project and deploy as one unit, which is simpler than coordinating a
  Worker and a Pages site.

## Consequences

- One deploy command, one provider, one secrets store (Cloudflare Pages
  runtime secrets).
- The 38MB Go WASM binary is too large for Pages and is hosted on R2
  instead (see `.cfpagesignore`, `docs/operations/deploy.md`).
- End-to-end CI against live Turso + Cloudflare bindings is
  operator-dependent, not fully automated in repo (known gap, see
  `https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/STATUS.md`).
