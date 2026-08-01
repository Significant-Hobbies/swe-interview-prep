import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const hasBinding = /\[\[d1_databases\]\][\s\S]*?binding\s*=\s*["']DB["']/.test(config);
const databaseId = config.match(
  /\[\[d1_databases\]\][\s\S]*?database_id\s*=\s*["']([^"']+)["']/
)?.[1];
const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
  databaseId || ''
);

if (!hasBinding || !isUuid) {
  console.error('Production D1 binding DB is not configured with a database UUID.');
  console.error(
    'Create and verify the remote database only after the migration receipt is approved.'
  );
  process.exit(1);
}

console.log('Production D1 binding contract ok.');
