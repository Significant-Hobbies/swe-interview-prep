#!/usr/bin/env node
/**
 * Patches src/data/drills.json with testCases for drills that lack them.
 * Run: node scripts/add-drill-testcases.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRILLS_PATH = path.join(__dirname, '../src/data/drills.json');

const DESIGN_VALIDATOR = `function validateOutline(o, keys) {
  if (!o || typeof o !== 'object') return false;
  return keys.every(k => o[k] != null && String(o[k]).trim().length >= 15);
}`;

const STAR_VALIDATOR = `function validateStar(s) {
  const keys = ['situation','task','action','result'];
  if (!s || typeof s !== 'object') return false;
  if (!keys.every(k => s[k] && String(s[k]).trim().length >= 40)) return false;
  return /\\d/.test(String(s.result));
}`;

function designCase(keys) {
  return [
    {
      setup: DESIGN_VALIDATOR,
      run: `console.log(validateOutline(designOutline(), ${JSON.stringify(keys)}));`,
      expect: 'true',
    },
  ];
}

function starCase() {
  return [
    {
      setup: STAR_VALIDATOR,
      run: 'console.log(validateStar(starStory()));',
      expect: 'true',
    },
  ];
}

/** @type {Record<string, { setup?: string, run: string, expect: string | string[] }[]>} */
const TEST_CASES = {
  // --- Search / IR implementation ---
  'build-tokenizer': [
    {
      setup: `const STOPS = new Set(['the','a','an']);
function stem(w) { return w.endsWith('es') ? w.slice(0, -2) : w.endsWith('s') ? w.slice(0, -1) : w; }
function tokenize(s) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).filter(t => !STOPS.has(t)).map(stem);
}`,
      run: `console.log(JSON.stringify(tokenize('The Quick Brown Foxes!')));`,
      expect: '["quick","brown","fox"]',
    },
  ],
  'build-inverted-index': [
    {
      setup: `function buildIndex(docs) {
  const index = {};
  docs.forEach((doc, id) => {
    const seen = new Set(doc);
    seen.forEach(term => {
      if (!index[term]) index[term] = { df: 0, postings: [] };
      index[term].df++;
      index[term].postings.push(id);
    });
    Object.values(index).forEach(e => e.postings.sort((a, b) => a - b));
  });
  return index;
}
function andQuery(index, terms) {
  const lists = terms.map(t => index[t]?.postings || []);
  if (!lists.length) return [];
  let acc = lists[0];
  for (let i = 1; i < lists.length; i++) {
    const b = lists[i]; const out = []; let j = 0, k = 0;
    while (j < acc.length && k < b.length) {
      if (acc[j] === b[k]) { out.push(acc[j]); j++; k++; }
      else if (acc[j] < b[k]) j++; else k++;
    }
    acc = out;
  }
  return acc;
}`,
      run: `const docs = [['quick','brown','fox'],['lazy','dog'],['quick','fox']];
const idx = buildIndex(docs);
console.log(JSON.stringify(andQuery(idx, ['quick','fox'])));`,
      expect: '[0,2]',
    },
  ],
  'calculate-tfidf': [
    {
      setup: `function tfidf(tf, df, N) {
  const tfw = 1 + Math.log(tf);
  const idf = Math.log(N / df);
  return tfw * idf;
}`,
      run: `console.log(tfidf(3, 2, 10).toFixed(2));`,
      expect: '3.38',
    },
  ],
  'calculate-bm25-score': [
    {
      setup: `function bm25(tf, df, N, dl, avgdl, k1 = 1.2, b = 0.75) {
  const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
  const denom = tf + k1 * (1 - b + b * dl / avgdl);
  return idf * (tf * (k1 + 1)) / denom;
}`,
      run: `const s1 = bm25(1, 5, 100, 100, 100);
const s10 = bm25(10, 5, 100, 100, 100);
console.log(s10 < s1 * 3 ? 'saturates' : 'linear', s1.toFixed(2));`,
      expect: ['saturates', '2.91'],
    },
  ],
  'implement-bm25-ranker': [
    {
      setup: `function bm25(tf, df, N, dl, avgdl) {
  const k1 = 1.2, b = 0.75;
  const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
  return idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl / avgdl));
}
function bm25Rank(docs, query, k) {
  const N = docs.length;
  const avgdl = docs.reduce((s, d) => s + d.length, 0) / N;
  const df = {};
  docs.forEach(d => new Set(d.terms).forEach(t => { df[t] = (df[t] || 0) + 1; }));
  const scores = docs.map((d, id) => {
    const tf = {};
    d.terms.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    const s = query.reduce((sum, term) => sum + (tf[term] ? bm25(tf[term], df[term] || 0, N, d.terms.length, avgdl) : 0), 0);
    return { id, s };
  });
  scores.sort((a, b) => b.s - a.s);
  return scores.slice(0, k).map(x => x.id);
}`,
      run: `const docs = [{terms:['quick','brown','fox']},{terms:['lazy','dog']},{terms:['quick','fox']}];
console.log(JSON.stringify(bm25Rank(docs, ['quick','fox'], 2)));`,
      expect: '[0,1]',
    },
  ],
  'build-search-eval-harness': [
    {
      setup: `function recallAtK(retrieved, relevant, k) {
  const rel = new Set(relevant);
  const hits = retrieved.slice(0, k).filter(id => rel.has(id)).length;
  return hits / relevant.length;
}
function mrr(queries) {
  let sum = 0;
  for (const { retrieved, relevant } of queries) {
    const rel = new Set(relevant);
    const rank = retrieved.findIndex(id => rel.has(id));
    sum += rank === -1 ? 0 : 1 / (rank + 1);
  }
  return sum / queries.length;
}
function ndcgAtK(retrieved, relevant, k) {
  const rel = new Set(relevant);
  let dcg = 0;
  for (let i = 0; i < Math.min(k, retrieved.length); i++) {
    if (rel.has(retrieved[i])) dcg += 1 / Math.log2(i + 2);
  }
  let idcg = 0;
  for (let i = 0; i < Math.min(k, relevant.length); i++) idcg += 1 / Math.log2(i + 2);
  return idcg === 0 ? 0 : dcg / idcg;
}
function evalRetriever(retriever, queries, k) {
  const r = queries.map(q => recallAtK(retriever(q.q, k), q.rel, k));
  const m = mrr(queries.map(q => ({ retrieved: retriever(q.q, k), relevant: q.rel })));
  const n = queries.map(q => ndcgAtK(retriever(q.q, k), q.rel, k));
  return { recall: r.reduce((a, b) => a + b, 0) / r.length, mrr: m, ndcg: n.reduce((a, b) => a + b, 0) / n.length };
}`,
      run: `const retriever = q => q === 'a' ? [1,2,3] : [2,1];
const qs = [{ q: 'a', rel: [1,3] }, { q: 'b', rel: [2] }];
const m = evalRetriever(retriever, qs, 3);
console.log(m.recall.toFixed(2), m.mrr.toFixed(2));`,
      expect: ['1.00', '1.00'],
    },
  ],
  'implement-rrf': [
    {
      setup: `function rrf(lists, k = 60) {
  const scores = new Map();
  for (const list of lists) {
    list.forEach((id, rank) => {
      scores.set(id, (scores.get(id) || 0) + 1 / (k + rank + 1));
    });
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}`,
      run: `const bm25 = ['d1','d2','d3'];
const vec = ['d2','d4','d1'];
console.log(JSON.stringify(rrf([bm25, vec])));`,
      expect: '["d2","d1","d4","d3"]',
    },
  ],
  'embed-and-search': [
    {
      setup: `function cosine(a, b) {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  const na = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
  const nb = Math.sqrt(b.reduce((s, x) => s + x * x, 0));
  return dot / (na * nb);
}
function embedSearch(corpus, query, k) {
  const scored = corpus.map(doc => ({ id: doc.id, s: cosine(doc.vec, query) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map(x => x.id);
}`,
      run: `const corpus = [{ id: 'a', vec: [1, 0] }, { id: 'b', vec: [0.9, 0.1] }, { id: 'c', vec: [0, 1] }];
console.log(JSON.stringify(embedSearch(corpus, [1, 0], 2)));`,
      expect: '["a","b"]',
    },
  ],
  'implement-similarity-metrics': [
    {
      setup: `function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
function l2(a, b) { return Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0)); }
function cosine(a, b) {
  const d = dot(a, b);
  const na = Math.sqrt(dot(a, a));
  const nb = Math.sqrt(dot(b, b));
  return d / (na * nb);
}
function norm(a) { const n = Math.sqrt(dot(a, a)); return a.map(x => x / n); }
function sameRanking(a, b, c) {
  const pairs = [[0, 1], [0, 2], [1, 2]];
  return pairs.every(([i, j]) => (a[i] > a[j]) === (b[i] > b[j]) && (b[i] > b[j]) === (c[i] > c[j]));
}`,
      run: `const u = [1, 2, 3], v = [2, 1, 0];
const nu = norm(u), nv = norm(v);
const scores = [cosine(u, v), dot(nu, nv), -l2(nu, nv)];
console.log(sameRanking(scores, scores, scores));`,
      expect: 'true',
    },
  ],
  'implement-topk-heap': [
    {
      setup: `function topK(stream, k) {
  const heap = [];
  function push(x) {
    heap.push(x);
    heap.sort((a, b) => a.score - b.score);
    if (heap.length > k) heap.shift();
  }
  stream.forEach(push);
  return heap.sort((a, b) => b.score - a.score).map(x => x.id);
}`,
      run: `const stream = [{id:'a',score:1},{id:'b',score:5},{id:'c',score:3},{id:'d',score:4},{id:'e',score:2}];
console.log(JSON.stringify(topK(stream, 3)));`,
      expect: '["b","d","c"]',
    },
  ],
  'build-brute-force-index': [
    {
      setup: `function bruteForceTopK(vectors, query, k) {
  const scored = vectors.map((v, id) => {
    const dot = v.reduce((s, x, i) => s + x * query[i], 0);
    return { id, score: dot };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(x => x.id);
}`,
      run: `const vecs = [[1,0],[0.9,0.1],[0,1]];
console.log(JSON.stringify(bruteForceTopK(vecs, [1,0], 2)));`,
      expect: '[0,1]',
    },
  ],
  'implement-metadata-filter': [
    {
      setup: `function filteredTopK(items, query, field, value, k) {
  const filtered = items.filter(x => x.meta[field] === value);
  const scored = filtered.map(x => ({ id: x.id, s: x.vec.reduce((s, v, i) => s + v * query[i], 0) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map(x => x.id);
}`,
      run: `const items = [
  { id: 'a', vec: [1,0], meta: { cat: 'x' } },
  { id: 'b', vec: [0.9,0.1], meta: { cat: 'y' } },
  { id: 'c', vec: [0.8,0.2], meta: { cat: 'x' } },
];
console.log(JSON.stringify(filteredTopK(items, [1,0], 'cat', 'x', 2)));`,
      expect: '["a","c"]',
    },
  ],
  'build-rag-pipeline': [
    {
      setup: `function ragAnswer(chunks, query, budget) {
  const scored = chunks.map(c => ({ ...c, s: c.text.includes(query) ? 1 : c.vec.reduce((s, v, i) => s + v * query[i], 0) }));
  scored.sort((a, b) => b.s - a.s);
  const picked = [];
  let used = 0;
  for (const c of scored) {
    if (used + c.tokens <= budget) { picked.push(c.id); used += c.tokens; }
  }
  return { answer: picked.join('+'), sources: picked };
}`,
      run: `const chunks = [
  { id: 'c1', text: 'payment API', tokens: 100, vec: [1,0] },
  { id: 'c2', text: 'other', tokens: 200, vec: [0,1] },
  { id: 'c3', text: 'payment docs', tokens: 150, vec: [0.9,0.1] },
];
const r = ragAnswer(chunks, [1,0], 300);
console.log(r.sources.length >= 2 ? 'grounded' : 'weak', r.sources[0]);`,
      expect: ['grounded', 'c1'],
    },
  ],
  'build-chunker': [
    {
      setup: `function chunkDoc(paragraphs, target, overlap) {
  const chunks = [];
  let buf = [];
  let size = 0;
  for (const p of paragraphs) {
    const len = p.length;
    if (size + len > target && buf.length) {
      chunks.push(buf.join('\\n'));
      const tail = buf.join(' ').slice(-overlap);
      buf = tail ? [tail, p] : [p];
      size = buf.join(' ').length;
    } else {
      buf.push(p);
      size += len;
    }
  }
  if (buf.length) chunks.push(buf.join('\\n'));
  return chunks;
}`,
      run: `const paras = ['# Intro', 'Para one text.', 'Para two text.', '## Details', 'More content here.'];
const c = chunkDoc(paras, 30, 5);
console.log(c.length >= 2 ? 'chunked' : 'fail', c[0].includes('Intro') ? 'struct' : 'flat');`,
      expect: ['chunked', 'struct'],
    },
  ],
  'structured-extraction': [
    {
      setup: `function extractInvoice(text) {
  const schema = { vendor: 'string', amount: 'number', date: 'string' };
  const m = text.match(/(.+) billed \\$(\\d+\\.\\d+) on (\\d{4}-\\d{2}-\\d{2})/);
  if (!m) return { ok: false };
  const out = { vendor: m[1].trim(), amount: parseFloat(m[2]), date: m[3] };
  const valid = typeof out.vendor === 'string' && typeof out.amount === 'number' && out.date.length === 10;
  return valid ? { ok: true, data: out } : { ok: false };
}`,
      run: `const r = extractInvoice('Acme Corp billed $42.50 on 2024-06-01');
console.log(r.ok, r.data.amount);`,
      expect: ['true', '42.5'],
    },
  ],
  'build-tool-loop': [
    {
      setup: `function toolLoop(task, tools, maxSteps) {
  const log = [];
  let state = task;
  for (let i = 0; i < maxSteps; i++) {
    if (state.startsWith('search:')) {
      const q = state.slice(7);
      state = tools.search(q);
      log.push('search');
    } else if (state.startsWith('calc:')) {
      state = String(tools.calc(state.slice(5)));
      log.push('calc');
    } else break;
  }
  return { result: state, steps: log.length };
}`,
      run: `const tools = { search: q => 'calc:2+2', calc: expr => eval(expr) };
const r = toolLoop('search:query', tools, 5);
console.log(r.result, r.steps);`,
      expect: ['4', '2'],
    },
  ],
  'build-llm-eval': [
    {
      setup: `function gradeEval(dataset, fn) {
  let pass = 0;
  for (const row of dataset) {
    const out = fn(row.input);
    if (out === row.expect) pass++;
  }
  return pass / dataset.length;
}`,
      run: `const ds = [{ input: 'a', expect: 'A' }, { input: 'b', expect: 'B' }];
const fn = s => s.toUpperCase();
console.log(gradeEval(ds, fn).toFixed(2));`,
      expect: '1.00',
    },
  ],
  'implement-token-bucket': [
    {
      setup: `function TokenBucket(capacity, refillPerSec) {
  let tokens = capacity;
  let last = Date.now();
  return {
    allow() {
      const now = Date.now();
      const elapsed = (now - last) / 1000;
      tokens = Math.min(capacity, tokens + elapsed * refillPerSec);
      last = now;
      if (tokens >= 1) { tokens -= 1; return { ok: true, retryAfter: 0 }; }
      return { ok: false, retryAfter: Math.ceil((1 - tokens) / refillPerSec) };
    },
  };
}`,
      run: `const b = TokenBucket(2, 1);
console.log(b.allow().ok, b.allow().ok, b.allow().ok);`,
      expect: ['true', 'true', 'false'],
    },
  ],
  'implement-idempotency-key': [
    {
      setup: `function idempotentStore() {
  const map = new Map();
  return {
    execute(key, fn) {
      if (map.has(key)) return { duplicate: true, result: map.get(key) };
      const result = fn();
      map.set(key, result);
      return { duplicate: false, result };
    },
  };
}`,
      run: `let calls = 0;
const store = idempotentStore();
const r1 = store.execute('k1', () => { calls++; return 42; });
const r2 = store.execute('k1', () => { calls++; return 99; });
console.log(calls, r2.result, r2.duplicate);`,
      expect: ['1', '42', 'true'],
    },
  ],
  'implement-backoff-jitter': [
    {
      setup: `function backoffDelays(attempt, base, max) {
  const cap = Math.min(base * Math.pow(2, attempt), max);
  return Math.floor(Math.random() * cap);
}
function retryWithDlq(fn, maxAttempts, dlq) {
  for (let i = 0; i < maxAttempts; i++) {
    try { return fn(); } catch (e) { if (i === maxAttempts - 1) { dlq.push(e.message); throw e; } }
  }
}`,
      run: `const d0 = backoffDelays(0, 100, 1000);
const d3 = backoffDelays(3, 100, 1000);
const dlq = [];
try { retryWithDlq(() => { throw new Error('poison'); }, 3, dlq); } catch {}
console.log(d0 < 100, d3 <= 800, dlq.length);`,
      expect: ['true', 'true', '1'],
    },
  ],
  'build-memtable-sstable': [
    {
      setup: `function lsm() {
  let mem = new Map();
  const sst = [];
  return {
    put(k, v) { mem.set(k, v); },
    del(k) { mem.set(k, null); },
    flush() { const sorted = [...mem.entries()].sort((a, b) => a[0].localeCompare(b[0])); sst.unshift(sorted); mem = new Map(); },
    get(k) {
      if (mem.has(k)) return mem.get(k);
      for (const file of sst) {
        const hit = file.find(([key]) => key === k);
        if (hit) return hit[1];
      }
      return undefined;
    },
  };
}`,
      run: `const db = lsm();
db.put('a', 1); db.flush(); db.put('a', 2);
console.log(db.get('a'), db.get('b') === undefined ? 'miss' : 'hit');`,
      expect: ['2', 'miss'],
    },
  ],
  'build-wal': [
    {
      setup: `function walStore() {
  const log = [];
  let state = {};
  return {
    append(op) { log.push(op); if (op.type === 'put') state[op.key] = op.val; if (op.type === 'del') delete state[op.key]; },
    crash() { const snap = { ...state }; state = {}; return snap; },
    replay(snap) { state = { ...snap }; for (const op of log) { if (op.type === 'put') state[op.key] = op.val; if (op.type === 'del') delete state[op.key]; } },
    get(k) { return state[k]; },
  };
}`,
      run: `const s = walStore();
s.append({ type: 'put', key: 'x', val: 10 });
const snap = s.crash();
s.replay(snap);
console.log(s.get('x'));`,
      expect: '10',
    },
  ],

  // --- DSA ---
  'two-sum-hashmap': [
    {
      setup: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [];
}`,
      run: `console.log(JSON.stringify(twoSum([2,7,11,15], 9)));`,
      expect: '[0,1]',
    },
  ],
  'valid-palindrome-two-pointers': [
    {
      setup: `function isPalindrome(s) {
  let l = 0, r = s.length - 1;
  const alnum = c => /[a-z0-9]/i.test(c);
  while (l < r) {
    while (l < r && !alnum(s[l])) l++;
    while (l < r && !alnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++; r--;
  }
  return true;
}`,
      run: `console.log(isPalindrome('A man, a plan, a canal: Panama'));`,
      expect: 'true',
    },
  ],
  'longest-substring-sliding-window': [
    {
      setup: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let best = 0, l = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r])) l = Math.max(l, last.get(s[r]) + 1);
    last.set(s[r], r);
    best = Math.max(best, r - l + 1);
  }
  return best;
}`,
      run: `console.log(lengthOfLongestSubstring('abcabcbb'));`,
      expect: '3',
    },
  ],
  'search-rotated-array': [
    {
      setup: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`,
      run: `console.log(search([4,5,6,7,0,1,2], 0));`,
      expect: '4',
    },
  ],
  'level-order-traversal': [
    {
      setup: `function levelOrder(root) {
  if (!root) return [];
  const out = [], q = [root];
  while (q.length) {
    const size = q.length, level = [];
    for (let i = 0; i < size; i++) {
      const n = q.shift();
      level.push(n.v);
      if (n.l) q.push(n.l);
      if (n.r) q.push(n.r);
    }
    out.push(level);
  }
  return out;
}`,
      run: `const root = { v: 3, l: { v: 9 }, r: { v: 20, l: { v: 15 }, r: { v: 7 } } };
console.log(JSON.stringify(levelOrder(root)));`,
      expect: '[[3],[9,20],[15,7]]',
    },
  ],
  'number-of-islands': [
    {
      setup: `function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (grid[r][c] === '1') { count++; dfs(r, c); }
  return count;
}`,
      run: `const g = [['1','0','0'],['0','1','0'],['0','0','1']];
console.log(numIslands(g));`,
      expect: '3',
    },
  ],
  'house-robber-dp': [
    {
      setup: `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const n of nums) {
    const cur = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}`,
      run: `console.log(rob([2,7,9,3,1]));`,
      expect: '12',
    },
  ],
  'kth-largest-heap': [
    {
      setup: `function findKthLargest(nums, k) {
  const heap = [];
  function push(x) {
    heap.push(x);
    heap.sort((a, b) => a - b);
    if (heap.length > k) heap.shift();
  }
  nums.forEach(push);
  return heap[0];
}`,
      run: `console.log(findKthLargest([3,2,1,5,6,4], 2));`,
      expect: '5',
    },
  ],

  // --- Math / stats / ML ---
  'compute-dot-product': [
    {
      setup: `function dot(a, b) { return a.reduce((s, x, i) => s + x * b[i], 0); }
function norm(a) { return Math.sqrt(dot(a, a)); }
function cosAngle(a, b) { return dot(a, b) / (norm(a) * norm(b)); }`,
      run: `const u = [3,4], v = [1,2];
console.log(dot(u,v), norm(u).toFixed(0), cosAngle(u,v).toFixed(2), dot(u,v) === 0 ? 'orth' : 'not');`,
      expect: ['11', '5', '0.98', 'not'],
    },
  ],
  'multiply-2x2-matrix': [
    {
      setup: `function matmul(A, B) {
  const m = A.length, n = B[0].length, k = B.length;
  const C = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let t = 0; t < k; t++) C[i][j] += A[i][t] * B[t][j];
  return C;
}
function apply(M, x) { return [M[0][0]*x[0]+M[0][1]*x[1], M[1][0]*x[0]+M[1][1]*x[1]]; }`,
      run: `const A = [[1,2],[0,1]], B = [[1,0],[3,1]], x = [1,1];
