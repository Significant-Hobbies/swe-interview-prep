import type { SystemDesignStudyGuide } from './system-design-case-schema';

type GuideHeading =
  | 'Clarify the contract'
  | 'Capacity math'
  | 'Architecture'
  | 'Deep dive'
  | 'Failure handling'
  | 'Observability and cost'
  | 'Common mistakes'
  | 'Harder follow-ups';

interface GuideConfig {
  slug: string;
  title: string;
  description: string;
  subject: string;
  decision: string;
  sections: Record<GuideHeading, string>;
  finalAnswer: string;
}

const HEADING_ORDER: GuideHeading[] = [
  'Clarify the contract',
  'Capacity math',
  'Architecture',
  'Deep dive',
  'Failure handling',
  'Observability and cost',
  'Common mistakes',
  'Harder follow-ups',
];

const COACHING_COPY: Record<GuideHeading, (config: GuideConfig) => string> = {
  'Clarify the contract': (config) =>
    `Treat the product name as a conversation starter, not a specification. For ${config.subject}, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.`,
  'Capacity math': (_config) =>
    `Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.`,
  Architecture: (config) =>
    `Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For ${config.subject}, the architecture should make ${config.decision} visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.`,
  'Deep dive': (_config) =>
    `Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.`,
  'Failure handling': (_config) =>
    `Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.`,
  'Observability and cost': (_config) =>
    `Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.`,
  'Common mistakes': (_config) =>
    `Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.`,
  'Harder follow-ups': (_config) =>
    `When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.`,
};

function makeGuide(config: GuideConfig): SystemDesignStudyGuide {
  return {
    slug: config.slug,
    title: config.title,
    description: config.description,
    publishedAt: '2026-08-05',
    updatedAt: '2026-08-05',
    sections: HEADING_ORDER.map((heading) => ({
      heading,
      body: `${config.sections[heading]}\n\n${COACHING_COPY[heading](config)}`,
    })),
    finalAnswer: config.finalAnswer,
  };
}

export const VIDEO_STREAMING_GUIDE = makeGuide({
  slug: 'video-streaming-platform',
  title: 'Design a Video Streaming Platform | Interview Guide',
  description:
    'Design upload, transcoding, adaptive-bitrate packaging, CDN delivery, playback reliability, and cost controls for a YouTube or Netflix-style interview.',
  subject: 'on-demand video streaming',
  decision: 'the upload-to-playback boundary and adaptive-bitrate delivery strategy',
  sections: {
    'Clarify the contract':
      'Start by separating user-generated on-demand video from live streaming. Assume creators upload source files, viewers start playback within two seconds, the service supports multiple devices and regions, and availability matters more than immediate consistency of view counts. Ask about maximum duration, resolutions, copyright and moderation, private videos, captions, downloads, and whether the interviewer wants recommendations. Keep recommendation ranking out of the first playback design; it is a separate existing case.',
    'Capacity math':
      'Assume 100 million daily viewers, two 20-minute sessions each, and a 5 Mb/s average delivered bitrate. That is 200 million sessions/day, roughly 2,315 average starts/s before peak factor, and about 7.5 gigabytes delivered per viewer-day. Egress dominates storage: multiply watched seconds by delivered bits/s, then model CDN hit ratio and regional prices. Separately estimate upload bytes/day and transcoding amplification: one source can produce several codecs, resolutions, audio tracks, thumbnails, and manifests.',
    Architecture:
      'The write path is resumable upload to object storage, metadata commit, durable transcode job, isolated workers, quality checks, packaging into segmented HLS renditions, and publication of an immutable manifest version. The read path is player to playback authorization, manifest service, CDN, and origin shield backed by object storage. Signed URLs or cookies protect private media. Metadata and entitlement remain strongly controlled while video segments are immutable and cacheable. Analytics events flow asynchronously so playback never waits for counters.',
    'Deep dive':
      'Adaptive bitrate is the critical path. Encode a ladder of renditions, segment each on aligned keyframes, and publish a master playlist only after required renditions pass validation. The client measures buffer, throughput, and device capability, then switches at segment boundaries. Smaller segments reduce startup and recovery time but increase request overhead and encoding inefficiency. HLS defines playlists and media segments; the design still must choose ladder, codec, segment duration, cache key, and manifest-version semantics for its workload.',
    'Failure handling':
      'A bad codec rollout can generate corrupt high-resolution renditions while lower renditions remain healthy. Version transcoding templates, validate samples before publication, retain the prior manifest, and roll back by switching the metadata pointer rather than overwriting cached segments. If a CDN region misses heavily, shield the origin, apply request collapsing, preserve popular renditions, and shed expensive cold transformations. Upload jobs are idempotent by asset and rendition so retries cannot publish duplicate versions.',
    'Observability and cost':
      'Track startup time, rebuffer ratio, fatal playback errors, rendition switches, delivered bitrate, CDN hit rate, origin fetches, transcode queue age, failed renditions, and time from upload completion to publish. Slice quality by ISP, region, device, codec, and content. Cost per watched hour combines CDN egress, origin egress, storage copies, and encoding compute. Netflix-style ML annotation or recommendation can enrich catalog metadata, but playback has a deterministic fallback when those models are unavailable.',
    'Common mistakes':
      'Do not stream every byte through application servers, transcode synchronously during upload, use one bitrate, mutate segment URLs in place, or count a database replica as media delivery. Avoid merging live-stream latency requirements into an on-demand design without discussion. A CDN is not sufficient by itself: explain cache keys, origin protection, authorization, invalidation, range requests, and what the player does when one rendition or segment fails.',
    'Harder follow-ups':
      'For live video, replace the offline transcode queue with a bounded real-time pipeline, shorter segments or chunks, and stricter end-to-end delay monitoring. For user uploads, add malware scanning, moderation, copyright fingerprints, and quarantine. For personalized encoding, decide whether content-aware ladders save enough egress to justify extra compute. For ML-assisted video classification from the supplied Netflix case study, discuss labeling, offline evaluation, confidence thresholds, human review, model versioning, and deterministic playback behavior when annotations are late.',
  },
  finalAnswer:
    'Accept resumable uploads into object storage, asynchronously transcode and validate aligned adaptive-bitrate renditions, then atomically publish an immutable manifest version. Authorize playback separately and serve manifests and segments through a shielded CDN. Size from starts, watched seconds, bitrate, upload volume, and transcode amplification; protect origin during misses, roll back bad renditions by manifest version, and operate on startup, rebuffering, playback errors, CDN hit rate, queue age, and cost per watched hour.',
});

