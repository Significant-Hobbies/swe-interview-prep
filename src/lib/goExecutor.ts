/**
 * Hybrid Go executor — starts with API, switches to local WASM once loaded.
 *
 * Flow:
 * 1. First Go run → API call to /api/go-run
 * 2. Background: start loading WASM interpreter (inside a Web Worker)
 * 3. Once WASM is ready → subsequent runs use the local WASM worker
 *
 * GUARDRAILS (why WASM runs in a Worker, not on the main thread):
 *   - Execution timeout — `executeViaWASM` races the worker against a
 *     WASM_EXEC_TIMEOUT_MS deadline. On timeout the worker is `terminate()`d,
 *     which kills even a tight `for {}` infinite loop instantly. The page
 *     stays responsive the whole time.
 *   - Memory cap — the worker patches `WebAssembly.Memory.grow` so a runaway
 *     allocation fails cleanly inside the VM (see goWasmWorker.ts).
 * A hang or OOM in user code therefore costs at most one worker, never the tab.
 */

import { getAuthToken } from '../contexts/AuthContext';

export type GoBackend = 'api' | 'wasm' | 'wasm-loading';

interface GoResult {
  output: string;
  errors: string | null;
  execTimeMs: number;
  errorLine: number | null;
  backend: GoBackend;
}

const WASM_BASE = 'https://pub-e88ae7f7cd154093afe81219f42c6597.r2.dev/wasm';
const WASM_EXEC_URL = `${WASM_BASE}/wasm_exec.js`;
const WASM_MODULE_URL = `${WASM_BASE}/go-interp.wasm`;

// Hard ceiling for a single WASM run. Interview snippets finish in well
// under a second; anything past this is treated as a hang.
const WASM_EXEC_TIMEOUT_MS = 5000;
// Allow the worker this long to fetch + instantiate the WASM module.
const WASM_LOAD_TIMEOUT_MS = 20_000;
// Cap how much stdout/stderr we keep from a single run. A tight
// `fmt.Println` loop can fire millions of times before the 5s timeout
// hits — rendering that much text into the DOM crashes the tab. 64 KiB
// is far more than any reasonable interview output.
const MAX_OUTPUT_CHARS = 64 * 1024;

function truncateOutput(text: string): string {
  if (!text || text.length <= MAX_OUTPUT_CHARS) return text;
  return `${text.slice(0, MAX_OUTPUT_CHARS)}\n…[output truncated]`;
}

let wasmReady = false;
let wasmLoading = false;
let wasmLoadPromise: Promise<boolean> | null = null;

let worker: Worker | null = null;
let workerLoadFailed = false;
let runId = 0;

function extractErrorLine(err: string): number | null {
  // Go compile errors: "prog.go:5:3:" or yaegi: "1:5:"
  const m = err.match(/(?:prog\.go:|^)(\d+):\d+/m);
  return m ? parseInt(m[1], 10) : null;
}

/** Run Go code via the Vercel serverless API proxy */
async function executeViaAPI(code: string): Promise<GoResult> {
  const t0 = performance.now();
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch('/api/go-run', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      throw new Error(`Go API responded ${res.status}`);
    }
    const data = await res.json();
    const time = performance.now() - t0;
    const errors = data.errors || data.error || null;
    return {
      output: truncateOutput(data.output || ''),
      errors: errors ? truncateOutput(errors) : null,
      execTimeMs: time,
      errorLine: errors ? extractErrorLine(errors) : null,
      backend: 'api',
    };
  } catch (e: any) {
    return {
      output: '',
      errors: `Go runner unavailable: ${e?.message ?? String(e)}`,
      execTimeMs: performance.now() - t0,
      errorLine: null,
      backend: 'api',
    };
  }
}

/** Create (or reuse) the WASM execution worker.
 *
 * Deliberately a *classic* worker (not `type: 'module'`): the worker uses
 * `importScripts()` to pull Go's `wasm_exec.js` glue, which is a classic
 * script and is not loadable from a module worker. The worker file itself has
 * no ES imports, so a classic worker is the right fit. */
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./goWasmWorker.ts', import.meta.url));
  }
  return worker;
}

/** Tear down the worker — used after a timeout or a fatal worker error. */
function killWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

