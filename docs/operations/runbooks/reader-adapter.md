# Runbook: Activate the private Reader adapter

The Reader adapter loads saved Reader articles at request time through the
authenticated server proxy (`/api/learning/reader`). Article bodies and
Reader credentials are never emitted into the static catalog or client
bundle. See
[`../../architecture/decisions/0007-unified-learning-sources-registry.md`](../../architecture/decisions/0007-unified-learning-sources-registry.md).

## Status

**Not yet activated.** Configuring `READER_API_TOKEN` is a planned item in
[`../../../STATUS.md`](../../../STATUS.md). Until then, the Reader source surfaces
as stale/empty and the last-good items are retained.

## Steps to activate

1. Obtain a Reader API token (Bearer-authenticated). Keep it secret.
2. Put it in `.env.local` as `READER_API_TOKEN` (gitignored). Do not commit.
3. Push it to Cloudflare Pages runtime secrets:
   ```bash
   pnpm sync:pages-secrets
   ```
   (or set `READER_API_TOKEN` in the Cloudflare dashboard).
4. Redeploy:
   ```bash
   pnpm deploy
   ```
5. Smoke as the owner: open `/sources`, pick the Reader source, confirm items
   load. Then run `/session/:date/:sessionId` against it.

## Failure mode

The adapter is Bearer-authenticated and versioned. On 401, upstream schema
failure, or network error, it retains only the last-good Reader items and
marks them `stale` — it never invents fresh content. If you see stale items
indefinitely, verify the token is valid and not expired, then redeploy.
