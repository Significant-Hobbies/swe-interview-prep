import {
  authoritativeSource,
  contentVersionId,
  defineTradeoffProblem,
} from './authoring-schema.mjs';

const sources = {
  sre: authoritativeSource('Google SRE Book', 'https://sre.google/sre-book/table-of-contents/'),
  dynamo: authoritativeSource(
    'Dynamo: Amazon’s Highly Available Key-value Store',
    'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'
  ),
  raft: authoritativeSource(
    'In Search of an Understandable Consensus Algorithm',
    'https://raft.github.io/raft.pdf'
  ),
  kafka: authoritativeSource(
    'Apache Kafka — Design',
    'https://kafka.apache.org/documentation/#design'
  ),
  postgres: authoritativeSource(
    'PostgreSQL Documentation',
    'https://www.postgresql.org/docs/current/index.html'
  ),
  oauth: authoritativeSource(
    'OAuth 2.0 Security Best Current Practice',
    'https://www.rfc-editor.org/rfc/rfc9700.html'
  ),
  http: authoritativeSource(
    'RFC 9110 — HTTP Semantics',
    'https://www.rfc-editor.org/rfc/rfc9110.html'
  ),
  websocket: authoritativeSource(
    'RFC 6455 — WebSocket Protocol',
    'https://www.rfc-editor.org/rfc/rfc6455.html'
  ),
  s3: authoritativeSource(
    'Amazon S3 User Guide',
    'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html'
  ),
  otel: authoritativeSource('OpenTelemetry Documentation', 'https://opentelemetry.io/docs/'),
};

