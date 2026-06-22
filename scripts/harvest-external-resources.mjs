#!/usr/bin/env node
/**
 * Harvest external learning links from curated GitHub aggregator repos into
 * src/data/external-resources.json, keyed by our concept-tag system.
 *
 * Curated pins in src/data/curated-external-resources.json are always
 * prepended and never dropped on re-harvest.
 *
 * Re-run: pnpm sync:external-resources
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const TMP = resolve(ROOT, '.tmp');
const OUT = resolve(ROOT, 'src/data/external-resources.json');
const CURATED = resolve(ROOT, 'src/data/curated-external-resources.json');

const PER_TAG_CAP = 20;

/** @type {{repo:string,file:string,sectionToTags:Record<string,string[]>,wholeFileTags?:string[]}[]} */
const SOURCES = [
  {
    repo: 'Developer-Y/cs-video-courses',
    file: 'cs-video-courses.md',
    sectionToTags: {
      'data structures and algorithms': ['dsa'],
      'systems programming': ['backend', 'system-design', 'runtime'],
      'database systems': ['databases', 'storage-engines'],
      'software engineering': ['foundations', 'low-level-design'],
      'object oriented design': ['low-level-design'],
      'software architecture': ['system-design'],
      concurrency: ['backend'],
      'artificial intelligence': ['ai-systems'],
      'machine learning': ['ai-systems', 'training'],
      'computer networks': ['backend', 'http'],
      security: ['auth', 'backend'],
      'web programming and internet technologies': ['backend', 'http'],
      'math for computer scientist': ['mathematics', 'probability'],
      'theoretical cs and programming languages': ['foundations'],
      'computer organization and architecture': ['backend', 'runtime'],
      'real time system evaluation': ['backend'],
      'distributed systems': ['distributed-systems', 'system-design'],
    },
  },
  {
    repo: 'Developer-Y/Scalable-Software-Architecture',
    file: 'scalable.md',
    sectionToTags: {
      'tech talks': ['system-design', 'scalability', 'distributed-systems'],
      papers: ['system-design', 'distributed-systems'],
      'web links': ['system-design', 'backend'],
      books: ['system-design'],
    },
  },
  {
    repo: 'Developer-Y/technical-interviews',
    file: 'interviews.md',
    sectionToTags: {
      'algorithms and data structures (practice sites)': ['dsa'],
      'algorithms and data structures (interview questions)': ['dsa'],
      'system design and scalability': ['system-design', 'distributed-systems'],
      'mock interviews': ['behavioral'],
      'competitve programming (practice sites & online judges)': ['dsa'],
      'competitve programming (problem sets)': ['dsa'],
      'books on technical interviews': ['dsa', 'system-design'],
      'books on competitive programming': ['dsa'],
    },
  },
  {
    repo: 'prakhar1989/awesome-courses',
    file: 'awesome-courses.md',
    sectionToTags: {
      algorithms: ['dsa'],
      'artificial intelligence': ['ai-systems'],
      'machine learning': ['ai-systems', 'training'],
      systems: ['backend', 'system-design', 'runtime', 'foundations'],
      security: ['auth', 'backend'],
      'statistics / regression': ['statistics', 'mathematics'],
      'programming languages / compilers': ['foundations'],
      misc: ['foundations'],
    },
  },
  {
    repo: 'theanalyst/awesome-distributed-systems',
    file: 'awesome-distributed-systems.md',
    sectionToTags: {
      courses: ['distributed-systems', 'system-design'],
      videos: ['distributed-systems'],
      books: ['distributed-systems', 'system-design'],
      bootcamp: ['distributed-systems'],
      'blogs and other reading links': ['distributed-systems', 'system-design'],
    },
  },
  {
    repo: 'pingcap/awesome-database-learning',
    file: 'awesome-database-learning.md',
    sectionToTags: {
      'recommended courses, books and talks': ['databases', 'storage-engines'],
      courses: ['databases'],
      books: ['databases', 'storage-engines'],
      talks: ['databases'],
      blogs: ['databases'],
      'sql & relation algebra': ['databases'],
      'query optimizer': ['databases'],
      'query execution': ['databases'],
      transaction: ['databases'],
      storage: ['storage-engines', 'databases'],
      'b-tree': ['storage-engines'],
      'lsm-tree': ['storage-engines'],
      'replication & consistency': ['databases', 'distributed-systems'],
      consensus: ['distributed-systems', 'databases'],
      'data partitioning': ['databases', 'distributed-systems'],
    },
  },
  {
    repo: 'keon/awesome-nlp',
    file: 'awesome-nlp.md',
    sectionToTags: {
      'videos and online courses': ['ai-systems', 'training'],
      books: ['ai-systems'],
      'language models for nlp': ['ai-systems', 'language-modeling', 'transformers'],
      'pretraining and adaptation': ['ai-systems', 'training'],
      'tokenization, morphology, and segmentation': ['tokenization', 'search-ir', 'ai-systems'],
      'retrieval and embeddings': ['search-ir', 'vector-db', 'embeddings', 'rag'],
      'evaluation and benchmarks': ['evals', 'evaluation', 'ai-systems'],
      'instruction tuning and preference optimization': ['ai-systems', 'training'],
    },
  },
  {
    repo: 'jwasham/coding-interview-university',
    file: 'coding-interview-university.md',
    sectionToTags: {
      'system design, scalability, data handling': ['system-design', 'distributed-systems', 'scalability'],
      'coding question practice': ['dsa'],
      'algorithmic complexity / big-o / asymptotic analysis': ['dsa'],
      'data structures': ['dsa'],
      trees: ['dsa'],
      graphs: ['dsa'],
      sorting: ['dsa'],
    },
  },
  {
    repo: 'ossu/computer-science',
    file: 'ossu-cs.md',
    sectionToTags: {
      'core programming': ['foundations', 'dsa'],
      'core math': ['mathematics', 'probability'],
      'core systems': ['backend', 'system-design', 'runtime'],
      'core security': ['auth'],
      'core theory': ['dsa', 'foundations'],
      'advanced systems': ['distributed-systems', 'system-design'],
      'advanced programming': ['foundations'],
    },
  },
  {
    repo: 'mlabonne/llm-course',
    file: 'llm-course.md',
    wholeFileTags: ['ai-systems', 'language-modeling', 'transformers', 'training'],
  },
];

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const HEADING_RE = /^(#{2,4})\s+(.+?)\s*$/;
const LOW_SIGNAL_TITLE =
  /^(youtube|videos?|lectures?|watch lectures|notes?(-\d{4})?|readme|home|website|link|here|click here|table of contents|contents|introduction|related|misc|legend)$/i;
const SEMESTER_TITLE = /^(spring|fall|winter|summer)\s+20\d{2}$/i;

function classify(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'video';
  if (u.includes('coursera.org') || u.includes('edx.org') || u.includes('udacity.com')) return 'course';
  if (u.includes('ocw.mit.edu') || u.includes('see.stanford.edu') || /\bcs\d{3,4}\b/.test(u)) return 'course';
  if (u.includes('arxiv.org') || u.endsWith('.pdf')) return 'paper';
  return 'link';
}

function normalizeHeading(h) {
  return h
    .replace(/[^\w\s&/-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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
  /** @type {{heading:string,body:string[]}[]} */
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

function keepLink(title) {
  const t = title.trim().replace(/\s+/g, ' ');
  if (!t || t.length < 4 || t.length > 120) return false;
  if (LOW_SIGNAL_TITLE.test(t)) return false;
  if (SEMESTER_TITLE.test(t)) return false;
  if (/^youtube-\d{4}$/i.test(t)) return false;
  return true;
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
      if (!keepLink(title)) continue;
      if (seen.has(url)) continue;
      if (url.startsWith('#') || url.includes('badge') || url.includes('shields.io')) continue;
      seen.add(url);
      links.push({ title, url, kind: classify(url) });
    }
  }
  return links;
}

function tagsForHeading(heading, sectionToTags) {
  const key = normalizeHeading(heading);
  if (sectionToTags[key]) return sectionToTags[key];
  // Fuzzy: heading contains a mapped key (e.g. nested DB subsections).
  for (const [pattern, tags] of Object.entries(sectionToTags)) {
    if (key.includes(pattern) || pattern.includes(key)) return tags;
  }
  return null;
}

function loadCurated() {
  if (!existsSync(CURATED)) return {};
  const raw = JSON.parse(readFileSync(CURATED, 'utf8'));
  /** @type {Record<string, {title:string,url:string,kind:string,source:string}[]>} */
  const byTag = {};
  for (const [tag, items] of Object.entries(raw.byTag ?? {})) {
    byTag[tag] = items.map(r => ({
      title: r.title,
      url: r.url,
      kind: r.kind ?? classify(r.url),
      source: r.source ?? 'curated',
    }));
  }
  return byTag;
}

function main() {
  /** @type {Record<string, {title:string,url:string,kind:string,source:string}[]>} */
  const harvested = {};
  const seenUrls = new Set();

  for (const src of SOURCES) {
    const md = readSource(src);
    if (src.wholeFileTags) {
      const links = extractLinks(md.split(/\r?\n/));
      for (const link of links) {
        if (seenUrls.has(link.url)) continue;
        seenUrls.add(link.url);
        for (const tag of src.wholeFileTags) {
          (harvested[tag] ??= []).push({ ...link, source: src.repo });
        }
      }
      continue;
    }

    const sections = parseSections(md);
    for (const sec of sections) {
      const tags = tagsForHeading(sec.heading, src.sectionToTags);
      if (!tags) continue;
      const links = extractLinks(sec.body);
      for (const link of links) {
        if (seenUrls.has(link.url)) continue;
        seenUrls.add(link.url);
        for (const tag of tags) {
          (harvested[tag] ??= []).push({ ...link, source: src.repo });
        }
      }
    }
  }

  const curated = loadCurated();
  const allTags = new Set([...Object.keys(harvested), ...Object.keys(curated)]);
  const out = {};

  for (const tag of [...allTags].sort()) {
    const merged = [];
    const seen = new Set();
    for (const link of [...(curated[tag] ?? []), ...(harvested[tag] ?? [])]) {
      if (seen.has(link.url)) continue;
      seen.add(link.url);
      merged.push(link);
      if (merged.length >= PER_TAG_CAP) break;
    }
    if (merged.length) out[tag] = merged;
  }

  const payload = {
    _meta: {
      source: SOURCES.map(s => s.repo),
      curated: 'src/data/curated-external-resources.json',
      generated_by: 'scripts/harvest-external-resources.mjs',
      cap_per_tag: PER_TAG_CAP,
    },
    byTag: out,
  };

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  const totalLinks = Object.values(out).reduce((n, arr) => n + arr.length, 0);
  console.log(`wrote ${OUT}`);
  console.log(`  ${Object.keys(out).length} tags, ${totalLinks} links`);
  console.log(`  tags: ${Object.keys(out).join(', ')}`);
}

main();