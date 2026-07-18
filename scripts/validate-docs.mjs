#!/usr/bin/env node
// Validate the docs/ tree without any install.
//
// Checks:
//   1. Required files exist.
//   2. No broken intra-doc relative markdown links (links to .md files that
//      do not exist, or to directories without an index/README).
//   3. No empty placeholder docs (markdown files with no real prose).
//   4. ADR index (docs/architecture/decisions/README.md) lists every
//      ADR file present and vice versa.
//
// Run: pnpm docs:validate
//
// Exits non-zero on any error. Only prints file paths and problems — never
// file contents.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DOCS = join(ROOT, 'docs');

const errors = [];

function fail(msg) {
  errors.push(msg);
}

// --- 1. Required files -------------------------------------------------------
const required = [
  'docs/index.md',
  'docs/README.md',
  'AGENTS.md',
  'STATUS.md',
  'docs/architecture/overview.md',
  'docs/architecture/data-flow.md',
  'docs/architecture/decisions/README.md',
  'docs/product/overview.md',
  'docs/product/surfaces.md',
  'docs/development/setup.md',
  'docs/development/commands.md',
  'docs/development/env.md',
  'docs/development/testing.md',
  'docs/development/content-pipelines.md',
  'docs/operations/deploy.md',
  'docs/operations/ci.md',
  'docs/operations/jobs/library-refresh.md',
  'docs/operations/jobs/weekly-quality.md',
  'docs/operations/jobs/docs-validate.md',
  'docs/operations/runbooks/rotate-jwt-secret.md',
  'docs/operations/runbooks/rotate-pages-secrets.md',
  'docs/operations/runbooks/reader-adapter.md',
  'docs/knowledge/learnings.md',
  'docs/knowledge/failed-approaches.md',
  'blume.config.ts',
  'scripts/validate-docs.mjs',
];
for (const rel of required) {
  if (!existsSync(join(ROOT, rel))) fail(`missing required file: ${rel}`);
}

// --- gather all markdown under docs/ ----------------------------------------
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.md$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const allMd = walk(DOCS);

// --- 2. broken intra-doc markdown links -------------------------------------
const linkRe = /\[[^\]]*\]\(([^)]+)\)/g;
const codeFenceRe = /```[\s\S]*?```/g;

function stripCodeFences(text) {
  return text.replace(codeFenceRe, '');
}

function resolveLink(fromFile, href) {
  // Only validate relative + same-repo markdown links. Skip absolute URLs,
  // mailto, anchors, and non-md targets.
  if (/^(https?:|mailto:|tel:|ftp:)/i.test(href)) return null;
  const [pathPart, anchor] = href.split('#');
  if (!pathPart) return null; // pure anchor — assume valid
  if (!/\.md$/i.test(pathPart)) return null; // non-md asset link — skip
  const resolved = resolve(join(dirname(fromFile), pathPart));
  return { resolved, anchor };
}

for (const file of allMd) {
  const rel = relative(ROOT, file);
  // Skip broken-link validation for:
  //  - docs/archive/: historical content with intentional cross-fleet
  //    references (../../../<sibling-repo>/docs/...) that cannot be resolved
  //    from this repo.
  //  - docs/learning/: in-product content Vite-globbed by the SPA. Links
  //    use ./slug.md form that the app rewrites to /learning/slug; pre-
  //    existing missing targets are product bugs, not doc-tree issues.
  if (rel.startsWith('docs/archive/') || rel.startsWith('docs/learning/')) continue;
  const raw = readFileSync(file, 'utf8');
  const text = stripCodeFences(raw);
  let m;
  linkRe.lastIndex = 0;
  while ((m = linkRe.exec(text)) !== null) {
    const href = m[1].trim();
    const r = resolveLink(file, href);
    if (!r) continue;
    if (!existsSync(r.resolved)) {
      fail(`broken link in ${rel}: \`${href}\` → ${relative(ROOT, r.resolved)} (not found)`);
    }
  }
}

// --- 3. empty placeholder docs ----------------------------------------------
const minProseBytes = 120; // a real doc has at least a heading + a sentence
for (const file of allMd) {
  const rel = relative(ROOT, file);
  // Skip the in-product learning roadmaps — they are product content and
  // some are intentionally short index pages.
  if (rel.startsWith('docs/learning/')) continue;
  const raw = readFileSync(file, 'utf8');
  const stripped = stripCodeFences(raw)
    .replace(/^#+\s.*$/gm, '') // headings
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length < minProseBytes) {
    fail(`empty/placeholder doc: ${rel} (no real prose)`);
  }
}

// --- 4. ADR index sync -------------------------------------------------------
// The decisions/README.md table lists ADRs by number in the first column
// (e.g. `| 0001 | ... |`). Match the table rows, not free-text dates.
const adrDir = join(DOCS, 'architecture', 'decisions');
const adrFiles = readdirSync(adrDir)
  .filter((f) => /^\d{4}-.*\.md$/.test(f))
  .sort();
const adrNumbers = new Set(adrFiles.map((f) => f.slice(0, 4)));
const adrReadme = readFileSync(join(adrDir, 'README.md'), 'utf8');
// Table rows look like: | 0001 | Title | Status | Date |
const tableRowRe = /^\|\s*(\d{4})\s*\|/gm;
const listedNumbers = new Set();
let tm;
while ((tm = tableRowRe.exec(adrReadme)) !== null) {
  listedNumbers.add(tm[1]);
}
for (const num of adrNumbers) {
  if (!listedNumbers.has(num)) {
    fail(`ADR not listed in decisions/README.md: ${num}`);
  }
}
for (const num of listedNumbers) {
  if (!adrNumbers.has(num)) {
    fail(`ADR listed in decisions/README.md but no file: ${num}-*.md`);
  }
}

// --- report ------------------------------------------------------------------
if (errors.length) {
  console.error('docs:validate — FAILED:');
  for (const e of errors) console.error('  ' + e);
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

console.log(
  `docs:validate — OK (${allMd.length} markdown files, ${adrFiles.length} ADRs, ${required.length} required files).`
);
