#!/usr/bin/env node
/**
 * Push runtime secrets from .env.local → Cloudflare Pages (production).
 * Never prints secret values.
 */
import { spawnSync } from 'child_process';
import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const PROJECT = 'swe-interview-prep';
const RUNTIME_KEYS = [
  'GOOGLE_CLIENT_ID',
  'JWT_SECRET',
  'TURSO_AUTH_TOKEN',
  'TURSO_DATABASE_URL',
];

const missing = RUNTIME_KEYS.filter(k => !process.env[k]?.trim());
if (missing.length) {
  console.error('Missing in .env.local:', missing.join(', '));
  process.exit(1);
}

for (const key of RUNTIME_KEYS) {
  const r = spawnSync(
    'pnpm',
    ['exec', 'wrangler', 'pages', 'secret', 'put', key, '--project-name', PROJECT],
    {
      input: process.env[key],
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit'],
    },
  );
  if (r.status !== 0) {
    console.error(`Failed to set ${key}`);
    process.exit(r.status ?? 1);
  }
  console.log(`✓ ${key}`);
}

console.log(`\nSynced ${RUNTIME_KEYS.length} secrets to Pages project "${PROJECT}".`);