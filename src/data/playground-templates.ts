// Starter scaffolds for math-stack artifacts — active implementation, not passive reading.
import type { Language } from '../types';

export interface PlaygroundTemplate {
  artifactId: string;
  title: string;
  language: Language;
  code: string;
  problem: string;
}

const TEMPLATES: PlaygroundTemplate[] = [
  {
    artifactId: 'implement-bm25-highsignal',
    title: 'Implement BM25 search in HighSignal',
    language: 'typescript',
    problem: `# Implement BM25 search in HighSignal

Index a corpus of articles and serve ranked keyword search using BM25.

## Success criteria
1. Index at least 100 documents
2. Support keyword search with a tokenizer shared by index and query
3. Return top-k ranked results scored by BM25
4. Add a small set of eval queries with expected results

## Deliverables
- Code commit
- Test/check command with output
- Short note on k1/b tuning

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `const K1 = 1.2;
const B = 0.75;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, ' ')
    .split(/\\s+/)
    .filter(Boolean);
}

type Posting = { docId: string; tf: number };
type Index = {
  docs: Map<string, { text: string; length: number }>;
  postings: Map<string, Posting[]>;
  avgDl: number;
};

function buildIndex(corpus: { id: string; text: string }[]): Index {
  const docs = new Map<string, { text: string; length: number }>();
  const postings = new Map<string, Posting[]>();
  let totalLen = 0;

  for (const doc of corpus) {
    const terms = tokenize(doc.text);
    docs.set(doc.id, { text: doc.text, length: terms.length });
    totalLen += terms.length;
    const tf = new Map<string, number>();
    for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [term, count] of tf) {
      const list = postings.get(term) ?? [];
      list.push({ docId: doc.id, tf: count });
      postings.set(term, list);
    }
  }

  return { docs, postings, avgDl: totalLen / Math.max(corpus.length, 1) };
}

function idf(N: number, df: number): number {
  return Math.log(1 + (N - df + 0.5) / (df + 0.5));
}

function bm25Score(
  term: string,
  docId: string,
  index: Index,
  N: number,
): number {
  const list = index.postings.get(term);
  if (!list) return 0;
  const posting = list.find(p => p.docId === docId);
  if (!posting) return 0;
  const dl = index.docs.get(docId)!.length;
  const df = list.length;
  const tfNorm =
    (posting.tf * (K1 + 1)) /
    (posting.tf + K1 * (1 - B + (B * dl) / index.avgDl));
  return idf(N, df) * tfNorm;
}

function search(index: Index, query: string, k = 5): { docId: string; score: number }[] {
  const terms = tokenize(query);
  const N = index.docs.size;
  const scores = new Map<string, number>();
  for (const term of terms) {
    const list = index.postings.get(term) ?? [];
    for (const { docId } of list) {
      scores.set(docId, (scores.get(docId) ?? 0) + bm25Score(term, docId, index, N));
    }
  }
  return [...scores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

const corpus = [
  { id: 'd1', text: 'BM25 ranking with inverted index tokenization' },
  { id: 'd2', text: 'Vector search uses embeddings and cosine similarity' },
  { id: 'd3', text: 'Hybrid search fuses BM25 and vector retrieval' },
];
const index = buildIndex(corpus);
console.log('BM25 top-k:', search(index, 'bm25 tokenization', 3));`,
  },
  {
    artifactId: 'hybrid-search-v0',
    title: 'Hybrid search v0 in HighSignal',
    language: 'typescript',
    problem: `# Hybrid search v0 in HighSignal

Combine BM25 and vector retrieval with reciprocal rank fusion.

## Success criteria
1. Run BM25 and vector retrieval over the same corpus
2. Fuse results with reciprocal rank fusion
3. Beat both single retrievers on the search eval set

## Deliverables
- Code commit
- Eval comparison table

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Hit = { id: string; score: number };

function bm25Search(query: string): Hit[] {
  const docs = ['alpha beta', 'beta gamma', 'alpha gamma delta'];
  const q = new Set(query.toLowerCase().split(/\\s+/));
  return docs
    .map((text, i) => ({
      id: String(i),
      score: [...q].filter(t => text.includes(t)).length,
    }))
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score);
}

function vectorSearch(query: string): Hit[] {
  const vecs = [
    { id: '0', v: [1, 0, 0] },
    { id: '1', v: [0.9, 0.1, 0] },
    { id: '2', v: [0, 1, 0] },
  ];
  const qv = [1, 0.2, 0];
  const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
  return vecs
    .map(d => ({ id: d.id, score: dot(d.v, qv) }))
    .sort((a, b) => b.score - a.score);
}

function reciprocalRankFusion(lists: Hit[][], k = 60): Hit[] {
  const scores = new Map<string, number>();
  for (const list of lists) {
    list.forEach((hit, rank) => {
      scores.set(hit.id, (scores.get(hit.id) ?? 0) + 1 / (k + rank + 1));
    });
  }
  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}

const query = 'alpha';
const fused = reciprocalRankFusion([bm25Search(query), vectorSearch(query)]);
console.log('BM25:', bm25Search(query));
console.log('Vector:', vectorSearch(query));
console.log('RRF fused:', fused);`,
  },
  {
    artifactId: 'search-eval-harness',
    title: 'Search eval harness',
    language: 'typescript',
    problem: `# Search eval harness

A reusable harness that scores any retriever against a labelled query set.

## Success criteria
1. At least 15 labelled queries with known-good results
2. Computes recall@k, MRR, and nDCG
3. Can score any retriever via a common interface

## Deliverables
- Harness code
- Baseline scores for BM25

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type EvalQuery = { id: string; query: string; relevant: string[] };
type Retriever = (query: string, k: number) => string[];

function recallAtK(retrieved: string[], relevant: string[], k: number): number {
  const top = new Set(retrieved.slice(0, k));
  const hits = relevant.filter(id => top.has(id)).length;
  return relevant.length ? hits / relevant.length : 0;
}

function mrr(runs: { retrieved: string[]; relevant: string[] }[]): number {
  let sum = 0;
  for (const { retrieved, relevant } of runs) {
    const rel = new Set(relevant);
    const rank = retrieved.findIndex(id => rel.has(id));
    sum += rank === -1 ? 0 : 1 / (rank + 1);
  }
  return runs.length ? sum / runs.length : 0;
}

function dcg(scores: number[]): number {
  return scores.reduce((acc, g, i) => acc + (Math.pow(2, g) - 1) / Math.log2(i + 2), 0);
}

function ndcg(retrieved: string[], grades: Record<string, number>, k: number): number {
  const gains = retrieved.slice(0, k).map(id => grades[id] ?? 0);
  const ideal = Object.values(grades).sort((a, b) => b - a).slice(0, k);
  const d = dcg(gains);
  const idcg = dcg(ideal);
  return idcg === 0 ? 0 : d / idcg;
}

function runHarness(retriever: Retriever, queries: EvalQuery[], k = 5) {
  const runs = queries.map(q => ({
    retrieved: retriever(q.query, k),
    relevant: q.relevant,
  }));
  const recall = runs.reduce((s, r, i) => s + recallAtK(r.retrieved, queries[i].relevant, k), 0) / queries.length;
  return { recallAtK: recall, mrr: mrr(runs) };
}

const labelled: EvalQuery[] = [
  { id: 'q1', query: 'bm25', relevant: ['d1', 'd3'] },
  { id: 'q2', query: 'vector', relevant: ['d2'] },
];

const stubRetriever: Retriever = (query, k) => {
  const pool = ['d1', 'd2', 'd3', 'd4'];
  return pool.filter(id => id.includes(query[0] ?? '')).slice(0, k);
};

console.log('Harness metrics:', runHarness(stubRetriever, labelled));
console.log('nDCG@3:', ndcg(['d1', 'd4', 'd3'], { d1: 3, d3: 2, d4: 0 }, 3));`,
  },
  {
    artifactId: 'tiny-vector-db-brute-force',
    title: 'Brute-force vector index',
    language: 'typescript',
    problem: `# Brute-force vector index

An exact nearest-neighbour index — the recall=1.0 baseline.

## Success criteria
1. Insert and search vectors with a chosen metric
2. Return correct top-k via a k-sized heap
3. Benchmark query latency vs vector count

## Deliverables
- Code commit
- Latency benchmark

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Vec = { id: string; values: number[] };

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-12);
}

