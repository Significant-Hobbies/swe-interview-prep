#!/usr/bin/env node
/**
 * Verify that every DOI we cite resolves to the paper we say it does.
 *
 * Why this exists: an earlier audit found nine fabricated DOIs and replaced
 * them, checking each replacement with an HTTP status code. That check is not
 * sufficient. A DOI can resolve perfectly and still point at a different paper
 * — two survived that pass:
 *
 *   query-rewriting  cited "Relevance feedback (Rocchio)" at 10.1145/321879.321880
 *                    -> "An Extension of the String-to-String Correction Problem"
 *   linked-list      cited "Skip lists (Pugh)"            at 10.1137/0221006
 *                    -> "Computing Algebraic Formulas Using a Constant Number of Registers"
 *
 * So this compares the CITED TITLE against the registered metadata, via DOI
 * content negotiation (Crossref/DataCite CSL JSON), and reports mismatches.
 *
 * Network-bound, so it is intentionally NOT part of `pnpm test`. Run it after
 * touching citations:  node scripts/verify-citations.mjs
 * Exits non-zero if any DOI is unresolvable or looks mis-cited.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Parentheses are legal in a DOI (e.g. 10.1016/0306-4573(88)90021-0), so the
// suffix runs to the end of the JSON string rather than to the first bracket.
const DOI_RE = /https:\/\/doi\.org\/(10\.[^"'\s]+)/;

/** Every (title, doi) pair we ship, from the packs and the concept resources. */
function citations() {
  const out = [];
  const packs = JSON.parse(readFileSync(join(ROOT, 'src/data/concept-packs.json'), 'utf8')).packs;
  for (const [conceptId, pack] of Object.entries(packs)) {
    for (const item of pack.items ?? []) {
      const m = DOI_RE.exec(item.url ?? '');
      if (m) out.push({ conceptId, title: item.title ?? '', doi: m[1] });
    }
  }
  const concepts = JSON.parse(readFileSync(join(ROOT, 'src/data/concepts.json'), 'utf8')).concepts;
  for (const concept of concepts) {
    for (const r of concept.resources ?? []) {
      const m = DOI_RE.exec(r.url ?? '');
      if (m) out.push({ conceptId: concept.id, title: r.title ?? '', doi: m[1] });
    }
  }
  return out;
}

/** Distinctive words of a title — the comparison ignores order and filler. */
function keywords(title) {
  const STOP = new Set([
    'the',
    'a',
    'an',
    'of',
    'for',
    'and',
    'in',
    'on',
    'to',
    'with',
    'using',
    'via',
    'from',
    'into',
    'by',
    'at',
    'is',
    'are',
    'be',
    'as',
    'its',
    'it',
    'that',
    'this',
    'how',
    'why',
    'what',
    'ch',
    'chapter',
    'part',
    'vol',
  ]);
  return new Set(
    title
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w))
  );
}

async function registered(doi) {
  const res = await fetch(`https://doi.org/${doi}`, {
    headers: { Accept: 'application/vnd.citationstyles.csl+json' },
    redirect: 'follow',
  });
  if (!res.ok) return null;
  const meta = await res.json();
  const title = Array.isArray(meta.title) ? meta.title[0] : meta.title;
  const authors = (meta.author ?? []).map((a) => a.family ?? '').filter(Boolean);
  return { title: title ?? '', authors };
}

const problems = [];
const cites = citations();
console.log(`Checking ${cites.length} DOI citations…\n`);

for (const c of cites) {
  let meta;
  try {
    meta = await registered(c.doi);
  } catch (error) {
    problems.push({ ...c, reason: `network error: ${error.message}` });
    continue;
  }
  if (!meta) {
    problems.push({ ...c, reason: 'DOI does not resolve — likely fabricated' });
    continue;
  }
  // Accept if the cited title shares distinctive words with the registered
  // one, OR names one of the registered authors (we cite "Skip lists (Pugh)"
  // rather than the full formal title).
  const ours = keywords(c.title);
  const theirs = keywords(meta.title);
  const overlap = [...ours].filter((w) => theirs.has(w)).length;
  const namesAuthor = meta.authors.some((a) => c.title.toLowerCase().includes(a.toLowerCase()));
  if (overlap >= 2 || (overlap >= 1 && namesAuthor) || (namesAuthor && ours.size <= 4)) continue;
  problems.push({
    ...c,
    reason: `cited as "${c.title}" but DOI is "${meta.title}"${
      meta.authors.length ? ` (${meta.authors.join(', ')})` : ''
    }`,
  });
}

if (!problems.length) {
  console.log(`All ${cites.length} DOI citations resolve to the cited work.`);
  process.exit(0);
}
console.error(`${problems.length} suspect citation(s):\n`);
for (const p of problems) console.error(`  [${p.conceptId}] ${p.doi}\n    ${p.reason}\n`);
process.exitCode = 1;
