/**
 * Runtime capability flags for features whose backend is not deployed.
 *
 * Offering a control that always fails is worse than not offering it, so the
 * UI reads these instead of assuming every code path has a server behind it.
 */

/**
 * Go execution needs one of two backends, and neither currently exists:
 *
 *  - `POST /api/go-run` is implemented in `api/go-run.mjs` but that handler is
 *    not routed by `functions/api/[[path]].js` (production) nor by
 *    `vite-plugin-local-ai.js` (dev), so it 404s everywhere.
 *  - The WASM fallback in `src/lib/goExecutor.ts` fetches `wasm_exec.js` and
 *    `go-interp.wasm` from an R2 bucket that no longer serves them.
 *
 * Flip this to `true` in the same change that routes `/api/go-run` or
 * republishes the WASM assets — the executor, worker, and Monaco config are
 * all still wired up behind it.
 */
export const GO_RUNTIME_AVAILABLE = false;