export const NOTIFICATION_DELIVERY_GUIDE = makeGuide({
  slug: 'notification-delivery-service',
  title: 'Design a Notification Service | Interview Guide',
  description:
    'Design preference-aware push, email, SMS, and in-app notification fan-out with quotas, deduplication, retries, provider failure, and observability.',
  subject: 'multi-channel notification delivery',
  decision:
    'durable fan-out with user preferences, deduplication, and provider-specific backpressure',
  sections: {
    'Clarify the contract':
      'Clarify transactional versus marketing messages, push/email/SMS/in-app channels, urgency, delay tolerance, user preferences, quiet hours, locale, ordering, and regulatory opt-outs. Assume upstream products submit a notification intent, not provider-formatted payloads. Transactional security alerts have a tighter latency and delivery contract than campaigns. Decide whether the API promises durable acceptance or actual delivery, and define duplicate tolerance because external providers generally offer at-least-once effects rather than a universal exactly-once guarantee.',
    'Capacity math':
      'Assume 100 million users, 20 notification intents per user-day, average fan-out of 1.4 eligible channels, and a 10× campaign burst. Two billion intents/day is about 23,150 average intents/s and 32,400 channel deliveries/s before peak; the burst can exceed 300,000 deliveries/s. Estimate payload storage by retention, preference reads, template rendering work, provider quotas, and retry amplification. Partition capacity by priority and channel because one slow SMS provider must not consume the push-alert budget.',
    Architecture:
      'The producer calls an authenticated idempotent intake API. The service validates schema, stores the intent and outbox atomically, then publishes to a durable log. A preference and policy stage resolves consent, quiet hours, locale, frequency caps, and eligible channels. Template rendering creates versioned provider payloads. Channel queues feed independently scaled adapters for APNs, FCM, web push, email, and SMS. Delivery receipts update attempt state asynchronously; an in-app inbox uses durable per-user records rather than relying on device push.',
    'Deep dive':
      'Use one stable notification ID and an idempotency key derived from producer, event, recipient, and semantic type. Persist an attempt state machine per channel: pending, leased, sent-to-provider, acknowledged when available, terminal, or retryable. Workers claim bounded batches with visibility leases. Provider success means acceptance, not necessarily device display, so preserve that distinction in APIs and metrics. Per-user ordering is scoped only where product semantics require it; global ordering would destroy throughput without improving the experience.',
    'Failure handling':
      'When one provider throttles, its adapter honors retry-after, lowers concurrency, opens a circuit, and reschedules with exponential backoff and jitter. Priority queues preserve security alerts while campaigns pause. A dead-letter path records terminal payload or credential errors without hot-looping. If the worker times out after provider acceptance, the idempotency record prevents an immediate duplicate where provider APIs support collapse or dedupe keys; otherwise the product explicitly tolerates rare duplicates and makes message effects idempotent.',
    'Observability and cost':
      'Measure intake durability, policy suppression, queue age, provider acceptance, device or user engagement when available, retries, duplicates, dead letters, and latency by priority/channel/provider. Track preference-store latency and template failures separately from delivery failures. Cost per accepted and engaged notification exposes expensive SMS fallbacks and wasteful campaigns. The supplied Uber out-of-app recommendation case study is a useful ML extension: model decisions must respect deterministic eligibility, frequency caps, experiments, and a safe non-personalized fallback.',
    'Common mistakes':
      'Do not call every provider synchronously from the product request, place all channels and priorities in one queue, ignore opt-outs, or report provider acceptance as confirmed human delivery. Avoid retrying invalid tokens forever and avoid generating templates inside opaque provider adapters. Exactly-once delivery to phones is not a credible promise; specify idempotent intake, bounded retries, provider semantics, collapse keys where supported, and deduplicated user-visible effects.',
    'Harder follow-ups':
      'Add scheduled campaigns by materializing recipients gradually rather than enqueueing a global spike. Handle quiet hours using recipient time zones and policy evaluated near send time. For multi-region intake, choose a home region per notification or a globally unique idempotency record. Discuss device-token rotation, privacy deletion, per-tenant quotas, localization rollout, and fallback from push to SMS. If personalization ranks messages, evaluate incremental value and cap frequency before scoring so optimization cannot violate user policy.',
  },
  finalAnswer:
    'Accept idempotent notification intents durably, resolve preferences and policy, render versioned templates, and fan out to isolated priority/channel queues. Provider adapters use leases, quotas, retry-after, jitter, circuits, and dead letters; attempt state distinguishes provider acceptance from user delivery. Preserve critical traffic during provider failure, make effects deduplicated rather than claiming universal exactly-once delivery, and monitor queue age, suppression, acceptance, retries, duplicates, engagement, and cost per useful notification.',
});

