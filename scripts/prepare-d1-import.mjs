#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { prepareD1Import } from '../shared/db/d1-import.mjs';

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath) {
  console.error('Usage: node scripts/prepare-d1-import.mjs <turso-dump.sql> <d1-import.sql>');
  process.exit(2);
}

const result = prepareD1Import(readFileSync(sourcePath, 'utf8'));
if (result.statementCount === 0) {
  console.error('Source dump contained no application-table inserts.');
  process.exit(1);
}

writeFileSync(targetPath, result.sql, { mode: 0o600 });
console.log(`Prepared ${result.statementCount} data statements for D1 import.`);
