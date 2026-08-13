import { authoritativeSource, contentVersionId, defineBlitzQuestion } from './authoring-schema.mjs';

const RFC_9110 = authoritativeSource(
  'RFC 9110 — HTTP Semantics',
  'https://www.rfc-editor.org/rfc/rfc9110.html'
);
const RFC_9111 = authoritativeSource(
  'RFC 9111 — HTTP Caching',
  'https://www.rfc-editor.org/rfc/rfc9111.html'
);
const RFC_6585 = authoritativeSource(
  'RFC 6585 — Additional HTTP Status Codes',
  'https://www.rfc-editor.org/rfc/rfc6585.html'
);
const RFC_7519 = authoritativeSource(
  'RFC 7519 — JSON Web Token',
  'https://www.rfc-editor.org/rfc/rfc7519.html'
);
const RFC_2104 = authoritativeSource(
  'RFC 2104 — HMAC',
  'https://www.rfc-editor.org/rfc/rfc2104.html'
);
const RFC_9293 = authoritativeSource(
  'RFC 9293 — TCP',
  'https://www.rfc-editor.org/rfc/rfc9293.html'
);
const POSTGRES_INDEXES = authoritativeSource(
  'PostgreSQL — Index Types',
  'https://www.postgresql.org/docs/current/indexes-types.html'
);
const POSTGRES_WAL = authoritativeSource(
  'PostgreSQL — Write-Ahead Logging',
  'https://www.postgresql.org/docs/current/wal-intro.html'
);
const POSTGRES_ISOLATION = authoritativeSource(
  'PostgreSQL — Transaction Isolation',
  'https://www.postgresql.org/docs/current/transaction-iso.html'
);
const AWS_S3 = authoritativeSource(
  'Amazon S3 — Data consistency model',
  'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel'
);
const DYNAMO = authoritativeSource(
  'Dynamo: Amazon’s Highly Available Key-value Store',
  'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'
);
const RAFT = authoritativeSource(
  'In Search of an Understandable Consensus Algorithm',
  'https://raft.github.io/raft.pdf'
);
const KAFKA = authoritativeSource(
  'Apache Kafka — Design',
  'https://kafka.apache.org/documentation/#design'
);
const REDIS_EVICTION = authoritativeSource(
  'Redis — Key eviction',
  'https://redis.io/docs/latest/develop/reference/eviction/'
);
const GOOGLE_SRE = authoritativeSource(
  'Google SRE — Monitoring Distributed Systems',
  'https://sre.google/sre-book/monitoring-distributed-systems/'
);
const SQLITE_WAL = authoritativeSource(
  'SQLite — Write-Ahead Logging',
  'https://sqlite.org/wal.html'
);
const GRPC_RETRY = authoritativeSource('gRPC — Retry', 'https://grpc.io/docs/guides/retry/');
const CLOUDFLARE_LB = authoritativeSource(
  'Cloudflare — Load Balancing reference',
  'https://developers.cloudflare.com/load-balancing/reference/'
);
const OAUTH_SECURITY = authoritativeSource(
  'OAuth 2.0 Security Best Current Practice',
  'https://www.rfc-editor.org/rfc/rfc9700.html'
);
const OTEL = authoritativeSource(
  'OpenTelemetry — Signals',
  'https://opentelemetry.io/docs/concepts/signals/'
);