export const WEB_CRAWLER_GUIDE = makeGuide({
  slug: 'web-crawler',
  title: 'Design a Web Crawler | Interview Guide',
  description:
    'Design a polite distributed web crawler with URL normalization, robots enforcement, host scheduling, deduplication, recrawling, traps, and failure isolation.',
  subject: 'a web-scale crawler',
  decision: 'a polite per-host frontier that separates discovery priority from fetch eligibility',
  sections: {
    'Clarify the contract':
      'Ask whether the crawler builds a search index, archive, link graph, or focused corpus; whether it fetches only HTML; the target pages and refresh interval; geography; and compliance requirements. Assume billions of known URLs, HTML-only retrieval, strict robots.txt enforcement, per-host politeness, duplicate suppression, and eventual freshness. Define success as useful unique documents fetched within policy and budget, not raw request count. Exclude ranking and query serving from the crawler hot path.',
    'Capacity math':
      'Suppose the target is one billion successful pages/day at 100 KB compressed each. That is about 11,600 successful fetches/s and 100 TB/day of inbound body data before headers, retries, and replication. At a 70% success rate, schedule roughly 16,600 attempts/s. Estimate DNS traffic, frontier entries, content hashes, link expansion, and storage retention. Recrawl demand is not uniform: change frequency and importance should allocate the finite fetch budget instead of revisiting every URL on one fixed interval.',
    Architecture:
      'Seed URLs enter normalization and seen-URL filtering, then a priority frontier. A scheduler selects eligible host queues using next-fetch time, robots policy, crawl priority, and worker region. Fetchers resolve DNS through caches, apply timeouts and size limits, stream bodies to object storage, and emit metadata for parsing. Parsers extract canonical hints and links, normalize candidates, compute content fingerprints, and return new or changed URLs to the frontier. Separate logs and immutable fetch records make replay possible.',
    'Deep dive':
      'Use two scheduling layers: a global priority queue for importance and freshness, and per-host queues guarded by a host politeness clock and concurrency cap. A URL becomes runnable only when both priority and host eligibility permit it. Cache robots.txt by origin with expiry and fail conservatively when policy is uncertain. Normalize scheme, host case, default ports, fragments, and selected query rules without assuming all parameters are disposable. Use URL dedupe before fetch and content fingerprints after fetch because distinct URLs can serve identical bodies.',
    'Failure handling':
      'Crawler traps generate infinite calendars, session parameters, or faceted combinations. Bound path depth, repeated patterns, parameter cardinality, per-site URL growth, response size, redirects, and fetch time. Quarantine hosts whose discovered-to-useful ratio collapses. Poison documents and parser crashes go to isolated dead-letter storage. A host returning errors receives exponential backoff; global workers continue. Leased frontier items return after worker loss, and content-addressed fetch records make duplicate attempts harmless.',
    'Observability and cost':
      'Track successful and attempted fetches, unique documents, bytes, freshness lag, robots denials, host queue age, DNS/cache behavior, response classes, redirect loops, duplicate ratios, parser failures, and trap quarantines. Break metrics down by host, priority class, and worker region without allowing one high-cardinality hostname label to overwhelm telemetry. Cost per useful changed document includes network, DNS, storage, parsing, and recrawl waste. Crawl-budget decisions should optimize freshness and corpus value under that total cost.',
    'Common mistakes':
      'A single global FIFO violates politeness and lets one host dominate. Fetching before robots evaluation, normalizing URLs too aggressively, storing everything in one transactional database, and recrawling all pages equally are also weak designs. Do not confuse URL deduplication with content deduplication or trust canonical tags as commands. Avoid unbounded redirects, bodies, parser time, and link expansion. Every fetch must be attributable to a policy, priority, host budget, and retry state.',
    'Harder follow-ups':
      'Handle JavaScript rendering with a separate scarce browser-render queue triggered only when static extraction is insufficient. Add image or video crawling with type-specific size, hashing, and safety policies. For near-real-time news, introduce feeds and publisher push hints while retaining recrawl verification. Discuss distributed frontier ownership, rebalancing a hot host, legal deletion, authenticated sites, multilingual prioritization, and how a learned change-frequency model is evaluated against a deterministic scheduling baseline without violating robots or politeness.',
  },
  finalAnswer:
    'Normalize and deduplicate discovered URLs, rank them by importance and freshness, then schedule through per-host queues constrained by robots policy, next-fetch time, and concurrency. Fetch with strict resource limits, store immutable bodies, parse links asynchronously, and deduplicate both URLs and content. Size fetch, bandwidth, frontier, and storage independently; isolate traps and poison pages, lease work for replay, and operate on useful unique documents, freshness lag, policy compliance, host pressure, duplicate rate, and cost per changed document.',
});

