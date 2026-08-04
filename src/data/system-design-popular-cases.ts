import type {
  CalculationAnchor,
  RubricAnchor,
  RubricDimension,
  SystemDesignCase,
  SystemDesignCategoryId,
  SystemDesignSource,
  SystemDesignStageId,
  SystemDesignStudyGuide,
} from './system-design-case-schema';
import {
  CLOUD_FILE_STORAGE_GUIDE,
  NOTIFICATION_DELIVERY_GUIDE,
  RIDE_SHARING_GUIDE,
  TICKET_BOOKING_GUIDE,
  VIDEO_STREAMING_GUIDE,
  WEB_CRAWLER_GUIDE,
} from './system-design-popular-guides';

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

interface PopularCaseConfig {
  id: string;
  title: string;
  category: SystemDesignCategoryId;
  pattern: string;
  criticalPath: string;
  difficulty: 'core' | 'advanced';
  prompt: string;
  assumptions: string[];
  calculations: CalculationAnchor[];
  stagePrompts: Record<'scoping' | 'estimation' | 'high-level-design' | 'deep-dive', string>;
  evidence: Record<
    'requirements' | 'capacity' | 'architecture' | 'judgment' | 'reliability',
    string[]
  >;
  concepts: string[];
  drills: string[];
  followUps: Array<{ id: string; matchAny: string[]; prompt: string }>;
  failure: { id: string; title: string; prompt: string; expectedSignals: string[] };
  mistakes: string[];
  strongerAnswer: string;
  sources: SystemDesignSource[];
  guide?: SystemDesignStudyGuide;
}

function dimension(
  id: string,
  label: string,
  stageIds: SystemDesignStageId[],
  evidenceSignals: string[],
  conceptIds: string[],
  drillIds: string[],
  misconceptionSignals: string[]
): RubricDimension {
  return {
    id,
    label,
    weight: 0.2,
    stageIds,
    evidenceSignals,
    misconceptionSignals,
    anchors: SCORE_ANCHORS,
    conceptIds,
    drillIds,
  };
}

function createPopularCase(config: PopularCaseConfig): SystemDesignCase {
  const conceptFor = (index: number) => [config.concepts[index % config.concepts.length]];
  const drillFor = (index: number) => [config.drills[index % config.drills.length]];
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
        prompt: config.stagePrompts.scoping,
        interviewerNote:
          'Look for explicit functional and non-functional requirements, exclusions, scale, consistency, latency, availability, privacy, and the dominant user operation.',
      },
      {
        id: 'estimation',
        title: 'Estimate capacity',
        prompt: config.stagePrompts.estimation,
        interviewerNote:
          'A strong answer carries units, distinguishes average from peak, and connects each estimate to a partition, queue, cache, storage, or fleet decision.',
      },
      {
        id: 'high-level-design',
        title: 'High-level design',
        prompt: config.stagePrompts['high-level-design'],
        interviewerNote:
          'Expect one end-to-end critical path, an authoritative state owner, asynchronous boundaries, idempotency, and an explicit control or policy plane.',
      },
      {
        id: 'deep-dive',
        title: 'Defend the critical path',
        prompt: config.stagePrompts['deep-dive'],
        interviewerNote: `Probe ${config.criticalPath}, its alternatives, partitioning, concurrency, tail behavior, and measurable invariant.`,
      },
      {
        id: 'failure',
        title: 'Failure injection',
        prompt: config.failure.prompt,
        interviewerNote: `Look for detection, containment, degraded behavior, idempotent recovery, and reconciliation. Expected signals include ${config.failure.expectedSignals.join(', ')}.`,
      },
      {
        id: 'review',
        title: 'Review and improve',
        prompt:
          'Summarize the design in two minutes. Name the invariant you protect, the weakest assumption, and the first production experiment or load test you would run.',
        interviewerNote:
          'The learner may now compare the attempt with the reference answer, calculations, mistakes, follow-ups, and targeted remediation.',
      },
    ],
    calculationAnchors: config.calculations,
    rubricDimensions: [
      dimension(
        'requirements',
        'Requirements and contract',
        ['scoping'],
        config.evidence.requirements,
        conceptFor(0),
        drillFor(0),
        ['starts with components before defining the contract']
      ),
      dimension(
        'capacity',
        'Capacity and workload reasoning',
        ['estimation'],
        config.evidence.capacity,
        conceptFor(1),
        drillFor(1),
        ['uses average QPS without peak, payload, amplification, or units']
      ),
      dimension(
        'architecture',
        'Architecture and data flow',
        ['high-level-design'],
        config.evidence.architecture,
        conceptFor(2),
        drillFor(2),
        ['lists technologies without an authoritative state or request path']
      ),
      dimension(
        'technical-judgment',
        'Critical-path judgment',
        ['deep-dive'],
        config.evidence.judgment,
        conceptFor(3),
        drillFor(3),
        ['names one mechanism without alternatives, invariant, or trade-off']
      ),
      dimension(
        'reliability',
        'Failure handling and operation',
        ['failure', 'review'],
        config.evidence.reliability,
        conceptFor(4),
        drillFor(0),
        ['retries indefinitely or recovers without reconciliation']
      ),
    ],
    followUps: config.followUps.map((followUp) => ({
      ...followUp,
      stageId: 'deep-dive' as const,
    })),
    failureInjections: [config.failure],
    conceptIds: config.concepts,
    drillIds: config.drills,
    commonMistakes: config.mistakes,
    strongerAnswer: config.strongerAnswer,
    sources: config.sources,
    publication: config.guide
      ? { state: 'approved', guide: config.guide }
      : { state: 'practice-only' },
  };
}

