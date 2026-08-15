const WAR_TOPIC_OPTIONS = [
  { label: 'Ranked Mix', slug: 'ranked_mix' },
  { label: 'APIs', slug: 'apis' },
  { label: 'Caching & Performance', slug: 'caching-performance' },
  { label: 'Complexity & Debugging', slug: 'complexity-debugging' },
  { label: 'Concurrency', slug: 'concurrency' },
  { label: 'Databases', slug: 'databases' },
  { label: 'Distributed Systems', slug: 'distributed-systems' },
  { label: 'Infrastructure & Cloud', slug: 'infrastructure-cloud' },
  { label: 'Messaging & Streaming', slug: 'messaging-streaming' },
  { label: 'Networking', slug: 'networking' },
  { label: 'Observability & Reliability', slug: 'observability-reliability' },
  { label: 'Operating Systems & Runtime', slug: 'operating-systems-runtime' },
  { label: 'Security', slug: 'security' },
] as const;

type WarTopic = (typeof WAR_TOPIC_OPTIONS)[number]['label'];

export interface PreviewQuestion {
  id: string;
  conceptId: string;
  topic: Exclude<WarTopic, 'Ranked Mix'>;
  difficulty: 'Core' | 'Advanced';
  stem: string;
  options: { id: string; label: string; explanation: string }[];
  correctOptionId: string;
  explanation: string;
  concept: string;
  source: { title: string; url: string };
}

/**
 * A small, explicitly unranked browser preview. Ranked questions and answer
 * keys stay in shared/data/software-wars and are never imported by the SPA.
 */
