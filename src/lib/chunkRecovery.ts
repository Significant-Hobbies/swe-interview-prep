/**
 * Recovery from an HTML document that outlived the chunks it names.
 *
 * `index.html` hardcodes content-hashed asset filenames. Any cached copy that
 * survives a deploy — a browser cache, a CDN edge, a restored tab — asks for
 * chunk names the current deployment does not have. Cloudflare Pages answers
 * each miss with the SPA fallback HTML, so the dynamic import fails a MIME
 * check and the route never mounts.
 *
 * `public/_headers` stops NEW copies going stale, but it cannot reach the ones
 * already stored, and edge entries age independently per PoP. So the app also
 * has to be able to dig itself out: a reload re-fetches the document, gets the
 * current asset names, and the route loads.
 */

const RELOAD_KEY = 'stale-chunk-reload-at';

/** Long enough that a genuine repeat is not a loop; short enough to retry. */
const RELOAD_COOLDOWN_MS = 30_000;

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /expected a javascript-or-wasm module script/i,
  /'text\/html' is not a valid javascript mime type/i,
];

export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Whether to reload, given the last attempt. Separated from the side effects so
 * the loop guard is testable — an unconditional reload on a chunk error turns a
 * permanently broken deploy into an infinite refresh.
 */
export function shouldReloadForStaleChunk(lastAttemptAt: number | null, now: number): boolean {
  if (lastAttemptAt === null) return true;
  return now - lastAttemptAt > RELOAD_COOLDOWN_MS;
}

function readLastAttempt(): number | null {
  try {
    const raw = sessionStorage.getItem(RELOAD_KEY);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Reload once for a stale-document error. Returns true when a reload was
 * started, so the caller can skip rendering an error screen that is about to
 * be thrown away.
 */
export function recoverFromStaleChunk(error: unknown): boolean {
  if (!isStaleChunkError(error)) return false;
  const now = Date.now();
  if (!shouldReloadForStaleChunk(readLastAttempt(), now)) return false;
  try {
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // Private mode with no storage: one reload is still better than a dead
    // page, and the browser's own cache revalidation stops a tight loop.
  }
  window.location.reload();
  return true;
}
