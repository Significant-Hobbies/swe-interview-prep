#!/usr/bin/env node
/**
 * Build concept-packs.json — six-slot learning pack per concept:
 * video, paper, blog, book, problem (drill), write (explain-back prompt).
 *
 * Run: node scripts/generate-concept-packs.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const concepts = JSON.parse(readFileSync(join(root, 'src/data/concepts.json'), 'utf8')).concepts;
const drills = JSON.parse(readFileSync(join(root, 'src/data/drills.json'), 'utf8')).drills;
const external = JSON.parse(readFileSync(join(root, 'src/data/external-resources.json'), 'utf8'));

const drillById = Object.fromEntries(drills.map(d => [d.id, d]));

const BOOK_HINT =
  /book|ostep|dataintensive|cvxbook|ir-book|craftinginterpreters|db-book|sre\.google\/books|use-the-index/i;
const PAPER_HINT = /arxiv\.org|\.pdf(\?|#|$)|acm\.org|usenix\.org|openreview|doi\.org/i;
const VIDEO_HINT = /youtube\.com|youtu\.be|vimeo\.com|3blue1brown\.com\/lessons/i;
const BLOG_HINT = /blog\.|\.io\/learn|\.io\/posts|lilianweng|karpathy\.github|jalammar|eugeneyan|jvns\.ca|martinfowler/i;

function classifyResource(r) {
  if (r.type === 'video') return 'video';
  if (r.type === 'paper') return 'paper';
  if (r.type === 'article') return 'blog';
  if (r.type === 'course') return VIDEO_HINT.test(r.url) ? 'video' : 'book';
  if (r.type === 'doc') {
    if (PAPER_HINT.test(r.url)) return 'paper';
    if (VIDEO_HINT.test(r.url)) return 'video';
    if (BOOK_HINT.test(r.url)) return 'book';
    if (BLOG_HINT.test(r.url)) return 'blog';
    if (/wikipedia\.org|docs\.|guide|tutorial|handbook/i.test(r.url)) return 'blog';
    return 'book';
  }
  return null;
}

function classifyLoose(title, url, kind) {
  return classifyResource({
    title,
    url,
    type: kind === 'video' || kind === 'course' || kind === 'paper' || kind === 'link'
      ? (kind === 'link' ? 'article' : kind === 'course' ? 'course' : kind)
      : 'doc',
  });
}

function writePrompt(c) {
  const anchor = (c.mentalModel?.split(/[.!?]/)[0] ?? c.description).trim();
  return `Explain "${c.name}" in three sentences a junior engineer would understand — no jargon you can't define. Cover: ${anchor}`;
}

function buildPack(concept) {
  const pack = { write: { prompt: writePrompt(concept) }, more: [] };
  const seen = new Set();

  function take(slot, link) {
    if (pack[slot] || seen.has(link.url)) return;
    pack[slot] = link;
    seen.add(link.url);
  }

  for (const r of concept.resources ?? []) {
    const slot = classifyResource(r);
    if (slot) take(slot, { title: r.title, url: r.url });
    else {
      pack.more.push({ title: r.title, url: r.url });
      seen.add(r.url);
    }
  }

  for (const tag of concept.tags ?? []) {
    const pool = external.byTag?.[tag] ?? [];
    for (const r of pool) {
      const slot = classifyLoose(r.title, r.url, r.kind);
      if (slot) take(slot, { title: r.title, url: r.url });
    }
  }

  const drillId = concept.drills?.[0];
  if (drillId && drillById[drillId]) {
    pack.problem = { drillId, title: drillById[drillId].title };
  }

  pack.more = (pack.more ?? []).filter(l => !seen.has(l.url));
  return pack;
}

const packs = {};
const stats = { video: 0, paper: 0, blog: 0, book: 0, problem: 0, write: 0, full: 0 };

for (const c of concepts) {
  const pack = buildPack(c);
  packs[c.id] = pack;
  if (pack.video) stats.video++;
  if (pack.paper) stats.paper++;
  if (pack.blog) stats.blog++;
  if (pack.book) stats.book++;
  if (pack.problem) stats.problem++;
  if (pack.write?.prompt) stats.write++;
  const n = [pack.video, pack.paper, pack.blog, pack.book, pack.problem, pack.write?.prompt].filter(Boolean).length;
  if (n === 6) stats.full++;
}

const out = {
  version: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  _meta: {
    slots: ['video', 'paper', 'blog', 'book', 'problem', 'write'],
    stats,
  },
  packs,
};

writeFileSync(join(root, 'src/data/concept-packs.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log('Wrote concept-packs.json', stats);