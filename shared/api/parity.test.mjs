import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HANDLER_MODULES, LEARNING_ACTIONS } from './learning-registry.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

describe('learning API parity', () => {
  it('loads shared auth handlers without requiring Node env at module initialization', async () => {
    const { requireAuth } = await import('../../api/auth/verify.mjs');
    expect(requireAuth).toBeTypeOf('function');
  });

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

  it('local learning.mjs wraps dispatchLearningAction', () => {
    const src = readFileSync(join(ROOT, 'api/learning.mjs'), 'utf8');
    expect(src).toContain('dispatchLearningAction');
    expect(src).not.toContain('mod.default(req, res)');
    expect(src).not.toContain('daily.mjs');
  });

  it('dispatchLearningAction does not import the Express bridge', async () => {
    const src = readFileSync(join(ROOT, 'shared/api/worker-learning.mjs'), 'utf8');
    expect(src).toContain('dispatchLearningAction');
    expect(src).not.toContain('express-bridge');
    expect(src).not.toContain('runExpressHandler');
    expect(existsSync(join(ROOT, 'shared/api/express-bridge.mjs'))).toBe(false);
    const { dispatchLearningAction } = await import('./worker-learning.mjs');
    expect(dispatchLearningAction).toBeTypeOf('function');
  });

  it('dispatchLearningAction rejects unknown actions and unauthenticated auth actions', async () => {
    const { dispatchLearningAction } = await import('./worker-learning.mjs');
    const json = (body, init = {}) =>
      new Response(JSON.stringify(body), { status: init.status ?? 200 });
    const unknown = await dispatchLearningAction({
      request: new Request('http://localhost/api/learning?action=nope'),
      client: null,
      user: null,
      json,
    });
    expect(unknown.status).toBe(400);
    const unauth = await dispatchLearningAction({
      request: new Request('http://localhost/api/learning?action=activity'),
      client: null,
      user: null,
      json,
    });
    expect(unauth.status).toBe(401);
  });
});
