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
      'system design, scalability, data handling': [
        'system-design',
        'distributed-systems',
        'scalability',
      ],
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
  // --- sarthakagrawal927/dev_learning submodule hoard ---
  {
    repo: 'logancyang/my-cs-degree',
    file: 'my-cs-degree.md',
    sectionToTags: {
      'general knowledge courses': ['foundations', 'dsa', 'mathematics'],
      'project courses': ['foundations', 'ai-systems'],
    },
  },
  {
    repo: 'ashishps1/awesome-low-level-design',
    file: 'awesome-lld.md',
    sectionToTags: {
      'oop fundamentals': ['low-level-design'],
      'class relationships': ['low-level-design'],
      'design principles': ['low-level-design'],
      'design patterns': ['low-level-design'],
      'concurrency and multi-threading concepts': ['low-level-design', 'backend'],
      'low level design interview problems': ['low-level-design'],
    },
  },
  {
    repo: 'ashishps1/awesome-system-design-resources',
    file: 'awesome-sd-res.md',
    sectionToTags: {
      'core concepts': ['system-design'],
      'networking fundamentals': ['http', 'system-design'],
      'database fundamentals': ['databases', 'system-design'],
      'caching fundamentals': ['caching', 'system-design'],
      'distributed system and microservices': ['distributed-systems', 'system-design'],
      'system design interview problems': ['system-design'],
    },
  },
  {
    repo: 'armankhondker/awesome-ai-ml-resources',
    file: 'awesome-ai-ml.md',
    sectionToTags: {
      courses: ['ai-systems', 'training'],
      books: ['ai-systems'],
      'ai/ml roadmap': ['ai-systems', 'training'],
      'ai/ml key concepts': ['ai-systems'],
      'ai/ml building blocks': ['ai-systems', 'training'],
    },
  },
  {
    repo: 'InterviewReady/system-design-resources',
    file: 'ir-sd.md',
    wholeFileTags: ['system-design', 'distributed-systems', 'caching'],
  },
  {
    repo: 'karanpratapsingh/system-design',
    file: 'karan-sd.md',
    wholeFileTags: ['system-design'],
  },
  {
    repo: 'ByteByteGoHq/system-design-101',
    file: 'bytebytego-sd.md',
    wholeFileTags: ['system-design'],
  },
  {
    repo: 'Engineer1999/A-Curated-List-of-ML-System-Design-Case-Studies',
    file: 'ml-sd-cases.md',
    sectionToTags: {
      'real-world ml systems': ['system-design', 'ai-systems'],
    },
  },
  {
    repo: 'yingjunwu/DBMS-Indexology',
    file: 'dbms-indexology.md',
    wholeFileTags: ['databases', 'storage-engines'],
  },
  {
    repo: 'arpitbbhayani/system-design-questions',
    file: 'sd-questions.md',
    wholeFileTags: ['system-design'],
  },
  {
    repo: 'Olshansk/interview',
    file: 'interview-help.md',
    wholeFileTags: ['dsa', 'behavioral', 'system-design'],
  },
  {
    repo: 'MichaelCade/90DaysOfDevOps',
    file: '90days-devops.md',
    wholeFileTags: ['backend', 'system-design'],
  },
  {
    repo: 'bregman-arie/devops-exercises',
    file: 'devops-exercises.md',
    wholeFileTags: ['backend', 'system-design'],
  },
];

/** Multi-file sources (personal hoards, notes repos). */
const MULTI_FILE_SOURCES = [
  {
    repo: 'sarthakagrawal927/dev_learning',
    files: [
      {
        path: 'assorted_list.md',
        wholeFileTags: ['dsa', 'system-design', 'databases', 'storage-engines', 'rate-limiting'],
      },
      {
        path: 'databases/readme.md',
        wholeFileTags: ['databases', 'storage-engines'],
      },
      {
        path: 'apex.md',
        sectionToTags: {
          courses: [
            'foundations',
            'ai-systems',
            'training',
            'system-design',
            'distributed-systems',
            'runtime',
            'dsa',
          ],
          'mathematics & algorithms': ['dsa', 'mathematics'],
          'systems & architecture': [
            'system-design',
            'distributed-systems',
            'databases',
            'storage-engines',
            'backend',
          ],
          'operating systems': ['runtime', 'backend'],
          'computer networks': ['http', 'backend'],
          'concurrency & parallelism': ['backend', 'distributed-systems'],
          'high-performance databases': ['databases', 'storage-engines'],
          'scalability & load management': ['scalability', 'system-design'],
          'observability & reliability': ['observability', 'backend'],
          'security best practices': ['auth', 'backend'],
          'cloud infrastructure': ['backend', 'system-design'],
          'performance engineering': ['runtime', 'backend', 'scalability'],
          'ai for personalization & rag systems': ['rag', 'ai-systems', 'llm-apps'],
          'microservices architecture': ['system-design', 'backend'],
        },
      },
    ],
  },
];

