# Runbook: Rotate JWT_SECRET

The 2026-03-29 security audit (see
[`security-audit-2026-03-29.md`](https://github.com/Significant-Hobbies/swe-interview-prep/blob/main/docs/archive/security-audit-2026-03-29.md))
removed the hardcoded `dev-secret-change-in-production` fallback. Commit
`26c3eb4` exposed the old fallback in git history, so rotating the production
secret is a known low-severity follow-up. Rotation is also good hygiene
after any suspected token leak.

## Impact

Rotating `JWT_SECRET` invalidates **every existing `dsa_prep_auth` cookie**
immediately. All signed-in users get logged out on their next request and
must re-authenticate with Google One Tap. No data is lost — `users` rows and
all per-user state persist; only the cookie is invalidated.

## Steps

1. Generate a new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Set it as a Cloudflare Pages runtime secret. Either:
   - Cloudflare dashboard → Pages → `swe-interview-prep` → Settings → Environment variables → `JWT_SECRET` (replace), or
   - ```bash
     pnpm sync:pages-secrets   # pushes .env.local runtime vars to Pages
     ```
     after putting the new value in `.env.local` (do not commit).
3. Redeploy so the new secret is picked up by cold starts:
   ```bash
   pnpm deploy
   ```
   (or run the `deploy.yml` GitHub Action manually via `workflow_dispatch`).
4. Smoke: open the site in a fresh browser → Google One Tap → sign in →
   confirm `/api/learning` returns 200 (not 401).

## Rollback

If sign-in breaks after rotation, the most likely cause is a typo or a
mismatch between the secret Cloudflare has and what the function reads.
Re-set `JWT_SECRET` to the previous value and redeploy. There is no
in-app rollback — the cookie is stateless and signed only with the current
secret.
