import type {
  CalculationAnchor,
  RubricAnchor,
  RubricDimension,
  SystemDesignCase,
  SystemDesignCategoryId,
  SystemDesignSource,
  SystemDesignStageId,
} from './system-design-case-schema';

const SCORE_ANCHORS: RubricAnchor[] = [
  { score: 0, description: 'No relevant evidence or a fundamental misconception.' },
  { score: 1, description: 'Names part of the concern without a usable mechanism or trade-off.' },
  {
    score: 2,
    description: 'Provides a workable mechanism with assumptions and one relevant trade-off.',
  },
  {
    score: 3,
    description: 'Connects assumptions, mechanism, trade-offs, failure behavior, and evidence.',
  },
];

interface ClassicCaseConfig {
  id: string;
  title: string;
  category: SystemDesignCategoryId;
  pattern: string;
  criticalPath: string;
  prompt: string;
  difficulty: 'core' | 'advanced';
  assumptions: string[];
  calculations: CalculationAnchor[];
  scopeContract: string[];
  architectureSignals: string[];
  invariant: string;
  tradeoff: string;
  concepts: string[];
  drills: string[];
  deepDivePrompt: string;
  followUp: { id: string; matchAny: string[]; prompt: string };
  failure: { id: string; title: string; prompt: string; expectedSignals: string[] };
  mistakes: string[];
  strongerAnswer: string;
  sources: SystemDesignSource[];
}

function dimension(
  id: string,
  label: string,
  stageIds: SystemDesignStageId[],
  evidenceSignals: string[],
  misconceptionSignals: string[],
  conceptId: string,
  drillId: string
): RubricDimension {
  return {
    id,
    label,
    weight: 0.2,
    stageIds,
    evidenceSignals,
    misconceptionSignals,
    anchors: SCORE_ANCHORS,
    conceptIds: [conceptId],
    drillIds: [drillId],
  };
}

function createClassicCase(config: ClassicCaseConfig): SystemDesignCase {
  const conceptFor = (index: number) => config.concepts[index % config.concepts.length];
  const drillFor = (index: number) => config.drills[index % config.drills.length];

  return {
    id: config.id,
    version: '1.0.0',
    title: config.title,
    category: config.category,
    pattern: config.pattern,
    criticalPath: config.criticalPath,
    durationMinutes: 45,
    prompt: config.prompt,
    difficulty: config.difficulty,
    hiddenAssumptions: config.assumptions,
    stages: [
      {
        id: 'scoping',
        title: 'Scope the problem',
        prompt: `Define the product contract, non-goals, workload, and correctness boundary. Resolve: ${config.scopeContract.join('; ')}.`,
        interviewerNote:
          'Look for an explicit dominant operation, scale, latency, consistency, privacy, availability, and exclusions before components are selected.',
      },
      {
        id: 'estimation',
        title: 'Estimate capacity',
        prompt: `Estimate the workload with units. At minimum calculate ${config.calculations
          .map((anchor) => anchor.label)
          .join(' and ')} and connect the result to a design decision.`,
        interviewerNote:
          'A strong answer distinguishes average from peak, includes amplification, and uses the estimate to size partitions, queues, storage, or fleets.',
      },
      {
        id: 'high-level-design',
        title: 'High-level design',
        prompt: `Draw the end-to-end path for ${config.criticalPath}. Name the authoritative state owner, partition key, synchronous boundary, asynchronous work, and read path.`,
        interviewerNote: `Expect these concrete signals: ${config.architectureSignals.join(', ')}.`,
      },
      {
        id: 'deep-dive',
        title: 'Defend the critical path',
        prompt: config.deepDivePrompt,
        interviewerNote: `The protected invariant is: ${config.invariant}. The central trade-off is: ${config.tradeoff}.`,
      },
      {
        id: 'failure',
        title: 'Failure injection',
        prompt: config.failure.prompt,
        interviewerNote: `Look for detection, containment, degraded behavior, idempotent recovery, and reconciliation. Expected signals: ${config.failure.expectedSignals.join(', ')}.`,
      },
      {
        id: 'review',
        title: 'Review and improve',
        prompt:
          'Summarize the design in two minutes. State the invariant, weakest assumption, capacity bottleneck, and first production experiment or fault injection.',
        interviewerNote:
          'The learner may now compare the attempt with calculations, rubric evidence, common mistakes, the stronger answer, and linked remediation.',
      },
    ],
    calculationAnchors: config.calculations,
    rubricDimensions: [
      dimension(
        'requirements',
        'Requirements and contract',
        ['scoping'],
        config.scopeContract,
        ['selects storage or infrastructure before defining the contract'],
        conceptFor(0),
        drillFor(0)
      ),
      dimension(
        'capacity',
        'Capacity and workload reasoning',
        ['estimation'],
        config.calculations.map((anchor) => `${anchor.label}: ${anchor.formula} (${anchor.unit})`),
        ['uses average requests per second without peak, payload, retention, or units'],
        conceptFor(1),
        drillFor(1)
      ),
      dimension(
        'architecture',
        'Architecture and data flow',
        ['high-level-design'],
        config.architectureSignals,
        ['lists products without an authoritative state owner or end-to-end path'],
        conceptFor(2),
        drillFor(2)
      ),
      dimension(
        'technical-judgment',
        'Critical-path judgment',
        ['deep-dive'],
        [config.invariant, config.tradeoff],
        ['claims one mechanism is universally correct without defending an invariant'],
        conceptFor(3),
        drillFor(3)
      ),
      dimension(
        'reliability',
        'Failure handling and operation',
        ['failure', 'review'],
        config.failure.expectedSignals,
        ['retries indefinitely or recovers without deduplication and reconciliation'],
        conceptFor(4),
        drillFor(0)
      ),
    ],
    followUps: [{ ...config.followUp, stageId: 'deep-dive' }],
    failureInjections: [config.failure],
    conceptIds: config.concepts,
    drillIds: config.drills,
    commonMistakes: config.mistakes,
    strongerAnswer: config.strongerAnswer,
    sources: config.sources,
    publication: { state: 'practice-only' },
  };
}