export const CLOUD_FILE_STORAGE_GUIDE = makeGuide({
  slug: 'cloud-file-storage',
  title: 'Design Dropbox or Google Drive | Interview Guide',
  description:
    'Design resumable chunked uploads, metadata, multi-device synchronization, versioning, conflict handling, sharing, durability, and storage cost.',
  subject: 'multi-device cloud file storage',
  decision: 'content-addressed chunk transfer coordinated by strongly versioned metadata',
  sections: {
    'Clarify the contract':
      'Ask about file and account limits, folders, sharing, offline editing, version history, conflict semantics, encryption, regional residency, and whether collaborative character-level editing is required. Assume desktop and mobile clients synchronize ordinary files across devices, upload resumes after interruption, metadata changes appear quickly, file bytes are durable, and concurrent whole-file edits create explicit versions rather than silent last-writer loss. Character-level collaboration belongs to the separate collaborative-document case.',
    'Capacity math':
      'Assume 50 million daily users, 20 metadata reads and two changed-file uploads per user-day, average changed bytes of 8 MB, and a 5× workday peak. That yields about 11,600 average metadata operations/s, 1,160 uploads/s, and 800 TB/day of logical changed data before deduplication and replication. Estimate chunk-index entries, versions, download egress, multipart concurrency, notification fan-out, and garbage-collection delay. Storage growth depends more on retained versions and duplicate content than account count.',
    Architecture:
      'Clients split files into deterministic chunks, hash them, ask which hashes are missing, upload missing chunks directly to object storage with scoped URLs, then commit a metadata version referencing the ordered chunk list. A strongly consistent metadata service owns paths, parents, permissions, versions, and change sequence. A per-user or namespace change log lets devices fetch deltas from a cursor. Download reconstructs authorized versions from chunks, usually through CDN or object storage, while asynchronous scanners and lifecycle jobs remain off the commit path.',
    'Deep dive':
      'The metadata commit is a compare-and-swap on the observed file version. If device A and B edit version 7 offline, A may create version 8; B cannot overwrite it blindly and instead creates a conflict version referencing its own chunk list. Chunks are immutable and content-addressed, so retransmission and deduplication are safe, but authorization is checked through metadata rather than possession of a hash. Chunk size balances dedupe and resume granularity against index, request, and reconstruction overhead; use representative files to choose it.',
    'Failure handling':
      'An upload session records expected chunks, ownership, expiry, and final metadata intent. Missing or repeated chunk uploads are harmless; only an authorized atomic commit makes a version visible. Orphan chunks remain unreferenced until delayed mark-and-sweep proves they are not reachable from any retained version. If the client times out after commit, retrying with the same operation ID returns the committed version. Regional object failure serves another replica while metadata avoids acknowledging versions whose required durability has not been reached.',
    'Observability and cost':
      'Measure sync convergence time, metadata p99, upload resume success, conflict rate, bytes avoided by dedupe, orphan backlog, chunk availability, change-log lag, permission failures, download throughput, and durability-repair queue age. Cost per stored and synchronized gigabyte includes replicated object bytes, versions, chunk-index metadata, requests, egress, scanning, and garbage collection. A Dropbox ML file-organization feature from the supplied CSV can consume committed metadata asynchronously; synchronization cannot depend on its prediction.',
    'Common mistakes':
      'Do not proxy all file bytes through application servers, store large blobs in the metadata database, use path as an immutable identity, or implement last-writer-wins without surfacing lost edits. Content hashes are not authorization tokens. Avoid deleting a chunk as soon as one version drops it, because another file or delayed commit may still reference it. A vague “use S3” answer misses resumability, metadata atomicity, change cursors, conflicts, version retention, sharing, and reconciliation.',
    'Harder follow-ups':
      'Add team shared folders with namespace-level ordering and permission inheritance. Handle very large files with parallel multipart upload and bounded client memory. Support end-to-end encryption while explaining the loss of server-side dedupe and scanning. Discuss cross-region metadata ownership, legal holds, ransomware recovery, millions of tiny files, rename of huge folders, and selective sync. If semantic search or ML organization is added, define index freshness, deletion propagation, authorization filters, and fallback to deterministic filename metadata.',
  },
  finalAnswer:
    'Synchronize immutable content-addressed chunks separately from strongly versioned metadata. Clients upload only missing chunks directly to object storage, then atomically compare-and-swap a metadata version and consume per-namespace change logs. Make retries idempotent, surface concurrent edits as conflict versions, delay chunk garbage collection until reachability is proven, and serve durable replicas. Operate on convergence, metadata latency, resume success, conflicts, dedupe savings, orphan backlog, durability repair, and total cost per synchronized gigabyte.',
});