class MinHeap<T> {
  private data: T[] = [];
  constructor(private cap: number, private score: (x: T) => number) {}
  push(item: T) {
    if (this.data.length < this.cap) {
      this.data.push(item);
      this.bubble(this.data.length - 1);
      return;
    }
    if (this.score(item) <= this.score(this.data[0])) return;
    this.data[0] = item;
    this.sink(0);
  }
  toSorted(): T[] {
    return [...this.data].sort((a, b) => this.score(b) - this.score(a));
  }
  private bubble(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.score(this.data[i]) >= this.score(this.data[p])) break;
      [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
      i = p;
    }
  }
  private sink(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.score(this.data[l]) < this.score(this.data[smallest])) smallest = l;
      if (r < n && this.score(this.data[r]) < this.score(this.data[smallest])) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

class BruteForceIndex {
  private vectors: Vec[] = [];
  insert(v: Vec) { this.vectors.push(v); }
  search(query: number[], k: number): { id: string; score: number }[] {
    const heap = new MinHeap<{ id: string; score: number }>(k, x => x.score);
    for (const v of this.vectors) {
      heap.push({ id: v.id, score: cosine(query, v.values) });
    }
    return heap.toSorted();
  }
}

const idx = new BruteForceIndex();
idx.insert({ id: 'a', values: [1, 0, 0] });
idx.insert({ id: 'b', values: [0.9, 0.1, 0] });
idx.insert({ id: 'c', values: [0, 1, 0] });
console.log('Top-2:', idx.search([1, 0.2, 0], 2));`,
  },
  {
    artifactId: 'vector-metadata-filter',
    title: 'Metadata filtering for vector search',
    language: 'typescript',
    problem: `# Metadata filtering for vector search

Add structured predicate filtering to vector search.

## Success criteria
1. Support 'nearest WHERE field = value' queries
2. Implement both pre-filter and post-filter and compare
3. Always return k results when k are available

## Deliverables
- Code commit
- Note on pre vs post filtering

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Row = { id: string; vec: number[]; tenant: string };
const rows: Row[] = [
  { id: '1', vec: [1, 0], tenant: 'a' },
  { id: '2', vec: [0.9, 0.1], tenant: 'b' },
  { id: '3', vec: [0.8, 0.2], tenant: 'a' },
];
const q = [1, 0];
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

