// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const excalidrawRequire = createRequire(require.resolve('@excalidraw/excalidraw'));
const source = readFileSync(excalidrawRequire.resolve('es6-promise-pool'), 'utf8');

describe('Excalidraw font pool with the Monaco AMD loader present', () => {
  it('exports a working CommonJS constructor without registering with Monaco', async () => {
    const module = { exports: {} as unknown };
    const define = Object.assign(vi.fn(), { amd: true });
    runInNewContext(source, { module, exports: module.exports, define, Promise });

    expect(define).not.toHaveBeenCalled();
    const completed: string[] = [];
    const tasks = ['first font', 'second font'];
    const Pool = module.exports as new (
      source: () => Promise<number> | null,
      concurrency: number
    ) => { start(): Promise<void> };
    const pool = new Pool(() => {
      const font = tasks.shift();
      return font ? Promise.resolve(font).then((value) => completed.push(value)) : null;
    }, 1);
    await pool.start();
    expect(completed).toEqual(['first font', 'second font']);
  });

  it('retains the standalone AMD fallback', () => {
    const define = Object.assign(vi.fn(), { amd: true });
    runInNewContext(source, { define, Promise });
    expect(define).toHaveBeenCalledOnce();
    expect(typeof define.mock.calls[0][1]()).toBe('function');
  });

  it('retains the standalone browser fallback', () => {
    const browser = { Promise } as {
      Promise: typeof Promise;
      PromisePool?: unknown;
      promisePool?: unknown;
    };
    runInNewContext(source, browser);
    expect(typeof browser.PromisePool).toBe('function');
    expect(browser.promisePool).toBe(browser.PromisePool);
  });
});