const distributedUniqueId = createClassicCase({
  id: 'distributed-unique-id-generator',
  title: 'Design a distributed unique ID generator',
  category: 'infrastructure-storage',
  pattern: 'time-ordered identifier allocation without a central write bottleneck',
  criticalPath: 'local ID generation from timestamp, worker identity, and per-tick sequence',
  prompt:
    'Design a service that issues globally unique, roughly time-sortable 64-bit IDs to thousands of application servers across regions without a database round trip per ID.',
  difficulty: 'core',
  assumptions: [
    'The identifier must fit in a signed 64-bit database column.',
    'Clients need at least five million IDs per second globally.',
    'Rough time ordering is useful, but identifiers are not a legal event-order oracle.',
    'A regional control plane may allocate worker identities; the data path must be local.',
  ],
  calculations: [
    {
      id: 'sequence-bits',
      label: 'sequence bits per time bucket',
      formula: 'ceil(log2(peak IDs per worker per millisecond))',
      unit: 'bits',
      expectedTerms: ['peak IDs/s', 'workers', 'milliseconds', 'burst factor'],
    },
    {
      id: 'timestamp-lifetime',
      label: 'timestamp field lifetime',
      formula: '2^timestampBits × tickDuration',
      unit: 'years',
      expectedTerms: ['custom epoch', 'timestamp bits', 'tick duration'],
    },
  ],
  scopeContract: [
    '64-bit output',
    'global uniqueness',
    'local generation',
    'clock rollback policy',
  ],
  architectureSignals: [
    'worker-identity lease',
    'custom epoch',
    'per-millisecond sequence',
    'rollback detection',
    'decoder for operational debugging',
  ],
  invariant: 'No two active generators can emit the same timestamp-worker-sequence tuple.',
  tradeoff:
    'More timestamp lifetime, worker capacity, and burst capacity compete for the same 63 usable bits.',
  concepts: [
    'unique-id-generation',
    'distributed-infra',
    'sharding',
    'consensus',
    'monitoring-analytics',
  ],
  drills: ['snowflake-id-layout', 'shard-key-choice', 'design-leader-election', 'slo-error-budget'],
  deepDivePrompt:
    'Choose the bit layout and worker-ID allocation scheme. Explain sequence exhaustion, clock rollback, lease reuse, and what ordering guarantees consumers may safely infer.',
  followUp: {
    id: 'multi-region-worker-leases',
    matchAny: ['worker', 'lease', 'region'],
    prompt:
      'A region is partitioned from the worker-ID allocator for an hour. Can it keep issuing IDs safely?',
  },
  failure: {
    id: 'clock-rollback',
    title: 'Clock moves backward',
    prompt:
      'NTP steps a generator clock backward by 1.5 seconds while its process restarts and its worker lease is near expiry. Preserve uniqueness without silently stalling the entire fleet.',
    expectedSignals: [
      'persisted last timestamp',
      'quarantine',
      'logical offset',
      'lease fencing',
      'alert',
    ],
  },
  mistakes: [
    'Using a random UUID without checking the 64-bit and locality requirements.',
    'Treating wall-clock order as a total order of business events.',
    'Reusing a worker ID immediately after lease expiry without fencing the prior holder.',
  ],
  strongerAnswer:
    'Allocate fenced worker identities through a small regional control plane and generate IDs locally as timestamp, worker, and sequence fields under a custom epoch. Size the fields from fleet and burst estimates, persist the last emitted tick, and refuse or logically offset generation on clock rollback. Sequence exhaustion waits for the next tick rather than wrapping. Expose a decoder and metrics for rollback, exhausted sequences, lease age, and duplicates, while documenting that numeric order is approximate creation order rather than causality.',
  sources: [
    {
      title: 'RFC 9562 — Universally Unique IDentifiers',
      url: 'https://www.rfc-editor.org/rfc/rfc9562.html',
      kind: 'standard',
    },
    {
      title: 'Twitter Snowflake source archive',
      url: 'https://github.com/twitter-archive/snowflake/tree/snowflake-2010',
      kind: 'official-doc',
    },
  ],
});

const proximitySearch = createClassicCase({
  id: 'proximity-search-service',
  title: 'Design a proximity search service',
  category: 'social-real-time',
  pattern: 'geospatial candidate generation followed by exact distance filtering',
  criticalPath:
    'write location to spatial cells, retrieve nearby candidates, then rank exact distances',
  prompt:
    'Design a service that returns open businesses within a radius, filtered by category and ranked by distance, for a global consumer application.',
  difficulty: 'core',
  assumptions: [
    'Business locations change rarely compared with reads.',
    'Users may search radii from 500 metres to 50 kilometres.',
    'Results can be seconds stale but must respect business visibility and opening status.',
    'The service must handle dense cities and sparse rural areas without scanning the world.',
  ],
  calculations: [
    {
      id: 'cell-fanout',
      label: 'spatial cells touched per query',
      formula: 'query area ÷ selected cell area plus boundary cells',
      unit: 'cells/query',
      expectedTerms: ['radius', 'cell resolution', 'boundary expansion', 'density'],
    },
    {
      id: 'candidate-volume',
      label: 'candidate records per peak second',
      formula: 'peak queries/s × average candidates/query',
      unit: 'candidate records/s',
      expectedTerms: ['peak QPS', 'urban density', 'filters', 'overfetch'],
    },
  ],
  scopeContract: [
    'radius query',
    'category and open filters',
    'distance ranking',
    'bounded staleness',
  ],
  architectureSignals: [
    'spatial cell index',
    'adaptive cell resolution',
    'metadata filter',
    'exact distance check',
    'hot-cell cache',
  ],
  invariant:
    'Every returned entity passes exact radius and visibility checks even when cells only over-approximate the circle.',
  tradeoff:
    'Finer cells reduce false candidates but increase index fan-out and write amplification.',
  concepts: [
    'location-transport',
    'sharding',
    'caching',
    'ranking-metrics',
    'monitoring-analytics',
  ],
  drills: [
    'design-ride-sharing',
    'shard-key-choice',
    'cache-key-and-ttl',
    'compute-precision-recall',
  ],
  deepDivePrompt:
    'Select a spatial indexing scheme and cell resolution strategy. Defend how you cover circle boundaries, filter hot cells, paginate stable results, and measure recall against exact search.',
  followUp: {
    id: 'dense-city-cell',
    matchAny: ['geohash', 'cell', 's2', 'h3'],
    prompt:
      'One downtown cell contains two million venues while nearby rural cells are nearly empty. Adapt the index and query plan.',
  },
  failure: {
    id: 'stale-visibility',
    title: 'Stale spatial replica',
    prompt:
      'A business owner hides a location, but a read replica and cache continue returning it for several minutes. Contain the privacy failure while retaining fast radius search.',
    expectedSignals: [
      'authoritative visibility check',
      'tombstone',
      'cache invalidation',
      'replica lag metric',
      'audit',
    ],
  },
  mistakes: [
    'Using latitude and longitude as independent range filters and accepting corner false positives.',
    'Choosing one fixed cell size for every density and query radius.',
    'Ranking approximate cell distance without an exact final radius check.',
  ],
  strongerAnswer:
    'Map each venue to a hierarchical spatial cell and partition the index by cell prefix. A query chooses a resolution from radius and density, covers the circle with cells, fetches and metadata-filters candidates, then computes exact spherical distance before ranking and cursor pagination. Split or sub-index hot urban cells, cache only safe query shapes, and keep visibility in an authoritative fast path so stale spatial replicas cannot leak hidden entities. Measure candidate amplification, exact-query recall, hot-cell skew, and replica lag.',
  sources: [
    {
      title: 'PostGIS ST_DWithin',
      url: 'https://postgis.net/docs/ST_DWithin.html',
      kind: 'official-doc',
    },
    {
      title: 'Redis geospatial data type',
      url: 'https://redis.io/docs/latest/develop/data-types/geospatial/',
      kind: 'official-doc',
    },
  ],
});