function preFilter(tenant: string, k: number) {
  return rows.filter(r => r.tenant === tenant)
    .map(r => ({ id: r.id, score: dot(r.vec, q) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function postFilter(tenant: string, k: number) {
  return rows.map(r => ({ id: r.id, score: dot(r.vec, q), tenant: r.tenant }))
    .sort((a, b) => b.score - a.score)
    .filter(r => r.tenant === tenant)
    .slice(0, k);
}

console.log('Pre-filter:', preFilter('a', 2));
console.log('Post-filter:', postFilter('a', 2));`,
  },
  {
    artifactId: 'recall-latency-dashboard',
    title: 'Recall / latency benchmark dashboard',
    language: 'typescript',
    problem: `# Recall / latency benchmark dashboard

Plot recall vs latency for ANN parameter sweeps against the brute-force baseline.

## Success criteria
1. Brute force used as the recall=1.0 ground truth
2. Sweep at least one ANN parameter
3. Produce a recall-vs-latency curve

## Deliverables
- Benchmark code
- Curve chart

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Point = { param: number; recall: number; latencyMs: number };
function sweep(paramValues: number[]): Point[] {
  return paramValues.map(p => ({
    param: p,
    recall: Math.min(1, 0.55 + p * 0.08),
    latencyMs: 2 + p * 4.5,
  }));
}
const curve = sweep([1, 2, 4, 8, 16]);
const baseline = { recall: 1, latencyMs: curve[curve.length - 1].latencyMs * 3 };
console.log('ANN sweep:', curve);
console.log('Brute-force baseline:', baseline);`,
  },
  {
    artifactId: 'rag-pipeline-v0',
    title: 'RAG pipeline v0',
    language: 'typescript',
    problem: `# RAG pipeline v0

An end-to-end retrieve → pack → generate pipeline grounded in a document corpus.

## Success criteria
1. Ingest documents with a chunking strategy
2. Retrieve relevant chunks for a query
3. Generate an answer grounded in retrieved context
4. Have at least 10 eval questions

## Deliverables
- Pipeline code
- Eval results

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function chunk(text: string, size = 40, overlap = 10): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    out.push(text.slice(i, i + size));
    if (i + size >= text.length) break;
  }
  return out;
}

function score(query: string, chunk: string): number {
  const q = new Set(query.toLowerCase().split(/\\s+/));
  return [...q].filter(t => chunk.toLowerCase().includes(t)).length;
}

function retrieve(docs: string[], query: string, k: number): string[] {
  const chunks = docs.flatMap((d, i) => chunk(d).map(c => \`[\${i}] \${c}\`));
  return chunks
    .map(c => ({ c, s: score(query, c) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map(x => x.c);
}

function packContext(chunks: string[], budget = 200): string {
  let used = 0;
  const picked: string[] = [];
  for (const c of chunks) {
    if (used + c.length > budget) break;
    picked.push(c);
    used += c.length;
  }
  return picked.join('\\n---\\n');
}

const docs = ['RAG retrieves chunks then packs context for generation.'];
const query = 'rag context';
const top = retrieve(docs, query, 3);
console.log('Retrieved:', top);
console.log('Packed prompt context:\\n', packContext(top));`,
  },
  {
    artifactId: 'llm-eval-harness',
    title: 'LLM eval harness',
    language: 'typescript',
    problem: `# LLM eval harness

A dataset + grader harness that scores LLM output on every prompt/model change.

## Success criteria
1. Fixed dataset of inputs with expected behavior
2. At least one deterministic grader and one LLM-as-judge grader
3. Runs as a single command and prints a score

## Deliverables
- Harness code
- Baseline score

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Case = { input: string; expect: string };
type Grader = (input: string, output: string, expect: string) => number;

const exact: Grader = (_, out, exp) => (out.trim() === exp.trim() ? 1 : 0);
const contains: Grader = (_, out, exp) => (out.includes(exp) ? 1 : 0);

function runEval(model: (input: string) => string, cases: Case[], graders: Grader[]) {
  const perCase = cases.map(c => {
    const out = model(c.input);
    const scores = graders.map(g => g(c.input, out, c.expect));
    return { input: c.input, out, scores, pass: scores.every(s => s === 1) };
  });
  const avg = perCase.reduce((s, r) => s + (r.pass ? 1 : 0), 0) / cases.length;
  return { avgPassRate: avg, results: perCase };
}

const cases: Case[] = [
  { input: '2+2', expect: '4' },
  { input: 'capital of France', expect: 'Paris' },
];
const stubModel = (input: string) => (input.includes('2+2') ? '4' : 'Paris');
console.log(runEval(stubModel, cases, [exact, contains]));`,
  },
  {
    artifactId: 'model-router',
    title: 'Model router',
    language: 'typescript',
    problem: `# Model router

Route each request to the cheapest model that passes evals for that request class.

## Success criteria
1. Classify request difficulty
2. Dispatch to a cheap or strong model accordingly
3. Track cost and latency per route

## Deliverables
- Router code
- Cost comparison

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Route = 'cheap' | 'strong';
type Request = { id: string; tokens: number; needsTools: boolean; complexity: number };

function classify(req: Request): Route {
  if (req.needsTools || req.complexity > 0.7 || req.tokens > 1200) return 'strong';
  return 'cheap';
}

const costs = { cheap: 0.0002, strong: 0.002 } as const;
const latency = { cheap: 120, strong: 450 } as const;

function dispatch(req: Request) {
  const route = classify(req);
  return { id: req.id, route, estCostUsd: costs[route] * req.tokens, estLatencyMs: latency[route] };
}

const batch: Request[] = [
  { id: 'a', tokens: 200, needsTools: false, complexity: 0.2 },
  { id: 'b', tokens: 800, needsTools: true, complexity: 0.5 },
];
console.log(batch.map(dispatch));`,
  },
  {
    artifactId: 'api-key-system',
    title: 'Reusable API key system',
    language: 'typescript',
    problem: `# Reusable API key system

Issue, hash, scope, and rotate API keys for machine clients.

## Success criteria
1. Keys stored only as hashes
2. Prefix for log-searchability
3. Scopes and a revocation path

## Deliverables
- Module code
- Tests

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `import { createHash, randomBytes } from 'crypto';

function issueKey(prefix = 'sk_live'): { raw: string; hash: string; prefix: string } {
  const secret = randomBytes(24).toString('hex');
  const raw = \`\${prefix}_\${secret}\`;
  const hash = createHash('sha256').update(raw).digest('hex');
  return { raw, hash, prefix: raw.slice(0, 12) };
}

function verifyKey(raw: string, storedHash: string): boolean {
  const hash = createHash('sha256').update(raw).digest('hex');
  return hash === storedHash;
}

const issued = issueKey();
console.log('Issued prefix:', issued.prefix);
console.log('Verify ok:', verifyKey(issued.raw, issued.hash));`,
  },
  {
    artifactId: 'rate-limiter',
    title: 'Reusable rate limiter',
    language: 'typescript',
    problem: `# Reusable rate limiter

A token-bucket rate limiter usable as middleware.

## Success criteria
1. Token bucket with configurable rate and burst
2. Returns 429 with a Retry-After header
3. Works across processes (shared store)

## Deliverables
- Module code
- Tests

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Bucket = { tokens: number; updatedAt: number };
const store = new Map<string, Bucket>();

function take(key: string, ratePerSec: number, burst: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  const bucket = store.get(key) ?? { tokens: burst, updatedAt: now };
  const elapsed = (now - bucket.updatedAt) / 1000;
  bucket.tokens = Math.min(burst, bucket.tokens + elapsed * ratePerSec);
  bucket.updatedAt = now;
  if (bucket.tokens < 1) {
    const retryAfterSec = (1 - bucket.tokens) / ratePerSec;
    store.set(key, bucket);
    return { ok: false, retryAfterSec };
  }
  bucket.tokens -= 1;
  store.set(key, bucket);
  return { ok: true, retryAfterSec: 0 };
}

console.log('First:', take('user-1', 2, 5));
console.log('Burst drain:', Array.from({ length: 6 }, () => take('user-1', 2, 5).ok));`,
  },
  {
    artifactId: 'job-queue-retries',
    title: 'Job queue with retries and DLQ',
    language: 'typescript',
    problem: `# Job queue with retries and DLQ

A background job queue with backoff, jitter, and a dead-letter queue.

## Success criteria
1. Retries with exponential backoff and jitter
2. Poison messages routed to a DLQ
3. Idempotent consumer handling

## Deliverables
- Module code
- Tests

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Job = { id: string; payload: string; attempts: number };
const queue: Job[] = [];
const dlq: Job[] = [];

function enqueue(payload: string) {
  queue.push({ id: String(queue.length + dlq.length + 1), payload, attempts: 0 });
}

function processOnce(handler: (p: string) => boolean, maxAttempts = 3) {
  const job = queue.shift();
  if (!job) return null;
  const ok = handler(job.payload);
  if (ok) return { status: 'done', job };
  job.attempts += 1;
  if (job.attempts >= maxAttempts) {
    dlq.push(job);
    return { status: 'dlq', job };
  }
  const backoffMs = 2 ** job.attempts * 100 + Math.floor(Math.random() * 50);
  queue.push(job);
  return { status: 'retry', job, backoffMs };
}

enqueue('charge:42');
enqueue('email:welcome');
console.log(processOnce(p => p.startsWith('email')));
console.log(processOnce(() => false));
console.log(processOnce(() => false));
console.log({ queue: queue.length, dlq: dlq.length });`,
  },
  {
    artifactId: 'structured-logging',
    title: 'Structured logging package',
    language: 'typescript',
    problem: `# Structured logging package

A structured logger with a request correlation id.

## Success criteria
1. JSON-structured log lines
2. Correlation id propagated through a request
3. Log levels and queryable fields

## Deliverables
- Module code

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Level = 'debug' | 'info' | 'warn' | 'error';
let correlationId = 'req-' + Math.random().toString(36).slice(2, 8);

function withCorrelation(id: string) {
  correlationId = id;
}

function log(level: Level, msg: string, fields: Record<string, unknown> = {}) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    correlationId,
    ...fields,
  };
  console.log(JSON.stringify(line));
}

withCorrelation('req-abc123');
log('info', 'request_started', { path: '/search', userId: 'u1' });
log('info', 'request_finished', { status: 200, latencyMs: 34 });`,
  },
  {
    artifactId: 'toy-lsm',
    title: 'Toy LSM tree',
    language: 'typescript',
    problem: `# Toy LSM tree

A minimal LSM storage engine: memtable, SSTables, compaction.

## Success criteria
1. Writes buffered in a memtable and flushed to immutable sorted files
2. Reads merge across files; deletes are tombstones
3. A simple compaction pass

## Deliverables
- Code commit
- Note on read/write amplification

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Entry = { key: string; value: string; tombstone?: boolean };
class MemTable {
  private map = new Map<string, Entry>();
  put(key: string, value: string) { this.map.set(key, { key, value }); }
  del(key: string) { this.map.set(key, { key, value: '', tombstone: true }); }
  entries() { return [...this.map.values()].sort((a, b) => a.key.localeCompare(b.key)); }
}

class ToyLSM {
  mem = new MemTable();
  sstables: Entry[][] = [];
  flush() {
    const sorted = this.mem.entries();
    if (sorted.length) this.sstables.unshift(sorted);
    this.mem = new MemTable();
  }
  get(key: string): string | null {
    const live = this.mem.entries().find(e => e.key === key);
    if (live) return live.tombstone ? null : live.value;
    for (const level of this.sstables) {
      const hit = level.find(e => e.key === key);
      if (hit) return hit.tombstone ? null : hit.value;
    }
    return null;
  }
}

const db = new ToyLSM();
db.mem.put('a', '1');
db.flush();
db.mem.put('a', '2');
console.log('Read merge:', db.get('a'));`,
  },
  {
    artifactId: 'toy-wal',
    title: 'Toy write-ahead log',
    language: 'typescript',
    problem: `# Toy write-ahead log

An append-only WAL with crash recovery.

## Success criteria
1. Append + fsync before acknowledging a write
2. Replay the log to recover state after a crash
3. Checkpoint/truncation to bound log size

## Deliverables
- Code commit
- Crash-recovery test

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type WalEntry = { op: 'put' | 'del'; key: string; value?: string };
const wal: WalEntry[] = [];
const state = new Map<string, string>();

function append(entry: WalEntry) {
  wal.push(entry);
}

function apply(entry: WalEntry) {
  if (entry.op === 'put') state.set(entry.key, entry.value ?? '');
  else state.delete(entry.key);
}

function commit(entry: WalEntry) {
  append(entry);
  apply(entry);
}

function recover(log: WalEntry[]) {
  state.clear();
  for (const e of log) apply(e);
}

commit({ op: 'put', key: 'user:1', value: 'alice' });
commit({ op: 'put', key: 'user:2', value: 'bob' });
const snapshot = [...wal];
state.clear();
recover(snapshot);
console.log('Recovered state:', Object.fromEntries(state));`,
  },
  {
    artifactId: 'object-storage-index',
    title: 'Object-storage-backed index',
    language: 'typescript',
    problem: `# Object-storage-backed index

Store index segments in object storage with a hot in-memory cache.

## Success criteria
1. Index segments persisted as immutable objects
2. A cache in front of object storage
3. Cold-read latency measured and noted

## Deliverables
- Code commit
- Latency note

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Segment = { id: string; terms: Record<string, string[]> };
class SegmentCache {
  private cache = new Map<string, Segment>();
  constructor(private fetch: (id: string) => Promise<Segment>) {}
  async get(id: string): Promise<Segment> {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const seg = await this.fetch(id);
    this.cache.set(id, seg);
    return seg;
  }
}

const objectStore = new Map<string, Segment>([
  ['seg-1', { id: 'seg-1', terms: { bm25: ['d1'], vector: ['d2'] } }],
]);

const cache = new SegmentCache(async id => {
  await new Promise(r => setTimeout(r, 5));
  return objectStore.get(id)!;
});

const t0 = Date.now();
await cache.get('seg-1');
const cold = Date.now() - t0;
const t1 = Date.now();
await cache.get('seg-1');
const hot = Date.now() - t1;
console.log({ coldMs: cold, hotMs: hot, segment: await cache.get('seg-1') });`,
  },
  {
    artifactId: 'search-platform-design-doc',
    title: 'Search platform design doc',
    language: 'typescript',
    problem: `# Search platform design doc

An architecture doc for a search platform: ingestion, indexing, query, ranking.

## Success criteria
1. Separate ingestion/indexing and query paths
2. Storage and segment/compaction story
3. Capacity estimate and failure-mode review

## Deliverables
- Design doc
- Architecture diagram

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `// Design doc artifact — use the Problem panel + Draw panel for architecture.

/*
Deliverables:
- Design doc
- Architecture diagram
*/

const checklist = [
  "Separate ingestion/indexing and query paths",
  "Storage and segment/compaction story",
  "Capacity estimate and failure-mode review"
];

function progress(): { done: number; total: number } {
  const done = checklist.filter((_, i) => i < 2).length;
  return { done, total: checklist.length };
}

console.log('Success criteria:', checklist.length);
console.log('Draft progress:', progress());`,
  },
  {
    artifactId: 'rag-system-design-doc',
    title: 'RAG system design doc',
    language: 'typescript',
    problem: `# RAG system design doc

An architecture doc for a production RAG system with an eval gate.

## Success criteria
1. Offline ingestion and online query pipelines defined
2. Eval harness as part of the architecture
3. Freshness/re-indexing strategy

## Deliverables
- Design doc
- Architecture diagram

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `// Design doc artifact — use the Problem panel + Draw panel for architecture.

/*
Deliverables:
- Design doc
- Architecture diagram
*/

const checklist = [
  "Offline ingestion and online query pipelines defined",
  "Eval harness as part of the architecture",
  "Freshness/re-indexing strategy"
];

function progress(): { done: number; total: number } {
  const done = checklist.filter((_, i) => i < 2).length;
  return { done, total: checklist.length };
}

console.log('Success criteria:', checklist.length);
console.log('Draft progress:', progress());`,
  },
  {
    artifactId: 'ab-test-analysis-report',
    title: 'A/B test analysis report',
    language: 'typescript',
    problem: `# A/B test analysis report

Analyze a mock or real experiment: check SRM, compute CI on the lift, interpret p-value and practical significance, and write a ship/no-ship recommendation.

## Success criteria
1. Document sample sizes per variant and check for sample ratio mismatch
2. Report point estimate and 95% CI for the primary metric
3. State null/alternative, p-value interpretation, and Type I/II tradeoff in plain English
4. Recommend ship, iterate, or extend the test with a one-paragraph rationale

## Deliverables
- Written report (1–2 pages)
- Optional notebook or spreadsheet with calculations

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `// Written analysis artifact — extend the outline below into your report.

/*
Sections to cover:
1. Document sample sizes per variant and check for sample ratio mismatch
2. Report point estimate and 95% CI for the primary metric
3. State null/alternative, p-value interpretation, and Type I/II tradeoff in plain English
4. Recommend ship, iterate, or extend the test with a one-paragraph rationale
*/

type Section = { heading: string; bullets: string[] };
const outline: Section[] = [
  { heading: 'Setup', bullets: ['Data source', 'Assumptions stated up front'] },
  { heading: 'Analysis', bullets: ['Primary metric + CI', 'Sanity checks'] },
  { heading: 'Recommendation', bullets: ['Ship / iterate / extend', 'Limitations'] },
];

function wordCount(sections: Section[]): number {
  return sections.reduce((n, s) => n + s.heading.length + s.bullets.join(' ').length, 0);
}

console.log('Outline sections:', outline.length);
console.log('Starter word budget:', wordCount(outline));`,
  },
  {
    artifactId: 'simulate-random-processes',
    title: 'Simulate coin flips, dice, and random walks',
    language: 'typescript',
    problem: `# Simulate coin flips, dice, and random walks

Code simulators (no stats libraries): Bernoulli trials, dice sums, and a 1D random walk. Plot or print distributions and compare sample mean to theory.

## Success criteria
1. 10k coin flips: sample proportion within 0.02 of 0.5
2. Dice sum histogram matches triangular shape qualitatively
3. Random walk: report mean displacement and max |position| over T steps

## Deliverables
- Runnable script/notebook
- One paragraph: what matched theory vs sampling noise

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function rand(): number { return Math.random(); }

function coinFlips(n: number) {
  let heads = 0;
  for (let i = 0; i < n; i++) if (rand() < 0.5) heads++;
  return { trials: n, heads, proportion: heads / n };
}

function diceSumHistogram(trials: number): Record<number, number> {
  const hist: Record<number, number> = {};
  for (let i = 0; i < trials; i++) {
    const sum = (Math.floor(rand() * 6) + 1) + (Math.floor(rand() * 6) + 1);
    hist[sum] = (hist[sum] ?? 0) + 1;
  }
  return hist;
}

function randomWalk(steps: number) {
  let pos = 0;
  let maxAbs = 0;
  for (let t = 0; t < steps; t++) {
    pos += rand() < 0.5 ? -1 : 1;
    maxAbs = Math.max(maxAbs, Math.abs(pos));
  }
  return { steps, finalPosition: pos, maxAbsPosition: maxAbs };
}

console.log('10k coin flips:', coinFlips(10_000));
console.log('Dice sums (sample):', diceSumHistogram(1000));
console.log('Random walk:', randomWalk(1000));`,
  },
  {
    artifactId: 'impl-descriptive-stats',
    title: 'Implement mean, variance, correlation from scratch',
    language: 'typescript',
    problem: `# Implement mean, variance, correlation from scratch

On a real CSV (or synthetic data), compute mean, variance, std dev, covariance, and Pearson r without pandas/numpy — loops only.

## Success criteria
1. Functions: mean, variance (sample), covariance, correlation
2. Spot-check against a calculator on 5 hand-picked pairs
3. Document when you would use median instead of mean on this dataset

## Deliverables
- Code
- Output table for ≥3 columns

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs: number[]): number {
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
}

function covariance(a: number[], b: number[]): number {
  const ma = mean(a), mb = mean(b);
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - ma) * (b[i] - mb);
  return sum / (a.length - 1);
}

function correlation(a: number[], b: number[]): number {
  return covariance(a, b) / (Math.sqrt(variance(a)) * Math.sqrt(variance(b)));
}

const x = [1, 2, 3, 4, 5];
const y = [2, 4, 5, 4, 5];
console.log({ meanX: mean(x), stdX: Math.sqrt(variance(x)), corr: correlation(x, y) });`,
  },
  {
    artifactId: 'debunk-fake-trading-signal',
    title: 'Analyze a fake trading signal',
    language: 'typescript',
    problem: `# Analyze a fake trading signal

Given (or generate) a spurious 'alpha' signal on synthetic or historical noise, show why it fails: multiple testing, in-sample overfit, or non-stationarity.

## Success criteria
1. Reproduce the 'great' in-sample metric
2. Show out-of-sample or holdout collapse
3. Name the statistical mistake (p-hacking, data snooping, regime shift, etc.)

## Deliverables
- Short writeup
- One chart or table

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `// Written analysis artifact — extend the outline below into your report.

/*
Sections to cover:
1. Reproduce the 'great' in-sample metric
2. Show out-of-sample or holdout collapse
3. Name the statistical mistake (p-hacking, data snooping, regime shift, etc.)
*/

type Section = { heading: string; bullets: string[] };
const outline: Section[] = [
  { heading: 'Setup', bullets: ['Data source', 'Assumptions stated up front'] },
  { heading: 'Analysis', bullets: ['Primary metric + CI', 'Sanity checks'] },
  { heading: 'Recommendation', bullets: ['Ship / iterate / extend', 'Limitations'] },
];

function wordCount(sections: Section[]): number {
  return sections.reduce((n, s) => n + s.heading.length + s.bullets.join(' ').length, 0);
}

console.log('Outline sections:', outline.length);
console.log('Starter word budget:', wordCount(outline));`,
  },
  {
    artifactId: 'math-weekly-writeup',
    title: 'Weekly math writeup (public note)',
    language: 'typescript',
    problem: `# Weekly math writeup (public note)

Explain one concept you drilled this week in your own words — derive or prove one step, include one mistake you caught yourself making.

## Success criteria
1. No copy-paste from videos; prose is yours
2. Contains at least one worked example or derivation
3. States one assumption you had wrong and corrected

## Deliverables
- Published or draft note (≥300 words)

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `// Written analysis artifact — extend the outline below into your report.

/*
Sections to cover:
1. No copy-paste from videos; prose is yours
2. Contains at least one worked example or derivation
3. States one assumption you had wrong and corrected
*/

type Section = { heading: string; bullets: string[] };
const outline: Section[] = [
  { heading: 'Setup', bullets: ['Data source', 'Assumptions stated up front'] },
  { heading: 'Analysis', bullets: ['Primary metric + CI', 'Sanity checks'] },
  { heading: 'Recommendation', bullets: ['Ship / iterate / extend', 'Limitations'] },
];

function wordCount(sections: Section[]): number {
  return sections.reduce((n, s) => n + s.heading.length + s.bullets.join(' ').length, 0);
}

console.log('Outline sections:', outline.length);
console.log('Starter word budget:', wordCount(outline));`,
  },
  {
    artifactId: 'impl-matrix-multiply',
    title: 'Implement matrix multiplication from scratch',
    language: 'typescript',
    problem: `# Implement matrix multiplication from scratch

General m×n by n×p matmul with nested loops; apply to a 2D rotation + scale transform on points.

## Success criteria
1. Correct matmul on 3×3 test case vs hand calculation
2. Apply transform to ≥4 points; verify orthogonality preserved for pure rotation

## Deliverables
- Code
- Before/after coordinates

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function matmul(A: number[][], B: number[][]): number[][] {
  const m = A.length, n = B[0].length, p = B.length;
  const C = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < p; k++) C[i][j] += A[i][k] * B[k][j];
    }
  }
  return C;
}

function transform2D(points: [number, number][], theta: number, scale = 1) {
  const R = [
    [scale * Math.cos(theta), -scale * Math.sin(theta)],
    [scale * Math.sin(theta), scale * Math.cos(theta)],
  ];
  return points.map(([x, y]) => {
    const [xp, yp] = matmul(R, [[x], [y]]).map(r => r[0]);
    return [xp, yp] as [number, number];
  });
}

const square: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
console.log('Rotated square:', transform2D(square, Math.PI / 4));`,
  },
  {
    artifactId: 'impl-ols-from-scratch',
    title: 'Least-squares regression from scratch',
    language: 'typescript',
    problem: `# Least-squares regression from scratch

Fit y = Xβ via normal equations (XᵀX)β = Xᵀy using your matmul — no sklearn. Report β, residuals, R².

## Success criteria
1. Matches sklearn/polyfit on a 2-feature toy dataset within 1e-6
2. Plot residuals; comment on one outlier's leverage

## Deliverables
- Code
- β vector and R²

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function transpose(m: number[][]): number[][] {
  return m[0].map((_, j) => m.map(row => row[j]));
}

function matmul(A: number[][], B: number[][]): number[][] {
  const rows = A.length, cols = B[0].length, inner = B.length;
  const out = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      for (let j = 0; j < cols; j++) out[i][j] += A[i][k] * B[k][j];
    }
  }
  return out;
}

