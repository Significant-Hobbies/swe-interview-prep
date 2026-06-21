#!/usr/bin/env node
/** Start local API (:3456) + Vite (:5199) for Playwright e2e. */
import { spawn, spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

spawnSync('pnpm', ['server:ensure'], { cwd: ROOT, stdio: 'inherit' });

const e2eEnv = {
  ...process.env,
  JWT_SECRET: process.env.JWT_SECRET || 'e2e-local-jwt-secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'e2e-google-client',
};

function run(cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...e2eEnv, ...opts.env },
  });
  child.on('exit', code => {
    if (code && code !== 0) process.exit(code);
  });
  return child;
}

const api = run('node', ['index.mjs'], { cwd: join(ROOT, 'server') });
const vite = run('pnpm', ['exec', 'vite', '--port', '5199', '--strictPort']);

function shutdown() {
  api.kill('SIGTERM');
  vite.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);