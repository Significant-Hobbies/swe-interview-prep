#!/usr/bin/env node
/**
 * Generate review-question stubs from library sections (concept-index.json).
 * Output: src/data/review-questions-ingested.json
 *
 * Run after fetch-library / build-concept-index:
 *   pnpm ingest-library-rqs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildIngestedReviewQuestions } from '../shared/lib/ingest-library.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LIBRARY_DIR = join(ROOT, 'src', 'data', 'library');
const INDEX_PATH = join(LIBRARY_DIR, 'concept-index.json');
const MANIFEST_PATH = join(LIBRARY_DIR, 'manifest.json');
const EDITORIAL_PATH = join(ROOT, 'src', 'data', 'review-questions.json');
const OUT_PATH = join(ROOT, 'src', 'data', 'review-questions-ingested.json');

function loadJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

if (!existsSync(INDEX_PATH)) {
  console.error('Missing concept-index.json — run pnpm build-concept-index first.');
  process.exit(1);
}

const conceptIndex = loadJSON(INDEX_PATH);
const manifest = loadJSON(MANIFEST_PATH);
const editorial = loadJSON(EDITORIAL_PATH).reviewQuestions || [];
const existingIds = new Set(editorial.map(q => q.id));

const repoContent = {};
for (const repo of manifest.repos || []) {
  const p = join(LIBRARY_DIR, repo.id, 'content.json');
  if (!existsSync(p)) continue;
  repoContent[repo.id] = loadJSON(p);
}

const reviewQuestions = buildIngestedReviewQuestions({
  conceptIndex,
  repoContent,
  existingIds,
});

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  reviewQuestions,
};

writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n');
console.log(`Wrote ${OUT_PATH}`);
console.log(`Ingested review questions: ${reviewQuestions.length}`);