function invert2x2(m: number[][]): number[][] {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  return [
    [m[1][1] / det, -m[0][1] / det],
    [-m[1][0] / det, m[0][0] / det],
  ];
}

function ols(Xraw: number[][], y: number[]) {
  const X = Xraw.map(row => [1, ...row]);
  const Xt = transpose(X);
  const XtX = matmul(Xt, X);
  const Xty = matmul(Xt, y.map(v => [v]));
  const beta = matmul(invert2x2(XtX), Xty).map(r => r[0]);
  const yHat = X.map(row => row.reduce((s, x, i) => s + x * beta[i], 0));
  const resid = y.map((yi, i) => yi - yHat[i]);
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  const ssRes = resid.reduce((s, r) => s + r * r, 0);
  const ssTot = y.reduce((s, yi) => s + (yi - yMean) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  return { beta, residuals: resid, r2 };
}

const X = [[1], [2], [3], [4]];
const y = [2.1, 3.9, 6.2, 8.1];
console.log('OLS fit:', ols(X, y));`,
  },
  {
    artifactId: 'impl-pca-from-scratch',
    title: 'PCA from scratch',
    language: 'typescript',
    problem: `# PCA from scratch

Center data, compute covariance matrix, eigen-decompose, project to 2D. Visualize.

## Success criteria
1. Top-2 eigenvectors explain ≥70% variance on a test dataset
2. 2D scatter of projected points
3. One sentence: what the first principal component 'means' for your data

## Deliverables
- Code
- Scree plot or variance ratios

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function meanCols(X: number[][]): number[] {
  const n = X.length, d = X[0].length;
  return Array.from({ length: d }, (_, j) => X.reduce((s, row) => s + row[j], 0) / n);
}

function covariance(X: number[][]): number[][] {
  const n = X.length, d = X[0].length;
  const mu = meanCols(X);
  const C = Array.from({ length: d }, () => Array(d).fill(0));
  for (const row of X) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) C[i][j] += (row[i] - mu[i]) * (row[j] - mu[j]);
    }
  }
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) C[i][j] /= n - 1;
  return C;
}

