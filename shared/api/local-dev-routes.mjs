import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

/** Load repo-root .env.local into process.env (does not override existing). */
export function loadEnvLocal() {
  const path = join(ROOT, '.env.local');
  if (!existsSync(path)) return false;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"'))
      || (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
  return true;
}

async function runHandler(loader, req, res) {
  const mod = await loader();
  return mod.default(req, res);
}

/**
 * Mount Learning OS + auth routes on the local Express API (port 3456).
 * Vite proxies /api/* here so local dev matches production surface.
 */
export function mountAppRoutes(api) {
  api.all('/learning', (req, res) => runHandler(() => import('../../api/learning.mjs'), req, res));
  api.post('/auth/google', (req, res) => runHandler(() => import('../../api/auth/google.mjs'), req, res));
  api.get('/auth/verify', (req, res) => runHandler(() => import('../../api/auth/verify.mjs'), req, res));
  api.post('/auth/logout', (req, res) => runHandler(() => import('../../api/auth/logout.mjs'), req, res));
}