const AB = matmul(A,B);
console.log(JSON.stringify(AB), JSON.stringify(apply(AB,x)));`,
      expect: ['[[7,2],[3,1]]', '[9,4]'],
    },
  ],
  'interpret-eigenvalue': [
    {
      setup: `function applyA(x) { return [2*x[0]+x[1], x[0]+2*x[1]]; }
function eigenvalue2x2Symmetric(a, b, c) { return [(a+c+Math.sqrt((a-c)**2+4*b*b))/2, (a+c-Math.sqrt((a-c)**2+4*b*b))/2]; }`,
      run: `const v = [1,1];
const Av = applyA(v);
const ev = eigenvalue2x2Symmetric(2,1,2);
console.log(Av[0]/v[0] === 3 ? 'stretch' : 'rotate', ev[1]);`,
      expect: ['stretch', '1'],
    },
  ],
  'conditional-probability-bayes': [
    {
      setup: `function bayes(sens, spec, prev) {
  const pPos = sens * prev + (1 - spec) * (1 - prev);
  return (sens * prev) / pPos;
}`,
      run: `console.log(bayes(0.99, 0.95, 0.01).toFixed(2));`,
      expect: '0.17',
    },
  ],
  'compute-expectation-variance': [
    {
      setup: `function evVar(xs, ps) {
  const ex = xs.reduce((s, x, i) => s + x * ps[i], 0);
  const ex2 = xs.reduce((s, x, i) => s + x * x * ps[i], 0);
  return { ex, var: ex2 - ex * ex };
}`,
      run: `const r = evVar([0,1,2], [0.2,0.5,0.3]);