export const RIDE_SHARING_GUIDE = makeGuide({
  slug: 'ride-sharing-platform',
  title: 'Design Uber or Lyft | Interview Guide',
  description:
    'Design driver location ingestion, nearby matching, atomic trip assignment, dispatch, ETA, regional overload, safety, and marketplace observability.',
  subject: 'a ride-sharing marketplace',
  decision: 'fresh geospatial supply indexing plus an atomic trip-assignment state machine',
  sections: {
    'Clarify the contract':
      'Scope rider requests, nearby driver discovery, offer and acceptance, live trip status, cancellation, and payment handoff. Ask about cities, active drivers, location frequency, match latency, ETA accuracy, pooled rides, scheduled rides, and safety. Assume one rider and one driver per trip, location can be slightly stale, but a driver cannot hold two active assignments. Pricing and ETA models may assist decisions; the durable trip state machine remains authoritative when models are unavailable.',
    'Capacity math':
      'Assume one million active drivers sending a location every four seconds: 250,000 updates/s, with city and event hot spots. If five million rides/day peak at 10× average, match creation can reach roughly 580/s, far below telemetry volume. Size ingestion bandwidth from update bytes, index writes from meaningful cell changes, fan-out from candidate offers, and trip-event retention separately. Use arrival rate times match duration to estimate concurrent searches and reserve capacity for a regional demand spike.',
    Architecture:
      'Driver apps publish authenticated sequenced locations to regional gateways and a durable stream. A location service keeps the latest accepted point and updates an in-memory geospatial index by H3 or S2 cell. Rider requests enter a trip service, which stores an idempotent requested state and asks matching for expanding nearby candidates filtered by availability and policy. A dispatch service sends bounded offers; one transactional compare-and-swap changes driver and trip to assigned. Trip events then drive rider/driver streams, receipts, and asynchronous analytics.',
    'Deep dive':
      'Partition the live index by city and hierarchical cell. Query the pickup cell, then expand rings until enough candidates or a latency boundary is reached. Location updates carry driver ID, event time, sequence, coordinates, accuracy, and expiry; reject older sequences and remove stale drivers. Candidate ranking can combine ETA, distance, acceptance likelihood, and fairness, but assignment uses a lease or conditional write so concurrent matchers cannot win the same driver. Releasing an expired offer must also be version-checked.',
    'Failure handling':
      'During a stadium exit, one cell becomes hot and locations may lag. Spread cell ownership, batch index updates, cap search expansion, degrade to coarser cells, and expose longer wait estimates. Do not match drivers whose location age crosses a safety threshold. If dispatch times out after driver acceptance, retry by trip and offer ID and read the authoritative assignment before sending another offer. A regional stream failure freezes stale supply, diverts new requests when safe, and reconciles trip events before normal dispatch resumes.',
    'Observability and cost':
      'Track location ingest lag and age, active indexed supply, candidate count, ring expansions, offer latency, acceptance, duplicate-assignment invariant violations, match time, cancellation, ETA error, and regional saturation. Measure rider and driver outcomes by geography without exposing raw precise traces broadly. Cost per completed trip includes location bandwidth, stream processing, index memory, map/route calls, messaging, and support. The supplied Lyft ETA reliability, Uber DeepETA, and DoorDash probabilistic ETA studies inform model monitoring and uncertainty, not assignment correctness.',
    'Common mistakes':
      'Do not write every GPS point synchronously to one relational table and query latitude/longitude with a full scan. Avoid treating nearest distance as travel ETA, accepting out-of-order points, broadcasting each request to all drivers, or assigning through two independent writes. A map provider does not solve marketplace state. Explain stale-location policy, cell skew, offer leases, atomic assignment, rider and driver idempotency, and what the user sees when matching is degraded.',
    'Harder follow-ups':
      'Add pooled rides by turning matching into constrained route insertion with explicit latency and detour budgets. Add scheduled rides with reservation and rebalancing. Discuss driver privacy, spoofed GPS, safety incident isolation, airport queues, city failover, and surge pricing. For learned ETA or acceptance ranking, define training labels, online features, calibration by region, uncertainty, drift, experiment guardrails, and a deterministic distance/time fallback. Explain how fairness goals interact with pure nearest-driver optimization.',
  },
  finalAnswer:
    'Ingest sequenced driver locations into a regional stream and latest-location store, index only fresh available supply in hierarchical geospatial cells, and search expanding rings for bounded candidate sets. Rank offers with ETA and policy, but atomically compare-and-swap trip and driver assignment through an idempotent state machine. Degrade hot cells safely, reject stale supply, reconcile ambiguous offers, and monitor location age, match latency, candidate depth, assignment invariants, cancellation, ETA error, and cost per completed trip.',
});

