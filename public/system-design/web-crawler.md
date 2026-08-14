# Design a web crawler

Design a polite distributed web crawler with URL normalization, robots enforcement, host scheduling, deduplication, recrawling, traps, and failure isolation.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=web-crawler&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

Ask whether the crawler builds a search index, archive, link graph, or focused corpus; whether it fetches only HTML; the target pages and refresh interval; geography; and compliance requirements. Assume billions of known URLs, HTML-only retrieval, strict robots.txt enforcement, per-host politeness, duplicate suppression, and eventual freshness. Define success as useful unique documents fetched within policy and budget, not raw request count. Exclude ranking and query serving from the crawler hot path.

Treat the product name as a conversation starter, not a specification. For a web-scale crawler, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.

## 2. Capacity math

Suppose the target is one billion successful pages/day at 100 KB compressed each. That is about 11,600 successful fetches/s and 100 TB/day of inbound body data before headers, retries, and replication. At a 70% success rate, schedule roughly 16,600 attempts/s. Estimate DNS traffic, frontier entries, content hashes, link expansion, and storage retention. Recrawl demand is not uniform: change frequency and importance should allocate the finite fetch budget instead of revisiting every URL on one fixed interval.

Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.

## 3. Architecture

Seed URLs enter normalization and seen-URL filtering, then a priority frontier. A scheduler selects eligible host queues using next-fetch time, robots policy, crawl priority, and worker region. Fetchers resolve DNS through caches, apply timeouts and size limits, stream bodies to object storage, and emit metadata for parsing. Parsers extract canonical hints and links, normalize candidates, compute content fingerprints, and return new or changed URLs to the frontier. Separate logs and immutable fetch records make replay possible.

Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For a web-scale crawler, the architecture should make a polite per-host frontier that separates discovery priority from fetch eligibility visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.

## 4. Deep dive

Use two scheduling layers: a global priority queue for importance and freshness, and per-host queues guarded by a host politeness clock and concurrency cap. A URL becomes runnable only when both priority and host eligibility permit it. Cache robots.txt by origin with expiry and fail conservatively when policy is uncertain. Normalize scheme, host case, default ports, fragments, and selected query rules without assuming all parameters are disposable. Use URL dedupe before fetch and content fingerprints after fetch because distinct URLs can serve identical bodies.

Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.

## 5. Failure handling

Crawler traps generate infinite calendars, session parameters, or faceted combinations. Bound path depth, repeated patterns, parameter cardinality, per-site URL growth, response size, redirects, and fetch time. Quarantine hosts whose discovered-to-useful ratio collapses. Poison documents and parser crashes go to isolated dead-letter storage. A host returning errors receives exponential backoff; global workers continue. Leased frontier items return after worker loss, and content-addressed fetch records make duplicate attempts harmless.

Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.

## 6. Observability and cost

Track successful and attempted fetches, unique documents, bytes, freshness lag, robots denials, host queue age, DNS/cache behavior, response classes, redirect loops, duplicate ratios, parser failures, and trap quarantines. Break metrics down by host, priority class, and worker region without allowing one high-cardinality hostname label to overwhelm telemetry. Cost per useful changed document includes network, DNS, storage, parsing, and recrawl waste. Crawl-budget decisions should optimize freshness and corpus value under that total cost.

Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.

## 7. Common mistakes

A single global FIFO violates politeness and lets one host dominate. Fetching before robots evaluation, normalizing URLs too aggressively, storing everything in one transactional database, and recrawling all pages equally are also weak designs. Do not confuse URL deduplication with content deduplication or trust canonical tags as commands. Avoid unbounded redirects, bodies, parser time, and link expansion. Every fetch must be attributable to a policy, priority, host budget, and retry state.

Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.

## 8. Harder follow-ups

Handle JavaScript rendering with a separate scarce browser-render queue triggered only when static extraction is insufficient. Add image or video crawling with type-specific size, hashing, and safety policies. For near-real-time news, introduce feeds and publisher push hints while retaining recrawl verification. Discuss distributed frontier ownership, rebalancing a hot host, legal deletion, authenticated sites, multilingual prioritization, and how a learned change-frequency model is evaluated against a deterministic scheduling baseline without violating robots or politeness.

When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.

## Answer outline

Normalize and deduplicate discovered URLs, rank them by importance and freshness, then schedule through per-host queues constrained by robots policy, next-fetch time, and concurrency. Fetch with strict resource limits, store immutable bodies, parse links asynchronously, and deduplicate both URLs and content. Size fetch, bandwidth, frontier, and storage independently; isolate traps and poison pages, lease work for replay, and operate on useful unique documents, freshness lag, policy compliance, host pressure, duplicate rate, and cost per changed document.

## Primary sources

- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309) (standard)
- [Google crawl budget documentation](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) (official-doc)
- [Google canonical URL documentation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) (official-doc)

## Repair the mechanisms

- [Search Platform Design](https://learn.significanthobbies.com/curriculum/concepts/search-platform-design)
- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues)
- [Sharding](https://learn.significanthobbies.com/curriculum/concepts/sharding)
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage)
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting)
