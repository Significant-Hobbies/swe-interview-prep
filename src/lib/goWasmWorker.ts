/// <reference lib="webworker" />
/**
 * Go-WASM execution worker.
 *
 * User Go code runs here — NOT on the main thread — so the page can never be
 * hung by an infinite loop or a runaway allocation:
 *
 *  - Execution timeout: the main thread `terminate()`s this worker if a run
 *    doesn't post a result in time. A terminated worker stops instantly,
 *    including a tight `for {}` loop the WASM VM would otherwise spin forever.
 *  - Memory cap: `WebAssembly.Memory.prototype.grow` is patched to reject
 *    growth past MAX_WASM_PAGES, so a huge `make([]byte, ...)` fails cleanly
 *    inside the VM instead of ballooning the tab's heap until the browser
 *    kills it.
 *
 * Protocol:
 *   main → worker:  { type: 'run', id, code, wasmExecUrl, wasmUrl }
 *   worker → main:  { type: 'ready', id }
 *                   { type: 'result', id, output, errors }
 *                   { type: 'error', id, message }
 */

// 64 KiB per WebAssembly page → 256 MiB cap. Generous for interview-sized
// programs, far below what would destabilise the tab.
const MAX_WASM_PAGES = 4096;

interface RunMessage {
  type: 'run';
  id: number;
  code: string;
  wasmExecUrl: string;
  wasmUrl: string;
}

interface GoRunResult {
  output?: string;
  errors?: string | null;
}

declare const Go: { new (): GoInstance };
interface GoInstance {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): void;
}

let goRunReady: ((code: string) => GoRunResult) | null = null;
let loadPromise: Promise<void> | null = null;

/**
 * Cap how far any WebAssembly.Memory in this worker can grow. Patched once,
 * before the Go module is instantiated, so the Go runtime's own memory is
 * covered too.
 */
function installMemoryCap() {
  const proto = WebAssembly.Memory.prototype as unknown as {
    grow: (delta: number) => number;
    __capped?: boolean;
  };
  if (proto.__capped) return;
  const originalGrow = proto.grow;
  proto.grow = function patchedGrow(this: WebAssembly.Memory, delta: number) {
    const current = this.buffer.byteLength / 65536;
    if (current + delta > MAX_WASM_PAGES) {
      throw new RangeError(
        `memory limit exceeded: program tried to use more than ${
          (MAX_WASM_PAGES * 64) / 1024
        } MiB`,
      );
    }
    return originalGrow.call(this, delta);
  };
  proto.__capped = true;
}

async function ensureLoaded(wasmExecUrl: string, wasmUrl: string): Promise<void> {
  if (goRunReady) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    installMemoryCap();

    // Load Go's WASM glue (defines `Go`).
    if (typeof Go === 'undefined') {
      importScripts(wasmExecUrl);
    }

    const go = new Go();
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`failed to fetch Go WASM module (${response.status})`);
    }
    const { instance } = await WebAssembly.instantiateStreaming(
      response,
      go.importObject,
    );
    go.run(instance); // starts main(), which sets self.__goRunCode

    // Wait (briefly) for the Go runtime to publish its entry point.
    await new Promise<void>((resolve, reject) => {
      const started = Date.now();
      const check = () => {
        const fn = (self as unknown as { __goRunCode?: typeof goRunReady })
          .__goRunCode;
        if (fn) {
          goRunReady = fn;
          resolve();
        } else if (Date.now() - started > 10_000) {
          reject(new Error('Go WASM runtime did not initialise in time'));
        } else {
          setTimeout(check, 25);
        }
      };
      check();
    });
  })();

  return loadPromise;
}

self.onmessage = async (event: MessageEvent<RunMessage>) => {
  const msg = event.data;
  if (!msg || msg.type !== 'run') return;
  const { id, code, wasmExecUrl, wasmUrl } = msg;

  try {
    await ensureLoaded(wasmExecUrl, wasmUrl);
    if (!goRunReady) throw new Error('Go WASM runner unavailable');

    // The actual VM call. If user code loops forever this never returns —
    // that's expected; the main thread's watchdog terminates this worker.
    const result = goRunReady(code);
    (self as unknown as Worker).postMessage({
      type: 'result',
      id,
      output: result.output ?? '',
      errors: result.errors ?? null,
    });
  } catch (e) {
    (self as unknown as Worker).postMessage({
      type: 'error',
      id,
      message: e instanceof Error ? e.message : String(e),
    });
  }
};
