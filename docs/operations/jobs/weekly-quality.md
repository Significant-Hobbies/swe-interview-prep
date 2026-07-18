# Job: Weekly Quality Check (weekly.yml)

Source of truth: `.github/workflows/weekly.yml`. This page describes the
contract.

## Schedule

`cron: '0 9 * * 1'` — Mondays 09:00 UTC. Also `workflow_dispatch`.

## What it does

A "quality snapshot" — runs whatever quality scripts are defined in
`package.json`, in this order: `lint`, `typecheck`, `test`, `build`. Each is
skipped with a "No <script> script" message if absent. Uses a placeholder
`VITE_GOOGLE_CLIENT_ID` so the build can run without secrets.

Auto-detects the package manager (pnpm / npm / yarn) from the lockfile.

Permissions: `contents: read` only — this job never commits.

## When it breaks

- A failure here does **not** block deploys (deploy is a separate workflow).
  It surfaces drift early. Triage the failing step the same way you would a
  local `pnpm lint`/`test`/`build` failure.
- If the job is noisy for a known reason, do not disable it — fix the root
  cause or mark the personal-use closure in [`../../../STATUS.md`](../../../STATUS.md).