const blueprints = [
  {
    key: 'http-safe-method',
    topic: 'apis',
    difficulty: 'foundation',
    conceptIds: ['http-lifecycle'],
    sources: [RFC_9110],
    stem: (n) =>
      `A monitoring client repeats request ${n} after losing the response. Which HTTP method is defined as safe?`,
    options: [
      ['get', 'GET'],
      ['post', 'POST'],
      ['patch', 'PATCH'],
      ['connect', 'CONNECT'],
    ],
    correct: 'get',
    explanation:
      'RFC 9110 defines GET as safe: its requested semantics are read-only. POST, PATCH, and CONNECT are not safe methods.',
  },
  {
    key: 'http-idempotent-method',
    topic: 'apis',
    difficulty: 'foundation',
    conceptIds: ['http-lifecycle', 'idempotency'],
    sources: [RFC_9110],
    stem: (n) =>
      `A proxy may retry an interrupted request up to ${n} times. Which method is defined as idempotent but not safe?`,
    options: [
      ['put', 'PUT'],
      ['post', 'POST'],
      ['patch', 'PATCH'],
      ['connect', 'CONNECT'],
    ],
    correct: 'put',
    explanation:
      'PUT is idempotent because repeating the same representation has the same intended effect, but it is not safe because it changes server state.',
  },
  {
    key: 'rate-limit-status',
    topic: 'apis',
    difficulty: 'foundation',
    conceptIds: ['rate-limiting'],
    sources: [RFC_6585],
    stem: (n) =>
      `A client exceeds an API allowance of ${n * 100} requests. Which status code specifically communicates rate limiting?`,
    options: [
      ['429', '429 Too Many Requests'],
      ['409', '409 Conflict'],
      ['412', '412 Precondition Failed'],
      ['503', '503 Service Unavailable'],
    ],
    correct: '429',
    explanation:
      'RFC 6585 defines 429 Too Many Requests for clients that have sent too many requests in a given amount of time.',
  },
  {
    key: 'idempotency-key-scope',
    topic: 'apis',
    difficulty: 'intermediate',
    conceptIds: ['idempotency'],
    sources: [RFC_9110],
    stem: (n) =>
      `A payment create request times out after ${n} seconds. What server behavior best makes a retry with the same idempotency key safe?`,
    options: [
      ['replay', 'Return the stored result for that key and operation scope'],
      ['rerun', 'Run the charge again and compare later'],
      ['random', 'Generate a new key on the server for every retry'],
      ['get', 'Convert every retry into an unrelated GET'],
    ],
    correct: 'replay',
    explanation:
      'An idempotency record binds a client key to one operation and its durable result, so a retry replays the original outcome instead of duplicating the side effect.',
  },
  {
    key: 'webhook-signature',
    topic: 'apis',
    difficulty: 'intermediate',
    conceptIds: ['webhooks'],
    sources: [RFC_2104],
    stem: (n) =>
      `A webhook may be delivered ${n} times. Which check authenticates its body before processing?`,
    options: [
      ['hmac', 'Verify an HMAC over the raw body with the shared secret'],
      ['cors', 'Check the browser CORS origin'],
      ['dns', 'Resolve the sender hostname once'],
      ['encoding', 'Base64-decode the payload'],
    ],
    correct: 'hmac',
    explanation:
      'HMAC verification authenticates message integrity with a shared secret. CORS, DNS resolution, and base64 encoding do not prove payload authenticity.',
  },
  {
    key: 'retry-backoff',
    topic: 'infrastructure',
    difficulty: 'intermediate',
    conceptIds: ['retries-dlq'],
    sources: [GRPC_RETRY],
    stem: (n) =>
      `${n * 100} clients fail together and retry. Which policy best reduces synchronized retry storms?`,
    options: [
      ['jitter', 'Exponential backoff with randomized jitter'],
      ['fixed', 'A fixed identical delay for every client'],
      ['zero', 'Immediate retries with no limit'],
      ['fanout', 'Duplicate each retry to two servers'],
    ],
    correct: 'jitter',
    explanation:
      'Exponential backoff limits retry frequency and jitter spreads retry times so clients do not repeatedly synchronize.',
  },
  {
    key: 'dlq-purpose',
    topic: 'infrastructure',
    difficulty: 'foundation',
    conceptIds: ['retries-dlq', 'message-queues'],
    sources: [KAFKA],
    stem: (n) =>
      `A queue message still fails after ${n} bounded attempts. What is the primary purpose of a dead-letter queue?`,
    options: [
      ['isolate', 'Isolate failed messages for inspection or controlled replay'],
      ['success', 'Mark every failed message as successful'],
      ['order', 'Guarantee global ordering across all partitions'],
      ['cache', 'Cache successful HTTP responses'],
    ],
    correct: 'isolate',
    explanation:
      'A dead-letter queue isolates messages that exceeded the retry policy so operators can inspect, repair, or replay them without blocking normal consumption.',
  },
  {
    key: 'cache-aside-miss',
    topic: 'infrastructure',
    difficulty: 'foundation',
    conceptIds: ['caching'],
    sources: [RFC_9111],
    stem: (n) =>
      `In cache-aside, a key with a ${n}-minute TTL is absent. What should the application do next?`,
    options: [
      ['load', 'Read the source of truth, then populate the cache'],
      ['invent', 'Return an invented value and skip storage'],
      ['delete', 'Delete the source-of-truth row'],
      ['broadcast', 'Broadcast invalidation before reading'],
    ],
    correct: 'load',
    explanation:
      'Cache-aside handles a miss by loading from the source of truth and then caching the retrieved value for later reads.',
  },
  {
    key: 'cache-eviction',
    topic: 'infrastructure',
    difficulty: 'intermediate',
    conceptIds: ['caching'],
    sources: [REDIS_EVICTION],
    stem: (n) =>
      `A cache holds ${n * 10} keys but memory is full. Which policy evicts the least recently used eligible key?`,
    options: [
      ['lru', 'LRU'],
      ['lfu', 'LFU'],
      ['fifo', 'FIFO'],
      ['ttl', 'Shortest TTL only'],
    ],
    correct: 'lru',
    explanation:
      'LRU approximates recency and evicts the least recently used key. LFU tracks frequency, while FIFO tracks insertion order.',
  },
  {
    key: 'queue-delivery',
    topic: 'infrastructure',
    difficulty: 'intermediate',
    conceptIds: ['message-queues', 'idempotency'],
    sources: [KAFKA],
    stem: (n) =>
      `A broker uses at-least-once delivery and a consumer crashes before acknowledging message ${n}. What must the handler assume?`,
    options: [
      ['duplicate', 'The message can be delivered again'],
      ['lost', 'The message can never reappear'],
      ['ordered', 'All topics now have total ordering'],
      ['once', 'The side effect happened exactly once automatically'],
    ],
    correct: 'duplicate',
    explanation:
      'At-least-once delivery can redeliver after an uncertain acknowledgement, so consumers need idempotent processing or deduplication.',
  },
  {
    key: 'observability-signal',
    topic: 'infrastructure',
    difficulty: 'foundation',
    conceptIds: ['monitoring-analytics'],
    sources: [OTEL, GOOGLE_SRE],
    stem: (n) =>
      `Request ${n} crosses five services. Which telemetry signal best reconstructs its end-to-end path?`,
    options: [
      ['trace', 'A distributed trace'],
      ['metric', 'One process-wide CPU gauge'],
      ['log', 'An uncorrelated startup log'],
      ['profile', 'A monthly heap profile'],
    ],
    correct: 'trace',
    explanation:
      'A distributed trace links spans across service boundaries using shared context, reconstructing one request path and latency breakdown.',
  },
  {
    key: 'jwt-expiry',
    topic: 'apis',
    difficulty: 'foundation',
    conceptIds: ['auth-systems'],
    sources: [RFC_7519],
    stem: (n) =>
      `A JWT has an exp claim ${n} minutes in the past. What must a conforming consumer conclude?`,
    options: [
      ['reject', 'The token must not be accepted after its expiration time'],
      ['refresh', 'The token silently refreshes itself'],
      ['admin', 'The token becomes an administrator token'],
      ['encrypt', 'The payload is now encrypted'],
    ],
    correct: 'reject',
    explanation:
      'The JWT exp claim identifies the time on or after which the token must not be accepted for processing.',
  },
  {
    key: 'oauth-pkce',
    topic: 'apis',
    difficulty: 'intermediate',
    conceptIds: ['auth-systems'],
    sources: [OAUTH_SECURITY],
    stem: (n) =>
      `A public browser client starts authorization flow ${n}. What does PKCE primarily mitigate?`,
    options: [
      ['interception', 'Authorization-code interception and redemption by another client'],
      ['password', 'Weak database passwords'],
      ['ddos', 'Volumetric denial of service'],
      ['cache', 'Stale browser caches'],
    ],
    correct: 'interception',
    explanation:
      'PKCE binds the authorization request to a verifier held by the initiating client, preventing an intercepted code from being redeemed elsewhere.',
  },
  {
    key: 'btree-range',
    topic: 'databases',
    difficulty: 'foundation',
    conceptIds: ['b-tree'],
    sources: [POSTGRES_INDEXES],
    stem: (n) =>
      `A table has ${n * 1000} rows and a B-tree index on created_at. Which query pattern is it designed to accelerate?`,
    options: [
      ['range', 'An ordered range predicate on created_at'],
      ['substring', 'An arbitrary substring inside every JSON value'],
      ['image', 'Similarity between image pixels'],
      ['graph', 'An unbounded graph traversal'],
    ],
    correct: 'range',
    explanation:
      'B-tree indexes maintain ordered keys and support equality and range comparisons such as less-than, greater-than, and BETWEEN.',
  },
  {
    key: 'secondary-index-write',
    topic: 'databases',
    difficulty: 'intermediate',
    conceptIds: ['secondary-index'],
    sources: [POSTGRES_INDEXES],
    stem: (n) =>
      `A write changes a column covered by ${n} secondary indexes. What direct tradeoff should you expect?`,
    options: [
      ['amplification', 'Additional index maintenance on writes'],
      ['free', 'Faster writes with zero storage cost'],
      ['serial', 'Automatic global serializability'],
      ['compression', 'Lossless compression of every row'],
    ],
    correct: 'amplification',
    explanation:
      'Each affected secondary index must be updated along with the table row, increasing write work and storage in exchange for faster indexed reads.',
  },
  {
    key: 'wal-order',
    topic: 'databases',
    difficulty: 'intermediate',
    conceptIds: ['wal'],
    sources: [POSTGRES_WAL, SQLITE_WAL],
    stem: (n) =>
      `Transaction ${n} modifies a data page. Under write-ahead logging, what must become durable first?`,
    options: [
      ['log', 'The corresponding log record'],
      ['page', 'The changed data page'],
      ['index', 'Every secondary index in the database'],
      ['backup', 'A full database backup'],
    ],
    correct: 'log',
    explanation:
      'Write-ahead logging requires log records describing a change to reach durable storage before the changed data page is written.',
  },
  {
    key: 'isolation-dirty-read',
    topic: 'databases',
    difficulty: 'foundation',
    conceptIds: ['concurrency-design'],
    sources: [POSTGRES_ISOLATION],
    stem: (n) =>
      `Transaction A reads transaction B's uncommitted value ${n}. Which anomaly occurred?`,
    options: [
      ['dirty', 'Dirty read'],
      ['phantom', 'Phantom read'],
      ['lost', 'Lost update'],
      ['skew', 'Clock skew'],
    ],
    correct: 'dirty',
    explanation:
      'A dirty read occurs when a transaction observes data written by another transaction that has not committed.',
  },
  {
    key: 'lsm-write-path',
    topic: 'databases',
    difficulty: 'advanced',
    conceptIds: ['lsm-tree'],
    sources: [DYNAMO],
    stem: (n) =>
      `An LSM-style store receives write ${n}. Which structure typically accepts the sorted in-memory update before immutable disk runs?`,
    options: [
      ['memtable', 'A memtable'],
      ['bitmap', 'A framebuffer'],
      ['btree', 'Only an in-place disk B-tree page'],
      ['cdn', 'A CDN edge cache'],
    ],
    correct: 'memtable',
    explanation:
      'LSM designs buffer writes in an ordered in-memory structure (commonly a memtable) and later flush immutable sorted runs to storage.',
  },
  {
    key: 'compaction-purpose',
    topic: 'databases',
    difficulty: 'advanced',
    conceptIds: ['compaction', 'lsm-tree'],
    sources: [DYNAMO],
    stem: (n) =>
      `An LSM store has ${n + 2} overlapping sorted runs. What is compaction primarily doing?`,
    options: [
      ['merge', 'Merging runs and discarding obsolete versions or tombstones when safe'],
      ['encrypt', 'Encrypting transport packets'],
      ['route', 'Routing HTTP requests to regions'],
      ['lock', 'Holding one global mutex forever'],
    ],
    correct: 'merge',
    explanation:
      'Compaction merges sorted runs, reconciles key versions, and can reclaim obsolete values and tombstones, trading background I/O for read and space efficiency.',
  },
  {
    key: 'columnar-analytics',
    topic: 'databases',
    difficulty: 'intermediate',
    conceptIds: ['columnar-storage'],
    sources: [
      authoritativeSource('Apache Parquet — Concepts', 'https://parquet.apache.org/docs/concepts/'),
    ],
    stem: (n) =>
      `An analytics query scans two columns from a ${n * 10}-column table. Why can columnar storage help?`,
    options: [
      ['projection', 'It can read and compress only the referenced columns'],
      ['rowlock', 'It creates one lock per HTTP request'],
      ['dns', 'It avoids DNS resolution'],
      ['consensus', 'It elects a database leader'],
    ],
    correct: 'projection',
    explanation:
      'Columnar layouts colocate values by column, enabling projection pushdown and column-specific compression for analytic scans.',
  },
  {
    key: 'object-storage-semantics',
    topic: 'databases',
    difficulty: 'foundation',
    conceptIds: ['object-storage'],
    sources: [AWS_S3],
    stem: (n) =>
      `An application successfully PUTs object version ${n} to S3. Which read consistency does current S3 document for subsequent GETs?`,
    options: [
      ['strong', 'Strong read-after-write consistency'],
      ['eventual', 'Only eventual consistency for all successful PUTs'],
      ['session', 'Consistency only inside the writer process'],
      ['none', 'No defined visibility behavior'],
    ],
    correct: 'strong',
    explanation:
      'Amazon S3 documents strong read-after-write consistency for successful PUT and DELETE operations, including subsequent reads and listings.',
  },
  {
    key: 'shard-key-hotspot',
    topic: 'distributed-systems',
    difficulty: 'intermediate',
    conceptIds: ['sharding'],
    sources: [DYNAMO],
    stem: (n) =>
      `${n * 10}% of writes share one tenant ID used as the shard key. What is the immediate risk?`,
    options: [
      ['hotspot', 'One shard becomes a throughput hotspot'],
      ['serializable', 'All transactions become serializable'],
      ['compression', 'Values compress to zero bytes'],
      ['tls', 'TLS certificates expire'],
    ],
    correct: 'hotspot',
    explanation:
      'A skewed shard-key distribution concentrates load on one partition even if total cluster capacity is high.',
  },
  {
    key: 'replication-lag',
    topic: 'distributed-systems',
    difficulty: 'intermediate',
    conceptIds: ['replication'],
    sources: [POSTGRES_WAL],
    stem: (n) =>
      `A follower is ${n} seconds behind its leader. Which anomaly can a read routed to that follower show?`,
    options: [
      ['stale', 'A recently committed value may appear stale'],
      ['future', 'Data committed in the future'],
      ['atomic', 'Automatic cross-system atomicity'],
      ['dedupe', 'Perfect request deduplication'],
    ],
    correct: 'stale',
    explanation:
      'Replication lag means the follower has not replayed the latest committed changes, so follower reads can return older state.',
  },
  {
    key: 'cap-partition',
    topic: 'distributed-systems',
    difficulty: 'advanced',
    conceptIds: ['cap-theorem'],
    sources: [
      authoritativeSource(
        'Brewer’s Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services',
        'https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf'
      ),
    ],
    stem: (n) =>
      `During network partition ${n}, two sides cannot communicate. CAP forces a replicated service to trade off which pair?`,
    options: [
      ['ca', 'Consistency versus availability while tolerating the partition'],
      ['latency', 'CPU versus memory only'],
      ['security', 'Authentication versus encryption'],
      ['format', 'JSON versus XML'],
    ],
    correct: 'ca',
    explanation:
      'When a partition actually occurs, a system cannot guarantee both every request receives a non-error response and every read observes a single latest value.',
  },
  {
    key: 'consistent-hashing-movement',
    topic: 'distributed-systems',
    difficulty: 'advanced',
    conceptIds: ['consistent-hashing'],
    sources: [DYNAMO],
    stem: (n) =>
      `Node ${n} joins a consistently hashed ring. What property is the ring intended to provide?`,
    options: [
      ['limited', 'Only a fraction of keys need remapping'],
      ['all', 'Every key must move to the new node'],
      ['ordered', 'All requests gain global total order'],
      ['durable', 'Memory becomes durable without a log'],
    ],
    correct: 'limited',
    explanation:
      'Consistent hashing limits key movement when membership changes, unlike a simple modulo of a changing node count.',
  },
  {
    key: 'load-balancer-health',
    topic: 'infrastructure',
    difficulty: 'foundation',
    conceptIds: ['load-balancing'],
    sources: [CLOUDFLARE_LB],
    stem: (n) =>
      `Backend ${n} fails active health checks. What should a health-aware load balancer do?`,
    options: [
      ['remove', 'Stop selecting it until it becomes healthy'],
      ['amplify', 'Send it every request'],
      ['cache', 'Turn every write into a cache hit'],
      ['elect', 'Make it a consensus leader'],
    ],
    correct: 'remove',
    explanation:
      'Health-aware load balancing removes unhealthy origins from eligible steering until health checks show recovery.',
  },
  {
    key: 'raft-majority',
    topic: 'distributed-systems',
    difficulty: 'advanced',
    conceptIds: ['consensus'],
    sources: [RAFT],
    stem: (n) => `A Raft cluster has ${2 * n + 1} voting servers. How many votes form a majority?`,
    options: (n) => [
      ['majority', `${n + 1}`],
      ['half', `${n}`],
      ['zero', '0'],
      ['allplus', `${2 * n + 2}`],
    ],
    correct: 'majority',
    explanation: (n) =>
      `A majority of ${2 * n + 1} voting servers is ${n + 1}; overlapping majorities are central to Raft safety.`,
  },
  {
    key: 'tcp-ordering',
    topic: 'networking',
    difficulty: 'foundation',
    conceptIds: ['http-lifecycle'],
    sources: [RFC_9293],
    stem: (n) =>
      `TCP segment ${n} arrives before an earlier segment. What byte-stream property does TCP expose to the application?`,
    options: [
      ['ordered', 'Reliable in-order bytes'],
      ['datagram', 'Independent unordered messages'],
      ['exactlyonce', 'Exactly-once business side effects'],
      ['broadcast', 'Network-wide broadcast'],
    ],
    correct: 'ordered',
    explanation:
      'TCP provides applications a reliable, in-order byte stream; it hides segment reordering and retransmission rather than exposing message boundaries.',
  },
  {
    key: 'background-job-ack',
    topic: 'infrastructure',
    difficulty: 'intermediate',
    conceptIds: ['background-jobs', 'message-queues'],
    sources: [KAFKA],
    stem: (n) =>
      `Worker ${n} acknowledges a job before its database side effect commits, then crashes. What failure can result?`,
    options: [
      ['lost', 'The broker considers the job done although the side effect is missing'],
      ['duplicate', 'The broker must duplicate every successful job'],
      ['linear', 'The database becomes linearizable'],
      ['encrypt', 'The payload becomes encrypted'],
    ],
    correct: 'lost',
    explanation:
      'Acknowledging before the durable side effect creates a loss window: a crash can leave no retry even though the work did not commit.',
  },
  {
    key: 'state-machine-invalid-transition',
    topic: 'runtime-complexity',
    difficulty: 'intermediate',
    conceptIds: ['state-management'],
    sources: [RAFT],
    stem: (n) =>
      `An order is already cancelled in transition ${n}. What should an explicit state machine do with a later ship command?`,
    options: [
      ['reject', 'Reject the transition as invalid'],
      ['accept', 'Silently ship it anyway'],
      ['rewind', 'Erase the cancellation history'],
      ['random', 'Choose a state randomly'],
    ],
    correct: 'reject',
    explanation:
      'An explicit state machine validates commands against the current state and rejects transitions outside the defined graph.',
  },
  {
    key: 'big-o-nested',
    topic: 'runtime-complexity',
    difficulty: 'foundation',
    conceptIds: ['array-hashing'],
    sources: [
      authoritativeSource(
        'MIT OpenCourseWare — Introduction to Algorithms',
        'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/'
      ),
    ],
    stem: (n) =>
      `A function runs an outer loop n times and, for each iteration, an independent inner loop ${n}n times. What is its asymptotic time complexity?`,
    options: [
      ['quadratic', 'O(n²)'],
      ['linear', 'O(n)'],
      ['log', 'O(log n)'],
      ['constant', 'O(1)'],
    ],
    correct: 'quadratic',
    explanation: (n) =>
      `The loop bodies execute n × ${n}n = ${n}n² times; constant factors are removed, leaving O(n²).`,
  },
];

