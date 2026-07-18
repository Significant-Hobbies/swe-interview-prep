# ADR 0003: Google One Tap + JWT cookie (no OAuth redirect)

Date: 2026-03
Status: Accepted

## Context

The prior auth flow was Supabase OAuth with a Google redirect. For a
single-user-ish personal product, the redirect dance was heavy and added a
full-page reload. The 2026-03-29 security audit (see
[`security-audit-2026-03-29.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/archive/security-audit-2026-03-29.md))
also flagged a hardcoded `JWT_SECRET` fallback that had to go.

## Decision

Use Google One Tap on the client. The credential is POSTed to
`/api/auth/google`, which verifies it with Google, upserts a `users` row,
and sets an httpOnly JWT cookie (`dsa_prep_auth`, 30-day max-age) signed with
`JWT_SECRET`. No OAuth redirect flow.

## Alternatives considered

- **Supabase OAuth redirect.** Prior path; rejected for UX weight.
- **Session table in DB.** Rejected: a signed httpOnly cookie is simpler and
  stateless; revocation is not needed for a personal product.

## Consequences

- `JWT_SECRET` must be set in production — there is **no fallback**. The
  audit removed the `dev-secret-change-in-production` fallback. Rotation is
  a known low-severity follow-up (commit `26c3eb4` exposed the old secret in
  git history) — see
  [`../../operations/runbooks/rotate-jwt-secret.md`](../../operations/runbooks/rotate-jwt-secret.md).
- Google API key is sent via the `x-goog-api-key` header, not a URL param
  (audit fix — URL params leak into logs/history/CDN caches).
- Auth error responses are generic; they no longer leak `hasClientId` /
  `clientIdLength`.