/** dev_learning .gitmodules path → tags (hiring/company lists intentionally skipped). */
const GITMODULE_TAGS = {
  'resources/my-cs-degree': ['foundations'],
  'resources/system-design-resources': ['system-design'],
  'resources/system-design': ['system-design'],
  'resources/system-design-101': ['system-design'],
  'resources/system-design-q': ['system-design', 'distributed-systems'],
  'resources/awesome-ai-ml-resources': ['ai-systems', 'training'],
  'resources/low-level-design': ['low-level-design'],
  'resources/ml-system-design-case-studies': ['system-design', 'ai-systems'],
  'resources/interview_help': ['dsa', 'behavioral', 'system-design'],
  'resources/90DaysOfDevOps': ['backend', 'system-design'],
  'resources/university': ['foundations'],
  'resources/Resources-for-Beginner-Bug-Bounty-Hunters': ['auth'],
  'databases/DBMS-Indexology': ['databases', 'storage-engines'],
  'questionnaires/system-design': ['system-design'],
  'questionnaires/grokking-oop': ['low-level-design'],
  'questionnaires/devops-exercises': ['backend', 'system-design'],
  'questionnaires/Back-End-Developer-Interview-Questions': ['backend'],
  'questionnaires/javascript-interview-questions': ['foundations'],
  'questionnaires/reactjs-interview-questions': ['foundations'],
  'questionnaires/frontend-end-interview-handbook': ['foundations'],
  'questionnaires/js-advanced': ['foundations'],
  'questionnaires/test-your-sysadmin-skills': ['backend', 'runtime'],
  'questionnaires/Security_Engineer_Interview_Questions': ['auth'],
};

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const INLINE_URL_RE = /([^\n(]{4,100}?)\s*\((https?:\/\/[^)]+)\)/g;
const BARE_URL_RE = /(?:^|\s)(https?:\/\/[^\s)]+)/g;
const HEADING_RE = /^(#{2,4})\s+(.+?)\s*$/;
const LOW_SIGNAL_TITLE =
  /^(youtube|videos?|lectures?|watch lectures|notes?(-\d{4})?|readme|home|website|link|here|click here|table of contents|contents|introduction|related|misc|legend)$/i;
const SEMESTER_TITLE = /^(spring|fall|winter|summer)\s+20\d{2}$/i;

function classify(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'video';
  if (u.includes('coursera.org') || u.includes('edx.org') || u.includes('udacity.com'))
    return 'course';
  if (
    u.includes('ocw.mit.edu') ||
    u.includes('csail.mit.edu') ||
    u.includes('see.stanford.edu') ||
    /\bcs\d{3,4}\b/.test(u)
  ) {
    return 'course';
  }
  if (u.includes('arxiv.org') || u.endsWith('.pdf')) return 'paper';
  return 'link';
}

function titleFromUrl(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const slug = pathname.replace(/\/$/, '').split('/').filter(Boolean).pop() ?? '';
    const base = slug ? slug.replace(/[-_]/g, ' ') : hostname.replace(/^www\./, '');
    return base.slice(0, 80) || url;
  } catch {
    return url;
  }
}