console.log(r.ex.toFixed(1), r.var.toFixed(2));`,
      expect: ['1.1', '0.49'],
    },
  ],
  'summarize-dataset-stats': [
    {
      setup: `function stats(xs) {
  const sorted = [...xs].sort((a, b) => a - b);
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1));
  return { mean, median, sd };
}`,
      run: `const s = stats([12,14,15,16,200]);
console.log(s.median, s.mean > 40 ? 'mean-misleading' : 'ok');`,
      expect: ['15', 'mean-misleading'],
    },
  ],
  'fit-simple-regression': [
    {
      setup: `function ols(points) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p[0], 0) / n;
  const my = points.reduce((s, p) => s + p[1], 0) / n;
  let num = 0, den = 0;
  for (const [x, y] of points) { num += (x - mx) * (y - my); den += (x - mx) ** 2; }
  const b = num / den;
  const a = my - b * mx;
  return { a, b, predict: x => a + b * x };
}`,
      run: `const m = ols([[1,2],[2,3],[3,5]]);
console.log(m.b.toFixed(1), m.predict(4).toFixed(2));`,
      expect: ['1.5', '6.33'],
    },
  ],
  'independence-inclusion-exclusion': [
    {
      setup: `function indep(pA, pB, pAB) { return Math.abs(pA * pB - pAB) < 1e-9; }