export const PREVIEW_QUESTIONS: PreviewQuestion[] = [
  {
    id: 'preview-idempotency',
    conceptId: 'idempotency',
    topic: 'APIs',
    difficulty: 'Core',
    stem: 'A client retries a timed-out POST /payments request. Which server design most directly prevents a second charge?',
    options: [
      {
        id: 'a',
        label: 'Return HTTP 202 for every request',
        explanation:
          '202 changes response semantics but does not deduplicate the charge operation.',
      },
      {
        id: 'b',
        label: 'Cache the endpoint response for 30 seconds',
        explanation: 'A cache entry may expire or be absent even though the charge committed.',
      },
      {
        id: 'c',
        label: 'Persist an idempotency key with the first outcome',
        explanation: 'The durable key binds every retry to the original operation and outcome.',
      },
      {
        id: 'd',
        label: 'Increase the client timeout',
        explanation:
          'A longer timeout reduces uncertainty but cannot prevent duplicate side effects.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'A durable idempotency key binds retries to the original operation and response. A timeout or cache alone cannot prove that a charge did not already commit.',
    concept: 'Idempotency',
    source: {
      title: 'Stripe — Idempotent requests',
      url: 'https://docs.stripe.com/api/idempotent_requests',
    },
  },
  {
    id: 'preview-isolation',
    conceptId: 'isolation-levels',
    topic: 'Databases',
    difficulty: 'Core',
    stem: 'Under snapshot isolation, which anomaly can still occur when two transactions update different rows after reading the same predicate?',
    options: [
      {
        id: 'a',
        label: 'Dirty read',
        explanation:
          'Snapshot isolation reads committed snapshots and therefore prevents dirty reads.',
      },
      {
        id: 'b',
        label: 'Write skew',
        explanation:
          'Disjoint writes can each preserve their snapshot while jointly violating an invariant.',
      },
      {
        id: 'c',
        label: 'Torn page',
        explanation: 'A torn page is a storage-write failure, not a transaction-isolation anomaly.',
      },
      {
        id: 'd',
        label: 'Read uncommitted',
        explanation:
          'Read uncommitted is an isolation level, not the anomaly described by the schedule.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'Snapshot isolation prevents dirty reads and direct write-write conflicts, but write skew remains possible when concurrent transactions update disjoint rows that jointly enforce an invariant.',
    concept: 'Transaction isolation',
    source: {
      title: 'PostgreSQL — Transaction isolation',
      url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
    },
  },
  {
    id: 'preview-tcp',
    conceptId: 'network-protocol-engineering',
    topic: 'Networking',
    difficulty: 'Core',
    stem: 'What is the primary purpose of TCP flow control?',
    options: [
      {
        id: 'a',
        label: 'Prevent the sender from overwhelming the receiver',
        explanation: 'The advertised receive window bounds data according to receiver capacity.',
      },
      {
        id: 'b',
        label: 'Choose the shortest network path',
        explanation: 'Routing protocols choose paths; TCP flow control does not perform routing.',
      },
      {
        id: 'c',
        label: 'Encrypt bytes in transit',
        explanation:
          'TLS provides transport encryption; TCP flow control does not encrypt payloads.',
      },
      {
        id: 'd',
        label: 'Prevent all packet loss',
        explanation:
          'TCP can recover from loss, but its flow-control mechanism cannot prevent all loss.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'The receiver-advertised window limits in-flight data based on receive-buffer capacity. Congestion control is the separate mechanism concerned with overwhelming the network.',
    concept: 'TCP flow control',
    source: {
      title: 'RFC 9293 — Transmission Control Protocol',
      url: 'https://www.rfc-editor.org/rfc/rfc9293.html',
    },
  },
  {
    id: 'preview-quorum',
    conceptId: 'consensus',
    topic: 'Distributed Systems',
    difficulty: 'Advanced',
    stem: 'A replicated store has N = 5 replicas. Which quorum choice guarantees every read quorum overlaps every write quorum?',
    options: [
      {
        id: 'a',
        label: 'R = 2, W = 2',
        explanation: 'R + W is 4, so read and write quorums can be disjoint among five replicas.',
      },
      {
        id: 'b',
        label: 'R = 1, W = 4',
        explanation: 'R + W equals N; strict overlap is not guaranteed when the sum is only five.',
      },
      {
        id: 'c',
        label: 'R = 2, W = 4',
        explanation: 'R + W is 6, which is greater than N and therefore guarantees overlap.',
      },
      {
        id: 'd',
        label: 'R = 1, W = 3',
        explanation: 'R + W is 4, leaving possible non-overlapping read and write replica sets.',
      },
    ],
    correctOptionId: 'c',
    explanation:
      'Read and write quorums overlap when R + W > N. Here 2 + 4 > 5. The other choices are equal to or below N and do not guarantee overlap.',
    concept: 'Quorum replication',
    source: {
      title: 'Amazon Dynamo paper',
      url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
    },
  },
  {
    id: 'preview-cache',
    conceptId: 'caching',
    topic: 'Caching & Performance',
    difficulty: 'Core',
    stem: 'Which HTTP response directive allows shared caches to store a response for 60 seconds while requiring browsers to revalidate?',
    options: [
      {
        id: 'a',
        label: 'Cache-Control: private, max-age=60',
        explanation:
          'private excludes shared caches and max-age lets the browser reuse the response.',
      },
      {
        id: 'b',
        label: 'Cache-Control: public, s-maxage=60, max-age=0',
        explanation:
          's-maxage grants shared-cache freshness while max-age=0 forces browser revalidation.',
      },
      {
        id: 'c',
        label: 'Cache-Control: no-store',
        explanation: 'no-store prevents both shared and private caches from storing the response.',
      },
      {
        id: 'd',
        label: 'Expires: 0',
        explanation:
          'An already-expired response does not grant a shared cache a 60-second lifetime.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      's-maxage controls shared caches, while max-age=0 makes a private browser cache revalidate before reuse.',
    concept: 'HTTP caching',
    source: {
      title: 'MDN — Cache-Control',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
    },
  },
];

export const PREVIEW_TRADEOFF = {
  title: 'Design a webhook delivery platform',
  prompt:
    'Design a multi-tenant webhook delivery platform for 50,000 events per second. Customers need ordered delivery per endpoint, retries, signing, delivery logs, and at-least-once semantics.',
  twist:
    'A top customer now requires regional data residency and must be able to rotate signing keys without dropping or duplicating in-flight deliveries.',
  allowedArtifacts: ['Text', 'Code', 'Schema', 'Pseudocode', 'Diagram'],
};
