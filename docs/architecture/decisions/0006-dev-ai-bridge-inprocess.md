# ADR 0006: In-process Vite dev AI bridge (replace local-ai submodule)

Date: 2026-06
Status: Accepted

## Context

Local dev previously relied on a separate `local-ai` git submodule that ran
its own server process and proxied `/api/chat` to the claude/codex/gemini
CLIs. The submodule added a second process to start, a proxy hop, and a
submodule ref to keep in sync. It also stubbed chats/progress/notes/auth.

## Decision

Replace the submodule with `vite-plugin-local-ai.js` — a dev-only Vite plugin
(`apply: 'serve'`) that mounts `/api/chat` (streams the logged-in
`claude`/`codex`/`gemini` CLIs over SSE) plus in-memory dev stubs for
`/api/chats`, `/api/progress`, `/api/notes`, and `/api/auth/*`. It boots and
dies with Vite. `codex` runs read-only/ephemeral on `codex login` — no API
keys for local iteration.

## Alternatives considered

- **Keep the `local-ai` submodule.** Rejected: too much operational overhead
  for a dev-only path.
- **Require real provider API keys in dev.** Rejected: the CLI bridge keeps
  local iteration free and keyless.

## Consequences

- `pnpm dev` is the only command needed for full local stack — no separate
  server, no proxy hop.
- The plugin ships **nothing to prod**: prod uses `functions/api/[[path]].js`.
  The plugin's `apply: 'serve'` guarantees it never runs during `vite build`.
- Pick a local provider in Settings → AI (dev only).