const nearbyFriends = createClassicCase({
  id: 'nearby-friends-service',
  title: 'Design a nearby friends service',
  category: 'social-real-time',
  pattern: 'privacy-filtered moving-presence fan-out over spatial subscriptions',
  criticalPath:
    'ingest a moving user location, update spatial presence, and notify authorized nearby friends',
  prompt:
    'Design an opt-in feature that shows which friends are nearby and updates within seconds as people move, while making privacy and battery cost first-class constraints.',
  difficulty: 'advanced',
  assumptions: [
    'Only mutually authorized friends may see proximity.',
    'Exact coordinates are not exposed; the product shows distance bands.',
    'Mobile clients send adaptive updates and may disappear without a clean disconnect.',
    'Presence within ten seconds is useful; durable travel history is out of scope.',
  ],
  calculations: [
    {
      id: 'location-ingest',
      label: 'location update ingest rate',
      formula: 'active users ÷ average update interval',
      unit: 'updates/s',
      expectedTerms: ['active users', 'foreground/background', 'update interval', 'burst'],
    },
    {
      id: 'friend-comparisons',
      label: 'authorized candidate comparisons',
      formula: 'updates/s × nearby candidates × friendship selectivity',
      unit: 'comparisons/s',
      expectedTerms: ['cell density', 'friend degree', 'privacy filter', 'dedupe'],
    },
  ],
  scopeContract: ['mutual opt-in', 'distance bands', 'ephemeral presence', 'mobile update budget'],
  architectureSignals: [
    'adaptive client sampling',
    'ephemeral spatial presence',
    'friendship authorization join',
    'distance-band hysteresis',
    'WebSocket fan-out',
  ],
  invariant:
    'A proximity event is visible only while both users are opted in, mutually authorized, and currently present.',
  tradeoff:
    'Faster location updates improve freshness but increase battery, network, privacy, and fan-out cost.',
  concepts: [
    'location-transport',
    'messaging-realtime',
    'security-isolation-boundaries',
    'caching',
    'monitoring-analytics',
  ],
  drills: ['design-ride-sharing', 'design-chat-system', 'cache-key-and-ttl', 'slo-error-budget'],
  deepDivePrompt:
    'Defend the presence TTL, adaptive mobile sampling, authorization join, entry/exit hysteresis, and whether updates fan out on write or are pulled on read.',
  followUp: {
    id: 'celebrity-friend-graph',
    matchAny: ['friend', 'fan-out', 'websocket'],
    prompt:
      'A celebrity account has ten million followers but authorizes only 40 close friends. Prevent graph-degree amplification.',
  },
  failure: {
    id: 'revoked-consent',
    title: 'Consent revoked during partition',
    prompt:
      'A user disables sharing while one presence region is partitioned and clients retain old nearby results. Stop disclosure quickly and reconcile afterward.',
    expectedSignals: [
      'authoritative consent version',
      'short presence TTL',
      'revocation broadcast',
      'fail closed',
      'reconcile',
    ],
  },
  mistakes: [
    'Treating this as static venue search and persisting exact location history by default.',
    'Fanning every movement update to the full social graph.',
    'Allowing stale presence to outlive consent or mutual authorization.',
  ],
  strongerAnswer:
    'Clients send adaptively sampled, coarse locations to a regional presence service keyed by spatial cell. Presence records have short TTLs and consent versions. Candidate generation happens by neighbouring cells, but a fast authoritative friendship and consent check filters every event before distance-band hysteresis and WebSocket fan-out. Pull or recompute on reconnect rather than replaying precise travel history. Revocation fails closed, invalidates sessions, and propagates independently of the location stream. Track freshness, battery budget, candidate amplification, revoked-event leakage, and fan-out skew.',
  sources: [
    {
      title: 'S2 Geometry concepts',
      url: 'https://s2geometry.io/devguide/s2cell_hierarchy.html',
      kind: 'official-doc',
    },
    {
      title: 'RFC 6455 — The WebSocket Protocol',
      url: 'https://www.rfc-editor.org/rfc/rfc6455.html',
      kind: 'standard',
    },
  ],
});

const mapsRouting = createClassicCase({
  id: 'maps-routing-platform',
  title: 'Design a maps and routing platform',
  category: 'infrastructure-storage',
  pattern: 'hierarchical shortest-path routing over a versioned road graph',
  criticalPath:
    'snap endpoints to the road graph, search a partitioned hierarchy, and assemble route guidance',
  prompt:
    'Design a driving-directions service that returns routes and ETAs across a continent, incorporates live traffic, and can serve map tiles separately from route computation.',
  difficulty: 'advanced',
  assumptions: [
    'The road graph changes in batches while traffic weights change continuously.',
    'Users need alternatives and turn guidance, not merely geometric distance.',
    'Route latency should remain below 500 ms at the 99th percentile.',
    'Offline map-tile delivery and live route computation are separate products.',
  ],
  calculations: [
    {
      id: 'road-graph-size',
      label: 'road graph storage',
      formula: 'directed edges × encoded bytes per edge × index overhead',
      unit: 'bytes',
      expectedTerms: ['nodes', 'directed edges', 'geometry', 'turn restrictions', 'index'],
    },
    {
      id: 'traffic-update-rate',
      label: 'live edge-weight update rate',
      formula: 'instrumented edges ÷ refresh interval',
      unit: 'edge updates/s',
      expectedTerms: ['coverage', 'refresh interval', 'regional skew', 'aggregation'],
    },
  ],
  scopeContract: [
    'driving route and ETA',
    'live traffic',
    'route alternatives',
    'separate tile path',
  ],
  architectureSignals: [
    'versioned road graph',
    'map matching',
    'hierarchical graph partitions',
    'dynamic traffic overlay',
    'route instruction assembly',
  ],
  invariant:
    'Every returned path obeys road direction and turn restrictions from one compatible graph version.',
  tradeoff:
    'Precomputation reduces query latency but becomes expensive or stale when edge weights change rapidly.',
  concepts: ['shortest-path', 'graphs', 'location-transport', 'sharding', 'caching'],
  drills: [
    'dijkstra-shortest-path',
    'design-ride-sharing',
    'shard-key-choice',
    'cache-key-and-ttl',
  ],
  deepDivePrompt:
    'Choose the graph partitioning and acceleration technique. Explain endpoint snapping, turn restrictions, live-weight overlays, alternatives, graph-version rollout, and route-cache safety.',
  followUp: {
    id: 'road-closure',
    matchAny: ['traffic', 'weight', 'closure'],
    prompt:
      'A bridge closes immediately, but precomputed shortcuts and route caches still include it. Propagate the hard constraint safely.',
  },
  failure: {
    id: 'mixed-graph-version',
    title: 'Mixed graph rollout',
    prompt:
      'Half the routing fleet uses a graph version with a new junction while the guidance service uses the prior turn table. Prevent impossible directions.',
    expectedSignals: [
      'version pinning',
      'atomic manifest',
      'compatibility check',
      'drain old workers',
      'rollback',
    ],
  },
  mistakes: [
    'Running unbounded Dijkstra over the continent for every request.',
    'Applying traffic speed to edges without respecting closures and turn restrictions.',
    'Caching routes without graph version, time bucket, vehicle mode, or policy in the key.',
  ],
  strongerAnswer:
    'Build a directed, turn-aware road graph in versioned regional partitions and publish it through an atomic manifest. Snap endpoints to candidate edges, use a hierarchy such as contraction or multi-level partitions for the static topology, and overlay frequently refreshed traffic weights and hard closures. Pin every request through search and guidance to one graph version, generate a small number of diverse alternatives, and cache only versioned, policy-complete route shapes. Measure p99 search work, ETA error, stale closures, partition crossings, and rollout compatibility.',
  sources: [
    {
      title: 'OSRM HTTP API',
      url: 'https://project-osrm.org/docs/v5.24.0/api/',
      kind: 'official-doc',
    },
    {
      title: 'OpenStreetMap turn restriction relation',
      url: 'https://wiki.openstreetmap.org/wiki/Relation:restriction',
      kind: 'official-doc',
    },
  ],
});