function powerIteration(C: number[][], steps = 40): number[] {
  let v = C.map(() => Math.random());
  const norm = () => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  for (let t = 0; t < steps; t++) {
    const w = C.map(row => row.reduce((s, c, i) => s + c * v[i], 0));
    const n = Math.sqrt(w.reduce((s, x) => s + x * x, 0));
    v = w.map(x => x / (n || 1));
  }
  return v;
}

const X = [[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0], [2.3, 2.7]];
const C = covariance(X);
const pc1 = powerIteration(C);
console.log('Covariance:', C);
console.log('PC1 direction:', pc1);`,
  },
  {
    artifactId: 'visualize-projections',
    title: 'Visualize linear projections',
    language: 'typescript',
    problem: `# Visualize linear projections

Draw vector projection onto a line/subspace: show orthogonal residual. Connect to OLS geometry.

## Success criteria
1. Diagram or plot: vector, subspace, projection, residual orthogonal
2. Numeric check: residual · subspace direction = 0

## Deliverables
- Figure
- 3-sentence geometric explanation

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function project(v: [number, number], u: [number, number]): [number, number] {
  const dot = v[0] * u[0] + v[1] * u[1];
  const unorm2 = u[0] * u[0] + u[1] * u[1];
  const scale = dot / unorm2;
  return [scale * u[0], scale * u[1]];
}

