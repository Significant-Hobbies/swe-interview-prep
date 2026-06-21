import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
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

  it('local dev server mounts learning routes', () => {
    const serverEntry = join(ROOT, 'server/index.mjs');
    if (!existsSync(serverEntry)) return; // submodule optional in CI
    const src = readFileSync(serverEntry, 'utf8');
    expect(src).toContain('mountAppRoutes');
    expect(src).toContain('local-dev-routes.mjs');
  });

  it('local learning.mjs uses registry', () => {
    const src = readFileSync(join(ROOT, 'api/learning.mjs'), 'utf8');
    expect(src).toContain('learning-registry.mjs');
    expect(src).not.toContain('daily.mjs');
  });
});