const videoStreaming = createPopularCase({
  id: 'video-streaming-platform',
  title: 'Design a video streaming platform',
  category: 'media-collaboration',
  pattern: 'adaptive bitrate media processing and edge delivery',
  criticalPath: 'immutable manifest publication through CDN-backed adaptive playback',
  difficulty: 'core',
  prompt:
    'Design an on-demand video platform for creator uploads and global playback. Focus on the reusable upload, transcode, package, authorize, and CDN-delivery pattern rather than recommendations.',
  assumptions: [
    'The first version is on-demand video rather than a low-latency live stream.',
    'Creators upload large source files through resumable sessions.',
    'Viewers expect playback startup under two seconds and adaptive quality across devices.',
    'Private and public videos are supported; recommendation ranking is out of scope.',
    'The service must survive a bad rendition rollout and loss of one CDN region.',
  ],
  calculations: [
    {
      id: 'playback-egress',
      label: 'Playback bandwidth',
      formula: 'concurrent viewers × delivered bitrate',
      unit: 'bits/s',
      expectedTerms: ['viewer', 'bitrate', 'second', 'peak', 'CDN'],
    },
    {
      id: 'transcode-amplification',
      label: 'Transcode and storage amplification',
      formula: 'source upload bytes × rendition and codec amplification',
      unit: 'bytes/day and compute-hours/day',
      expectedTerms: ['upload', 'rendition', 'codec', 'storage', 'compute'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify upload, playback, privacy, device, latency, availability, and media-format requirements. What is deliberately out of scope?',
    estimation:
      'Estimate peak playback starts, concurrent viewers, delivered bandwidth, daily uploads, derived rendition bytes, and transcode work with units.',
    'high-level-design':
      'Trace one source upload to a published asset, then one viewer request through authorization, manifest, CDN, and origin.',
    'deep-dive':
      'Defend the adaptive-bitrate packaging, immutable manifest version, segment sizing, cache key, and rollback design.',
  },
  evidence: {
    requirements: ['on-demand', 'upload', 'playback', 'private', 'startup', 'device'],
    capacity: ['concurrent viewers', 'bitrate', 'egress', 'uploads/day', 'renditions', 'peak'],
    architecture: [
      'object storage',
      'transcode queue',
      'manifest',
      'CDN',
      'authorization',
      'analytics',
    ],
    judgment: ['adaptive bitrate', 'segment', 'keyframe', 'immutable', 'origin shield', 'rollback'],
    reliability: [
      'prior manifest',
      'validation',
      'request collapsing',
      'idempotent job',
      'degrade',
      'reconcile',
    ],
  },
  concepts: [
    'streaming-media',
    'cdn-edge-delivery',
    'object-storage',
    'queueing-theory',
    'monitoring-analytics',
  ],
  drills: [
    'design-video-streaming',
    'queue-backpressure',
    'cache-key-and-ttl',
    'practice-opentelemetry-observability',
  ],
  followUps: [
    {
      id: 'live-video',
      matchAny: ['segment', 'latency'],
      prompt:
        'How would this design change for a live event with a five-second glass-to-glass target?',
    },
    {
      id: 'video-ml',
      matchAny: ['moderation', 'metadata'],
      prompt:
        'How would an ML video-annotation pipeline publish labels without making playback depend on the model?',
    },
  ],
  failure: {
    id: 'bad-rendition-origin-overload',
    title: 'Bad rendition and origin overload',
    prompt:
      'A new encoding template corrupts the highest rendition while CDN misses overload the origin. Walk through detection, containment, rollback, and recovery.',
    expectedSignals: [
      'versioned manifest',
      'quality validation',
      'rollback',
      'origin shield',
      'request collapse',
      're-encode',
    ],
  },
  mistakes: [
    'Streaming media through application servers.',
    'Publishing renditions before validation completes.',
    'Saying “use a CDN” without cache, origin, authorization, or invalidation semantics.',
  ],
  strongerAnswer:
    'Upload resumably to object storage, transcode and validate versioned adaptive renditions asynchronously, then atomically publish an immutable manifest. Authorize playback separately and serve segments through a shielded CDN. Size from watched seconds and bitrate, roll back bad renditions by manifest pointer, collapse origin misses, and monitor startup, rebuffering, errors, hit ratio, queue age, and cost per watched hour.',
  sources: [
    {
      title: 'RFC 8216: HTTP Live Streaming',
      url: 'https://www.rfc-editor.org/rfc/rfc8216',
      kind: 'standard',
    },
    {
      title: 'Apple HTTP Live Streaming documentation',
      url: 'https://developer.apple.com/streaming/',
      kind: 'official-doc',
    },
    {
      title: 'Netflix Open Connect overview',
      url: 'https://openconnect.netflix.com/en/',
      kind: 'official-doc',
    },
    {
      title: 'Netflix video annotation framework',
      url: 'https://netflixtechblog.com/video-annotator-building-video-classifiers-using-vision-language-models-and-active-learning-8ebdda0b2db4',
      kind: 'official-doc',
    },
  ],
  guide: VIDEO_STREAMING_GUIDE,
});

const photoSharing = createPopularCase({
  id: 'photo-sharing-platform',
  title: 'Design a photo-sharing platform',
  category: 'social-real-time',
  pattern: 'privacy-aware social media processing and delivery',
  criticalPath: 'authorized media upload processing and CDN delivery with deletion propagation',
  difficulty: 'core',
  prompt:
    'Design an Instagram-like photo-sharing service with uploads, transformations, privacy, feeds, likes, and safe deletion. Focus on media and social-delivery boundaries.',
  assumptions: [
    'Users upload photos with captions.',
    'The service produces several immutable image variants.',
    'Private accounts and blocking must be enforced on reads.',
    'Feed ranking reuses the existing feed case.',
    'Deletion must remove metadata quickly and purge media asynchronously.',
  ],
  calculations: [
    {
      id: 'photo-storage',
      label: 'Photo storage',
      formula: 'uploads/day × average source and variant bytes × retention',
      unit: 'bytes',
      expectedTerms: ['uploads', 'bytes', 'variants', 'retention'],
    },
    {
      id: 'photo-read-load',
      label: 'Media read load',
      formula: 'feed views/s × photos/view × cache-miss ratio',
      unit: 'origin reads/s',
      expectedTerms: ['feed', 'photos', 'cache', 'origin'],
    },
  ],
  stagePrompts: {
    scoping: 'Clarify media limits, privacy, feed scope, moderation, deletion, and latency.',
    estimation:
      'Estimate upload bytes, derived variants, feed media reads, CDN egress, and metadata writes.',
    'high-level-design':
      'Trace upload processing and an authorized feed/media read, keeping metadata and bytes separate.',
    'deep-dive':
      'Defend privacy checks, immutable variants, CDN authorization, and deletion/tombstone propagation.',
  },
  evidence: {
    requirements: ['upload', 'privacy', 'feed', 'delete', 'moderation'],
    capacity: ['uploads/day', 'variants', 'storage', 'egress', 'cache miss'],
    architecture: ['object storage', 'processor', 'metadata', 'CDN', 'feed', 'policy'],
    judgment: ['signed URL', 'immutable', 'tombstone', 'purge', 'authorization'],
    reliability: ['viral', 'hot key', 'delete', 'invalidate', 'fallback'],
  },
  concepts: [
    'image-video-generation',
    'object-storage',
    'cdn-edge-delivery',
    'social-media',
    'security-isolation-boundaries',
  ],
  drills: [
    'practice-image-video-generation',
    'design-news-feed',
    'cache-key-and-ttl',
    'shard-key-choice',
  ],
  followUps: [
    {
      id: 'visual-search',
      matchAny: ['embedding', 'search'],
      prompt:
        'How would visual-similarity search consume media without coupling upload availability to the model?',
    },
    {
      id: 'content-moderation',
      matchAny: ['moderation', 'safety'],
      prompt:
        'How do ML moderation and human review interact with deterministic policy and appeal?',
    },
  ],
  failure: {
    id: 'viral-delete',
    title: 'Viral photo must be deleted',
    prompt:
      'A viral private photo is cached globally just as the owner deletes it. Contain access and reconcile every copy.',
    expectedSignals: [
      'tombstone',
      'authorization',
      'CDN purge',
      'cache expiry',
      'audit',
      'reconcile',
    ],
  },
  mistakes: [
    'Using object URLs as authorization.',
    'Putting image bytes in the metadata database.',
    'Deleting metadata without blocking cached media reads.',
  ],
  strongerAnswer:
    'Store immutable source and derived variants in object storage, keep privacy and identity in authoritative metadata, process uploads asynchronously, and serve authorized variants through a CDN. Reuse feed ranking but apply policy before media access. Deletion writes a tombstone first, denies new authorization immediately, purges caches and objects asynchronously, and is audited until reconciliation completes.',
  sources: [
    {
      title: 'Amazon S3 object storage documentation',
      url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html',
      kind: 'official-doc',
    },
    {
      title: 'Cloudflare Images documentation',
      url: 'https://developers.cloudflare.com/images/',
      kind: 'official-doc',
    },
    {
      title: 'Yelp video moderation',
      url: 'https://engineeringblog.yelp.com/2024/03/moderating-inappropriate-video-content-at-yelp.html',
      kind: 'official-doc',
    },
  ],
});

const collaborativeEditor = createPopularCase({
  id: 'collaborative-document-editor',
  title: 'Design a collaborative document editor',
  category: 'media-collaboration',
  pattern: 'convergent offline-capable replicated editing',
  criticalPath: 'causally tracked document operations through durable convergence and snapshots',
  difficulty: 'advanced',
  prompt:
    'Design a Google Docs-like editor with real-time multi-user edits, offline work, presence, history, permissions, and deterministic convergence.',
  assumptions: [
    'Text editing is primary.',
    'Clients may disconnect and edit offline.',
    'All authorized replicas must converge.',
    'Presence can be ephemeral.',
    'History and snapshots are durable.',
  ],
  calculations: [
    {
      id: 'edit-throughput',
      label: 'Edit throughput',
      formula: 'active editors × operations/editor/s',
      unit: 'operations/s',
      expectedTerms: ['editors', 'operations', 'second', 'peak'],
    },
    {
      id: 'document-state',
      label: 'Document state growth',
      formula: 'operations/day × metadata bytes/operation × retention',
      unit: 'bytes',
      expectedTerms: ['operations', 'metadata', 'retention', 'snapshot'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify text scope, offline editing, cursor presence, history, permission, and latency.',
    estimation:
      'Estimate concurrent editors, operation rate, active documents, log growth, snapshot cadence, and fan-out.',
    'high-level-design':
      'Trace a local edit through connection ownership, authorization, durable log, fan-out, acknowledgement, and offline catch-up.',
    'deep-dive':
      'Choose OT or CRDT semantics and defend convergence, causality, identifiers, compaction, and permission revocation.',
  },
  evidence: {
    requirements: ['offline', 'converge', 'presence', 'history', 'permission'],
    capacity: ['editors', 'operations/s', 'documents', 'fan-out', 'snapshot'],
    architecture: ['WebSocket', 'operation log', 'snapshot', 'fan-out', 'authorization'],
    judgment: ['CRDT', 'OT', 'causal', 'commutative', 'compaction', 'tombstone'],
    reliability: ['reconnect', 'duplicate', 'out-of-order', 'revocation', 'reconcile'],
  },
  concepts: [
    'conflict-resolution',
    'messaging-realtime',
    'state-management',
    'idempotency',
    'replication',
  ],
  drills: [
    'build-g-counter-merge',
    'design-chat-system',
    'implement-idempotency-key',
    'replication-lag-read',
  ],
  followUps: [
    {
      id: 'permission-revoke',
      matchAny: ['permission', 'authorization'],
      prompt:
        'A user edits offline after access is revoked. Which operations are accepted on reconnect?',
    },
    {
      id: 'large-document',
      matchAny: ['snapshot', 'compaction'],
      prompt: 'How do you compact years of operations without breaking old replicas or cursors?',
    },
  ],
  failure: {
    id: 'offline-merge',
    title: 'Concurrent offline edits',
    prompt:
      'Two devices edit the same paragraph offline for an hour and reconnect through different regions. Show convergence and conflict visibility.',
    expectedSignals: ['causal metadata', 'dedupe', 'merge', 'snapshot', 'permission', 'converge'],
  },
  mistakes: [
    'Using wall-clock last-write-wins for text.',
    'Treating presence as durable document state.',
    'Claiming CRDT without defining operation identity and convergence conditions.',
  ],
  strongerAnswer:
    'Keep local editing responsive, assign stable operation identities and causal context, durably append authorized operations, and fan them to connected replicas. Use a defined OT or CRDT algorithm whose operations converge under reordering and duplication, snapshot and compact safely, keep presence ephemeral, and gate offline replay against current permissions while surfacing rejected or conflicting work.',
  sources: [
    { title: 'Automerge documentation', url: 'https://automerge.org/docs/', kind: 'official-doc' },
    { title: 'Yjs documentation', url: 'https://docs.yjs.dev/', kind: 'official-doc' },
    {
      title: 'A comprehensive study of CRDTs',
      url: 'https://hal.inria.fr/inria-00555588/document',
      kind: 'paper',
    },
  ],
});

const notificationDelivery = createPopularCase({
  id: 'notification-delivery-service',
  title: 'Design a notification delivery service',
  category: 'social-real-time',
  pattern: 'preference-aware multi-channel fan-out with provider isolation',
  criticalPath: 'durable intent through policy rendering and deduplicated provider delivery',
  difficulty: 'core',
  prompt:
    'Design push, email, SMS, and in-app notification delivery with user preferences, priorities, quotas, retries, provider failure, and duplicate control.',
  assumptions: [
    'Producers submit semantic intents.',
    'Transactional and marketing priorities differ.',
    'Users have channel preferences and quiet hours.',
    'Provider acceptance is not confirmed human delivery.',
    'One provider can throttle independently.',
  ],
  calculations: [
    {
      id: 'delivery-fanout',
      label: 'Channel fan-out',
      formula: 'notification intents/s × eligible channels/intent',
      unit: 'delivery attempts/s',
      expectedTerms: ['intent', 'channel', 'attempts', 'peak'],
    },
    {
      id: 'retry-load',
      label: 'Retry amplification',
      formula: 'base attempts/s × average attempts per delivery',
      unit: 'provider calls/s',
      expectedTerms: ['retry', 'attempts', 'provider', 'calls'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify intent types, channels, priority, preferences, delivery semantics, scheduling, and compliance.',
    estimation:
      'Estimate intents, channel fan-out, campaign peaks, retry amplification, provider quotas, and retention.',
    'high-level-design':
      'Trace an accepted intent through outbox, policy, template, channel queues, provider adapters, and receipts.',
    'deep-dive':
      'Defend idempotency, attempt state, priority isolation, provider backpressure, and ambiguous delivery semantics.',
  },
  evidence: {
    requirements: ['transactional', 'marketing', 'preference', 'quiet hours', 'delivery'],
    capacity: ['intents/s', 'fan-out', 'burst', 'retry', 'quota'],
    architecture: ['outbox', 'policy', 'template', 'channel queue', 'provider adapter'],
    judgment: ['idempotency key', 'attempt state', 'priority', 'retry-after', 'dedupe'],
    reliability: ['throttle', 'circuit', 'jitter', 'dead letter', 'reconcile'],
  },
  concepts: [
    'message-queues',
    'webhooks',
    'retries-and-circuit-breakers',
    'idempotency',
    'monitoring-analytics',
  ],
  drills: [
    'queue-backpressure',
    'webhook-signature-verify',
    'implement-idempotency-key',
    'practice-opentelemetry-observability',
  ],
  followUps: [
    {
      id: 'campaign-burst',
      matchAny: ['campaign', 'marketing'],
      prompt:
        'How do you schedule a 100-million-recipient campaign without starving security alerts?',
    },
    {
      id: 'personalized-notification',
      matchAny: ['rank', 'personal'],
      prompt:
        'Where can an ML relevance model influence delivery without bypassing consent or frequency caps?',
    },
  ],
  failure: {
    id: 'provider-throttle',
    title: 'Provider throttling',
    prompt:
      'The primary push provider throttles for twenty minutes while security and campaign traffic continue.',
    expectedSignals: [
      'priority isolation',
      'retry-after',
      'circuit breaker',
      'jitter',
      'quota',
      'dead letter',
    ],
  },
  mistakes: [
    'Calling providers synchronously from product requests.',
    'One queue for all channels and priorities.',
    'Promising universal exactly-once device delivery.',
  ],
  strongerAnswer:
    'Durably accept idempotent intents, resolve policy and preferences, render versioned templates, and fan out to isolated priority/channel queues. Provider adapters honor quotas and retry-after with jitter, circuits, leases, and dead letters. Track attempt state and deduplicate effects, preserve transactional traffic during outages, and distinguish provider acceptance from delivery.',
  sources: [
    {
      title: 'RFC 8030: Generic Event Delivery Using HTTP Push',
      url: 'https://www.rfc-editor.org/rfc/rfc8030',
      kind: 'standard',
    },
    {
      title: 'Firebase Cloud Messaging architecture',
      url: 'https://firebase.google.com/docs/cloud-messaging/fcm-architecture',
      kind: 'official-doc',
    },
    {
      title: 'Apple Push Notification service',
      url: 'https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server',
      kind: 'official-doc',
    },
    {
      title: 'Uber out-of-app recommendation system',
      url: 'https://www.uber.com/en-GB/blog/personalized-marketing-at-scale/',
      kind: 'official-doc',
    },
  ],
  guide: NOTIFICATION_DELIVERY_GUIDE,
});

const webCrawler = createPopularCase({
  id: 'web-crawler',
  title: 'Design a web crawler',
  category: 'infrastructure-storage',
  pattern: 'polite distributed URL frontier and recrawl scheduling',
  criticalPath: 'priority plus per-host eligibility through bounded fetch and deduplication',
  difficulty: 'advanced',
  prompt:
    'Design a web-scale crawler that discovers, fetches, deduplicates, stores, and recrawls useful pages while obeying robots policy and host politeness.',
  assumptions: [
    'HTML is the first content type.',
    'robots.txt and host politeness are mandatory.',
    'The corpus contains billions of known URLs.',
    'Freshness varies by page importance and change frequency.',
    'Crawler traps and poison pages must be isolated.',
  ],
  calculations: [
    {
      id: 'crawl-rate',
      label: 'Fetch attempt rate',
      formula: 'target successful pages/day ÷ seconds/day ÷ success ratio',
      unit: 'fetch attempts/s',
      expectedTerms: ['pages/day', 'success', 'attempts', 'second'],
    },
    {
      id: 'crawl-bandwidth',
      label: 'Inbound crawl bandwidth',
      formula: 'fetch attempts/s × average compressed response bytes',
      unit: 'bytes/s',
      expectedTerms: ['fetch', 'bytes', 'bandwidth', 'peak'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify corpus purpose, content types, scale, freshness, politeness, compliance, and query-serving exclusions.',
    estimation:
      'Estimate successful fetches, attempts, bandwidth, frontier size, DNS load, parsing work, storage, and recrawl budget.',
    'high-level-design':
      'Trace seed URL through normalization, seen filtering, frontier, host scheduler, fetcher, storage, parser, and rediscovery.',
    'deep-dive':
      'Defend the two-level priority/per-host frontier, robots cache, normalization, deduplication, leases, and trap controls.',
  },
  evidence: {
    requirements: ['corpus', 'freshness', 'robots', 'politeness', 'HTML'],
    capacity: ['pages/day', 'attempts/s', 'bytes/s', 'frontier', 'recrawl'],
    architecture: [
      'normalization',
      'frontier',
      'host queue',
      'fetcher',
      'parser',
      'object storage',
    ],
    judgment: ['next fetch time', 'robots cache', 'URL dedupe', 'content hash', 'lease'],
    reliability: ['trap', 'limit', 'quarantine', 'backoff', 'dead letter', 'replay'],
  },
  concepts: [
    'search-platform-design',
    'message-queues',
    'sharding',
    'object-storage',
    'rate-limiting',
  ],
  drills: ['design-search-platform', 'queue-backpressure', 'shard-key-choice', 'cache-key-and-ttl'],
  followUps: [
    {
      id: 'js-rendering',
      matchAny: ['JavaScript', 'render'],
      prompt:
        'How do you add browser rendering without spending that scarce resource on every page?',
    },
    {
      id: 'recrawl-model',
      matchAny: ['fresh', 'change'],
      prompt:
        'How would a learned change-frequency model improve recrawl priority while preserving policy?',
    },
  ],
  failure: {
    id: 'crawler-trap',
    title: 'Crawler trap',
    prompt:
      'A high-ranked domain creates an infinite parameterized calendar and begins consuming the frontier.',
    expectedSignals: [
      'per-host budget',
      'pattern limit',
      'quarantine',
      'depth',
      'backoff',
      'useful ratio',
    ],
  },
  mistakes: [
    'One global FIFO frontier.',
    'Fetching before robots and host eligibility.',
    'Confusing URL dedupe with content dedupe.',
  ],
  strongerAnswer:
    'Normalize and deduplicate discovered URLs, rank by value and freshness, then release work through per-host queues constrained by robots, next-fetch time, and concurrency. Fetch with strict limits, lease work for replay, store immutable bodies, parse asynchronously, fingerprint content, and quarantine traps. Measure useful unique documents and freshness rather than raw requests.',
  sources: [
    {
      title: 'RFC 9309: Robots Exclusion Protocol',
      url: 'https://www.rfc-editor.org/rfc/rfc9309',
      kind: 'standard',
    },
    {
      title: 'Google crawl budget documentation',
      url: 'https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget',
      kind: 'official-doc',
    },
    {
      title: 'Google canonical URL documentation',
      url: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
      kind: 'official-doc',
    },
  ],
  guide: WEB_CRAWLER_GUIDE,
});

const distributedCache = createPopularCase({
  id: 'distributed-cache',
  title: 'Design a distributed cache',
  category: 'infrastructure-storage',
  pattern: 'partitioned volatile key-value serving with bounded stampede recovery',
  criticalPath: 'consistent key routing through eviction replication and miss collapse',
  difficulty: 'advanced',
  prompt:
    'Design a low-latency distributed cache with partitioning, replication, TTL, eviction, invalidation, node failure, hot keys, and stampede protection.',
  assumptions: [
    'The cache is not the only durable copy.',
    'Reads dominate but writes and invalidations exist.',
    'The first deployment is one region.',
    'p99 latency matters.',
    'Node loss must not overload the backing store.',
  ],
  calculations: [
    {
      id: 'cache-memory',
      label: 'Memory capacity',
      formula: 'working-set keys × average entry bytes ÷ target occupancy',
      unit: 'bytes',
      expectedTerms: ['working set', 'entry', 'memory', 'occupancy'],
    },
    {
      id: 'cache-miss-load',
      label: 'Backing-store load',
      formula: 'read QPS × miss ratio × miss amplification',
      unit: 'origin reads/s',
      expectedTerms: ['reads', 'miss', 'origin', 'amplification'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify API, value size, consistency, TTL, eviction, durability, region, and failure contract.',
    estimation:
      'Estimate working-set memory, read/write QPS, network bandwidth, hit ratio, origin load, and hot-key skew.',
    'high-level-design':
      'Trace get/set/delete through clients, routing, nodes, replicas, membership, and invalidation.',
    'deep-dive':
      'Defend consistent hashing, replication, eviction metadata, miss collapse, hot-key mitigation, and node rebalancing.',
  },
  evidence: {
    requirements: ['get', 'set', 'TTL', 'eviction', 'consistency'],
    capacity: ['working set', 'entry bytes', 'QPS', 'hit ratio', 'origin'],
    architecture: ['consistent hashing', 'node', 'replica', 'membership', 'invalidation'],
    judgment: ['LRU', 'TTL', 'singleflight', 'hot key', 'rebalancing'],
    reliability: ['node loss', 'stampede', 'jitter', 'fallback', 'origin budget'],
  },
  concepts: [
    'caching',
    'consistent-hashing',
    'replication',
    'monitoring-analytics',
    'queueing-theory',
  ],
  drills: ['cache-key-and-ttl', 'cache-stampede', 'shard-key-choice', 'replication-lag-read'],
  followUps: [
    {
      id: 'write-policy',
      matchAny: ['write-through', 'write-back'],
      prompt: 'When would write-back be safe, and what durability contract changes?',
    },
    {
      id: 'multi-region-cache',
      matchAny: ['region', 'replica'],
      prompt:
        'How do you prevent a global invalidation mechanism from becoming slower than the cache?',
    },
  ],
  failure: {
    id: 'node-loss-stampede',
    title: 'Node loss and stampede',
    prompt: 'A heavily loaded node fails and its hot keys all miss against the database.',
    expectedSignals: [
      'replica',
      'consistent hashing',
      'singleflight',
      'stale serve',
      'jitter',
      'origin limit',
    ],
  },
  mistakes: [
    'Treating the cache as durable without saying so.',
    'Rehashing every key on one node change.',
    'Retrying all misses directly against the origin.',
  ],
  strongerAnswer:
    'Partition the working set with virtual-node consistent hashing, replicate hot state, enforce TTL and bounded eviction, and expose explicit consistency semantics. Collapse concurrent misses, jitter expiries, protect the origin with budgets, and serve stale only where safe. Rebalance gradually after membership changes and operate on hit ratio, p99, evictions, hot-key skew, node saturation, and origin amplification.',
  sources: [
    {
      title: 'Memcached protocol',
      url: 'https://github.com/memcached/memcached/blob/master/doc/protocol.txt',
      kind: 'official-doc',
    },
    {
      title: 'Redis eviction documentation',
      url: 'https://redis.io/docs/latest/develop/reference/eviction/',
      kind: 'official-doc',
    },
  ],
});

const searchAutocomplete = createPopularCase({
  id: 'search-autocomplete',
  title: 'Design search autocomplete',
  category: 'infrastructure-storage',
  pattern: 'low-latency prefix retrieval with freshness safety and ranking',
  criticalPath: 'normalized prefix lookup through top-k ranking inside a keystroke budget',
  difficulty: 'core',
  prompt:
    'Design typeahead suggestions for a large search product with prefix lookup, ranking, trends, personalization, freshness, moderation, and low latency.',
  assumptions: [
    'Suggestions appear after a short prefix.',
    'The corpus has tens of millions of candidate phrases.',
    'p99 must fit within a keystroke interaction.',
    'Trends update within minutes.',
    'Unsafe or private terms must be filtered.',
  ],
  calculations: [
    {
      id: 'keystroke-qps',
      label: 'Keystroke query rate',
      formula: 'search sessions/s × autocomplete requests/session',
      unit: 'queries/s',
      expectedTerms: ['sessions', 'keystrokes', 'queries', 'peak'],
    },
    {
      id: 'prefix-memory',
      label: 'Prefix index memory',
      formula: 'candidate prefixes × top-k entries × bytes/entry',
      unit: 'bytes',
      expectedTerms: ['prefix', 'top-k', 'entries', 'memory'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify corpus, prefix behavior, ranking, freshness, personalization, language, safety, and latency.',
    estimation:
      'Estimate keystroke QPS, cacheability, prefix index memory, update throughput, and regional replication.',
    'high-level-design':
      'Trace query normalization through edge cache, prefix service, ranking/filtering, and response; then trace offline and streaming updates.',
    'deep-dive':
      'Defend trie/FST representation, top-k materialization, update strategy, cache keys, safety filters, and fallback.',
  },
  evidence: {
    requirements: ['prefix', 'latency', 'freshness', 'personalization', 'safety'],
    capacity: ['keystroke', 'QPS', 'top-k', 'memory', 'updates'],
    architecture: ['normalizer', 'cache', 'trie', 'FST', 'rank', 'filter'],
    judgment: ['precompute', 'delta', 'merge', 'language', 'fallback'],
    reliability: ['trending', 'stale', 'unsafe', 'rollback', 'cache purge'],
  },
  concepts: [
    'tries',
    'search-platform-design',
    'caching',
    'ranking-metrics',
    'monitoring-analytics',
  ],
  drills: [
    'trie-prefix-search',
    'design-search-platform',
    'cache-key-and-ttl',
    'browse-vs-search-metrics',
  ],
  followUps: [
    {
      id: 'personalized-typeahead',
      matchAny: ['personal', 'history'],
      prompt:
        'How do you personalize without leaking another user’s history through caches or logs?',
    },
    {
      id: 'ml-ranking',
      matchAny: ['rank', 'model'],
      prompt:
        'How do Target-style real-time recommendations enter the candidate/ranking path with a deterministic fallback?',
    },
  ],
  failure: {
    id: 'unsafe-trend',
    title: 'Unsafe trending term',
    prompt: 'A harmful phrase spikes globally and has already entered regional caches.',
    expectedSignals: ['policy blocklist', 'filter', 'cache purge', 'version', 'fallback', 'audit'],
  },
  mistakes: [
    'Querying the primary database per keystroke.',
    'Caching personalized results without user scope.',
    'Ranking before policy filtering.',
  ],
  strongerAnswer:
    'Normalize prefixes, serve precomputed top-k candidates from a compact trie or FST near users, merge bounded fresh deltas, apply deterministic safety policy, and optionally rerank with context. Size from keystrokes rather than searches, version indexes and caches for rollback, isolate personalization, and fall back to safe global popularity when fresh or learned ranking fails.',
  sources: [
    {
      title: 'Elasticsearch completion suggester',
      url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#completion-suggester',
      kind: 'official-doc',
    },
    {
      title: 'Apache Lucene FST API',
      url: 'https://lucene.apache.org/core/9_12_0/core/org/apache/lucene/util/fst/FST.html',
      kind: 'official-doc',
    },
    {
      title: 'Target AutoComplete recommendations',
      url: 'https://tech.target.com/blog/target-autocomplete',
      kind: 'official-doc',
    },
  ],
});

const cloudFileStorage = createPopularCase({
  id: 'cloud-file-storage',
  title: 'Design cloud file storage',
  category: 'infrastructure-storage',
  pattern: 'content-addressed chunk synchronization with versioned metadata',
  criticalPath: 'resumable missing-chunk transfer followed by atomic metadata version commit',
  difficulty: 'advanced',
  prompt:
    'Design Dropbox or Google Drive-style file synchronization with resumable uploads, folders, sharing, versions, offline conflicts, durability, and efficient transfer.',
  assumptions: [
    'Ordinary files, not character-level collaborative documents.',
    'Clients can edit offline.',
    'Large uploads resume.',
    'Metadata must converge quickly.',
    'File bytes require multi-copy durability.',
  ],
  calculations: [
    {
      id: 'changed-bytes',
      label: 'Changed bytes',
      formula: 'active users × changed files/user/day × average changed bytes',
      unit: 'bytes/day',
      expectedTerms: ['users', 'files', 'bytes', 'day'],
    },
    {
      id: 'metadata-load',
      label: 'Metadata operations',
      formula: 'active users × metadata operations/user/day ÷ seconds/day × peak factor',
      unit: 'operations/s',
      expectedTerms: ['metadata', 'operations', 'peak', 'second'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify file size, folders, sharing, offline edits, history, conflict, durability, and encryption.',
    estimation:
      'Estimate changed bytes/day, upload sessions, metadata QPS, chunk index, versions, egress, and garbage collection.',
    'high-level-design':
      'Trace chunk discovery/upload and atomic metadata commit, then change-log sync to another device.',
    'deep-dive':
      'Defend chunking, content addressing, compare-and-swap versions, conflict copies, change cursors, and delayed garbage collection.',
  },
  evidence: {
    requirements: ['offline', 'resume', 'version', 'share', 'durability'],
    capacity: ['changed bytes', 'metadata QPS', 'chunks', 'versions', 'egress'],
    architecture: ['chunk', 'object storage', 'metadata', 'change log', 'cursor'],
    judgment: [
      'content hash',
      'compare-and-swap',
      'conflict copy',
      'immutable',
      'garbage collection',
    ],
    reliability: ['partial upload', 'timeout', 'orphan', 'reconcile', 'replica'],
  },
  concepts: [
    'object-storage',
    'storage-retrieval',
    'conflict-resolution',
    'replication',
    'idempotency',
  ],
  drills: [
    'storage-vs-retrieval',
    'replication-lag-read',
    'implement-idempotency-key',
    'shard-key-choice',
  ],
  followUps: [
    {
      id: 'encrypted-files',
      matchAny: ['encrypt', 'privacy'],
      prompt:
        'What deduplication, scanning, and sharing properties change with end-to-end encryption?',
    },
    {
      id: 'ml-organization',
      matchAny: ['search', 'metadata'],
      prompt:
        'How can Dropbox-style ML organization consume files without becoming part of sync correctness?',
    },
  ],
  failure: {
    id: 'partial-conflict',
    title: 'Partial upload and conflicting edits',
    prompt:
      'Two offline devices edit the same file; one upload times out after commit while the other has missing chunks.',
    expectedSignals: [
      'operation id',
      'compare-and-swap',
      'conflict version',
      'resume',
      'orphan GC',
      'reconcile',
    ],
  },
  mistakes: [
    'Storing file bytes in the metadata database.',
    'Using path as permanent identity.',
    'Last-writer-wins that silently loses offline edits.',
  ],
  strongerAnswer:
    'Upload immutable content-addressed chunks directly and resumably, then atomically compare-and-swap versioned metadata referencing the ordered chunks. Devices consume per-namespace change cursors. Surface concurrent whole-file edits as conflict versions, make retries idempotent, delay orphan collection until reachability is proven, and separate durable bytes from strongly controlled paths, permissions, and versions.',
  sources: [
    {
      title: 'Dropbox content hash',
      url: 'https://www.dropbox.com/developers/reference/content-hash',
      kind: 'official-doc',
    },
    {
      title: 'Amazon S3 strong consistency',
      url: 'https://aws.amazon.com/s3/consistency/',
      kind: 'official-doc',
    },
    {
      title: 'RFC 9110 HTTP conditional requests',
      url: 'https://www.rfc-editor.org/rfc/rfc9110',
      kind: 'standard',
    },
    {
      title: 'Dropbox ML file organization',
      url: 'https://dropbox.tech/machine-learning/smart-move-ml-ai-file-organization-automation',
      kind: 'official-doc',
    },
  ],
  guide: CLOUD_FILE_STORAGE_GUIDE,
});

const distributedKeyValueStore = createPopularCase({
  id: 'distributed-key-value-store',
  title: 'Design a distributed key-value store',
  category: 'infrastructure-storage',
  pattern: 'replicated partitioned durable key-value state',
  criticalPath: 'partition routing through quorum durability conflict repair and compaction',
  difficulty: 'advanced',
  prompt:
    'Design a Dynamo-style distributed key-value store with partitioning, replication, tunable consistency, durability, rebalancing, repair, and compaction.',
  assumptions: [
    'Keys and values are bounded.',
    'The system spans multiple failure domains.',
    'Availability during partitions is configurable.',
    'Writes are durable before acknowledgement.',
    'Range scans are not the primary API.',
  ],
  calculations: [
    {
      id: 'kv-storage',
      label: 'Replicated storage',
      formula: 'logical bytes × replication factor ÷ target disk occupancy',
      unit: 'bytes',
      expectedTerms: ['logical', 'replication', 'disk', 'occupancy'],
    },
    {
      id: 'kv-node-qps',
      label: 'Per-node traffic',
      formula: 'peak QPS × quorum operations ÷ node count adjusted for skew',
      unit: 'node operations/s',
      expectedTerms: ['QPS', 'quorum', 'nodes', 'skew'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify API, value limits, consistency, availability, durability, region, and scan requirements.',
    estimation:
      'Estimate bytes, replicated capacity, read/write QPS, quorum amplification, node count, skew, and repair bandwidth.',
    'high-level-design':
      'Trace put/get through membership, partition routing, replicas, WAL/memtable/SSTables, and client response.',
    'deep-dive':
      'Defend partitioning, quorum math, version/conflict semantics, hinted handoff, anti-entropy, and compaction.',
  },
  evidence: {
    requirements: ['get', 'put', 'consistency', 'availability', 'durability'],
    capacity: ['bytes', 'replication factor', 'QPS', 'quorum', 'skew'],
    architecture: ['partition', 'replica', 'WAL', 'memtable', 'SSTable'],
    judgment: ['quorum', 'version', 'hinted handoff', 'Merkle', 'compaction'],
    reliability: ['partition', 'conflict', 'repair', 'recovery', 'reconcile'],
  },
  concepts: ['sharding', 'replication', 'consensus', 'wal', 'lsm-tree', 'isolation-levels'],
  drills: [
    'shard-key-choice',
    'replication-lag-read',
    'practice-transaction-processing',
    'storage-vs-retrieval',
  ],
  followUps: [
    {
      id: 'strong-key',
      matchAny: ['strong', 'linearizable'],
      prompt: 'How would you add linearizable operations for a subset of keys?',
    },
    {
      id: 'hot-partition',
      matchAny: ['hot', 'skew'],
      prompt:
        'How do you split or replicate a hot key without changing client-visible consistency?',
    },
  ],
  failure: {
    id: 'partition-conflict',
    title: 'Network partition and conflicting writes',
    prompt:
      'Two replica groups accept writes for the same key during a partition. Explain response semantics and repair.',
    expectedSignals: ['version', 'quorum', 'conflict', 'read repair', 'anti-entropy', 'reconcile'],
  },
  mistakes: [
    'Saying CAP chooses only two forever.',
    'Ignoring write amplification and repair bandwidth.',
    'Using last-write-wins without a trustworthy clock or conflict contract.',
  ],
  strongerAnswer:
    'Partition keys over virtual nodes, replicate across failure domains, durably append writes before acknowledgement, and offer explicit quorum/consistency semantics. Carry versions so concurrent writes are detected, use hinted handoff and anti-entropy for recovery, compact LSM state under bounded amplification, and measure skew, tail latency, conflict, repair debt, and disk headroom.',
  sources: [
    {
      title: 'Dynamo paper',
      url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
      kind: 'paper',
    },
    { title: 'Raft paper', url: 'https://raft.github.io/raft.pdf', kind: 'paper' },
    {
      title: 'RocksDB wiki',
      url: 'https://github.com/facebook/rocksdb/wiki',
      kind: 'official-doc',
    },
  ],
});

const rideSharing = createPopularCase({
  id: 'ride-sharing-platform',
  title: 'Design a ride-sharing platform',
  category: 'commerce-marketplaces',
  pattern: 'geospatial moving-supply matching with atomic assignment',
  criticalPath: 'fresh driver location index through bounded offer and trip assignment',
  difficulty: 'advanced',
  prompt:
    'Design an Uber or Lyft-style marketplace with driver locations, nearby matching, dispatch offers, atomic trip assignment, live trip state, ETA, and regional spikes.',
  assumptions: [
    'One rider and driver per first-version trip.',
    'Drivers update location every few seconds.',
    'Stale drivers cannot be matched.',
    'A driver cannot own two active trips.',
    'ETA ranking has a deterministic fallback.',
  ],
  calculations: [
    {
      id: 'location-ingest',
      label: 'Location ingestion',
      formula: 'active drivers ÷ update interval',
      unit: 'updates/s',
      expectedTerms: ['drivers', 'interval', 'updates', 'second'],
    },
    {
      id: 'match-concurrency',
      label: 'Concurrent matching',
      formula: 'ride requests/s × average match duration',
      unit: 'active match searches',
      expectedTerms: ['requests', 'duration', 'concurrent', 'peak'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify rider, driver, location, match, offer, trip, ETA, payment, safety, and geographic scope.',
    estimation:
      'Estimate location updates, active drivers, ride requests, concurrent searches, offers, and city hot spots.',
    'high-level-design':
      'Trace driver location into a live index, then a rider request through candidates, ranking, dispatch, and atomic assignment.',
    'deep-dive':
      'Defend hierarchical geospatial cells, stale-location rules, expanding-ring queries, offer leases, and compare-and-swap assignment.',
  },
  evidence: {
    requirements: ['rider', 'driver', 'location', 'match', 'ETA', 'safety'],
    capacity: ['drivers', 'updates/s', 'rides/s', 'concurrent', 'hot spot'],
    architecture: ['location stream', 'geospatial index', 'matching', 'dispatch', 'trip state'],
    judgment: ['H3', 'cell', 'sequence', 'stale', 'lease', 'compare-and-swap'],
    reliability: ['demand spike', 'lag', 'coarser cell', 'idempotent', 'reconcile'],
  },
  concepts: [
    'location-transport',
    'messaging-realtime',
    'transaction-processing',
    'unique-id-generation',
    'monitoring-analytics',
  ],
  drills: [
    'design-ride-sharing',
    'queue-backpressure',
    'implement-idempotency-key',
    'practice-opentelemetry-observability',
  ],
  followUps: [
    {
      id: 'pooled-rides',
      matchAny: ['route', 'pool'],
      prompt: 'How does matching change for pooled rides with detour constraints?',
    },
    {
      id: 'eta-model',
      matchAny: ['ETA', 'model'],
      prompt:
        'How do Lyft/Uber-style ETA models expose uncertainty and fall back safely by region?',
    },
  ],
  failure: {
    id: 'stadium-spike',
    title: 'Stadium demand spike',
    prompt: 'A stadium empties, one geospatial cell becomes hot, and driver locations are delayed.',
    expectedSignals: [
      'cell split',
      'batch',
      'stale threshold',
      'degrade',
      'backpressure',
      'reconcile',
    ],
  },
  mistakes: [
    'Full-scanning latitude/longitude.',
    'Assigning driver and trip in separate unguarded writes.',
    'Treating nearest straight-line distance as reliable ETA.',
  ],
  strongerAnswer:
    'Ingest sequenced locations into a regional stream and latest-point store, index only fresh available drivers by hierarchical cell, and search expanding rings for bounded candidates. Rank offers with ETA and policy but atomically compare-and-swap assignment through an idempotent trip state machine. Degrade hot cells, reject stale supply, and reconcile ambiguous acceptances.',
  sources: [
    { title: 'Uber H3 documentation', url: 'https://h3geo.org/docs/', kind: 'official-doc' },
    {
      title: 'PostGIS spatial indexes',
      url: 'https://postgis.net/workshops/postgis-intro/indexing.html',
      kind: 'official-doc',
    },
    { title: 'Google S2 Geometry', url: 'https://s2geometry.io/', kind: 'official-doc' },
    {
      title: 'Lyft ETA reliability',
      url: 'https://eng.lyft.com/eta-estimated-time-of-arrival-reliability-at-lyft-d4ca2720bda8',
      kind: 'official-doc',
    },
    {
      title: 'Uber DeepETA',
      url: 'https://www.uber.com/en-GB/blog/deepeta-how-uber-predicts-arrival-times/',
      kind: 'official-doc',
    },
  ],
  guide: RIDE_SHARING_GUIDE,
});

const ticketBooking = createPopularCase({
  id: 'ticket-booking-platform',
  title: 'Design a ticket-booking platform',
  category: 'commerce-marketplaces',
  pattern: 'scarce inventory holds with idempotent purchase reconciliation',
  criticalPath: 'atomic seat hold through ambiguous payment to confirmed order',
  difficulty: 'advanced',
  prompt:
    'Design Ticketmaster-style reserved-seat booking with event browse, a virtual waiting room, expiring holds, payments, oversell prevention, bots, and flash crowds.',
  assumptions: [
    'Seats are individually reserved.',
    'One seat can have at most one confirmed order.',
    'A hold lasts ten minutes.',
    'Sale starts create extreme bursts.',
    'Payment outcomes can be ambiguous.',
  ],
  calculations: [
    {
      id: 'sale-admission',
      label: 'Waiting-room admission',
      formula: 'sustainable hold transactions/s × target utilization',
      unit: 'admitted users/s',
      expectedTerms: ['transactions', 'admission', 'utilization', 'second'],
    },
    {
      id: 'active-holds',
      label: 'Active holds',
      formula: 'successful holds/s × average hold duration',
      unit: 'held orders',
      expectedTerms: ['holds', 'duration', 'active', 'inventory'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify seat type, browse, waiting room, hold, payment, fairness, bot, refund, and consistency requirements.',
    estimation:
      'Estimate waiting users, admission rate, seat-map reads, hold writes, active holds, payment concurrency, and expiry work.',
    'high-level-design':
      'Trace waiting-room admission through browse projection, atomic hold, order, payment, confirmation, and expiry.',
    'deep-dive':
      'Defend seat state transitions, multi-seat atomicity, hold version/expiry, payment idempotency, and reconciliation.',
  },
  evidence: {
    requirements: ['seat', 'hold', 'payment', 'oversell', 'waiting room'],
    capacity: ['users', 'admission', 'holds/s', 'duration', 'concurrency'],
    architecture: ['waiting room', 'seat projection', 'inventory', 'order', 'payment'],
    judgment: ['row lock', 'conditional write', 'hold id', 'expiry', 'idempotency'],
    reliability: ['ambiguous', 'webhook', 'reconcile', 'meter', 'fairness'],
  },
  concepts: [
    'booking-inventory',
    'transaction-processing',
    'isolation-levels',
    'idempotency',
    'rate-limiting',
  ],
  drills: [
    'design-hotel-booking',
    'practice-transaction-processing',
    'payment-idempotency',
    'design-rate-limiter',
  ],
  followUps: [
    {
      id: 'general-admission',
      matchAny: ['counter', 'capacity'],
      prompt: 'How does the invariant change for general-admission inventory?',
    },
    {
      id: 'queue-fairness',
      matchAny: ['queue', 'waiting'],
      prompt: 'Compare FIFO admission with a randomized lottery under retries, regions, and bots.',
    },
  ],
  failure: {
    id: 'payment-timeout-flash-crowd',
    title: 'Payment timeout during flash crowd',
    prompt:
      'The processor times out after authorization while the waiting room is full and the hold nears expiry.',
    expectedSignals: [
      'idempotency key',
      'lookup',
      'extend hold',
      'state machine',
      'webhook',
      'reconcile',
    ],
  },
  mistakes: [
    'Holding a database lock during payment.',
    'Trusting a cached seat map on purchase.',
    'Retrying ambiguous payments with a new order ID.',
  ],
  strongerAnswer:
    'Meter flash crowds through a signed waiting room, serve browse from projections, and keep authoritative seat states available, versioned hold, or sold. Create multi-seat holds atomically, pay outside locks with idempotency, confirm against the same hold, expire by version, and reconcile payments, orders, webhooks, and inventory before reopening throughput.',
  sources: [
    {
      title: 'PostgreSQL explicit locking',
      url: 'https://www.postgresql.org/docs/current/explicit-locking.html',
      kind: 'official-doc',
    },
    {
      title: 'Stripe idempotent requests',
      url: 'https://docs.stripe.com/api/idempotent_requests',
      kind: 'official-doc',
    },
    {
      title: 'RFC 6585: HTTP 429',
      url: 'https://www.rfc-editor.org/rfc/rfc6585',
      kind: 'standard',
    },
  ],
  guide: TICKET_BOOKING_GUIDE,
});

const paymentProcessing = createPopularCase({
  id: 'payment-processing-system',
  title: 'Design a payment-processing system',
  category: 'commerce-marketplaces',
  pattern: 'idempotent payment state machine backed by an immutable double-entry ledger',
  criticalPath: 'authorization through durable ledger posting settlement and reconciliation',
  difficulty: 'advanced',
  prompt:
    'Design a payment system with authorization, capture, refunds, idempotency, webhooks, an auditable ledger, processor timeouts, reconciliation, and fraud controls.',
  assumptions: [
    'The system integrates with external processors.',
    'Money movement requires immutable audit.',
    'Requests and webhooks can repeat.',
    'Processor timeouts can be ambiguous.',
    'Fraud models may advise but not rewrite ledger history.',
  ],
  calculations: [
    {
      id: 'payment-tps',
      label: 'Payment transaction rate',
      formula: 'payments/day ÷ seconds/day × peak factor × attempts/payment',
      unit: 'processor attempts/s',
      expectedTerms: ['payments', 'peak', 'attempts', 'second'],
    },
    {
      id: 'ledger-growth',
      label: 'Ledger growth',
      formula: 'business transactions/day × ledger entries/transaction × bytes/entry',
      unit: 'bytes/day',
      expectedTerms: ['transactions', 'entries', 'bytes', 'day'],
    },
  ],
  stagePrompts: {
    scoping:
      'Clarify authorization, capture, refund, currency, ledger, settlement, webhook, fraud, and compliance scope.',
    estimation:
      'Estimate peak payment attempts, webhook traffic, ledger writes, reconciliation volume, retention, and provider limits.',
    'high-level-design':
      'Trace idempotent payment intent through processor, state machine, ledger entries, webhook delivery, settlement, and reconciliation.',
    'deep-dive':
      'Defend idempotency scope, legal transitions, double-entry invariants, ambiguous outcomes, outbox, and reconciliation.',
  },
  evidence: {
    requirements: ['authorize', 'capture', 'refund', 'ledger', 'webhook'],
    capacity: ['payments/s', 'peak', 'attempts', 'ledger entries', 'retention'],
    architecture: [
      'payment intent',
      'processor',
      'state machine',
      'ledger',
      'outbox',
      'reconciliation',
    ],
    judgment: ['idempotency key', 'double entry', 'legal transition', 'ambiguous', 'immutable'],
    reliability: ['timeout', 'lookup', 'duplicate webhook', 'reconcile', 'audit'],
  },
  concepts: [
    'ecommerce-payments',
    'transaction-processing',
    'idempotency',
    'webhooks',
    'monitoring-analytics',
  ],
  drills: [
    'payment-idempotency',
    'implement-idempotency-key',
    'webhook-signature-verify',
    'practice-transaction-processing',
  ],
  followUps: [
    {
      id: 'fraud-model',
      matchAny: ['fraud', 'risk'],
      prompt:
        'How do Careem/Instacart/Uber-style fraud models affect holds or challenges without corrupting ledger truth?',
    },
    {
      id: 'multi-currency',
      matchAny: ['currency', 'FX'],
      prompt: 'How do currency precision, FX rates, and settlement accounts change the ledger?',
    },
  ],
  failure: {
    id: 'ambiguous-duplicate',
    title: 'Ambiguous timeout and duplicate webhook',
    prompt:
      'The processor times out after committing, then sends the same webhook twice while the client retries.',
    expectedSignals: [
      'idempotency key',
      'processor lookup',
      'dedupe',
      'legal transition',
      'ledger invariant',
      'reconcile',
    ],
  },
  mistakes: [
    'Updating a balance without immutable entries.',
    'Using message delivery as exactly-once money movement.',
    'Retrying ambiguous processor calls with a fresh idempotency key.',
  ],
  strongerAnswer:
    'Create one idempotent payment intent with explicit legal states, integrate processors behind stable operation keys, and post every monetary effect as balanced immutable ledger entries. Deduplicate signed webhooks, publish side effects through an outbox, query ambiguous outcomes before retry, and continuously reconcile processor, settlement, intent, and ledger records. Fraud models trigger review or challenge but never rewrite history.',
  sources: [
    {
      title: 'Stripe idempotent requests',
      url: 'https://docs.stripe.com/api/idempotent_requests',
      kind: 'official-doc',
    },
    {
      title: 'PCI DSS',
      url: 'https://www.pcisecuritystandards.org/document_library/',
      kind: 'standard',
    },
    {
      title: 'PostgreSQL transaction isolation',
      url: 'https://www.postgresql.org/docs/current/transaction-iso.html',
      kind: 'official-doc',
    },
    {
      title: 'Uber Project RADAR fraud detection',
      url: 'https://www.uber.com/en-GB/blog/project-radar-intelligent-early-fraud-detection/',
      kind: 'official-doc',
    },
  ],
});

export const POPULAR_SYSTEM_DESIGN_CASES: SystemDesignCase[] = [
  videoStreaming,
  photoSharing,
  collaborativeEditor,
  notificationDelivery,
  webCrawler,
  distributedCache,
  searchAutocomplete,
  cloudFileStorage,
  distributedKeyValueStore,
  rideSharing,
  ticketBooking,
  paymentProcessing,
];