function residual(v: [number, number], p: [number, number]): [number, number] {
  return [v[0] - p[0], v[1] - p[1]];
}

const v: [number, number] = [3, 4];
const u: [number, number] = [1, 1];
const p = project(v, u);
const r = residual(v, p);
const orthogonal = r[0] * u[0] + r[1] * u[1];
console.log({ v, subspace: u, projection: p, residual: r, dotResidualSubspace: orthogonal });`,
  },
  {
    artifactId: 'quant-returns-pipeline',
    title: 'Price data → daily returns pipeline',
    language: 'typescript',
    problem: `# Price data → daily returns pipeline

Ingest adjusted close prices (CSV or free API), compute simple/log daily returns, handle missing days.

## Success criteria
1. ≥1 year daily data for one ticker
2. Returns series with correct alignment (no look-ahead)
3. Sanity: mean daily return and count of trading days documented

## Deliverables
- Code
- returns.csv or equivalent

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type PriceRow = { date: string; close: number };

function parsePrices(csv: string): PriceRow[] {
  return csv
    .trim()
    .split('\\n')
    .slice(1)
    .map(line => {
      const [date, close] = line.split(',');
      return { date, close: Number(close) };
    })
    .filter(r => Number.isFinite(r.close));
}

function simpleReturns(prices: PriceRow[]): { date: string; ret: number }[] {
  const out: { date: string; ret: number }[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].close;
    const curr = prices[i].close;
    if (prev <= 0) continue;
    out.push({ date: prices[i].date, ret: (curr - prev) / prev });
  }
  return out;
}

