# New things to learn — swe-interview-prep

Novel tech used in this project, ordered from most unfamiliar to most familiar.

---

## FSRS Algorithm (Free Spaced Repetition Scheduler)
- What: Bayesian SRS model that tracks per-card `stability` and `difficulty` to predict optimal review timing.
- Why here: TBD
- Gotcha (from code): `confidence = Math.min(1, card.stability / 30)` (`src/lib/fsrs.ts:46`) is a display proxy — it saturates at stability ≥ 30, while raw retrievability keeps decaying. The two diverge sharply for high-stability cards that haven't been reviewed recently.
- Source: https://github.com/open-spaced-repetition/ts-fsrs (v5.3.2, `package.json:53`)

## FSRS Retrievability Decay
- What: The formula `R = (1 + elapsed / (9 * S))^-1` describes how memory fades between reviews — codebase implements this in `decayConfidence()` (`src/lib/fsrs.ts:74-76`).
- Why here: TBD
- Gotcha (from code): ts-fsrs 5.3.2 ships FSRS v5+ which uses a trainable decay exponent (`R = (1 + factor·t/S)^-w₂₀`), not the fixed `-1` exponent. The project's `decayConfidence` still uses the v4 approximation — accurate enough for display, but not bitwise-identical to what the scheduler itself computes.
- Source: https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm

## Go WASM in the Browser (yaegi interpreter)
- What: A pre-compiled Go interpreter shipped as `.wasm`, run inside a Web Worker via `wasm_exec.js` glue + `WebAssembly.instantiateStreaming`.
- Why here: TBD
- Gotcha (from code): `executeGo()` (`src/lib/goExecutor.ts:273-283`) calls `executeViaAPI()` on first run; `startWASMLoading()` fires in background fetching from the R2 URL (`src/lib/goExecutor.ts:31`). Once `wasmReady` flips, subsequent runs never hit the API. Module lives at `pub-e88ae7f7cd154093afe81219f42c6597.r2.dev/wasm/go-interp.wasm`.
- Source: https://go.dev/doc/webassembly

## WebAssembly.Memory patching for safety
- What: Monkey-patching `WebAssembly.Memory.prototype.grow` inside a Worker to hard-cap allocations before the Go runtime sees them.
- Why here: TBD
- Gotcha (from code): `installMemoryCap()` (`src/lib/goWasmWorker.ts:54-73`) wraps `WebAssembly.Memory.prototype.grow` with a 4096-page (256 MiB) ceiling. It's idempotent via `proto.__capped` guard and runs before `WebAssembly.instantiateStreaming` (`src/lib/goWasmWorker.ts:80,92`) so the Go runtime's own memory is covered. Overflow throws a `RangeError`, not a tab kill.
- Source: https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory/grow

## Monaco Editor Embedding (@monaco-editor/react)
- What: VS Code's editor as a React component, with LSP-like IntelliSense, themes, and keybinding APIs.
- Why here: TBD
- Gotcha (from code): `handleFormat()` (`src/components/CodeEditor.tsx:49-65`) branches on `language === 'go'`: Go uses `editor.action.formatDocument` (Monaco built-in), while JS/TS use Prettier (babel + estree + typescript plugins). Prettier has no Go plugin, so there is no unified format path.
- Source: https://github.com/microsoft/monaco-editor

## Excalidraw Embedding
- What: Infinite-canvas whiteboard component loaded lazily via `React.lazy` to avoid blocking the main bundle.
- Why here: TBD
- Gotcha (from code): `saveDiagram()` (`src/components/DiagramEditor.tsx:21-25`) persists only `{ zoom, scrollX, scrollY }` from `appState` — deliberately shallow. Restoring full `appState` breaks because it carries ephemeral UI flags (active tool, cursor state, etc.) that conflict with Excalidraw's internal init.
- Source: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/excalidraw-component

## Vercel AI SDK — multi-provider streaming (`streamText`)
- What: Unified SDK wrapping OpenAI, Anthropic, Google, and any OpenAI-compatible endpoint behind one `streamText` call.
- Why here: TBD
- Gotcha (from code): the local dev path (`api/ai/chat.ts:21-34`) uses `createOpenAICompatible` + `streamText` from `@ai-sdk/openai-compatible`. The edge path (`functions/api/[[path]].js:567-584`) bypasses the AI SDK entirely and does a raw `fetch` to the BYOK endpoint — the AI SDK's Node.js modules are not available in the CF Worker runtime. Two different streaming paths for the same feature.
- Source: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text

## Feynman Gate grading pattern
- What: User writes a plain-English explanation of their code; AI grades 0-100 and returns gap concepts mapped to FSRS `again`/`hard` ratings.
- Why here: TBD
- Source: https://fs.blog/feynman-learning-technique/

## Socratic AI (never-answer constraint)
- What: System-prompt engineering that forbids the AI from writing solutions — it may only ask questions and probe understanding.
- Why here: TBD
- Source: https://en.wikipedia.org/wiki/Socratic_method

## Cloudflare Pages Functions (catch-all route)
- What: A single `functions/api/[[path]].js` file handles every `/api/*` request at the edge, replacing traditional serverless functions.
- Why here: TBD
- Gotcha (from code): line 1 of `functions/api/[[path]].js` imports `@libsql/client/web` (fetch-based HTTP client) rather than `@libsql/client` (Node.js TCP client). The CF Worker runtime has no Node.js TCP stack — using the default import silently fails at runtime, not at build time.
- Source: https://developers.cloudflare.com/pages/functions/

## Turso (libSQL) client
- What: SQLite-compatible DB with a cloud primary and optional edge replicas, accessed via HTTP in edge runtimes.
- Why here: TBD
- Gotcha (from code): the DB client is lazily initialized once per CF Function invocation via a module-level `let db` singleton (`functions/api/[[path]].js:8-21`). A cold start re-creates the client because CF Workers don't share process state across requests from different isolates.
- Source: https://docs.turso.tech/sdk/ts/reference

## React 19 lazy + Suspense for route-level code splitting
- What: Every route component is loaded via `React.lazy` with `<Suspense>` boundaries in `App.tsx`, deferring bundle parsing until the route is first visited.
- Why here: TBD
- Gotcha (from code): it's not just the six primary tabs — 25 page components are lazy-loaded (`src/App.tsx`, the `const … = lazy(…)` block), including detail pages (ConceptDetail, RoadmapDetail, ProjectDetail, BuildLab) and static pages. Two separate `<Suspense>` boundaries wrap the nav shell and the route outlet (`src/App.tsx:207,225`).
- Source: https://react.dev/reference/react/lazy