function rotateOptions(options, seed) {
  const offset = seed % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)].map(([id, label]) => ({
    id,
    label,
  }));
}

function buildVariant(blueprint, seed) {
  const variantKey = `v${String(seed).padStart(2, '0')}`;
  const options =
    typeof blueprint.options === 'function' ? blueprint.options(seed) : blueprint.options;
  return defineBlitzQuestion({
    id: contentVersionId(blueprint.key, 1, variantKey),
    contentKey: blueprint.key,
    version: 1,
    variantKey,
    status: 'active',
    topic: blueprint.topic,
    difficulty: blueprint.difficulty,
    conceptIds: blueprint.conceptIds,
    sources: blueprint.sources,
    review: { reviewedBy: 'software-wars-editorial-v1', reviewedAt: '2026-08-13' },
    stem: blueprint.stem(seed),
    options: rotateOptions(options, seed),
    correctOptionId: blueprint.correct,
    explanation:
      typeof blueprint.explanation === 'function'
        ? blueprint.explanation(seed)
        : blueprint.explanation,
    generator: {
      id: `${blueprint.key}-generator-v1`,
      seed,
      verification: 'bounded-domain-seeds-1-through-10-and-option-key-membership-v1',
    },
  });
}

export const blitzQuestions = Object.freeze(
  blueprints.flatMap((blueprint) =>
    Array.from({ length: 10 }, (_, index) => buildVariant(blueprint, index + 1))
  )
);