const distributedQueue = createClassicCase({
  id: 'distributed-message-queue',
  title: 'Design a distributed message queue',
  category: 'infrastructure-storage',
  pattern: 'partitioned durable log with consumer-owned progress and bounded redelivery',
  criticalPath:
    'append to an ordered partition, replicate, acknowledge, fetch, and advance consumer progress',
  prompt:
    'Design a multi-tenant distributed queue for asynchronous jobs and event streams with durable retention, consumer groups, backpressure, and at-least-once delivery.',
  difficulty: 'advanced',
  assumptions: [
    'Ordering is required only within a producer-selected key.',
    'Messages may be retained after acknowledgement for replay.',
    'Consumers fail independently and may process messages longer than the normal lease.',
    'Exactly-once external side effects are not promised by the broker.',
  ],
  calculations: [
    {
      id: 'queue-ingress',
      label: 'replicated ingress bandwidth',
      formula: 'peak messages/s × average bytes/message × replication factor',
      unit: 'bytes/s',
      expectedTerms: ['peak rate', 'payload', 'batching', 'replication'],
    },
    {
      id: 'retained-log',
      label: 'retained log storage',
      formula: 'average bytes/s × retention seconds × replication factor',
      unit: 'bytes',
      expectedTerms: ['retention', 'compression', 'replication', 'headroom'],
    },
  ],
  scopeContract: [
    'key-ordered partitions',
    'at-least-once delivery',
    'replay retention',
    'consumer groups',
  ],
  architectureSignals: [
    'partition leader and replicas',
    'batched append log',
    'consumer-owned offset',
    'lease or heartbeat',
    'dead-letter policy',
  ],
  invariant:
    'An acknowledged durable append survives the configured failure quorum and retains its partition order.',
  tradeoff:
    'Larger batches and fewer partitions improve throughput efficiency but increase latency and reduce parallelism.',
  concepts: ['message-queues', 'event-streaming-kafka', 'replication', 'sharding', 'idempotency'],
  drills: [
    'queue-backpressure',
    'practice-event-streaming-kafka',
    'replication-lag-read',
    'implement-idempotency-key',
  ],
  deepDivePrompt:
    'Defend partition assignment, acknowledgement quorum, consumer-group ownership, visibility or offset semantics, poison-message handling, and producer/consumer backpressure.',
  followUp: {
    id: 'slow-consumer-rebalance',
    matchAny: ['consumer group', 'offset', 'lease', 'heartbeat'],
    prompt:
      'A consumer pauses for ten minutes during processing and its partition is reassigned. Prevent silent loss while bounding duplicate work.',
  },
  failure: {
    id: 'leader-ack-loss',
    title: 'Leader fails after append',
    prompt:
      'The partition leader appends a batch and sends an acknowledgement, but fails before a lagging replica observes it. Explain the configured durability result and recovery.',
    expectedSignals: [
      'ack quorum',
      'high watermark',
      'leader epoch',
      'unclean election disabled',
      'producer dedupe',
    ],
  },
  mistakes: [
    'Claiming the broker makes an arbitrary database write exactly once.',
    'Using one global ordered partition and then promising horizontal throughput.',
    'Retrying poison messages forever without a bounded quarantine and replay path.',
  ],
  strongerAnswer:
    'Hash ordering keys into a sufficient number of append-only partitions, replicate each partition, and acknowledge only at the chosen durability watermark. Producers use stable identities and sequence numbers for retry deduplication. Consumer groups own partitions through fenced epochs and persist progress only after their idempotent effect or transaction boundary. Apply byte- and lag-based quotas, pause fetch before memory explodes, quarantine poison messages with diagnostic context, and retain the log for replay. State clearly that end-to-end exactly-once needs cooperation from the sink.',
  sources: [
    {
      title: 'Apache Kafka design documentation',
      url: 'https://kafka.apache.org/documentation/#design',
      kind: 'official-doc',
    },
    {
      title: 'RabbitMQ reliability guide',
      url: 'https://www.rabbitmq.com/docs/reliability',
      kind: 'official-doc',
    },
  ],
});

const metricsPlatform = createClassicCase({
  id: 'metrics-monitoring-platform',
  title: 'Design a metrics monitoring platform',
  category: 'infrastructure-storage',
  pattern: 'high-cardinality time-series ingestion with rollups and query fan-out',
  criticalPath:
    'validate and shard samples, persist recent series, compact blocks, and evaluate queries and alerts',
  prompt:
    'Design a multi-tenant metrics platform that ingests counters, gauges, and histograms, supports dashboard queries and recording rules, and evaluates reliable alerts.',
  difficulty: 'advanced',
  assumptions: [
    'Tenants can accidentally create unbounded label cardinality.',
    'Recent data needs low-latency queries; older data may use immutable object-store blocks.',
    'Alert evaluation must survive query-node restarts without duplicate notifications.',
    'Raw samples have shorter retention than downsampled aggregates.',
  ],
  calculations: [
    {
      id: 'sample-ingest',
      label: 'sample ingest rate',
      formula: 'active series × samples per series per second',
      unit: 'samples/s',
      expectedTerms: ['active series', 'scrape interval', 'burst', 'tenant skew'],
    },
    {
      id: 'metrics-storage',
      label: 'compressed retention storage',
      formula: 'samples/s × bytes/sample × retention seconds × replication factor',
      unit: 'bytes',
      expectedTerms: ['compression', 'retention tiers', 'replication', 'index overhead'],
    },
  ],
  scopeContract: ['labelled time series', 'range queries', 'recording rules', 'alert evaluation'],
  architectureSignals: [
    'cardinality admission control',
    'tenant-aware ingest sharding',
    'write-ahead log',
    'immutable time blocks',
    'query fan-out and rollup selection',
  ],
  invariant:
    'A sample is identified by tenant, metric name, full label set, and timestamp; alert state advances on a consistent evaluation timeline.',
  tradeoff:
    'Flexible labels make diagnosis powerful but uncontrolled cardinality multiplies memory, index, and query cost.',
  concepts: ['monitoring-analytics', 'sharding', 'object-storage', 'queueing-theory', 'caching'],
  drills: [
    'practice-opentelemetry-observability',
    'shard-key-choice',
    'storage-vs-retrieval',
    'utilisation-latency-curve',
  ],
  deepDivePrompt:
    'Defend the series identity, cardinality controls, hot versus block storage, compaction, query splitting, rollup selection, and stateful alert evaluation.',
  followUp: {
    id: 'cardinality-explosion',
    matchAny: ['label', 'cardinality', 'series'],
    prompt:
      'A deployment adds request_id as a label and creates 50 million new series in five minutes. Protect other tenants and preserve diagnostic evidence.',
  },
  failure: {
    id: 'late-compacted-block',
    title: 'Duplicate overlapping blocks',
    prompt:
      'A compactor retries after an ambiguous object-store timeout and publishes overlapping blocks while queries are running. Avoid double counting and recover safely.',
    expectedSignals: [
      'deterministic block identity',
      'manifest',
      'compaction lineage',
      'dedupe',
      'quarantine',
    ],
  },
  mistakes: [
    'Treating metric labels as free-form log fields without cardinality limits.',
    'Scanning raw samples for every dashboard range regardless of retention tier.',
    'Making alert delivery idempotent but forgetting durable alert state and silence versions.',
  ],
  strongerAnswer:
    'Validate metric and label schemas at tenant gateways, estimate new-series cost before admission, and shard by tenant plus series fingerprint. Replicated ingesters append to a WAL and serve the recent head; compacted immutable blocks move to object storage with manifests and lineage. Query frontends split time ranges, select safe rollups, cache immutable results, and bound fan-out. Alert evaluators use durable group ownership and state, while notification delivery uses deduplication keys. Track rejected series, active cardinality, ingest lag, query fan-out, block overlap, and alert freshness.',
  sources: [
    {
      title: 'Prometheus data model',
      url: 'https://prometheus.io/docs/concepts/data_model/',
      kind: 'official-doc',
    },
    {
      title: 'OpenMetrics specification',
      url: 'https://github.com/prometheus/OpenMetrics/blob/main/specification/OpenMetrics.md',
      kind: 'standard',
    },
  ],
});

