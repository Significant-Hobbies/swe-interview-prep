import { describe, expect, it } from 'vitest';

import { isStaleChunkError, shouldReloadForStaleChunk } from './chunkRecovery';

describe('isStaleChunkError', () => {
  // The exact message production threw when the edge served a day-old
  // document: `cf-cache-status: HIT`, `age: 52300`, chunk names from two
  // deploys earlier.
  it('recognises a failed dynamic import', () => {
    expect(
      isStaleChunkError(
        new Error(
          'Failed to fetch dynamically imported module: https://learn.significanthobbies.com/assets/Today-DQMvCKip.js'
        )
      )
    ).toBe(true);
  });

  it('recognises the MIME rejection that precedes it', () => {
    expect(
      isStaleChunkError(
        new Error(
          'Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html".'
        )
      )
    ).toBe(true);
  });

  it('leaves ordinary application errors alone', () => {
    expect(isStaleChunkError(new Error('Cannot read properties of undefined'))).toBe(false);
    expect(isStaleChunkError(new TypeError('x is not a function'))).toBe(false);
    expect(isStaleChunkError(undefined)).toBe(false);
  });
});

describe('shouldReloadForStaleChunk', () => {
  it('reloads the first time', () => {
    expect(shouldReloadForStaleChunk(null, 1_000_000)).toBe(true);
  });

  // Without this guard a deployment that is genuinely broken becomes an
  // infinite refresh rather than an error screen.
  it('refuses to reload again inside the cooldown', () => {
    expect(shouldReloadForStaleChunk(1_000_000, 1_005_000)).toBe(false);
    expect(shouldReloadForStaleChunk(1_000_000, 1_029_000)).toBe(false);
  });

  it('allows another attempt once the cooldown has passed', () => {
    expect(shouldReloadForStaleChunk(1_000_000, 1_031_000)).toBe(true);
  });
});