function logReturns(prices: PriceRow[]): { date: string; ret: number }[] {
  const out: { date: string; ret: number }[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1].close;
    const curr = prices[i].close;
    if (prev <= 0 || curr <= 0) continue;
    out.push({ date: prices[i].date, ret: Math.log(curr / prev) });
  }
  return out;
}

const sample = \`date,close
2024-01-02,100
2024-01-03,101.5
2024-01-04,100.8
2024-01-05,102.2\`;
const prices = parsePrices(sample);
const rets = simpleReturns(prices);
console.log('Trading days:', prices.length);
console.log('Simple returns:', rets);
console.log('Mean daily return:', rets.reduce((s, r) => s + r.ret, 0) / rets.length);`,
  },
  {
    artifactId: 'quant-risk-dashboard',
    title: 'Volatility, Sharpe, drawdown, correlation matrix',
    language: 'typescript',
    problem: `# Volatility, Sharpe, drawdown, correlation matrix

On 2–5 tickers: annualized vol, Sharpe (assume rf=0 or document rate), max drawdown, pairwise correlation matrix.

## Success criteria
1. All metrics computed from returns you built (not pre-built risk APIs)
2. Correlation matrix symmetric, diag = 1
3. One paragraph interpreting whether diversification shows up

## Deliverables
- Code
- Metrics table

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function std(xs: number[]): number {
  const m = mean(xs);
  const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

function annualizedVol(dailyReturns: number[], tradingDays = 252): number {
  return std(dailyReturns) * Math.sqrt(tradingDays);
}

function sharpe(dailyReturns: number[], rfDaily = 0, tradingDays = 252): number {
  const excess = dailyReturns.map(r => r - rfDaily);
  const vol = std(excess);
  return vol === 0 ? 0 : (mean(excess) / vol) * Math.sqrt(tradingDays);
}

function maxDrawdown(equity: number[]): number {
  let peak = equity[0];
  let maxDd = 0;
  for (const v of equity) {
    peak = Math.max(peak, v);
    maxDd = Math.max(maxDd, (peak - v) / peak);
  }
  return maxDd;
}

function correlation(a: number[], b: number[]): number {
  const ma = mean(a), mb = mean(b);
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) {
    const xa = a[i] - ma, xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  return num / Math.sqrt(da * db);
}

const spy = [0.01, -0.005, 0.002, 0.008, -0.012];
const qqq = [0.012, -0.008, 0.004, 0.01, -0.015];
const equity = spy.reduce<number[]>((acc, r) => {
  const prev = acc.length ? acc[acc.length - 1] : 1;
  acc.push(prev * (1 + r));
  return acc;
}, []);

console.log({
  volSpy: annualizedVol(spy),
  sharpeSpy: sharpe(spy),
  maxDrawdown: maxDrawdown(equity),
  corrSpyQqq: correlation(spy, qqq),
});`,
  },
  {
    artifactId: 'momentum-backtest-benchmark',
    title: 'Simple momentum backtest vs SPY/QQQ',
    language: 'typescript',
    problem: `# Simple momentum backtest vs SPY/QQQ

12-month momentum rule on 1–3 names; compare cumulative return to SPY or QQQ over the same window. State assumptions and survivorship bias.

## Success criteria
1. Rule written before seeing full-sample results (or use holdout half)
2. Equity curve: strategy vs benchmark
3. Honest limitations section (costs, slippage, overfitting)

## Deliverables
- Code
- Equity curve chart
- Limitations paragraph

**Gym rules:** Run code, change parameters, ship when criteria are met.`,
    code: `type Bar = { date: string; close: number };
function momentumSignal(history: Bar[], lookback = 12): number {
  if (history.length <= lookback) return 0;
  const past = history[history.length - lookback - 1].close;
  const now = history[history.length - 1].close;
  return now > past ? 1 : 0;
}

function backtest(bars: Bar[], benchmark: Bar[]) {
  let equity = 1;
  const curve: number[] = [equity];
  for (let i = 1; i < bars.length; i++) {
    const hist = bars.slice(0, i + 1);
    const pos = momentumSignal(hist);
    const ret = (bars[i].close - bars[i - 1].close) / bars[i - 1].close;
    equity *= 1 + pos * ret;
    curve.push(equity);
  }
  const bmk = benchmark[benchmark.length - 1].close / benchmark[0].close - 1;
  const strat = equity - 1;
  return { strategyReturn: strat, benchmarkReturn: bmk, curve };
}

const bars: Bar[] = Array.from({ length: 24 }, (_, i) => ({ date: String(i), close: 100 + i * 0.5 + (i % 3) }));
console.log(backtest(bars, bars));`,
  }];

const BY_ID = Object.fromEntries(TEMPLATES.map(t => [t.artifactId, t]));

export function getPlaygroundTemplate(artifactId: string | null | undefined): PlaygroundTemplate | null {
  if (!artifactId) return null;
  return BY_ID[artifactId] ?? null;
}

const MATH_ARTIFACT_PREFIXES = [
  'simulate-',
  'impl-',
  'debunk-',
  'math-',
  'quant-',
  'momentum-',
  'ab-test-',
  'build-derivatives',
  'build-classical',
  'build-bayesian',
  'build-matrix',
  'build-stationarity',
  'visualize-projections',
];

export function listMathPlaygroundTemplates(): PlaygroundTemplate[] {
  return TEMPLATES.filter(t =>
    MATH_ARTIFACT_PREFIXES.some(p => t.artifactId.startsWith(p))
    || t.artifactId.includes('ols')
    || t.artifactId.includes('pca'),
  );
}