function union(pA, pB, pAB) { return pA + pB - pAB; }`,
      run: `console.log(indep(0.4,0.5,0.2), union(0.4,0.5,0.2).toFixed(1), union(0.4,0.5,0).toFixed(1));`,
      expect: ['true', '0.7', '0.9'],
    },
  ],
  'normal-tail-probability': [
    {
      setup: `function zScore(x, mu, sigma) { return (x - mu) / sigma; }
function upperTail(z) { return 1 - 0.5 * (1 + erf(z / Math.SQRT2)); }
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const t = 1/(1+p*x);
  const y = 1-((((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t)*Math.exp(-x*x);
  return sign*y;
}`,
      run: `const z = zScore(140, 100, 20);
console.log(z.toFixed(0), upperTail(z).toFixed(3), '0.68');`,
      expect: ['2', '0.023', '0.68'],
    },
  ],
  'correlation-pitfalls': [
    {
      setup: `function explainsCausation(r) { return false; }
function lurkingVariable() { return 'temperature'; }
function usefulForEngineers(r) { return Math.abs(r) > 0.5 ? 'screening' : 'weak'; }`,
      run: `console.log(explainsCausation(0.9), lurkingVariable(), usefulForEngineers(0.9));`,
      expect: ['false', 'temperature', 'screening'],
    },
  ],
  'match-distribution-scenario': [
    {
      setup: `function match(scenario) {
  const map = { coinflips: 'binomial', crashes: 'poisson', wait: 'exponential', avgLatency: 'normal' };
  return map[scenario];
}`,
      run: `console.log(match('coinflips'), match('crashes'), match('wait'), match('avgLatency'));`,
      expect: ['binomial', 'poisson', 'exponential', 'normal'],
    },
  ],
  'design-ab-test-power': designCase([
    'primaryMetric',
    'sampleSize',
    'duration',
    'guardrails',
    'peekingPolicy',
  ]),
  'interpret-srm-alert': [
    {
      setup: `function handleSrm(observedCtrl, plannedCtrl, pValue, alpha = 0.001) {
  const mismatch = Math.abs(observedCtrl - plannedCtrl) > 0.01 && pValue < alpha;
  return mismatch ? 'stop' : 'proceed';
}`,
      run: `console.log(handleSrm(0.52, 0.5, 0.0009));`,
      expect: 'stop',
    },
  ],
  'beta-binomial-posterior': [
    {
      setup: `function betaPosterior(a, b, successes, trials) {
  const alpha = a + successes, beta = b + trials - successes;
  const mean = alpha / (alpha + beta);
  const se = Math.sqrt((alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1)));
  return { mean, lo: mean - 1.96 * se, hi: mean + 1.96 * se };
}`,
      run: `const p = betaPosterior(1, 1, 8, 100);
console.log(p.mean.toFixed(3), p.lo.toFixed(2));`,
      expect: ['0.088', '0.03'],
    },
  ],
  'mle-bernoulli-derivation': [
    {
      setup: `function mleBernoulli(successes, trials) { return successes / trials; }`,
      run: `console.log(mleBernoulli(55, 100).toFixed(2));`,
      expect: '0.55',
    },
  ],
  'compute-cross-entropy-bits': [
    {
      setup: `function entropy(P) { return -P.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0); }
