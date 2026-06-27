import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HANDLER_MODULES, LEARNING_ACTIONS } from './learning-registry.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

describe('learning API parity', () => {
  it('every registry action has a handler module', () => {
    for (const action of LEARNING_ACTIONS) {
      expect(HANDLER_MODULES[action], action).toBeDefined();
    }
  });

  it('worker dispatchLearningAction is wired in Pages API', () => {
    const src = readFileSync(join(ROOT, 'functions/api/[[path]].js'), 'utf8');
    expect(src).toContain('dispatchLearningAction');
    expect(src).not.toMatch(/if \(action === "daily"\)/);
    expect(src).not.toContain('async function handleLearningNotes');
    expect(src).not.toContain('async function handleFeynman');
  });

  it('dev AI bridge serves the chat route and is dev-only', () => {
    // The former local-ai submodule was replaced by an in-process Vite dev plugin.
    const bridge = readFileSync(join(ROOT, 'vite-plugin-local-ai.js'), 'utf8');
    expect(bridge).toContain("path === '/chat'");
    expect(bridge).toContain("apply: 'serve'"); // dev-only, never ships to prod
    expect(readFileSync(join(ROOT, 'vite.config.js'), 'utf8')).toContain('localAi()');
  });

  it('local learning.mjs uses registry', () => {
    const src = readFileSync(join(ROOT, 'api/learning.mjs'), 'utf8');
    expect(src).toContain('learning-registry.mjs');
    expect(src).not.toContain('daily.mjs');
  });
});
