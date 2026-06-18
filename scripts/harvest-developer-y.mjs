#!/usr/bin/env node
// Harvest curated external resources from Developer-Y's lists into
// src/data/external-resources.json, keyed by our concept-tag system.
//
// Source repos (all CC-style curated link lists, attribution preserved
// in the emitted JSON):
//   - Developer-Y/cs-video-courses
//   - Developer-Y/Scalable-Software-Architecture
//   - Developer-Y/technical-interviews
//
// Re-run: pnpm tsx scripts/harvest-developer-y.mjs
// (Uses cached files in .tmp/ if present; otherwise calls `gh api`.)

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const TMP = resolve(ROOT, '.tmp');
const OUT = resolve(ROOT, 'src/data/external-resources.json');

const SOURCES = [
  { repo: 'Developer-Y/cs-video-courses', file: 'cs-video-courses.md' },
  { repo: 'Developer-Y/Scalable-Software-Architecture', file: 'scalable.md' },
  { repo: 'Developer-Y/technical-interviews', file: 'interviews.md' },
];

// section heading (lowercased, trimmed) → array of our tag ids.
// Sections not listed here are dropped. Be conservative — bad mappings
// produce off-topic resources on a concept page.
const SECTION_TO_TAGS = {
  // ───── cs-video-courses ─────
  'data structures and algorithms': ['dsa'],
  'systems programming': ['backend', 'system-design'],
  'operating systems': ['backend', 'foundations'],
  'distributed systems': ['distributed-systems', 'system-design'],
  'real-time systems': ['backend'],
  'database systems': ['databases', 'storage-engines'],
  'software engineering': ['foundations'],
  'object oriented design': ['low-level-design'],
  'software architecture': ['system-design'],
  concurrency: ['backend'],
  'artificial intelligence': ['ai-systems'],
  'machine learning': ['ai-systems', 'training'],
  'computer networks': ['backend', 'http'],
  security: ['auth', 'backend'],
  'web programming and internet technologies': ['backend', 'http'],
  // ───── Scalable-Software-Architecture ─────
  'tech talks': ['system-design', 'scalability'],
  papers: ['system-design', 'distributed-systems'],
  'web links': ['system-design', 'backend'],
  books: ['system-design'],
  // ───── technical-interviews ─────
  'algorithms and data structures (practice sites)': ['dsa'],
  'algorithms and data structures (interview questions)': ['dsa'],
  'system design and scalability': ['system-design'],
  'mock interviews': ['behavioral'],
  'competitve programming (practice sites & online judges)': ['dsa'],
  'competitve programming (problem sets)': ['dsa'],
  'books on technical interviews': ['dsa', 'system-design'],
  'books on competitive programming': ['dsa'],
};

// Per-tag cap so a concept page isn't a wall of links.
const PER_TAG_CAP = 20;

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const HEADING_RE = /^(#{2,4})\s+(.+?)\s*$/;

function classify(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'video';
  if (u.includes('coursera.org') || u.includes('edx.org') || u.includes('udacity.com')) return 'course';
  if (u.includes('ocw.mit.edu') || u.includes('see.stanford.edu') || u.match(/cs\d{3}/)) return 'course';
  if (u.includes('arxiv.org') || u.endsWith('.pdf')) return 'paper';
  return 'link';
}

function readSource({ repo, file }) {
  const path = resolve(TMP, file);
  if (existsSync(path)) return readFileSync(path, 'utf8');
  mkdirSync(TMP, { recursive: true });
  const buf = execSync(`gh api repos/${repo}/contents/README.md -q .content`, { encoding: 'utf8' });
  const md = Buffer.from(buf, 'base64').toString('utf8');
  writeFileSync(path, md);
  return md;
}

function parseSections(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let current = null;
  for (const line of lines) {
    const h = line.match(HEADING_RE);
    if (h) {
      if (current) sections.push(current);
      current = { heading: h[2].trim(), body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) sections.push(current);
  return sections;
}

function extractLinks(body) {
  const links = [];
  const seen = new Set();
  for (const line of body) {
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(line)) !== null) {
      const title = m[1].trim().replace(/\s+/g, ' ');
      const url = m[2].replace(/[.,;)]+$/, '');
      if (!title || title.length > 120) continue;
      if (seen.has(url)) continue;
      // Skip in-document anchors and obviously low-signal links.
      if (url.startsWith('#') || url.includes('badge') || url.includes('shields.io')) continue;
      seen.add(url);
      links.push({ title, url, kind: classify(url) });
    }
  }
  return links;
}

function main() {
  /** @type {Record<string, {title:string,url:string,kind:string,source:string}[]>} */
  const byTag = {};
  const seenUrls = new Set();

  for (const src of SOURCES) {
    const md = readSource(src);
    const sections = parseSections(md);
    for (const sec of sections) {
      const key = sec.heading.toLowerCase();
      const tags = SECTION_TO_TAGS[key];
      if (!tags) continue;
      const links = extractLinks(sec.body);
      for (const link of links) {
        if (seenUrls.has(link.url)) continue;
        seenUrls.add(link.url);
        for (const tag of tags) {
          (byTag[tag] ??= []).push({ ...link, source: src.repo });
        }
      }
    }
  }

  // Cap and sort: keep first-encountered order (curated list ordering
  // is itself a signal), but trim to PER_TAG_CAP per tag.
  const out = {};
  for (const tag of Object.keys(byTag).sort()) {
    out[tag] = byTag[tag].slice(0, PER_TAG_CAP);
  }

  // Emit with a one-line provenance comment-equivalent (JSON has no
  // comments — put it inside a meta key).
  const payload = {
    _meta: {
      source: SOURCES.map(s => s.repo),
      generated_by: 'scripts/harvest-developer-y.mjs',
      cap_per_tag: PER_TAG_CAP,
    },
    byTag: out,
  };

  writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n');
  const totalLinks = Object.values(out).reduce((n, arr) => n + arr.length, 0);
  const tags = Object.keys(out);
  console.log(`wrote ${OUT}`);
  console.log(`  ${tags.length} tags, ${totalLinks} links`);
  console.log(`  tags: ${tags.join(', ')}`);
}

main();