const adClickAggregation = createClassicCase({
  id: 'ad-click-aggregation-system',
  title: 'Design an ad click aggregation system',
  category: 'commerce-marketplaces',
  pattern: 'event-time stream aggregation with deduplication and late-data correction',
  criticalPath:
    'accept a signed click, deduplicate it, join campaign metadata, window by event time, and publish aggregates',
  prompt:
    'Design an ad click pipeline that powers near-real-time campaign dashboards and produces auditable daily billing aggregates despite duplicates, retries, bots, and late events.',
  difficulty: 'advanced',
  assumptions: [
    'Dashboard totals may be provisional; billing totals must close through reconciliation.',
    'Clients and edge collectors retry, so duplicate click events are normal.',
    'Events can arrive hours late and campaign metadata changes over time.',
    'Fraud classification may be revised after the initial click.',
  ],
  calculations: [
    {
      id: 'click-ingest',
      label: 'peak click ingress',
      formula: 'impressions/s × click-through rate × burst factor',
      unit: 'events/s',
      expectedTerms: ['impressions', 'CTR', 'burst', 'retry amplification'],
    },
    {
      id: 'window-state',
      label: 'active window state',
      formula: 'campaign-key cardinality × open windows × bytes/accumulator',
      unit: 'bytes',
      expectedTerms: ['campaigns', 'dimensions', 'watermark delay', 'state overhead'],
    },
  ],
  scopeContract: [
    'provisional dashboards',
    'auditable billing totals',
    'event-time windows',
    'fraud corrections',
  ],
  architectureSignals: [
    'signed event ID',
    'durable event log',
    'event-time watermark',
    'versioned campaign join',
    'correction ledger',
  ],
  invariant:
    'Each accepted click contributes at most once to a given aggregate version, and every billing correction is auditable.',
  tradeoff:
    'Longer lateness windows improve completeness but increase state, latency, and the duration of provisional results.',
  concepts: [
    'event-streaming-kafka',
    'idempotency',
    'monitoring-analytics',
    'transaction-processing',
    'product-analytics',
  ],
  drills: [
    'practice-event-streaming-kafka',
    'implement-idempotency-key',
    'practice-transaction-processing',
    'define-north-star-metric',
  ],
  deepDivePrompt:
    'Define event identity, event time, watermark and lateness policy, metadata versioning, dedupe scope, provisional updates, and billing reconciliation.',
  followUp: {
    id: 'fraud-reclassification',
    matchAny: ['fraud', 'correction', 'billing'],
    prompt:
      'A fraud model invalidates one percent of clicks after daily aggregates were published. Correct dashboards and billing without rewriting history.',
  },
  failure: {
    id: 'checkpoint-replay',
    title: 'Processor replays after checkpoint loss',
    prompt:
      'A stream worker publishes a window result, then loses its latest checkpoint and reprocesses the same partition. Prevent double billing.',
    expectedSignals: [
      'transactional sink or idempotent upsert',
      'aggregate version',
      'checkpoint',
      'dedupe',
      'reconciliation',
    ],
  },
  mistakes: [
    'Windowing by processing time and silently assigning delayed mobile events to the wrong day.',
    'Calling broker delivery exactly once without defining sink and replay behavior.',
    'Overwriting billed totals when fraud corrections arrive instead of recording an adjustment.',
  ],
  strongerAnswer:
    'Collectors validate and sign a stable click ID, then append immutable events to a partitioned log. Stream processors use event time and explicit watermarks, deduplicate by click ID within a declared horizon, join versioned campaign metadata, and emit versioned upserts to provisional aggregates. The raw log and daily immutable snapshots support replay. Billing closes from reconciled aggregates and later fraud decisions post adjustment entries rather than rewriting history. Measure late-event rate, dedupe hits, watermark lag, correction volume, and replay equivalence.',
  sources: [
    {
      title: 'Apache Beam programming guide — event time and windowing',
      url: 'https://beam.apache.org/documentation/programming-guide/#windowing',
      kind: 'official-doc',
    },
    {
      title: 'Google Cloud Dataflow exactly-once processing',
      url: 'https://cloud.google.com/dataflow/docs/concepts/exactly-once',
      kind: 'official-doc',
    },
  ],
});

const hotelReservation = createClassicCase({
  id: 'hotel-reservation-system',
  title: 'Design a hotel reservation system',
  category: 'commerce-marketplaces',
  pattern: 'dated inventory holds with transactional confirmation and expiry',
  criticalPath:
    'price a room-night set, place a bounded hold, authorize payment, and atomically confirm inventory',
  prompt:
    'Design a hotel booking platform that searches room availability and prevents overselling across multi-night stays, retries, payment delays, and expiring holds.',
  difficulty: 'core',
  assumptions: [
    'Inventory is sold by hotel, room type, and night rather than by a specific physical room.',
    'Search may be slightly stale; confirmation must not oversell.',
    'A short hold bridges payment authorization and booking confirmation.',
    'Cancellation and refund policies are versioned at booking time.',
  ],
  calculations: [
    {
      id: 'room-night-rows',
      label: 'room-night inventory records',
      formula: 'hotels × room types/hotel × bookable nights',
      unit: 'inventory rows',
      expectedTerms: ['hotels', 'room types', 'booking horizon', 'partitioning'],
    },
    {
      id: 'hold-volume',
      label: 'concurrent holds',
      formula: 'peak checkout starts/s × hold duration seconds',
      unit: 'holds',
      expectedTerms: ['peak checkout', 'hold TTL', 'abandonment', 'multi-night rows'],
    },
  ],
  scopeContract: [
    'room-type search',
    'multi-night availability',
    'bounded hold',
    'idempotent confirmation',
  ],
  architectureSignals: [
    'search availability projection',
    'authoritative room-night inventory',
    'hold with expiry',
    'idempotent booking intent',
    'payment saga and reconciliation',
  ],
  invariant:
    'Confirmed plus unexpired held inventory never exceeds sellable room-night inventory for any date.',
  tradeoff:
    'Longer holds reduce payment-time failures but lower effective inventory and invite abuse.',
  concepts: [
    'booking-inventory',
    'transaction-processing',
    'isolation-levels',
    'idempotency',
    'ecommerce-payments',
  ],
  drills: [
    'design-hotel-booking',
    'practice-transaction-processing',
    'payment-idempotency',
    'implement-idempotency-key',
  ],
  deepDivePrompt:
    'Defend the room-night data model and transaction used to hold a multi-night stay. Explain expiry, idempotent confirmation, stale search results, payment ambiguity, cancellation, and reconciliation.',
  followUp: {
    id: 'hot-property',
    matchAny: ['lock', 'inventory', 'hold'],
    prompt:
      'A flash sale sends 50,000 concurrent requests for the final ten rooms at one property. Preserve the invariant and bound contention.',
  },
  failure: {
    id: 'payment-confirm-timeout',
    title: 'Payment committed, booking response lost',
    prompt:
      'The payment provider commits an authorization, but the booking service times out before returning confirmation and the client retries.',
    expectedSignals: [
      'stable booking intent',
      'idempotency key',
      'processor lookup',
      'legal state transition',
      'reconciliation',
    ],
  },
  mistakes: [
    'Treating a cached search result as authority to confirm inventory.',
    'Locking only the arrival night for a multi-night booking.',
    'Releasing a hold on timeout without checking an ambiguous payment result.',
  ],
  strongerAnswer:
    'Serve search from a fast availability projection, but create a stable booking intent before checkout. In one authoritative transaction, conditionally reserve every requested room-night row under a short hold and fail the whole stay if any night is unavailable. Authorize payment under the intent ID, then transition the hold to confirmed idempotently; ambiguous results are queried before retry. Expiry workers use fenced state transitions, cancellation applies the policy snapshot captured at booking, and reconciliation compares inventory, booking, and payment records.',
  sources: [
    {
      title: 'PostgreSQL transaction isolation',
      url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
      kind: 'official-doc',
    },
    {
      title: 'Stripe idempotent requests',
      url: 'https://docs.stripe.com/api/idempotent_requests',
      kind: 'official-doc',
    },
  ],
});