/**
 * Run Go code in the WASM worker with a hard timeout. If the deadline passes
 * the worker is terminated (killing any infinite loop), and we fall back to
 * the API so the user still gets a result.
 *
 * `timeoutMs` is the watchdog budget for this run. The warm-up run passes the
 * larger load budget since it also has to fetch + instantiate the module;
 * normal runs use the strict execution ceiling.
 */
function executeViaWASM(code: string, timeoutMs: number = WASM_EXEC_TIMEOUT_MS): Promise<GoResult> {
  return new Promise<GoResult>((resolve) => {
    const t0 = performance.now();
    const id = ++runId;
    let settled = false;
    const w = getWorker();

    const cleanup = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
      clearTimeout(timer);
    };

    const finishWithApi = async (note: string) => {
      // The worker is gone (or unusable) — recover via the API backend.
      const apiResult = await executeViaAPI(code);
      resolve({
        ...apiResult,
        errors: apiResult.errors ? `${note}\n${apiResult.errors}` : note || apiResult.errors,
      });
    };

    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.id !== id) return;
      if (settled) return;
      settled = true;
      cleanup();

      if (data.type === 'result') {
        const errors: string | null = data.errors ?? null;
        resolve({
          output: truncateOutput(data.output ?? ''),
          errors: errors ? truncateOutput(errors) : null,
          execTimeMs: performance.now() - t0,
          errorLine: errors ? extractErrorLine(errors) : null,
          backend: 'wasm',
        });
      } else {
        // Worker reported an error (memory cap hit, load failure, etc.).
        const message: string = data.message ?? 'WASM execution failed';
        if (/memory limit/i.test(message)) {
          // A memory-cap breach is a real user-code error — surface it as such.
          resolve({
            output: '',
            errors: `Memory limit exceeded — your program allocated too much memory.`,
            execTimeMs: performance.now() - t0,
            errorLine: null,
            backend: 'wasm',
          });
        } else {
          console.warn('WASM worker error, falling back to API:', message);
          void finishWithApi('');
        }
      }
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      cleanup();
      // An uncaught worker error usually means an OOM crash — discard it.
      killWorker();
      console.warn('WASM worker crashed, falling back to API');
      void finishWithApi('');
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      // Infinite loop / runaway run — kill the worker outright. A fresh one
      // will be created (and re-load WASM) on the next execution.
      killWorker();
      wasmReady = false;
      wasmLoading = false;
      wasmLoadPromise = null;
      resolve({
        output: '',
        errors: `Execution timed out (${WASM_EXEC_TIMEOUT_MS / 1000}s limit) — your code may contain an infinite loop.`,
        execTimeMs: timeoutMs,
        errorLine: null,
        backend: 'wasm',
      });
    }, timeoutMs);

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({
      type: 'run',
      id,
      code,
      wasmExecUrl: WASM_EXEC_URL,
      wasmUrl: WASM_MODULE_URL,
    });
  });
}

/**
 * Load the WASM interpreter in the background by sending a tiny warm-up run to
 * the worker. The worker fetches + instantiates the module once; if that fails
 * we stay on the API backend.
 */
function startWASMLoading(): void {
  if (wasmReady || wasmLoading || workerLoadFailed) return;
  wasmLoading = true;

  wasmLoadPromise = (async () => {
    try {
      // A trivial program forces the worker to load + instantiate the module.
      // The warm-up gets the larger load budget (it has to fetch the .wasm).
      const warmup = await executeViaWASM('package main\nfunc main() {}', WASM_LOAD_TIMEOUT_MS);

      if (warmup.backend === 'wasm' && !warmup.errors) {
        wasmReady = true;
        wasmLoading = false;
        return true;
      }
      // Warm-up fell back to the API or timed out — WASM is not available.
      workerLoadFailed = true;
      wasmLoading = false;
      killWorker();
      return false;
    } catch (e) {
      console.warn('Failed to load Go WASM interpreter:', e);
      workerLoadFailed = true;
      wasmLoading = false;
      killWorker();
      return false;
    }
  })();
}

/** Execute Go code using the best available backend */
export async function executeGo(code: string): Promise<GoResult> {
  if (wasmReady) {
    return executeViaWASM(code);
  }

  // Start loading WASM in background on first Go execution.
  if (!wasmLoading && !wasmLoadPromise && !workerLoadFailed) {
    startWASMLoading();
  }

  return executeViaAPI(code);
}