function normalizeHeading(h) {
  return h
    .replace(/[^\w\s&/-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function readSource({ repo, file }, repoPath = 'README.md') {
  const cacheKey = `${repo.replace('/', '__')}__${repoPath.replace(/\//g, '__')}`;
  const path = resolve(TMP, file ?? `${cacheKey}.md`);
  if (existsSync(path)) return readFileSync(path, 'utf8');
  mkdirSync(TMP, { recursive: true });
  const buf = execSync(`gh api repos/${repo}/contents/${repoPath} -q .content`, {
    encoding: 'utf8',
  });
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

function pushLink(links, seen, title, url) {
  const cleanUrl = url.replace(/[.,;)]+$/, '');
  if (!cleanUrl.startsWith('http')) return;
  if (
    cleanUrl.includes('badge') ||
    cleanUrl.includes('shields.io') ||
    cleanUrl.includes('camo.githubusercontent.com')
  ) {
    return;
  }
  if (seen.has(cleanUrl)) return;
  let cleanTitle = title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[-*]\s*/, '');
  if (!keepLink(cleanTitle)) cleanTitle = titleFromUrl(cleanUrl);
  if (!keepLink(cleanTitle)) return;
  seen.add(cleanUrl);
  links.push({ title: cleanTitle, url: cleanUrl, kind: classify(cleanUrl) });
}

function extractLinks(body) {
  const links = [];
  const seen = new Set();
  const lines = Array.isArray(body) ? body : body.split(/\r?\n/);
  for (const line of lines) {
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(line)) !== null) {
      pushLink(links, seen, m[1], m[2]);
    }
    INLINE_URL_RE.lastIndex = 0;
    while ((m = INLINE_URL_RE.exec(line)) !== null) {
      pushLink(links, seen, m[1], m[2]);
    }
    if (!line.includes('](')) {
      BARE_URL_RE.lastIndex = 0;
      while ((m = BARE_URL_RE.exec(line)) !== null) {
        pushLink(links, seen, titleFromUrl(m[1]), m[1]);
      }
    }
  }
  return links;
}

function parseGitmodules(md) {
  /** @type {{path:string,url:string}[]} */
  const entries = [];
  let current = {};
  for (const line of md.split(/\r?\n/)) {
    if (line.startsWith('[submodule')) {
      if (current.path && current.url) entries.push(current);
      current = {};
    } else if (line.startsWith('path = ')) current.path = line.slice(7).trim();
    else if (line.startsWith('url = ')) {
      let url = line.slice(6).trim();
      if (url.endsWith('.git')) url = url.slice(0, -4);
      current.url = url;
    }
  }
  if (current.path && current.url) entries.push(current);
  return entries;
}

function harvestDevLearningSubmodules(harvested, seenUrls) {
  const md = readSource(
    { repo: 'sarthakagrawal927/dev_learning', file: 'dev-learning-gitmodules.txt' },
    '.gitmodules'
  );
  const hoardRoot = {
    title: 'dev_learning — personal learning hoard',
    url: 'https://github.com/sarthakagrawal927/dev_learning',
    kind: 'link',
    source: 'sarthakagrawal927/dev_learning',
  };
  for (const tag of ['foundations', 'system-design']) {
    if (!seenUrls.has(hoardRoot.url)) {
      seenUrls.add(hoardRoot.url);
      (harvested[tag] ??= []).push(hoardRoot);
    }
  }

  for (const { path: subPath, url } of parseGitmodules(md)) {
    const tags = GITMODULE_TAGS[subPath];
    if (!tags) continue;
    const name = subPath.split('/').pop()?.replace(/-/g, ' ') ?? subPath;
    const link = {
      title: `dev_learning › ${name}`,
      url,
      kind: 'link',
      source: 'sarthakagrawal927/dev_learning#submodule',
    };
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    for (const tag of tags) {
      (harvested[tag] ??= []).push(link);
    }
  }
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
    byTag[tag] = items.map((r) => ({
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

  function ingestMarkdown(md, src, { wholeFileTags, sectionToTags }) {
    if (wholeFileTags) {
      for (const link of extractLinks(md)) {
        if (seenUrls.has(link.url)) continue;
        seenUrls.add(link.url);
        for (const tag of wholeFileTags) {
          (harvested[tag] ??= []).push({ ...link, source: src });
        }
      }
      return;
    }
    for (const sec of parseSections(md)) {
      const tags = tagsForHeading(sec.heading, sectionToTags);
      if (!tags) continue;
      for (const link of extractLinks(sec.body)) {
        if (seenUrls.has(link.url)) continue;
        seenUrls.add(link.url);
        for (const tag of tags) {
          (harvested[tag] ??= []).push({ ...link, source: src });
        }
      }
    }
  }

  for (const src of SOURCES) {
    const md = readSource(src);
    ingestMarkdown(md, src.repo, src);
  }

  for (const mfs of MULTI_FILE_SOURCES) {
    for (const file of mfs.files) {
      const md = readSource(
        { repo: mfs.repo, file: `dev-learning__${file.path.replace(/\//g, '__')}.md` },
        file.path
      );
      ingestMarkdown(md, mfs.repo, file);
    }
  }

  harvestDevLearningSubmodules(harvested, seenUrls);

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
      source: [
        ...SOURCES.map((s) => s.repo),
        ...MULTI_FILE_SOURCES.map((s) => s.repo),
        'sarthakagrawal927/dev_learning#submodules',
      ],
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