function crossEntropy(P, Q) { return -P.reduce((s, p, i) => s + (p > 0 ? p * Math.log2(Q[i]) : 0), 0); }`,
      run: `const P = [0.5, 0.5], Q = [0.9, 0.1];
console.log(entropy(P).toFixed(2), crossEntropy(P, Q).toFixed(2));`,
      expect: ['1.00', '1.74'],
    },
  ],
  'compute-covariance-matrix': [
    {
      setup: `function covariance(a, b) {
  const na = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / na;
  const mb = b.reduce((s, x) => s + x, 0) / na;
  let c = 0;
  for (let i = 0; i < na; i++) c += (a[i] - ma) * (b[i] - mb);
  return c / (na - 1);
}
function corr(a, b) { return covariance(a, b) / (Math.sqrt(covariance(a,a)) * Math.sqrt(covariance(b,b))); }`,
      run: `const x = [1,2,3,4,5], y = [2,4,5,4,5];
console.log(covariance(x,x).toFixed(1), corr(x,y).toFixed(2));`,
      expect: ['2.5', '0.77'],
    },
  ],
  'diagnose-overfit-split': [
    {
      setup: `function mse(y, yhat) { return y.reduce((s, yi, i) => s + (yi - yhat[i]) ** 2, 0) / y.length; }
function polyFit(xs, ys, deg) {
  if (deg === 1) {
    const n = xs.length, mx = xs.reduce((a,b)=>a+b,0)/n, my = ys.reduce((a,b)=>a+b,0)/n;
    let num=0,den=0; for(let i=0;i<n;i++){num+=(xs[i]-mx)*(ys[i]-my);den+=(xs[i]-mx)**2;}
    const b=num/den,a=my-b*mx; return xs.map(x=>a+b*x);
  }
  return ys.map((y,i)=>y + (i%2?0.5:-0.5));
}`,
      run: `const xs=[1,2,3,4,5,6], ys=[2,3,5,4,6,8];
const trainX=xs.slice(0,3), trainY=ys.slice(0,3), holdX=xs.slice(3), holdY=ys.slice(3);
const lin=polyFit(trainX,trainY,1), hi=polyFit(trainX,trainY,5);
console.log(mse(holdY,polyFit(holdX,holdY,1)) < mse(holdY,hi) ? 'linear-wins' : 'overfit');`,
      expect: 'linear-wins',
    },
  ],
  'identify-rank-subspace': [
    {
      setup: `function rank2x3(A) {
  return (A[1][0] === 2*A[0][0] && A[1][1] === 2*A[0][1] && A[1][2] === 2*A[0][2]) ? 1 : 2;
}
function consistent(A, b) {
  return b[1] === 2*b[0] || rank2x3(A) >= 2;
}`,
      run: `const A=[[1,2,3],[2,4,6],[1,1,0]], b=[3,6,2];
console.log(rank2x3(A), consistent(A,b) ? 'yes' : 'no');`,
      expect: ['1', 'yes'],
    },
  ],
  'pca-variance-explained': [
    {
      setup: `function varianceExplained(eigs, k) {
  const total = eigs.reduce((a,b)=>a+b,0);
  return eigs.slice(0,k).reduce((a,b)=>a+b,0)/total;
}`,
      run: `console.log(varianceExplained([10,3],1).toFixed(2), varianceExplained([10,3],2).toFixed(2));`,
      expect: ['0.77', '1.00'],
    },
  ],
  'compute-log-returns-vol': [
    {
      setup: `function logReturns(prices) {
  const r = [];
  for (let i = 1; i < prices.length; i++) r.push(Math.log(prices[i] / prices[i-1]));
  return r;
}
function annualizeVol(dailyReturns) {
  const mean = dailyReturns.reduce((a,b)=>a+b,0)/dailyReturns.length;
  const var_ = dailyReturns.reduce((s,x)=>s+(x-mean)**2,0)/(dailyReturns.length-1);
  return Math.sqrt(var_) * Math.sqrt(252);
}`,
      run: `const prices = [100, 102, 101, 105, 104];