const emailService = createClassicCase({
  id: 'distributed-email-service',
  title: 'Design a distributed email service',
  category: 'infrastructure-storage',
  pattern: 'policy-aware asynchronous delivery with domain throttles and feedback loops',
  criticalPath:
    'accept one logical message, expand recipients, enqueue by destination domain, attempt SMTP delivery, and process feedback',
  prompt:
    'Design a transactional email platform that accepts API requests, renders templates, delivers through SMTP, handles retries and bounces, and protects sender reputation.',
  difficulty: 'advanced',
  assumptions: [
    'The platform sends transactional mail rather than bulk marketing campaigns.',
    'One request may expand to many recipients, but privacy forbids leaking the recipient list.',
    'Remote domains impose different rate and concurrency limits.',
    'SMTP outcomes include success, permanent rejection, transient rejection, and ambiguous disconnects.',
  ],
  calculations: [
    {
      id: 'email-egress',
      label: 'peak MIME egress',
      formula: 'peak recipients/s × average encoded message bytes',
      unit: 'bytes/s',
      expectedTerms: [
        'recipient expansion',
        'attachments',
        'base64 overhead',
        'retry amplification',
      ],
    },
    {
      id: 'retry-backlog',
      label: 'transient retry backlog',
      formula: 'transient failures/s × average retry residence seconds',
      unit: 'queued recipients',
      expectedTerms: ['4xx rate', 'backoff', 'retention', 'domain skew'],
    },
  ],
  scopeContract: [
    'transactional send API',
    'per-recipient delivery',
    'SMTP retry semantics',
    'bounce and complaint feedback',
  ],
  architectureSignals: [
    'idempotent message submission',
    'recipient expansion',
    'domain-partitioned queues',
    'SPF DKIM and DMARC alignment',
    'suppression list',
  ],
  invariant:
    'A suppressed recipient is never intentionally attempted, and every recipient has an independent auditable delivery state.',
  tradeoff:
    'Aggressive retries improve short-term delivery but can worsen remote throttling and sender reputation.',
  concepts: [
    'message-queues',
    'retries-and-circuit-breakers',
    'idempotency',
    'security-isolation-boundaries',
    'monitoring-analytics',
  ],
  drills: [
    'queue-backpressure',
    'implement-idempotency-key',
    'webhook-signature-verify',
    'slo-error-budget',
  ],
  deepDivePrompt:
    'Define per-recipient states and SMTP outcome handling. Defend domain throttles, retry schedules, idempotency, template rendering, authentication, suppression, and feedback processing.',
  followUp: {
    id: 'gmail-throttle',
    matchAny: ['domain', 'throttle', 'retry'],
    prompt:
      'A major mailbox provider starts returning temporary 4xx responses to half your traffic. Adapt without blocking every other domain.',
  },
  failure: {
    id: 'ambiguous-smtp-disconnect',
    title: 'Disconnect after DATA',
    prompt:
      'The remote server accepts the message body and disconnects before your sender receives the final status. Decide whether and how to retry.',
    expectedSignals: [
      'ambiguous state',
      'stable Message-ID',
      'bounded retry',
      'possible duplicate',
      'feedback reconciliation',
    ],
  },
  mistakes: [
    'Treating one API request as one delivery state when it has many recipients.',
    'Retrying permanent 5xx rejections or suppressed addresses.',
    'Using a single global queue that lets one throttled domain block all delivery.',
  ],
  strongerAnswer:
    'Create one idempotent logical message and immutable per-recipient jobs after rendering and policy checks. Partition scheduling by destination domain so concurrency, rate, and backoff adapt to each provider. Sign aligned mail, use stable Message-IDs, classify SMTP results into delivered, permanent, transient, or ambiguous, and bound retries with jitter and expiry. Bounce and complaint feedback updates a strongly checked suppression list before any future attempt. Track queue age, domain response classes, authentication failures, complaints, and duplicate-risk retries.',
  sources: [
    {
      title: 'RFC 5321 — Simple Mail Transfer Protocol',
      url: 'https://www.rfc-editor.org/rfc/rfc5321.html',
      kind: 'standard',
    },
    {
      title: 'RFC 7489 — DMARC',
      url: 'https://www.rfc-editor.org/rfc/rfc7489.html',
      kind: 'standard',
    },
  ],
});

