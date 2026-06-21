#!/usr/bin/env node
/**
 * Fetch LeetCode metadata and append drill stubs to drills.json.
 *
 *   pnpm ingest-leetcode two-sum valid-palindrome
 *   pnpm ingest-leetcode --dry-run two-sum
 *   pnpm ingest-leetcode --list   # curated starter set
 */
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  buildDrillStub,
  fetchLeetCodeQuestion,
  mergeDrillStubs,
} from '../shared/lib/ingest-leetcode.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DRILLS_PATH = join(ROOT, 'src/data/drills.json');

const STARTER_SLUGS = [
  'two-sum',
  'valid-palindrome',
  'best-time-to-buy-and-sell-stock',
  'contains-duplicate',
  'maximum-subarray',
  '3sum',
  'longest-substring-without-repeating-characters',
  'valid-parentheses',
  'merge-two-sorted-lists',
  'binary-search',
  'number-of-islands',
  'climbing-stairs',
  'coin-change',
  'house-robber',
  'product-of-array-except-self',
  'group-anagrams',
  'top-k-frequent-elements',
  'invert-binary-tree',
  'maximum-depth-of-binary-tree',
  'kth-largest-element-in-an-array',
  'word-search',
  'permutations',
  'jump-game',
  'merge-intervals',
  'single-number',
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const useList = args.includes('--list');
const slugs = useList
  ? STARTER_SLUGS
  : args.filter(a => !a.startsWith('--'));

if (!slugs.length) {
  console.error('Usage: node scripts/ingest-leetcode.mjs [--dry-run] [--list] <slug>…');
  process.exit(1);
}

const drillsFile = JSON.parse(readFileSync(DRILLS_PATH, 'utf8'));
const existing = drillsFile.drills || [];

const stubs = [];
const errors = [];

for (const slug of slugs) {
  try {
    const q = await fetchLeetCodeQuestion(slug);
    stubs.push(buildDrillStub(q, slug));
    console.log(`✓ ${slug} → ${stubs[stubs.length - 1].conceptId}`);
  } catch (err) {
    errors.push({ slug, message: err.message });
    console.error(`✗ ${slug}: ${err.message}`);
  }
}

const { drills, added, skipped } = mergeDrillStubs(existing, stubs, { dryRun });

console.log(`\nStubs: ${stubs.length} fetched, ${added} new, ${skipped} already in drills.json`);
if (errors.length) console.log(`Errors: ${errors.length}`);

if (!dryRun && added > 0) {
  drillsFile.drills = drills;
  writeFileSync(DRILLS_PATH, JSON.stringify(drillsFile, null, 2) + '\n');
  console.log(`Wrote ${DRILLS_PATH}`);
  spawnSync('node', ['scripts/link-leetcode-drills.mjs'], { cwd: ROOT, stdio: 'inherit' });
} else if (dryRun) {
  console.log('Dry run — drills.json unchanged');
}