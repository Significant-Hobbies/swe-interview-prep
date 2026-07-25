#!/usr/bin/env node
/**
 * Build src/data/library/concept-index.json by string-matching concepts
 * against library section titles + content. Top 3 sections per concept.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LIBRARY_DIR = join(ROOT, 'src', 'data', 'library');
const CONCEPTS_PATH = join(ROOT, 'src', 'data', 'concepts.json');
const OUT_PATH = join(LIBRARY_DIR, 'concept-index.json');

/** An own-title hit scores 10, an ancestor-heading hit 4. */
const MIN_SCORE = 8;

function loadJSON(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

// Manual keyword expansions for concepts where the name doesn't surface in docs.
const KEYWORDS = {
  'array-hashing': ['hash', 'hashmap', 'hashing', 'frequency'],
  'two-pointers': ['two pointer', 'two-pointer'],
  'sliding-window': ['sliding window'],
  'binary-search': ['binary search'],
  'linked-list': ['linked list'],
  tries: ['trie', 'prefix tree'],
  heap: ['heap', 'priority queue'],
  'union-find': ['union find', 'disjoint set'],
  'dp-1d': ['dynamic programming', 'memoization'],
  'dp-2d': ['dynamic programming', 'knapsack', 'edit distance'],
  'shortest-path': ['dijkstra', 'bellman', 'shortest path'],
  'load-balancing': ['load balancer', 'load balancing'],
  'consistent-hashing': ['consistent hashing', 'consistent hash'],
  'cap-theorem': ['cap theorem', 'consistency model', 'pacelc'],
  consensus: ['raft', 'paxos', 'consensus'],
  'message-queues': ['message queue', 'kafka', 'rabbitmq'],
  'rate-limiting': ['rate limit', 'throttling', 'token bucket'],
  'storage-retrieval': ['lsm', 'b-tree', 'storage engine', 'wal'],
  'search-discovery': ['inverted index', 'search', 'autocomplete'],
  replication: ['replication', 'leader follower', 'multi-leader'],
  sharding: ['sharding', 'partition'],
  caching: ['cache', 'caching', 'eviction'],
  'streaming-media': ['cdn', 'video stream', 'transcoding'],
  'social-media': ['feed', 'timeline', 'fan-out'],
  'messaging-realtime': ['websocket', 'real-time', 'chat system'],
  'collaboration-productivity': ['crdt', 'operational transform', 'collaborative'],
  'monitoring-analytics': ['observability', 'metrics', 'tracing', 'sli', 'slo'],
  'api-design': ['rest api', 'grpc', 'pagination'],
  'auth-systems': ['oauth', 'jwt', 'authentication', 'authorization'],
  'object-modeling': ['oop', 'class diagram', 'object oriented'],
  'state-management': ['state machine', 'state pattern'],
  'strategy-pattern': ['strategy pattern'],
  'observer-pattern': ['observer pattern', 'pub/sub', 'pubsub'],
  'factory-creational': ['factory pattern', 'builder pattern', 'singleton'],
  'decorator-structural': ['decorator pattern', 'adapter pattern'],
  'concurrency-design': ['concurrency', 'mutex', 'thread safe'],
  'command-chain': ['command pattern', 'chain of responsibility'],
};

function tokens(name, id) {
  const extra = KEYWORDS[id] || [];
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
  return [base, ...extra.map((k) => k.toLowerCase())];
}

/**
 * Substring matching produced pure noise — `rag` matched "local stoRAGe",
 * `consensus` matched nothing useful. Queries must land on word boundaries.
 */
function countMatches(text, query) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'g');
  return (text.match(re) || []).length;
}

function score(text, queries) {
  const lower = text.toLowerCase();
  let s = 0;
  for (const q of queries) {
    // Two-letter queries match far too much to be evidence of anything.
    if (!q || q.length < 3) continue;
    s += Math.min(5, countMatches(lower, q));
  }
  return s;
}

/**
 * Depth-first walk over `sections[].children`. The indexer used to read only
 * the top level, which meant it saw 2 of system-design's 305 sections while
 * `shared/lib/ingest-library.mjs` and `RepoView.tsx` both recursed.
 */
function flattenSections(sections, trail = [], out = []) {
  for (const section of sections || []) {
    out.push({ section, trail });
    if (section.children?.length) {
      flattenSections(section.children, [...trail, section.title || ''], out);
    }
  }
  return out;
}

function makeSnippet(content, query) {
  if (!content) return '';
  const lower = content.toLowerCase();
  const idx = Math.max(0, lower.indexOf(query.toLowerCase()));
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + 200);
  return `${(start > 0 ? '…' : '') + content.slice(start, end).replace(/\s+/g, ' ').trim()}…`;
}

const concepts = loadJSON(CONCEPTS_PATH).concepts;
const manifest = loadJSON(join(LIBRARY_DIR, 'manifest.json'));

const index = {};
let totalMatches = 0;

for (const concept of concepts) {
  const queries = tokens(concept.name, concept.id);
  const candidates = [];

  for (const repo of manifest.repos) {
    const contentPath = join(LIBRARY_DIR, repo.id, 'content.json');
    if (!existsSync(contentPath)) continue;
    const content = loadJSON(contentPath);
    const sections = flattenSections(content.sections);

    for (const { section, trail } of sections) {
      const title = section.title || '';
      const body = section.content || '';
      if (!body.trim()) continue;
      // A body-only hit is not evidence that a section is *about* a concept,
      // so a heading match is mandatory: the section's own title, or failing
      // that an ancestor heading, which is weaker evidence.
      const ownScore = score(title, queries) * 10;
      const trailScore = ownScore ? 0 : score(trail.join(' \n '), queries) * 4;
      if (ownScore === 0 && trailScore === 0) continue;
      const bodyScore = Math.min(5, score(body, queries));
      const total = ownScore + trailScore + bodyScore;
      if (total < MIN_SCORE) continue;
      candidates.push({
        repoId: repo.id,
        repoName: repo.name,
        sectionId: section.id,
        title,
        snippet: makeSnippet(body, queries[0]),
        score: total,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, 3).map((c) => ({
    repoId: c.repoId,
    repoName: c.repoName,
    sectionId: c.sectionId,
    title: c.title,
    snippet: c.snippet,
  }));
  if (top.length > 0) {
    index[concept.id] = top;
    totalMatches += top.length;
  }
}

writeFileSync(OUT_PATH, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Wrote ${OUT_PATH}`);
console.log(`Concepts indexed: ${Object.keys(index).length}/${concepts.length}`);
console.log(`Total section matches: ${totalMatches}`);
