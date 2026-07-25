# ADR 0009: Remove the Go runtime instead of keeping it behind a flag

Date: 2026-07
Status: Accepted

## Context

The playground once ran Go two ways: a first run proxied `POST /api/go-run`
to `https://go.dev/_/compile`, while a 38 MB Go interpreter compiled to WASM
loaded in the background from R2 and took over on subsequent runs.

Both backends had stopped existing:

- `api/go-run.mjs` was never routed. Neither
  `functions/api/[[path]].js` (production) nor `vite-plugin-local-ai.js`
  (dev) mapped `/api/go-run`, so it 404'd everywhere.
- The R2 assets were gone. `HEAD` on both
  `…r2.dev/wasm/wasm_exec.js` and `…r2.dev/wasm/go-interp.wasm` returns
  **404** (verified 2026-07-25).

`src/lib/capabilities.ts` papered over this with
`GO_RUNTIME_AVAILABLE = false`, which hid the Go button but kept roughly 400
lines of executor, Web Worker, Monaco branch and UI behind a constant that no
code path could ever flip.

## Decision

Delete the Go path outright: `src/lib/goExecutor.ts`,
`src/lib/goWasmWorker.ts`, `src/lib/capabilities.ts`, `api/go-run.mjs`, the
`'go'` member of the `Language` union, the Go starter template, the Monaco
format branch, the language buttons and the WASM/API backend badge.

Code execution is now JavaScript and TypeScript only, in-browser, via sucrase
plus a sandboxed `srcdoc` iframe.

## Alternatives considered

- **Keep `GO_RUNTIME_AVAILABLE`.** Rejected: a flag is only worth its upkeep
  when someone can flip it. Restoring Go needs a re-hosted 38 MB binary or a
  new compile proxy — at which point the executor gets rewritten anyway, and
  this ADR is the record of how it used to work.
- **Route `/api/go-run` through the Pages Function.** Rejected: it proxies
  arbitrary user code to a third party, and the 2026-03-29 security audit had
  already flagged the handler. Personal-use closure means no new backends.

## Consequences

- Old share links and `localStorage` entries can still carry `lang: 'go'`.
  `resolveLanguage()` in `src/pages/Playground.tsx` normalises any unrunnable
  language to `typescript` rather than trusting the stored value.
- No user-visible surface offers Go.
- `docs/learning/new-things.md` still describes the WASM executor. It is a
  dated learning journal, not a description of current behaviour.