const objectStorage = createClassicCase({
  id: 'object-storage-service',
  title: 'Design an object storage service',
  category: 'infrastructure-storage',
  pattern: 'immutable blob placement with strongly identified metadata and background repair',
  criticalPath:
    'authorize a multipart upload, place erasure-coded chunks, commit metadata, and serve ranged reads',
  prompt:
    'Design an S3-like object storage service with buckets, immutable object versions, multipart uploads, ranged reads, checksums, lifecycle policies, and regional durability.',
  difficulty: 'advanced',
  assumptions: [
    'Objects range from kilobytes to multi-terabyte multipart uploads.',
    'Metadata operations require clear consistency semantics distinct from blob placement.',
    'Clients need conditional writes, versioning, and ranged downloads.',
    'The service must detect silent corruption and rebuild after disk, host, and rack failures.',
  ],
  calculations: [
    {
      id: 'durable-capacity',
      label: 'physical storage with coding overhead',
      formula: 'logical bytes × erasure coding expansion × version and headroom factor',
      unit: 'bytes',
      expectedTerms: ['logical bytes', 'data shards', 'parity shards', 'versions', 'headroom'],
    },
    {
      id: 'repair-bandwidth',
      label: 'failure-domain repair bandwidth',
      formula: 'bytes to rebuild ÷ recovery objective seconds',
      unit: 'bytes/s',
      expectedTerms: ['failed domain', 'RTO', 'read amplification', 'throttle'],
    },
  ],
  scopeContract: [
    'bucket and object API',
    'multipart upload',
    'versioned metadata',
    'ranged and conditional reads',
  ],
  architectureSignals: [
    'strongly identified metadata row',
    'multipart upload manifest',
    'content checksum',
    'erasure-coded chunk placement',
    'scrub and repair queue',
  ],
  invariant:
    'A committed object version references a complete checksum-verified chunk set whose placement satisfies the durability policy.',
  tradeoff:
    'Erasure coding lowers capacity overhead but increases small-write complexity, repair reads, and degraded-read latency.',
  concepts: [
    'object-storage',
    'replication',
    'sharding',
    'transaction-processing',
    'monitoring-analytics',
  ],
  drills: [
    'storage-vs-retrieval',
    'replication-lag-read',
    'shard-key-choice',
    'practice-transaction-processing',
  ],
  deepDivePrompt:
    'Defend the metadata/blob split, multipart commit protocol, chunk placement, erasure coding choice, checksum path, ranged reads, versioning, garbage collection, and repair priority.',
  followUp: {
    id: 'small-object-load',
    matchAny: ['chunk', 'erasure', 'multipart'],
    prompt:
      'The workload shifts to billions of 2 KB objects. Avoid spending more metadata and coding overhead than payload.',
  },
  failure: {
    id: 'orphaned-multipart',
    title: 'Commit outcome is ambiguous',
    prompt:
      'All multipart chunks were placed, but the metadata commit response was lost and the client retries CompleteMultipartUpload. Avoid duplicate versions and leaked chunks.',
    expectedSignals: [
      'upload ID',
      'idempotent commit',
      'manifest checksum',
      'conditional metadata write',
      'orphan garbage collection',
    ],
  },
  mistakes: [
    'Writing metadata before enough durable chunks exist and exposing an unreadable committed object.',
    'Assuming disk success proves end-to-end data integrity without checksums and scrubbing.',
    'Deleting unreferenced chunks immediately despite ambiguous or in-flight multipart commits.',
  ],
  strongerAnswer:
    'Keep bucket, key, version, policy, and chunk-manifest metadata in a strongly identified partitioned store. Multipart parts receive checksums and durable temporary placement under an upload ID; completion verifies the manifest and conditionally publishes one object version idempotently. Large immutable chunks are erasure-coded across failure domains, while small objects may be packed or replicated. Reads fetch only required ranges, verify checksums, and reconstruct on degraded paths. Background scrub, repair, lifecycle, and delayed orphan collection are rate-limited and observable.',
  sources: [
    {
      title: 'Amazon S3 data consistency model',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel',
      kind: 'official-doc',
    },
    {
      title: 'Amazon S3 multipart upload overview',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html',
      kind: 'official-doc',
    },
  ],
});

const gamingLeaderboard = createClassicCase({
  id: 'gaming-leaderboard',
  title: 'Design a real-time gaming leaderboard',
  category: 'social-real-time',
  pattern: 'ordered score index with idempotent event updates and rank snapshots',
  criticalPath:
    'validate a score event, update the ordered index, and answer top-N and around-player ranks',
  prompt:
    'Design a leaderboard for a global game with seasonal, regional, and friends-only rankings, real-time score updates, anti-cheat review, and stable end-of-season results.',
  difficulty: 'core',
  assumptions: [
    'Scores may increase frequently and events can be retried or arrive out of order.',
    'Top-N and around-player queries dominate; exact rank for every player need not be globally synchronous.',
    'Untrusted clients cannot be the authority for score changes.',
    'Season closure requires an immutable auditable snapshot.',
  ],
  calculations: [
    {
      id: 'score-update-rate',
      label: 'peak score update rate',
      formula: 'active players × scoring events/player/s × burst factor',
      unit: 'updates/s',
      expectedTerms: ['active players', 'event rate', 'burst', 'dedupe'],
    },
    {
      id: 'ordered-index-memory',
      label: 'ordered index memory',
      formula: 'ranked players × bytes per member and index overhead',
      unit: 'bytes',
      expectedTerms: ['players', 'score', 'member ID', 'index pointers', 'shards'],
    },
  ],
  scopeContract: [
    'seasonal scores',
    'top-N and around-player reads',
    'regional and friends views',
    'authoritative score events',
  ],
  architectureSignals: [
    'server-signed score event',
    'event deduplication',
    'ordered score index',
    'tie-break rule',
    'season snapshot',
  ],
  invariant:
    'Each accepted gameplay event affects a season score at most once, and ties resolve deterministically.',
  tradeoff:
    'A single exact global order is simple to query but becomes a hot write bottleneck; sharded ranks need merge or approximation.',
  concepts: [
    'event-streaming-kafka',
    'ranking-metrics',
    'sharding',
    'caching',
    'monitoring-analytics',
  ],
  drills: [
    'practice-event-streaming-kafka',
    'compute-precision-recall',
    'shard-key-choice',
    'cache-key-and-ttl',
  ],
  deepDivePrompt:
    'Defend score-event authority and dedupe, ordered-index choice, tie-breaking, global versus regional partitioning, around-player reads, friend filtering, anti-cheat quarantine, and season closure.',
  followUp: {
    id: 'top-player-hotspot',
    matchAny: ['sorted set', 'rank', 'shard'],
    prompt:
      'One tournament creates one million updates per second to the same global board. Preserve useful rank freshness without one hot key.',
  },
  failure: {
    id: 'season-close-replay',
    title: 'Late events after season closure',
    prompt:
      'A partition recovers and replays valid but delayed score events after prizes were computed. Define closure, correction, and audit behavior.',
    expectedSignals: [
      'event-time cutoff',
      'watermark',
      'immutable snapshot',
      'late-event quarantine',
      'manual adjudication',
    ],
  },
  mistakes: [
    'Accepting a client-supplied absolute score as authoritative.',
    'Using floating-point scores without a deterministic tie-break key.',
    'Promising exact global rank from independent shards without a merge or rank-estimation design.',
  ],
  strongerAnswer:
    'Game servers emit signed, stable score events to a durable log. Consumers deduplicate event IDs and update a season-scoped ordered index using integer scores plus a deterministic tie-break field. Regional boards partition naturally; a global board either merges shard leaders for top-N and around-player windows or documents bounded rank staleness. Friends-only views intersect candidate ranks with the social graph. Suspicious events enter quarantine before publication, and season closure pins an event-time cutoff and immutable snapshot with a reviewed late-event path.',
  sources: [
    {
      title: 'Redis sorted sets',
      url: 'https://redis.io/docs/latest/develop/data-types/sorted-sets/',
      kind: 'official-doc',
    },
    {
      title: 'Apache Kafka Streams core concepts',
      url: 'https://kafka.apache.org/documentation/streams/core-concepts',
      kind: 'official-doc',
    },
  ],
});