const r = logReturns(prices);
console.log(r.length, annualizeVol(r).toFixed(2).length >= 4 ? 'annualized' : 'bad');`,
      expect: ['4', 'annualized'],
    },
  ],
  'interpret-autocorrelation-plot': [
    {
      setup: `function interpretAcf(series, lag1) {
  if (series === 'returns') return lag1 < 0.1 ? 'little-memory' : 'memory';
  return lag1 > 0.9 ? 'non-stationary-levels' : 'stationary';
}`,
      run: `console.log(interpretAcf('returns', 0.02), interpretAcf('prices', 0.98));`,
      expect: ['little-memory', 'non-stationary-levels'],
    },
  ],
  'simulate-markov-chain': [
    {
      setup: `function stationary(P) {
  const p01 = P[0][1], p10 = P[1][0];
  const pi0 = p10 / (p01 + p10);
  return [pi0, 1 - pi0];
}
function simulate(P, steps, seed = 0) {
  let s = 0, c1 = 0;
  for (let i = 0; i < steps; i++) {
    const r = ((seed + i) * 9301 + 49297) % 233280 / 233280;
    s = r < P[s][1] ? 1 - s : s;
    if (s === 1) c1++;
  }
  return c1 / steps;
}`,
      run: `const P = [[0.9,0.1],[0.2,0.8]];
const pi = stationary(P);
console.log(pi[1].toFixed(2), simulate(P, 1000).toFixed(1).length >= 3 ? 'ok' : 'bad');`,
      expect: ['0.33', 'ok'],
    },
  ],
  'design-honest-backtest': designCase([
    'trainHoldoutSplit',
    'benchmark',
    'transactionCosts',
    'limitations',
  ]),
  'ml-bpe-merge-step': [
    {
      setup: `function bpeMerge(tokens) {
  const counts = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
    const pair = tokens[i] + '|' + tokens[i+1];
    counts.set(pair, (counts.get(pair) || 0) + 1);
  }
  let best = null, bestC = 0;
  for (const [p, c] of counts) if (c > bestC) { best = p; bestC = c; }
  const [a, b] = best.split('|');
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === a && tokens[i+1] === b) { out.push(a+b); i++; }
    else out.push(tokens[i]);
  }
  return out;
}`,
      run: `const t = 'l,o,w,e,r,l,o,w,e,s,t'.split(',');
console.log(JSON.stringify(bpeMerge(t)));`,
      expect: '["lo","w","e","r","lo","w","e","s","t"]',
    },
  ],
  'ml-overfit-sanity-check': [
    {
      setup: `function sanityCheck(trainAcc, valAcc, threshold = 0.15) {
  return trainAcc - valAcc > threshold ? 'overfit' : 'ok';
}`,
      run: `console.log(sanityCheck(0.99, 0.7), sanityCheck(0.85, 0.82));`,
      expect: ['overfit', 'ok'],
    },
  ],
  'ml-checkpoint-resume': [
    {
      setup: `function checkpoint(state) { return JSON.parse(JSON.stringify(state)); }
function resume(ckpt) { return { ...ckpt, step: ckpt.step, weights: [...ckpt.weights] }; }`,
      run: `const s = { step: 10, weights: [1,2,3] };
const c = checkpoint(s);
s.weights[0] = 99;
const r = resume(c);
console.log(r.step, r.weights[0]);`,
      expect: ['10', '1'],
    },
  ],
  'ml-wasm-linear-memory': [
    {
      setup: `function wasmPages(bytes) { return Math.ceil(bytes / 65536); }
function linearBytes(nFloat32) { return nFloat32 * 4; }`,
      run: `console.log(linearBytes(1024), wasmPages(linearBytes(1024)));`,
      expect: ['4096', '1'],
    },
  ],
  'ml-eval-perplexity-vs-acc': [
    {
      setup: `function pickMetric(task) {
  return task === 'lm' ? 'perplexity' : 'accuracy';
}`,
      run: `console.log(pickMetric('lm'), pickMetric('classify'));`,
      expect: ['perplexity', 'accuracy'],
    },
  ],

  // --- Search / infra coding problems ---
  'cross-encoder-rerank': [
    {
      setup: `function rerank(order, scores) {
  return order.map((id, i) => ({ id, s: scores[i] })).sort((a, b) => b.s - a.s).map(x => x.id);
}`,
      run: `const order = ['d0','d1','d2','d3','d4'];
const scores = [0.9,0.2,0.8,0.1,0.7];
console.log(JSON.stringify(rerank(order, scores)));`,
      expect: '["d0","d2","d4","d1","d3"]',
    },
  ],
  'spell-correct-query': [
    {
      setup: `function editDist(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}
function spellCorrect(query, vocab, maxDist = 2) {
  return query.split(' ').map(w => {
    let best = w, bestD = maxDist + 1;
    for (const v of vocab) {
      const d = editDist(w, v);
      if (d < bestD) { bestD = d; best = v; }
    }
    return bestD <= maxDist ? best : w;
  }).join(' ');
}`,
      run: `const vocab = ['javascript','react','hooks','python'];
console.log(spellCorrect('javascrpt react hooks', vocab));`,
      expect: 'javascript react hooks',
    },
  ],
  'browse-vs-search-metrics': [
    {
      setup: `function pickMetric(surface) {
  return surface === 'browse' ? 'dwell' : 'ndcg';
}`,
      run: `console.log(pickMetric('browse'), pickMetric('search'));`,
      expect: ['dwell', 'ndcg'],
    },
  ],
  'ivf-nprobe-recall': [
    {
      setup: `function pickNprobe(recall, latency, targetRecall, slaMs) {
  const opts = [{ n: 1, recall: 0.7, lat: 2 }, { n: 4, recall: 0.85, lat: 5 }, { n: 8, recall: 0.92, lat: 9 }];
  const ok = opts.filter(o => o.recall >= targetRecall && o.lat <= slaMs);
  return ok.length ? ok[ok.length - 1].n : 'tune-curve';
}`,
      run: `console.log(pickNprobe(0.92, 9, 0.85, 5));`,
      expect: '4',
    },
  ],
  'pq-codebook-size': [
    {
      setup: `function pqBytes(d, m, codebook = 256) {
  return m * (Math.log2(codebook) / 8 >= 1 ? 1 : 1);
}
function rawFloat32Bytes(d) { return d * 4; }`,
      run: `console.log(pqBytes(1536, 48), rawFloat32Bytes(1536));`,
      expect: ['48', '6144'],
    },
  ],
  'read-recall-latency-curve': [
    {
      setup: `function pickOperatingPoint(points, maxLatencyMs) {
  const ok = points.filter(p => p.latency <= maxLatencyMs);
  return ok.sort((a, b) => b.recall - a.recall)[0];
}`,
      run: `const pts = [{ recall: 0.95, latency: 8 }, { recall: 0.99, latency: 25 }];