export const TICKET_BOOKING_GUIDE = makeGuide({
  slug: 'ticket-booking-platform',
  title: 'Design Ticketmaster | Interview Guide',
  description:
    'Design browse, virtual waiting room, seat holds, payment, oversell prevention, flash-crowd control, expiration, reconciliation, and fairness.',
  subject: 'a scarce-inventory ticket booking platform',
  decision: 'an expiring inventory hold and idempotent order state machine under flash-crowd load',
  sections: {
    'Clarify the contract':
      'Clarify reserved seats versus general admission, browse and search, sale start, hold duration, purchase limits, payment, refunds, transfer, anti-bot rules, and fairness. Assume reserved seats, globally visible availability, a ten-minute hold, and strict prevention of two confirmed orders for one seat. Availability displays may lag slightly, but hold and confirmation must be serialized. The system promises fair admission to the purchase path, not that every queued buyer receives a ticket.',
    'Capacity math':
      'Assume a 50,000-seat event attracts five million waiting users and one million admission attempts in the first minute. That is about 16,700 admitted attempts/s if unbounded, so the waiting room must meter entrants to the proven hold/payment capacity. Estimate seat-map reads, hold writes, expiry timers, payment latency, and websocket or polling updates independently. Inventory cardinality is small; contention and burst shape dominate. Set admission from sustainable transaction rate and p99, not total web frontend capacity.',
    Architecture:
      'A CDN serves event pages while a signed virtual waiting room meters clients using opaque positions or admission tokens. Browse reads a cacheable seat-map projection. The inventory service is authoritative for seat state and creates a hold through a transaction or conditional write on available seats. An order service records an idempotent pending order, payment is attempted outside the inventory lock, and successful authorization transitions held seats and order to confirmed through a recoverable state machine. Expiry workers release abandoned holds by version.',
    'Deep dive':
      'Model each seat as available, held with hold ID and expiry, or sold with order ID. A multi-seat hold must succeed atomically or return a clear partial-policy result; row locks or conditional batch writes serialize contenders. Never keep a database lock open during an external payment. Instead, the hold reserves inventory, payment uses an idempotency key, and confirmation checks the same hold version before sale. Expiry uses a time-ordered index plus a source-of-truth check so delayed timers cannot release renewed or sold seats.',
    'Failure handling':
      'If payment times out, the outcome is ambiguous. Query by idempotency key before retrying and keep the hold until a bounded reconciliation window. Webhooks are deduplicated and only legal state transitions apply. During a flash crowd, the edge rejects invalid tokens, the waiting room caps admission, per-account/device limits slow bots, and inventory protects its transaction budget. If cache lags, the purchase write still rejects unavailable seats. Recovery reconciles payments, orders, holds, and seats before reopening admission.',
    'Observability and cost':
      'Measure waiting-room admission and abandonment, token validation, seat-map staleness, hold success/contention, transaction p99, hold expiry, payment ambiguity, confirmation latency, oversell invariant, bot challenges, refunds, and reconciliation backlog. Audit every inventory transition by actor and correlation ID. Cost per confirmed ticket includes queue traffic, seat-map fan-out, payment fees, fraud checks, support, and unused held inventory. Fairness metrics should detect whether retries, regions, or automation systematically bypass admission policy.',
    'Common mistakes':
      'Do not decrement an eventually consistent counter and call oversell solved, hold a database transaction across payment, trust the cached seat map on purchase, or release seats from an unchecked timer. Avoid allowing retries to create new orders and avoid sending all waiting users to inventory at sale start. “Exactly once payment” needs idempotency and reconciliation, not a broker setting. Define inventory state, legal transitions, ownership, expiry version, and the invariant that confirms at most one order per seat.',
    'Harder follow-ups':
      'For general admission, use an atomic remaining-capacity counter plus purchase quantity limits. Add adjacent-seat selection, accessible inventory, resale and transfer, refunds, dynamic pricing, promoter presales, and region-specific payment methods. Discuss queue fairness versus random lottery, bot detection false positives, data residency, event cancellation, and a full regional outage during sale. If ML scores fraud, keep deterministic purchase limits and explain feature freshness, model fallback, human appeal, and bias monitoring.',
  },
  finalAnswer:
    'Put flash crowds behind a signed virtual waiting room that meters admission to measured inventory and payment capacity. Keep an authoritative seat state machine—available, versioned hold, sold—and create multi-seat holds atomically. Pay outside locks with idempotency, confirm only against the same live hold, expire by version, and reconcile ambiguous processor outcomes and webhooks. Serve browse from projections but enforce purchases at inventory, and monitor contention, staleness, payment ambiguity, oversell invariants, fairness, and reconciliation backlog.',
});
