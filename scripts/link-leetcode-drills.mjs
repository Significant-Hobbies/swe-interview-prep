#!/usr/bin/env node
/**
 * Append lc-* drill ids to concepts.json drills[] for each conceptId match.
 * Run after pnpm ingest-leetcode.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONCEPTS_PATH = join(ROOT, 'src/data/concepts.json');
const DRILLS_PATH = join(ROOT, 'src/data/drills.json');

const conceptsFile = JSON.parse(readFileSync(CONCEPTS_PATH, 'utf8'));
const drills = JSON.parse(readFileSync(DRILLS_PATH, 'utf8')).drills || [];
const lcDrills = drills.filter(d => d.id.startsWith('lc-'));

const byConcept = Object.groupBy(lcDrills, d => d.conceptId);
let linked = 0;

for (const concept of conceptsFile.concepts) {
  const stubs = byConcept[concept.id] ?? [];
  if (!stubs.length) continue;
  const existing = new Set(concept.drills ?? []);
  for (const d of stubs) {
    if (!existing.has(d.id)) {
      concept.drills = [...(concept.drills ?? []), d.id];
      existing.add(d.id);
      linked++;
    }
  }
}

writeFileSync(CONCEPTS_PATH, JSON.stringify(conceptsFile, null, 2) + '\n');
console.log(`Linked ${linked} LeetCode drill ids across ${Object.keys(byConcept).length} concepts`);