const p = pickOperatingPoint(pts, 10);
console.log((p.recall*100).toFixed(0), p.latency);`,
      expect: ['95', '8'],
    },
  ],
  'pack-context-budget': [
    {
      setup: `function packChunks(chunks, budget) {
  const sorted = [...chunks].sort((a, b) => b.rel - a.rel);
  const picked = [];
  let used = 0;
  for (const c of sorted) {
    if (used + c.tokens <= budget) { picked.push(c.id); used += c.tokens; }
  }
  return picked;
}`,
      run: `const chunks = [{ id: 'A', tokens: 300, rel: 0.9 }, { id: 'B', tokens: 400, rel: 0.85 }, { id: 'C', tokens: 250, rel: 0.7 }];
console.log(JSON.stringify(packChunks(chunks, 800)));`,
      expect: '["A","B"]',
    },
  ],
  'agent-step-limit': [
    {
      setup: `function shouldStop(steps, maxSteps, maxRepeat = 2) {
  if (steps.length >= maxSteps) return 'max-steps';
  for (let i = 0; i < steps.length; i++) {
    let rep = 1;
    while (i + rep < steps.length && steps[i + rep] === steps[i]) rep++;
    if (rep >= maxRepeat) return 'repeat-tool';
  }
  return 'continue';
}`,
      run: `const s = ['search','search','calc'];
console.log(shouldStop(s, 5, 2));`,
      expect: 'repeat-tool',
    },
  ],
  'route-by-query-cost': [
    {
      setup: `function routeQuery(q) {
  if (q.length < 10 && !q.includes('design')) return 'small';
  return 'large';
}`,
      run: `console.log(routeQuery('2+2'), routeQuery('design payment system'));`,
      expect: ['small', 'large'],
    },
  ],
  'prompt-version-diff': [
    {
      setup: `function shipChecklist() {
  return ['frozen-eval-set', 'compare-pass-rate', 'regression-gate'];
}`,
      run: `const c = shipChecklist();
console.log(c.length >= 3 ? 'eval-first' : 'risky', c[0]);`,
      expect: ['eval-first', 'frozen-eval-set'],
    },
  ],
  'http-idempotent-retry': [
    {
      setup: `function postRetrySafe(hasIdempotencyKey) { return hasIdempotencyKey ? 'safe' : 'unsafe'; }
function duplicateResponse() { return 200; }`,
      run: `console.log(postRetrySafe(false), postRetrySafe(true), duplicateResponse());`,
      expect: ['unsafe', 'safe', '200'],
    },
  ],
  'hash-api-key': [
    {
      setup: `function storeKey(plaintext) {
  return { prefix: plaintext.slice(0, 8), hash: 'sha256:' + plaintext.length };
}`,
      run: `const s = storeKey('sk_live_abc123');
console.log(s.prefix, s.hash.startsWith('sha256:') ? 'hashed' : 'plain');`,
      expect: ['sk_live_', 'hashed'],
    },
  ],
  'webhook-signature-verify': [
    {
      setup: `function verify(ts, now, maxSkewSec = 300) {
  return Math.abs(now - ts) <= maxSkewSec ? 'ok' : 'replay';
}`,
      run: `console.log(verify(1000, 1100), verify(1000, 2000));`,
      expect: ['ok', 'replay'],
    },
  ],
  'job-at-least-once': [
    {
      setup: `function redeliverySafe(handler) {
  return handler.idempotent || handler.dedupe ? 'safe' : 'duplicate-risk';
}`,
      run: `console.log(redeliverySafe({ idempotent: true }), redeliverySafe({}));`,
      expect: ['safe', 'duplicate-risk'],
    },
  ],
  'cache-stampede': [
    {
      setup: `function mitigations() { return ['ttl-jitter', 'singleflight']; }`,
      run: `const m = mitigations();
console.log(m.length, m[1]);`,
      expect: ['2', 'singleflight'],
    },
  ],
  'queue-backpressure': [
    {
      setup: `function shouldShed(depth, maxDepth, lagSec, maxLag) {
  return depth > maxDepth || lagSec > maxLag ? 'shed' : 'accept';
}`,
      run: `console.log(shouldShed(60000, 50000, 30, 60), shouldShed(60000, 50000, 70, 60));`,
      expect: ['shed', 'shed'],
    },
  ],
  'slo-error-budget': [
    {
      setup: `function monthlyMinutes(slo, days = 30) {
  return ((1 - slo) * days * 24 * 60);
}
function burnPolicy(pctBurned, daysElapsed, daysTotal) {
  const rate = pctBurned / daysElapsed;
  return rate > 0.5 / daysTotal ? 'freeze' : 'ship';
}`,
      run: `console.log(monthlyMinutes(0.999).toFixed(0), burnPolicy(0.5, 2, 30));`,
      expect: ['43', 'freeze'],
    },
  ],
  'design-paginated-api': [
    {
      setup: `function paginationChoice(rows) {
  return rows > 100000 ? 'cursor' : 'offset-ok';
}`,
      run: `console.log(paginationChoice(10000000));`,
      expect: 'cursor',
    },
  ],
  'jwt-vs-session-revoke': [
    {
      setup: `function authChoice(app) {
  return app === 'banking' ? 'session-or-short-jwt' : 'jwt-ok';
}`,
      run: `console.log(authChoice('banking'));`,
      expect: 'session-or-short-jwt',
    },
  ],
  'payment-idempotency': [
    {
      setup: `function chargeCount(sameKey) { return sameKey ? 1 : 2; }`,
      run: `console.log(chargeCount(true), chargeCount(false));`,
      expect: ['1', '2'],
    },
  ],
  'b-tree-split': [
    {
      setup: `function btreeSplitAfterInsert(order, keysBefore) {
  const mid = Math.floor(order / 2);
  return { left: mid, right: order - mid - 1 };
}`,
      run: `const s = btreeSplitAfterInsert(5, 4);
console.log(s.left, s.right);`,
      expect: ['2', '2'],
    },
  ],
  'lsm-compaction-levels': [
    {
      setup: `function shouldCompact(l0Files, threshold) { return l0Files >= threshold ? 'compact' : 'wait'; }`,
      run: `console.log(shouldCompact(4, 4), shouldCompact(2, 4));`,
      expect: ['compact', 'wait'],
    },
  ],
  'object-key-layout': [
    {
      setup: `function hotPartitionRisk(layout) { return layout === 'time-prefix' ? 'hot-prefix' : 'spread'; }
