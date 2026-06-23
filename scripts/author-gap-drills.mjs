#!/usr/bin/env node
/** Editorial drills for concepts that only had bootstrap drill-* placeholders. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const drillsPath = resolve(root, 'src/data/drills.json');
const conceptsPath = resolve(root, 'src/data/concepts.json');

const GAP_DRILLS = [
  {
    id: 'cross-encoder-rerank',
    conceptId: 'reranking',
    title: 'Cross-encoder rerank top-k',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Retrieve top-5 by BM25, then rerank with scores [0.9,0.2,0.8,0.1,0.7] for query "payment API". Return new order.',
    expectedOutput: 'Doc0, Doc2, Doc4, Doc1, Doc3.',
    hints: ['Reranker sees query+doc jointly.', 'Only score the small candidate set.'],
    solutionNotes: 'Retrieve wide, rerank narrow.',
  },
  {
    id: 'spell-correct-query',
    conceptId: 'query-rewriting',
    title: 'Spell-correct a search query',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Query "javascrpt react hooks" → suggest correction using edit distance ≤2 against vocab ["javascript","react","hooks","python"].',
    expectedOutput: 'javascript react hooks.',
    hints: ['Rewrite before retrieval.', 'Keep original as fallback.'],
    solutionNotes: 'Query understanding is cheap recall insurance.',
  },
  {
    id: 'browse-vs-search-metrics',
    conceptId: 'search-discovery',
    title: 'Browse vs search metrics',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Discovery feed: which metric — CTR, dwell time, or nDCG@10? Pick one for homepage browse, one for keyword search, justify in one line each.',
    expectedOutput: 'Browse: dwell/engagement; search: nDCG/precision@k.',
    hints: ['Discovery has weak intent.', 'Keyword search has explicit relevance labels.'],
    solutionNotes: 'Do not grade browse like search.',
  },
  {
    id: 'ivf-nprobe-recall',
    conceptId: 'ivf',
    title: 'IVF nprobe vs recall',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt:
      '100k vectors, 1000 centroids, nprobe=1 recalls 70%, nprobe=8 recalls 92%. Latency 2ms→9ms. Pick nprobe for prod if SLA is 5ms and recall target 85%.',
    expectedOutput: 'nprobe=8 exceeds recall but misses SLA; try nprobe=4 and measure curve.',
    hints: ['More cells scanned → higher recall, higher latency.'],
    solutionNotes: 'IVF is a knob, not a constant.',
  },
  {
    id: 'pq-codebook-size',
    conceptId: 'product-quantization',
    title: 'PQ codebook footprint',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt:
      '1536-d vector, m=48 subspaces, 256 centroids per subspace, 1 byte code/subspace. Bytes per vector vs raw float32?',
    expectedOutput: '48 bytes vs 6144 bytes (~128× compression).',
    hints: ['Each subspace stores an index 0–255.', 'Distance is approximate.'],
    solutionNotes: 'PQ trades accuracy for RAM.',
  },
  {
    id: 'read-recall-latency-curve',
    conceptId: 'recall-latency-tradeoffs',
    title: 'Read a recall–latency curve',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt:
      'ANN curve: 95% recall @ 8ms, 99% @ 25ms, brute force 100% @ 200ms. Which point do you ship for interactive search?',
    expectedOutput: '95%/8ms if UX budget ~10ms; document regression vs brute force.',
    hints: ['Plot recall on Y, latency on X.', 'Brute force anchors truth.'],
    solutionNotes: 'Pick an operating point, not a single number.',
  },
  {
    id: 'pack-context-budget',
    conceptId: 'context-packing',
    title: 'Pack chunks into context budget',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Budget 800 tokens. Chunks A=300,B=400,C=250 relevance [0.9,0.85,0.7]. Greedy pack by relevance until full. Which included?',
    expectedOutput: 'A+B=700; C does not fit entirely — include partial or skip per policy.',
    hints: ['Sort by relevance.', 'Leave room for instructions.'],
    solutionNotes: 'Packing is knapsack with token weights.',
  },
  {
    id: 'agent-step-limit',
    conceptId: 'agent-loops',
    title: 'Cap agent tool loop',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Agent calls tools in a loop. Max 5 steps, same tool 2× in a row triggers stop. Steps: search, search, calc, search, search, calc. When stop?',
    expectedOutput:
      'Stop at step 3 (duplicate search) or step 5 by max steps — implement both guards.',
    hints: ['Infinite loops burn tokens.', 'Log each tool call.'],
    solutionNotes: 'Agents need budgets like any service.',
  },
  {
    id: 'route-by-query-cost',
    conceptId: 'model-routing',
    title: 'Route by cost and difficulty',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Classify queries: "2+2" → small model; "design payment system" → large model. Write a 2-rule router on length and keyword "design".',
    expectedOutput: 'Rule-based router with fallback to large on low confidence.',
    hints: ['Cheap path for easy queries.', 'Escalate on failure.'],
    solutionNotes: 'Routing is a product lever, not just ML.',
  },
  {
    id: 'prompt-version-diff',
    conceptId: 'prompt-versioning',
    title: 'Diff two prompt versions',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'v1 and v2 prompts differ by one instruction. Name what you must re-run before shipping v2.',
    expectedOutput: 'Frozen eval set on both versions; compare pass rate delta.',
    hints: ['Prompts are code — version them.', 'Never ship without eval diff.'],
    solutionNotes: 'Regression gates for prompts.',
  },
  {
    id: 'http-idempotent-retry',
    conceptId: 'http-lifecycle',
    title: 'Idempotent POST retry',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'POST returns 503 after 30s. Client retries. Safe without Idempotency-Key? When is 409 vs 200 on duplicate?',
    expectedOutput:
      'Unsafe without key; Idempotency-Key makes retry safe; duplicate returns cached 200.',
    hints: ['503 may mean server processed request.', 'GET is safe; POST is not.'],
    solutionNotes: 'Retries require idempotency design.',
  },
  {
    id: 'hash-api-key',
    conceptId: 'api-keys',
    title: 'Hash and prefix API keys',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Generate key sk_live_abc123, store SHA-256 hash only, show prefix sk_live for support lookup. Why never store plaintext?',
    expectedOutput: 'Leak of DB does not expose usable secrets.',
    hints: ['Prefix helps support find row.', 'Rotate on compromise.'],
    solutionNotes: 'Treat keys like passwords.',
  },
  {
    id: 'webhook-signature-verify',
    conceptId: 'webhooks',
    title: 'Verify webhook HMAC',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Body b, secret s, header HMAC-SHA256(s,b). Constant-time compare. Why reject if timestamp >5m old?',
    expectedOutput: 'Prevents replay; timing-safe compare prevents forgery leaks.',
    hints: ['Sign raw body bytes.', 'Include timestamp in signed payload.'],
    solutionNotes: 'Webhooks are unsigned HTTP unless you verify.',
  },
  {
    id: 'job-at-least-once',
    conceptId: 'background-jobs',
    title: 'At-least-once job delivery',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Worker crashes after processing but before ACK. What happens on redelivery? How make handler safe?',
    expectedOutput: 'Duplicate delivery; handler must be idempotent or use dedupe keys.',
    hints: ['ACK after side effects = loss risk.', 'ACK before = duplicate risk.'],
    solutionNotes: 'Pick your poison; design for duplicates.',
  },
  {
    id: 'cache-stampede',
    conceptId: 'caching',
    title: 'Cache stampede',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Hot key expires, 1000 requests miss together. Name two mitigations.',
    expectedOutput: 'Probabilistic early expiry, request coalescing/singleflight, mutex per key.',
    hints: ['TTL jitter spreads expiry.', 'One backend fetch serves many waiters.'],
    solutionNotes: 'Hot keys need hot-key strategy.',
  },
  {
    id: 'queue-backpressure',
    conceptId: 'message-queues',
    title: 'Queue backpressure',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Producer 10k msg/s, consumer 2k msg/s. Queue depth grows 8k/s. When shed load — at depth 50k or consumer lag 60s?',
    expectedOutput:
      'Alert on lag and depth; shed at SLA breach; scale consumers or throttle producer.',
    hints: ['Queues are buffers, not infinite.', 'Dead-letter poison messages.'],
    solutionNotes: 'Backpressure is a feature.',
  },
  {
    id: 'slo-error-budget',
    conceptId: 'monitoring-analytics',
    title: 'SLO error budget',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      '99.9% monthly SLO. How many minutes downtime allowed in 30 days? Burn 50% budget in 2 days — ship or freeze?',
    expectedOutput: '~43 min/month; freeze risky releases.',
    hints: ['Budget = 1 − SLO over window.', 'Fast burn → stop deploying.'],
    solutionNotes: 'SLOs turn ops into math.',
  },
  {
    id: 'design-paginated-api',
    conceptId: 'api-design',
    title: 'Design cursor pagination',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'List endpoint returns 10M rows. Why offset pagination fails? Sketch cursor on (created_at, id).',
    expectedOutput: 'Offset scans skip rows; cursor is stable under inserts.',
    hints: ['Opaque cursor encodes position.', 'Consistent sort key required.'],
    solutionNotes: 'Pagination is API design 101.',
  },
  {
    id: 'jwt-vs-session-revoke',
    conceptId: 'auth-systems',
    title: 'JWT revocation tradeoff',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'User logs out. Session store vs JWT blacklist vs short TTL+refresh — pick one for banking app, justify.',
    expectedOutput: 'Short-lived JWT + refresh rotation or server session for instant revoke.',
    hints: ['Stateless JWT cannot revoke without blocklist.', 'Sessions need store.'],
    solutionNotes: 'Auth is a revocation requirement problem.',
  },
  {
    id: 'payment-idempotency',
    conceptId: 'ecommerce-payments',
    title: 'Idempotent charge',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Double-click Pay sends two POST /charge with same Idempotency-Key. How many charges?',
    expectedOutput: 'One charge; second returns same receipt.',
    hints: ['Store key → result mapping 24h.', 'Network retries are normal.'],
    solutionNotes: 'Payments without idempotency are bugs waiting to happen.',
  },
  {
    id: 'b-tree-split',
    conceptId: 'b-tree',
    title: 'B-tree page split',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Page holds 4 keys, insert 5th triggers split. After split how many keys in each page (order 5)?',
    expectedOutput: '2 keys in left, 2 in right, median promoted.',
    hints: ['Split keeps tree balanced.', 'Fanout controls height.'],
    solutionNotes: 'B-trees optimize disk reads.',
  },
  {
    id: 'lsm-compaction-levels',
    conceptId: 'compaction',
    title: 'LSM compaction levels',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt:
      'L0 has 4 SSTables, threshold 4 triggers compaction to L1. Why not compact every write?',
    expectedOutput: 'Compaction is expensive; batching amortizes I/O; reads use bloom + levels.',
    hints: ['L0 may overlap key ranges.', 'Tiered compaction trades write amp for read amp.'],
    solutionNotes: 'LSM is write-optimized with background tax.',
  },
  {
    id: 'object-key-layout',
    conceptId: 'object-storage',
    title: 'Object key layout',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Keys userId/timestamp/uuid vs flat uuid. Name one hot-partition risk and one listing benefit.',
    expectedOutput: 'Prefix listing per user; hot prefix if time-ordered without sharding.',
    hints: ['S3 listing is prefix-based.', 'Shard prefixes for hot tenants.'],
    solutionNotes: 'Key design is query design in object stores.',
  },
  {
    id: 'columnar-vs-row',
    conceptId: 'columnar-storage',
    title: 'Columnar vs row store',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Analytics query: SELECT avg(price) FROM sales WHERE date>2024. Which store wins and why?',
    expectedOutput: 'Columnar — reads only price+date columns, better compression.',
    hints: ['Row store reads whole records.', 'Columnar skips untouched fields.'],
    solutionNotes: 'Workload shape picks the engine.',
  },
  {
    id: 'secondary-index-write',
    conceptId: 'secondary-index',
    title: 'Secondary index write cost',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Table with 3 secondary indexes. One INSERT touches how many index structures?',
    expectedOutput: 'Primary + 3 secondaries = 4 writes (plus WAL).',
    hints: ['Each index is another B-tree insert.', 'Indexes speed reads, tax writes.'],
    solutionNotes: 'Index count is a write-amplification knob.',
  },
  {
    id: 'storage-vs-retrieval',
    conceptId: 'storage-retrieval',
    title: 'Storage vs retrieval API',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Design blob store: PUT by id vs GET by tag. Which needs secondary index? Which is O(1) lookup?',
    expectedOutput: 'PUT/GET by id is primary key O(1); tag search needs inverted/secondary index.',
    hints: ['Object id is content-addressed or assigned.', 'Retrieval patterns drive indexes.'],
    solutionNotes: 'Separate write path from query path.',
  },
  {
    id: 'shard-key-choice',
    conceptId: 'sharding',
    title: 'Pick a shard key',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt:
      'Multi-tenant SaaS: shard by tenant_id vs user_id vs hash(id). Which avoids hot tenant and cross-shard admin queries?',
    expectedOutput:
      'tenant_id co-locates tenant data; hash spreads load; user_id splits tenant across shards.',
    hints: ['Hot tenant needs sub-sharding.', 'Cross-shard queries are expensive.'],
    solutionNotes: 'Shard key is the hardest migration.',
  },
  {
    id: 'replication-lag-read',
    conceptId: 'replication',
    title: 'Read-your-writes under lag',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Write to primary, read replica 200ms later, lag 500ms. User sees stale read. Two fixes?',
    expectedOutput:
      'Read-after-write from primary; session stickiness; sync quorum for critical reads.',
    hints: ['Async replication = eventual consistency.', 'Route recent keys to leader.'],
    solutionNotes: 'Replicas are not interchangeable without thought.',
  },
  {
    id: 'cap-partition-choice',
    conceptId: 'cap-theorem',
    title: 'CAP under partition',
    type: 'coding-problem',
    difficulty: 'core',
    prompt:
      'Network split isolates two DB nodes. Choose CP or AP for payment ledger vs social likes feed.',
    expectedOutput: 'Ledger: CP (reject writes); likes: AP (allow divergence + merge).',
    hints: ['Partition forces C vs A tradeoff.', 'PACELC extends for normal case.'],
    solutionNotes: 'CAP is about partition behavior, not everyday latency.',
  },
  {
    id: 'hessian-learning-rate',
    conceptId: 'multivariable-optimization',
    title: 'Condition number and learning rate',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt: 'Loss Hessian eigenvalues 1 and 100. Why one global lr=0.1 struggles? What helps?',
    expectedOutput:
      'Ill-conditioned — oscillates along high-curvature dir; use Adam/normalization/smaller lr.',
    hints: ['Curvature varies by direction.', 'Adaptive per-parameter methods help.'],
    solutionNotes: 'SGD struggles when bowl is elongated.',
  },
];

const drillsFile = JSON.parse(readFileSync(drillsPath, 'utf8'));
const conceptsFile = JSON.parse(readFileSync(conceptsPath, 'utf8'));
const existing = new Set(drillsFile.drills.map((d) => d.id));
let added = 0;
for (const d of GAP_DRILLS) {
  if (existing.has(d.id)) continue;
  drillsFile.drills.push(d);
  existing.add(d.id);
  added++;
}
let linked = 0;
for (const c of conceptsFile.concepts) {
  const gap = GAP_DRILLS.find((d) => d.conceptId === c.id);
  if (!gap) continue;
  const set = new Set(c.drills ?? []);
  set.delete(`drill-${c.id}`);
  set.add(gap.id);
  c.drills = [...set];
  linked++;
}
writeFileSync(drillsPath, `${JSON.stringify(drillsFile, null, 2)}\n`);
writeFileSync(conceptsPath, `${JSON.stringify(conceptsFile, null, 2)}\n`);
console.log(`Gap drills: added ${added}, linked ${linked} concepts.`);
