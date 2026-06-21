// Timed mock interview prompts — static, no AI required for the shell.
export type MockKind = 'technical' | 'system-design' | 'behavioral';

export interface MockPrompt {
  id: string;
  kind: MockKind;
  title: string;
  durationMinutes: number;
  prompt: string;
  rubric: string[];
  conceptIds?: string[];
}

export const MOCK_PROMPTS: MockPrompt[] = [
  {
    id: 'mock-bm25-ranking',
    kind: 'technical',
    title: 'BM25 vs vector ranking',
    durationMinutes: 25,
    prompt: 'Explain when you would use BM25 vs dense retrieval in a production RAG system. Cover failure modes, hybrid patterns, and how you would evaluate.',
    rubric: [
      'Names lexical vs semantic failure modes',
      'Describes hybrid fusion (RRF or weighted)',
      'Mentions offline eval (nDCG, recall@k) before online',
      'Calls out latency/cost tradeoffs',
    ],
    conceptIds: ['bm25', 'vector-similarity', 'hybrid-search'],
  },
  {
    id: 'mock-rag-pipeline',
    kind: 'technical',
    title: 'RAG pipeline debug',
    durationMinutes: 30,
    prompt: 'Users report RAG answers are confident but wrong. Walk through your debugging checklist from retrieval through generation.',
    rubric: [
      'Checks chunking and citation grounding',
      'Inspects retrieval recall on failing queries',
      'Considers reranker and context window limits',
      'Proposes measurable fixes',
    ],
    conceptIds: ['rag', 'chunking', 'reranking'],
  },
  {
    id: 'mock-url-shortener',
    kind: 'system-design',
    title: 'Design a URL shortener',
    durationMinutes: 45,
    prompt: 'Design bit.ly at 10M writes/day. Cover API, storage, ID generation, redirects, analytics, and hot-key risks.',
    rubric: [
      'Estimates QPS and storage',
      'Picks ID strategy (hash vs counter) with collision handling',
      'Redirect path is low-latency (cache/CDN)',
      'Discusses abuse and rate limits',
    ],
  },
  {
    id: 'mock-rate-limiter',
    kind: 'system-design',
    title: 'Distributed rate limiter',
    durationMinutes: 40,
    prompt: 'Design a global rate limiter for an API gateway. Compare token bucket vs sliding window. How do you enforce per-user limits across regions?',
    rubric: [
      'Compares algorithms with tradeoffs',
      'Handles distributed consistency (Redis, drift)',
      'Defines HTTP 429 contract and headers',
      'Mentions burst vs steady traffic',
    ],
    conceptIds: ['rate-limiting'],
  },
  {
    id: 'mock-conflict-behavioral',
    kind: 'behavioral',
    title: 'Disagreement with a senior engineer',
    durationMinutes: 15,
    prompt: 'Tell me about a time you disagreed with a senior engineer on a technical decision. What was the situation, what did you do, and what was the outcome?',
    rubric: [
      'STAR structure (situation, task, action, result)',
      'Shows respect + data, not ego',
      'Concrete technical detail, not vague',
      'Reflects on what you learned',
    ],
  },
  {
    id: 'mock-failure-behavioral',
    kind: 'behavioral',
    title: 'Production incident ownership',
    durationMinutes: 15,
    prompt: 'Describe a production incident you caused or owned. How did you detect it, mitigate, communicate, and prevent recurrence?',
    rubric: [
      'Clear timeline and blast radius',
      'Ownership without blame-shifting',
      'Postmortem / guardrail actions',
      'Measurable prevention',
    ],
  },
  {
    id: 'mock-lru-cache',
    kind: 'technical',
    title: 'Implement LRU cache',
    durationMinutes: 35,
    prompt: 'Implement an LRU cache with O(1) get and put. Explain your data structures, complexity, and how you would test it.',
    rubric: [
      'Hash map + doubly-linked list (or ordered structure)',
      'O(1) get/put with correct eviction',
      'Handles capacity edge cases',
      'Mentions concurrency extension if asked',
    ],
    conceptIds: ['caching'],
  },
  {
    id: 'mock-two-sum-variants',
    kind: 'technical',
    title: 'Two Sum variants',
    durationMinutes: 25,
    prompt: 'Solve Two Sum, then extend: what if the array is sorted? What if you need all pairs? What if inputs do not fit in memory?',
    rubric: [
      'Hash map O(n) baseline',
      'Two-pointer variant for sorted input',
      'States time/space for each variant',
      'External sort / streaming mention for large inputs',
    ],
    conceptIds: ['array-hashing', 'two-pointers'],
  },
  {
    id: 'mock-chat-system',
    kind: 'system-design',
    title: 'Design WhatsApp / chat',
    durationMinutes: 45,
    prompt: 'Design a real-time chat at 50M DAU. Cover message delivery, ordering, groups, presence, and push notifications.',
    rubric: [
      'WebSocket/long-poll + message queue',
      'Per-chat ordering and idempotency',
      'Fan-out for groups with hot partitions',
      'Offline delivery and read receipts',
    ],
  },
  {
    id: 'mock-news-feed',
    kind: 'system-design',
    title: 'Design a news feed',
    durationMinutes: 45,
    prompt: 'Design Instagram/Twitter home feed for 100M users. Fan-out on write vs read, ranking, and cold-start users.',
    rubric: [
      'Compare fan-out strategies with tradeoffs',
      'Feed ranking pipeline (retrieve → rank → filter)',
      'Caching and precomputation for celebrities',
      'Latency budget per phase',
    ],
  },
  {
    id: 'mock-leadership-behavioral',
    kind: 'behavioral',
    title: 'Leading without authority',
    durationMinutes: 15,
    prompt: 'Tell me about a time you drove a cross-team technical initiative without formal authority.',
    rubric: [
      'STAR with measurable outcome',
      'Shows influence via data and prototypes',
      'Acknowledges conflict resolution',
      'Ties to business impact',
    ],
  },
  {
    id: 'mock-eval-design',
    kind: 'technical',
    title: 'Design a RAG eval suite',
    durationMinutes: 30,
    prompt: 'You own evals for a production RAG system. What metrics, datasets, and gates do you put in CI vs weekly offline runs?',
    rubric: [
      'Retrieval metrics (recall@k, MRR) separate from generation',
      'Golden set curation and regression detection',
      'Human eval sampling strategy',
      'Ship/no-ship thresholds',
    ],
    conceptIds: ['rag'],
  },
];