const definitions = [
  {
    key: 'global-rate-limiter',
    title: 'Global API Rate Limiter',
    difficulty: 'advanced',
    topic: 'distributed-systems',
    conceptIds: ['rate-limiting', 'distributed-infra'],
    sources: [sources.sre],
    prompt:
      'Design a multi-region rate limiter for a public API serving 1 million requests per second. Describe keys, quotas, storage, request path, failure behavior, and observability.',
    hiddenTwist:
      'A new enterprise tier requires a global hard cap with no more than 1% overshoot during a region partition, while free-tier requests should remain available.',
  },
  {
    key: 'payment-idempotency',
    title: 'Idempotent Payment Orchestration',
    difficulty: 'advanced',
    topic: 'apis',
    conceptIds: ['idempotency', 'retries-dlq', 'ecommerce-payments'],
    sources: [sources.http],
    prompt:
      'Design an API and workflow that charges a payment provider, records an order, and emits fulfillment events under retries and partial failures.',
    hiddenTwist:
      'The payment provider can succeed but delay its response for 90 seconds, and callers aggressively retry from two devices with the same cart.',
  },
  {
    key: 'webhook-delivery',
    title: 'Webhook Delivery Platform',
    difficulty: 'advanced',
    topic: 'apis',
    conceptIds: ['webhooks', 'message-queues', 'retries-dlq'],
    sources: [sources.kafka],
    prompt:
      'Design a webhook delivery platform for 100,000 tenants with signatures, retries, ordering choices, replay, and delivery observability.',
    hiddenTwist:
      'One tenant has a six-hour outage and a 50-million-event backlog, but other tenants must retain normal latency and throughput.',
  },
  {
    key: 'feature-flags',
    title: 'Global Feature Flag Service',
    difficulty: 'advanced',
    topic: 'distributed-systems',
    conceptIds: ['caching', 'replication', 'cap-theorem'],
    sources: [sources.dynamo],
    prompt:
      'Design a feature flag evaluation service with sub-10ms reads, auditability, gradual rollouts, and SDK support across regions.',
    hiddenTwist:
      'Security kill switches must propagate globally within two seconds, even while ordinary rollout flags may favor availability during partitions.',
  },
  {
    key: 'job-scheduler',
    title: 'Durable Background Job Scheduler',
    difficulty: 'advanced',
    topic: 'infrastructure',
    conceptIds: ['background-jobs', 'message-queues', 'idempotency'],
    sources: [sources.kafka],
    prompt:
      'Design a delayed and recurring job platform with worker leases, retries, deduplication, cancellation, and tenant isolation.',
    hiddenTwist:
      'A clock-skew incident puts 20% of scheduler nodes five minutes ahead while a million jobs are due in the same minute.',
  },
  {
    key: 'leader-election',
    title: 'Metadata Leader Election',
    difficulty: 'advanced',
    topic: 'distributed-systems',
    conceptIds: ['consensus', 'state-management'],
    sources: [sources.raft],
    prompt:
      'Design leader election and replicated metadata for a five-node control plane. Explain terms, quorums, failure detection, persistence, and reads.',
    hiddenTwist:
      'Operators require stale followers to serve read-only metadata during a leaderless interval, but must never expose an uncommitted configuration.',
  },
  {
    key: 'chat-presence',
    title: 'Realtime Chat and Presence',
    difficulty: 'advanced',
    topic: 'networking',
    conceptIds: ['messaging-realtime', 'message-queues', 'state-management'],
    sources: [sources.websocket],
    prompt:
      'Design two-person and group chat with WebSocket connections, presence, offline delivery, ordering, and reconnect behavior.',
    hiddenTwist:
      'Mobile clients can remain offline for 30 days and may reconnect concurrently from three devices with overlapping local sends.',
  },
  {
    key: 'audit-log',
    title: 'Tamper-Evident Audit Log',
    difficulty: 'advanced',
    topic: 'databases',
    conceptIds: ['wal', 'object-storage', 'monitoring-analytics'],
    sources: [sources.s3],
    prompt:
      'Design a multi-tenant audit log that supports high write volume, retention policies, search, export, and tamper evidence.',
    hiddenTwist:
      'A regulator requires a verifiable daily export that remains provable even if the primary database administrator is malicious.',
  },
  {
    key: 'image-pipeline',
    title: 'Media Processing Pipeline',
    difficulty: 'intermediate',
    topic: 'infrastructure',
    conceptIds: ['object-storage', 'background-jobs', 'retries-dlq'],
    sources: [sources.s3],
    prompt:
      'Design an upload and image-processing pipeline with validation, thumbnails, retries, metadata, and delivery through a CDN.',
    hiddenTwist:
      'A customer uploads a 30GB decompression bomb disguised as a small image while a viral event creates a 50× traffic spike.',
  },
  {
    key: 'multi-tenant-search',
    title: 'Multi-Tenant Search Service',
    difficulty: 'advanced',
    topic: 'databases',
    conceptIds: ['inverted-index', 'sharding', 'caching'],
    sources: [sources.sre],
    prompt:
      'Design full-text search for 50,000 tenants with indexing, query routing, relevance, freshness, and tenant isolation.',
    hiddenTwist:
      'One tenant is 60% of the corpus but only 2% of queries, while a smaller tenant suddenly produces 40% of query traffic.',
  },
  {
    key: 'inventory-reservation',
    title: 'Inventory Reservation Service',
    difficulty: 'advanced',
    topic: 'databases',
    conceptIds: ['booking-inventory', 'concurrency-design', 'idempotency'],
    sources: [sources.postgres],
    prompt:
      'Design inventory reservation for flash sales with holds, expiration, payment confirmation, oversell prevention, and recovery.',
    hiddenTwist:
      'A partner channel can only send batch updates every 60 seconds but contractual policy requires never overselling its reserved allocation.',
  },
  {
    key: 'event-deduplication',
    title: 'Event Ingestion and Deduplication',
    difficulty: 'advanced',
    topic: 'infrastructure',
    conceptIds: ['message-queues', 'idempotency', 'columnar-storage'],
    sources: [sources.kafka],
    prompt:
      'Design event ingestion for analytics with at-least-once producers, deduplication, schema evolution, partitioning, and warehouse delivery.',
    hiddenTwist:
      'Producers can replay the previous seven days after an outage, but many historical events lack a globally unique event ID.',
  },
  {
    key: 'session-store',
    title: 'Global Session Store',
    difficulty: 'advanced',
    topic: 'distributed-systems',
    conceptIds: ['auth-systems', 'replication', 'caching'],
    sources: [sources.oauth],
    prompt:
      'Design server-side sessions for a global application with fast validation, rotation, revocation, device management, and regional failover.',
    hiddenTwist:
      'Security demands account-wide logout take effect globally within five seconds during an inter-region network partition.',
  },
  {
    key: 'metrics-platform',
    title: 'High-Cardinality Metrics Platform',
    difficulty: 'advanced',
    topic: 'infrastructure',
    conceptIds: ['monitoring-analytics', 'columnar-storage', 'sharding'],
    sources: [sources.otel, sources.sre],
    prompt:
      'Design metrics ingestion and querying for millions of time series with retention tiers, aggregation, alerting, and cardinality controls.',
    hiddenTwist:
      'A deployment accidentally adds user_id as a label and creates 100 million new series in ten minutes.',
  },
  {
    key: 'api-pagination',
    title: 'Consistent Feed Pagination',
    difficulty: 'intermediate',
    topic: 'apis',
    conceptIds: ['api-design', 'secondary-index', 'social-media'],
    sources: [sources.http],
    prompt:
      'Design a paginated activity feed API that supports continuous writes, stable navigation, filters, deletion, and mobile retries.',
    hiddenTwist:
      'Product now requires users to move backward as well as forward without showing duplicates after feed items are inserted or deleted.',
  },
  {
    key: 'schema-migration',
    title: 'Zero-Downtime Schema Migration',
    difficulty: 'advanced',
    topic: 'databases',
    conceptIds: ['replication', 'secondary-index', 'background-jobs'],
    sources: [sources.postgres],
    prompt:
      'Plan a zero-downtime migration of a billion-row user table to a new normalized schema while old and new application versions coexist.',
    hiddenTwist:
      'The backfill takes four days and rollback must remain possible until 24 hours after all traffic moves to the new code.',
  },
  {
    key: 'config-push',
    title: 'Edge Configuration Distribution',
    difficulty: 'advanced',
    topic: 'distributed-systems',
    conceptIds: ['replication', 'state-management', 'monitoring-analytics'],
    sources: [sources.sre],
    prompt:
      'Design distribution of versioned configuration from a control plane to 100,000 edge processes with validation, rollback, and visibility.',
    hiddenTwist:
      'A bad configuration passes schema validation but causes 30% CPU regression; rollback must target only affected hardware generations.',
  },
  {
    key: 'distributed-lock',
    title: 'Lease-Based Distributed Lock',
    difficulty: 'advanced',
    topic: 'distributed-systems',
    conceptIds: ['consensus', 'concurrency-design', 'state-management'],
    sources: [sources.raft],
    prompt:
      'Design a lease service for mutually exclusive maintenance jobs. Explain ownership, fencing, expiration, renewal, and failure recovery.',
    hiddenTwist:
      'A paused process resumes after its lease expired and still holds credentials to the downstream storage system.',
  },
  {
    key: 'log-compaction',
    title: 'Compacted Change Log',
    difficulty: 'advanced',
    topic: 'databases',
    conceptIds: ['compaction', 'message-queues', 'wal'],
    sources: [sources.kafka],
    prompt:
      'Design a change log that retains the latest value per key, supports rebuilds, tombstones, consumers, and bounded storage.',
    hiddenTwist:
      'Legal deletion requires a key disappear from all online projections within one hour while offline consumers may return months later.',
  },
  {
    key: 'upload-service',
    title: 'Resumable Upload Service',
    difficulty: 'intermediate',
    topic: 'apis',
    conceptIds: ['api-design', 'object-storage', 'idempotency'],
    sources: [sources.s3, sources.http],
    prompt:
      'Design resumable uploads for large files with chunking, integrity checks, retries, authorization, finalization, and cleanup.',
    hiddenTwist:
      'Users may edit a file while uploading it from an unreliable mobile connection, and storage billing must not grow from abandoned chunks.',
  },
];

