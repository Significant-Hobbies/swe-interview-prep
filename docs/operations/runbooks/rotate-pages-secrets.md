# Runbook: Sync / rotate Cloudflare Pages secrets

`pnpm sync:pages-secrets` runs `scripts/sync-pages-secrets.mjs`, which pushes
the runtime variables from `.env.local` to Cloudflare Pages. Use it on first
setup or whenever a runtime secret rotates (`JWT_SECRET`, `TURSO_AUTH_TOKEN`,
`READER_API_TOKEN`, etc.).

## When to run

- First-time production setup.
- After rotating any runtime secret (see
  [`rotate-jwt-secret.md`](rotate-jwt-secret.md)).
- After enabling the Reader adapter (see
  [`reader-adapter.md`](reader-adapter.md)).

## Steps

1. Put the current runtime values in `.env.local` (gitignored). Never commit
   them.
2. ```bash
   pnpm sync:pages-secrets
   ```
3. Redeploy so cold starts pick up the new values:
   ```bash
   pnpm deploy
   ```
4. Smoke the affected surface (e.g. sign-in for `JWT_SECRET`, a Reader
   session for `READER_API_TOKEN`).

## Notes

- The script only writes the variables it knows about; it does not delete
  extras. To remove a stale secret, delete it in the Cloudflare dashboard.
- `pnpm validate:env:deploy` checks that the required runtime secret **names**
  are configured on Cloudflare before deploying — it never reads values.
