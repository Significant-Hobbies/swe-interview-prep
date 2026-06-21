#!/usr/bin/env node
/**
 * CLI: parse Anki .apkg or plain-text export → JSON.
 *
 *   node scripts/ingest-anki.mjs deck.apkg
 *   node scripts/ingest-anki.mjs deck.txt
 */
import { readFileSync } from 'fs';
import { basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import { parseAnkiExport, parseApkgBytes, toReviewQuestions } from '../shared/lib/ingest-anki.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/ingest-anki.mjs <deck.apkg|deck.txt>');
  process.exit(1);
}

const concepts = JSON.parse(
  readFileSync(join(__dirname, '..', 'src/data/concepts.json'), 'utf8'),
).concepts;

const deckName = basename(inputPath).replace(/\.(apkg|txt|csv)$/i, '');
const lower = inputPath.toLowerCase();

let parsed;
if (lower.endsWith('.apkg')) {
  const SQL = await initSqlJs();
  const bytes = new Uint8Array(readFileSync(inputPath));
  parsed = parseApkgBytes(bytes, SQL, { concepts, deckName });
} else {
  const text = readFileSync(inputPath, 'utf8');
  parsed = parseAnkiExport(text, { concepts, deckName });
}

const cards = toReviewQuestions(parsed, { requireConcept: false });

console.log(JSON.stringify({
  deckName: parsed.deckName,
  format: parsed.format,
  stats: parsed.stats,
  count: cards.length,
  cards,
}, null, 2));