function rubricFor(definition) {
  return [
    {
      id: 'requirements',
      label: 'Requirements and invariants',
      weight: 25,
      evidence: 'Makes the core guarantees, assumptions, and non-goals explicit.',
    },
    {
      id: 'architecture',
      label: 'Architecture and data model',
      weight: 30,
      evidence: 'Defines components, ownership, durable state, keys, and request/data flow.',
    },
    {
      id: 'failure',
      label: 'Failure and twist response',
      weight: 30,
      evidence: `Addresses failure modes and adapts coherently to: ${definition.hiddenTwist}`,
    },
    {
      id: 'operations',
      label: 'Operations and tradeoffs',
      weight: 15,
      evidence:
        'Explains observability, capacity, security, alternatives, and intentional tradeoffs.',
    },
  ];
}

export const tradeoffProblems = Object.freeze(
  definitions.map((definition) =>
    defineTradeoffProblem({
      id: contentVersionId(definition.key, 1),
      contentKey: definition.key,
      version: 1,
      status: 'active',
      title: definition.title,
      topic: definition.topic,
      difficulty: definition.difficulty,
      conceptIds: definition.conceptIds,
      sources: definition.sources,
      review: { reviewedBy: 'software-wars-editorial-v1', reviewedAt: '2026-08-13' },
      prompt: definition.prompt,
      hiddenTwist: definition.hiddenTwist,
      allowedTools: ['documentation', 'external-ai', 'calculator'],
      allowedArtifacts: ['text', 'code', 'schema', 'pseudocode', 'diagram'],
      rubric: rubricFor(definition),
      phasePlanVersion: 'tradeoff-30m-v1',
    })
  )
);
