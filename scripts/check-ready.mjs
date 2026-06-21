#!/usr/bin/env node
/**
 * Pre-flight: local env, unit tests, production build, optional Pages secret audit.
 */
import { spawnSync } from 'child_process';
import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const ROOT = new URL('..', import.meta.url).pathname;

function run(cmd, args, env = process.env) {
  const r = spawnSync(cmd, args, { cwd: ROOT, env, stdio: 'inherit', shell: false });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log('── 1/4 Env contract (deploy) ──');
run('node', ['scripts/validate-env.mjs', 'deploy']);

console.log('\n── 2/4 Unit tests ──');
run('pnpm', ['test']);

console.log('\n── 3/4 Production build ──');
run('pnpm', ['build']);

console.log('\n── 4/4 Cloudflare Pages secrets (optional) ──');
const audit = spawnSync(
  'pnpm',
  ['exec', 'wrangler', 'pages', 'secret', 'list', '--project-name=swe-interview-prep'],
  { cwd: ROOT, env: process.env, encoding: 'utf8' },
);
if (audit.status === 0) {
  const required = ['GOOGLE_CLIENT_ID', 'JWT_SECRET', 'TURSO_AUTH_TOKEN', 'TURSO_DATABASE_URL'];
  const present = required.filter(name => audit.stdout.includes(`- ${name}:`));
  const missing = required.filter(name => !present.includes(name));
  if (missing.length) {
    console.warn('Missing Pages secrets:', missing.join(', '));
    console.warn('Run: node scripts/sync-pages-secrets.mjs');
  } else {
    console.log('Pages production secrets: ok');
  }
} else {
  console.warn('Skipped Pages secret audit (wrangler not logged in or offline).');
}

console.log('\n✓ Ready — push to main for auto-deploy, or: pnpm deploy');