const digitalWallet = createClassicCase({
  id: 'digital-wallet-system',
  title: 'Design a digital wallet',
  category: 'commerce-marketplaces',
  pattern: 'double-entry value transfer with holds, idempotent commands, and reconciliation',
  criticalPath:
    'authorize a transfer, reserve funds, post balanced ledger entries, and expose derived balances',
  prompt:
    'Design a digital wallet that supports deposits, peer-to-peer transfers, merchant payments, refunds, and withdrawals while maintaining auditable balances across retries and external settlement.',
  difficulty: 'advanced',
  assumptions: [
    'Ledger entries are immutable and balances are derived or transactionally cached.',
    'External bank and card operations may return ambiguous outcomes.',
    'Available, pending, and settled balances are distinct.',
    'Multi-currency conversion is out of the first critical path but must not corrupt precision.',
  ],
  calculations: [
    {
      id: 'ledger-write-rate',
      label: 'ledger entry write rate',
      formula: 'peak operations/s × average entries/operation',
      unit: 'entries/s',
      expectedTerms: ['operations', 'debit and credit entries', 'fees', 'retries'],
    },
    {
      id: 'reconciliation-volume',
      label: 'daily reconciliation comparisons',
      formula: 'external settlement records/day + internal operations/day',
      unit: 'records/day',
      expectedTerms: ['processor records', 'bank records', 'ledger operations', 'exceptions'],
    },
  ],
  scopeContract: [
    'double-entry ledger',
    'available and pending balances',
    'P2P transfer',
    'external settlement reconciliation',
  ],
  architectureSignals: [
    'stable operation intent',
    'balanced immutable entries',
    'funds hold',
    'legal state machine',
    'reconciliation exceptions',
  ],
  invariant:
    'Every posted operation balances debits and credits per currency, and no account spends more than its available funds.',
  tradeoff:
    'Serializing every account mutation protects balances but requires careful partitioning and coordination for cross-account transfers.',
  concepts: [
    'ecommerce-payments',
    'transaction-processing',
    'idempotency',
    'isolation-levels',
    'monitoring-analytics',
  ],
  drills: [
    'payment-idempotency',
    'practice-transaction-processing',
    'implement-idempotency-key',
    'slo-error-budget',
  ],
  deepDivePrompt:
    'Define accounts, entries, holds, operation states, idempotency, cross-account concurrency, external settlement, refunds, balance reads, and reconciliation.',
  followUp: {
    id: 'cross-partition-transfer',
    matchAny: ['ledger', 'account', 'transaction'],
    prompt:
      'Sender and recipient accounts live on different partitions. Preserve atomic value conservation without a global database lock.',
  },
  failure: {
    id: 'ambiguous-withdrawal',
    title: 'Bank accepted withdrawal, response lost',
    prompt:
      'The external bank may have accepted a withdrawal, but the response timed out and the user retries. Prevent double withdrawal and avoid releasing funds prematurely.',
    expectedSignals: [
      'stable external key',
      'pending state',
      'provider lookup',
      'no blind retry',
      'reconciliation',
    ],
  },
  mistakes: [
    'Updating a mutable balance without immutable balanced ledger entries.',
    'Using binary floating point for money.',
    'Treating a transport timeout as proof that an external transfer failed.',
  ],
  strongerAnswer:
    'Create a stable operation intent and validate currency, limits, and identity before posting. Represent money in fixed minor units and record every effect as immutable balanced entries under one legal state transition. Funds move from available to held before external work; cross-partition transfers use a durable coordinator or paired reservations with fencing and compensation, never an untracked partial debit. Ambiguous provider outcomes remain pending and are queried or reconciled before retry. Balance projections are rebuildable from the ledger and every exception is auditable.',
  sources: [
    {
      title: 'Stripe idempotent requests',
      url: 'https://docs.stripe.com/api/idempotent_requests',
      kind: 'official-doc',
    },
    {
      title: 'PostgreSQL transaction isolation',
      url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
      kind: 'official-doc',
    },
  ],
});

const stockExchange = createClassicCase({
  id: 'stock-exchange',
  title: 'Design a stock exchange',
  category: 'commerce-marketplaces',
  pattern: 'single-writer price-time priority matching with sequenced market-data replication',
  criticalPath:
    'risk-check and sequence an order, mutate one symbol book, emit trades, and publish ordered market data',
  prompt:
    'Design the core of a stock exchange that accepts limit and market orders, matches by price-time priority, publishes market data, and recovers without reordering or duplicating trades.',
  difficulty: 'advanced',
  assumptions: [
    'One logical matching owner processes a symbol partition at a time.',
    'The matching path prioritizes deterministic low latency over cross-symbol transactions.',
    'Pre-trade risk checks happen before the order reaches the matching sequencer.',
    'Settlement is downstream; the exchange must emit an authoritative execution log.',
  ],
  calculations: [
    {
      id: 'order-throughput',
      label: 'peak sequenced message rate',
      formula: 'new orders/s + cancels/s + replaces/s',
      unit: 'commands/s',
      expectedTerms: ['orders', 'cancels', 'replaces', 'burst', 'symbols'],
    },
    {
      id: 'market-data-fanout',
      label: 'market data egress',
      formula: 'book events/s × encoded bytes/event × subscriber fan-out strategy',
      unit: 'bytes/s',
      expectedTerms: ['executions', 'book updates', 'snapshots', 'multicast or gateways'],
    },
  ],
  scopeContract: [
    'limit and market orders',
    'cancel and replace',
    'price-time priority',
    'authoritative executions and market data',
  ],
  architectureSignals: [
    'pre-trade risk gateway',
    'monotonic input sequencer',
    'single-writer symbol book',
    'write-ahead event log',
    'snapshot plus incremental market data',
  ],
  invariant:
    'For one symbol, accepted commands execute exactly in sequencer order and resting orders at the best price match by arrival priority.',
  tradeoff:
    'A deterministic single writer simplifies ordering and recovery but caps one symbol partition at one engine core or shard.',
  concepts: [
    'transaction-processing',
    'event-streaming-kafka',
    'distributed-infra',
    'replication',
    'monitoring-analytics',
  ],
  drills: [
    'practice-transaction-processing',
    'practice-event-streaming-kafka',
    'replication-lag-read',
    'slo-error-budget',
  ],
  deepDivePrompt:
    'Defend the order state machine, price-time data structures, sequencing, single-writer boundary, cancel races, persistence, replica recovery, market-data snapshots, and deterministic replay.',
  followUp: {
    id: 'hot-symbol',
    matchAny: ['symbol', 'partition', 'single writer'],
    prompt:
      'One symbol receives more traffic than one matching core can process. Which semantics can and cannot survive splitting its order book?',
  },
  failure: {
    id: 'engine-failover',
    title: 'Matcher fails after emitting executions',
    prompt:
      'The active matcher emits trade events, then crashes before its latest snapshot. A standby takes over while gateways retry orders. Prevent duplicate or reordered executions.',
    expectedSignals: [
      'input sequence',
      'durable log',
      'fenced epoch',
      'deterministic replay',
      'client order ID',
    ],
  },
  mistakes: [
    'Using wall-clock timestamps from many gateways to decide time priority.',
    'Allowing two active matchers to mutate the same symbol book during failover.',
    'Publishing market data from a path that can diverge from the authoritative execution log.',
  ],
  strongerAnswer:
    'Gateways authenticate, risk-check, and attach stable client order IDs before a sequencer assigns the symbol partition and total command order. One fenced matcher owns each partition, keeps price levels in ordered structures with FIFO queues, appends deterministic state transitions to a durable log, and emits executions and book deltas from that same sequence. Standbys restore a snapshot and replay the log before acquiring a higher epoch. Market-data consumers recover from sequence gaps through versioned snapshots plus incrementals. Cross-symbol scaling uses partitioning, while one hot symbol remains a deliberate single-writer limit unless semantics are weakened.',
  sources: [
    {
      title: 'FIX Trading Community — FIX standards',
      url: 'https://www.fixtrading.org/standards/',
      kind: 'standard',
    },
    {
      title: 'Nasdaq TotalView-ITCH specification',
      url: 'https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf',
      kind: 'official-doc',
    },
  ],
});

export const CLASSIC_GAP_SYSTEM_DESIGN_CASES: SystemDesignCase[] = [
  distributedUniqueId,
  proximitySearch,
  nearbyFriends,
  mapsRouting,
  distributedQueue,
  metricsPlatform,
  adClickAggregation,
  hotelReservation,
  emailService,
  objectStorage,
  gamingLeaderboard,
  digitalWallet,
  stockExchange,
];
