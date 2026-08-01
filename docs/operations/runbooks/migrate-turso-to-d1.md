# Turso to D1 cutover

This is the one-time production procedure for issue #39. Do not run the remote
steps until the migration receipt is approved. Turso retirement and secret
deletion are separate actions.

## Local rehearsal

```bash
pnpm db:migrate:local
pnpm exec wrangler d1 execute DB --local --config wrangler.local.toml \
  --file scripts/fixtures/d1-rehearsal.sql
pnpm exec wrangler d1 execute DB --local --config wrangler.local.toml \
  --command "PRAGMA foreign_key_check;"
pnpm test -- shared/db/d1-client.test.mjs shared/db/d1-import.test.mjs \
  shared/api/pages-ai-chat.test.mjs shared/api/parity.test.mjs
```

The rehearsal must show 19 application tables, five explicit indexes, one row
in each synthetic auth/progress/mastery/notes/projects/activity check, and no
foreign-key violations.

## Approved remote preparation

1. Create one production and one preview D1 database.
2. Add both database UUIDs to the `DB` binding in `wrangler.toml`.
3. Run `pnpm validate:d1:deploy`.
4. Apply `migrations/d1/` to production and preview through Wrangler.
5. Verify the remote schema catalog before importing any application rows.

## Snapshot and import

During the declared write freeze, export the Turso database to an ignored,
owner-only path under `.migration-private/`. Convert it to data-only D1 SQL:

```bash
pnpm db:prepare-import .migration-private/turso.sql .migration-private/d1.sql
```

The converter accepts only inserts into the 19 tracked application tables,
drops source DDL and outer transaction statements, and creates its output with
owner-only permissions. Import that file with an explicit Wrangler `--remote`
command. Do not place exports or row data in git, logs, issues, or receipts.

## Acceptance and rollback

Before traffic moves, compare every table row count, all five explicit indexes,
`PRAGMA foreign_key_check`, and aggregate signatures for `users`,
`user_progress`, `concept_mastery`, `user_learning_notes`, `user_projects`, and
`activity_log`. Then verify anonymous auth rejection and authenticated
progress/FSRS/note/project/activity read-write journeys.

If any check fails, do not deploy: production remains on Turso. After a D1
deployment, rollback uses the previous Cloudflare Pages deployment, whose
function still connects to the unchanged Turso database. Keep Turso and its
runtime secrets intact throughout the observation window.