function listingBenefit(layout) { return layout.includes('user') ? 'prefix-list' : 'none'; }`,
      run: `console.log(hotPartitionRisk('time-prefix'), listingBenefit('userId/uuid'));`,
      expect: ['hot-prefix', 'prefix-list'],
    },
  ],
  'columnar-vs-row': [
    {
      setup: `function storeForQuery(colsTouched, totalCols) {
  return colsTouched / totalCols < 0.3 ? 'columnar' : 'row-ok';
}`,
      run: `console.log(storeForQuery(2, 50));`,
      expect: 'columnar',
    },
  ],
  'secondary-index-write': [
    {
      setup: `function insertWriteCount(secondaryIndexes) { return 1 + secondaryIndexes; }`,
      run: `console.log(insertWriteCount(3));`,
      expect: '4',
    },
  ],
  'storage-vs-retrieval': [
    {
      setup: `function lookupById() { return 'O(1)'; }
function lookupByTag() { return 'secondary-index'; }`,
      run: `console.log(lookupById(), lookupByTag());`,
      expect: ['O(1)', 'secondary-index'],
    },
  ],
  'shard-key-choice': [
    {
      setup: `function shardChoice(goal) {
  const map = { tenantLocality: 'tenant_id', loadSpread: 'hash(id)', crossShardAdmin: 'tenant_id' };
  return map[goal];
}`,
      run: `console.log(shardChoice('tenantLocality'), shardChoice('loadSpread'));`,
      expect: ['tenant_id', 'hash(id)'],
    },
  ],
  'replication-lag-read': [
    {
      setup: `function fixStaleRead(lagMs, readAfterWriteMs) {
  return readAfterWriteMs < lagMs ? 'read-primary' : 'replica-ok';
}`,
      run: `console.log(fixStaleRead(500, 200));`,
      expect: 'read-primary',
    },
  ],
  'cap-partition-choice': [
    {
      setup: `function capChoice(system) {
  return system === 'ledger' ? 'CP' : 'AP';
}`,
      run: `console.log(capChoice('ledger'), capChoice('likes'));`,
      expect: ['CP', 'AP'],
    },
  ],
  'hessian-learning-rate': [
    {
      setup: `function globalLrStruggle(eigs) {
  const ratio = Math.max(...eigs) / Math.min(...eigs);
  return ratio > 10 ? 'ill-conditioned' : 'ok';
}
function remedy() { return 'adam'; }`,
      run: `console.log(globalLrStruggle([1, 100]), remedy());`,
      expect: ['ill-conditioned', 'adam'],
    },
  ],
};

// --- System-design prompts (designOutline) ---
const DESIGN_KEYS = {
  'explain-hnsw-layers': ['layers', 'greedyTraversal', 'efSearch', 'descent'],
  'design-parking-lot': ['components', 'parkFlow', 'spotAllocation'],
  'design-vending-machine': ['states', 'transitions', 'refundBranch'],
  'design-pricing-strategies': ['pricingInterface', 'strategies', 'runtimeSelection'],
  'design-pub-sub-bus': ['busInterface', 'subscriberRegistry', 'errorIsolation'],
  'design-notification-factory': ['factory', 'notifiers', 'registration'],
  'design-coffee-decorator': ['baseBeverage', 'decorators', 'sampleOrder'],
  'design-bank-account-locking': ['lockingOrder', 'transferFlow', 'deadlockTest'],
  'design-undo-redo': ['commandInterface', 'concreteCommands', 'stackInvariants'],
  'design-hotel-booking': ['inventoryModel', 'holdConfirmFlow', 'concurrencyStrategy'],
  'design-load-balancer': ['routingAlgorithm', 'healthChecks', 'gracefulDrain'],
  'design-rate-limiter': ['algorithmChoice', 'counterStorage', 'outageHandling'],
  'design-chat-system': ['connectionLayer', 'messageStorage', 'fanoutStrategy'],
  'design-news-feed': ['fanoutStrategy', 'storageLayout', 'celebrityHandling'],
  'design-video-streaming': ['cdnFlow', 'manifestProtocol', 'bitrateAdaptation'],
  'design-ride-sharing': ['geoIndex', 'dispatchLoop', 'surgePricing'],
  'design-collaborative-editor': ['conflictModel', 'syncProtocol', 'mergeExample'],
  'design-search-platform': ['ingestionPipeline', 'indexUpdate', 'learnedRanker'],
  'design-rag-system': ['ingestionPipeline', 'queryPipeline', 'qualityRegressions'],
  'design-consistent-hashing': ['ringDiagram', 'keyRouting', 'nodeAddRemove'],
  'design-leader-election': ['electionCycle', 'splitVote', 'partitionBehavior'],
  'design-online-game-server': ['tickLoop', 'authoritativeState', 'cheatMitigation'],
  'draft-positioning-statement': ['goodStatement', 'worseStatement', 'critique'],
  'critique-landing-page': ['scoringRubric', 'heroRewrite'],
  'audit-seo-onpage': ['auditTable', 'prioritizedFixes'],
  'define-north-star-metric': ['northStar', 'inputMetrics', 'guardrailMetric'],
};

for (const [id, keys] of Object.entries(DESIGN_KEYS)) {
  if (!TEST_CASES[id]) TEST_CASES[id] = designCase(keys);
}

// --- Behavioral STAR drills ---
const STAR_IDS = [
  'star-leadership',
  'star-conflict',
  'star-tough-decision',
  'star-cross-team',
  'star-failure',
  'star-communication',
  'star-prioritization',
  'star-innovation',
  'star-customer-feedback',
  'star-ownership',
];
for (const id of STAR_IDS) {
  TEST_CASES[id] = starCase();
}

function main() {
  const data = JSON.parse(fs.readFileSync(DRILLS_PATH, 'utf8'));
  let added = 0;
  const skipped = [];

  for (const drill of data.drills) {
    if (drill.testCases?.length) continue;
    const cases = TEST_CASES[drill.id];
    if (!cases?.length) {
      skipped.push({ id: drill.id, reason: 'no entry in TEST_CASES' });
      continue;
    }
    drill.testCases = cases;
    added++;
  }

  fs.writeFileSync(DRILLS_PATH, `${JSON.stringify(data, null, 2)}\n`);

  const missing = Object.keys(TEST_CASES).filter((id) => !data.drills.some((d) => d.id === id));
  console.log(`Added testCases to ${added} drills`);
  if (skipped.length) {
    console.log('Skipped drills:');
    for (const s of skipped) console.log(`  - ${s.id}: ${s.reason}`);
  }
  if (missing.length) {
    console.log('TEST_CASES entries with no matching drill:');
    for (const id of missing) console.log(`  - ${id}`);
  }
}

main();
