# Design a ride-sharing platform

Design driver location ingestion, nearby matching, atomic trip assignment, dispatch, ETA, regional overload, safety, and marketplace observability.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=ride-sharing-platform&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

Scope rider requests, nearby driver discovery, offer and acceptance, live trip status, cancellation, and payment handoff. Ask about cities, active drivers, location frequency, match latency, ETA accuracy, pooled rides, scheduled rides, and safety. Assume one rider and one driver per trip, location can be slightly stale, but a driver cannot hold two active assignments. Pricing and ETA models may assist decisions; the durable trip state machine remains authoritative when models are unavailable.

Treat the product name as a conversation starter, not a specification. For a ride-sharing marketplace, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.

## 2. Capacity math

Assume one million active drivers sending a location every four seconds: 250,000 updates/s, with city and event hot spots. If five million rides/day peak at 10× average, match creation can reach roughly 580/s, far below telemetry volume. Size ingestion bandwidth from update bytes, index writes from meaningful cell changes, fan-out from candidate offers, and trip-event retention separately. Use arrival rate times match duration to estimate concurrent searches and reserve capacity for a regional demand spike.

Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.

## 3. Architecture

Driver apps publish authenticated sequenced locations to regional gateways and a durable stream. A location service keeps the latest accepted point and updates an in-memory geospatial index by H3 or S2 cell. Rider requests enter a trip service, which stores an idempotent requested state and asks matching for expanding nearby candidates filtered by availability and policy. A dispatch service sends bounded offers; one transactional compare-and-swap changes driver and trip to assigned. Trip events then drive rider/driver streams, receipts, and asynchronous analytics.

Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For a ride-sharing marketplace, the architecture should make fresh geospatial supply indexing plus an atomic trip-assignment state machine visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.

## 4. Deep dive

Partition the live index by city and hierarchical cell. Query the pickup cell, then expand rings until enough candidates or a latency boundary is reached. Location updates carry driver ID, event time, sequence, coordinates, accuracy, and expiry; reject older sequences and remove stale drivers. Candidate ranking can combine ETA, distance, acceptance likelihood, and fairness, but assignment uses a lease or conditional write so concurrent matchers cannot win the same driver. Releasing an expired offer must also be version-checked.

Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.

## 5. Failure handling

During a stadium exit, one cell becomes hot and locations may lag. Spread cell ownership, batch index updates, cap search expansion, degrade to coarser cells, and expose longer wait estimates. Do not match drivers whose location age crosses a safety threshold. If dispatch times out after driver acceptance, retry by trip and offer ID and read the authoritative assignment before sending another offer. A regional stream failure freezes stale supply, diverts new requests when safe, and reconciles trip events before normal dispatch resumes.

Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.

## 6. Observability and cost

Track location ingest lag and age, active indexed supply, candidate count, ring expansions, offer latency, acceptance, duplicate-assignment invariant violations, match time, cancellation, ETA error, and regional saturation. Measure rider and driver outcomes by geography without exposing raw precise traces broadly. Cost per completed trip includes location bandwidth, stream processing, index memory, map/route calls, messaging, and support. The supplied Lyft ETA reliability, Uber DeepETA, and DoorDash probabilistic ETA studies inform model monitoring and uncertainty, not assignment correctness.

Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.

## 7. Common mistakes

Do not write every GPS point synchronously to one relational table and query latitude/longitude with a full scan. Avoid treating nearest distance as travel ETA, accepting out-of-order points, broadcasting each request to all drivers, or assigning through two independent writes. A map provider does not solve marketplace state. Explain stale-location policy, cell skew, offer leases, atomic assignment, rider and driver idempotency, and what the user sees when matching is degraded.

Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.

## 8. Harder follow-ups

Add pooled rides by turning matching into constrained route insertion with explicit latency and detour budgets. Add scheduled rides with reservation and rebalancing. Discuss driver privacy, spoofed GPS, safety incident isolation, airport queues, city failover, and surge pricing. For learned ETA or acceptance ranking, define training labels, online features, calibration by region, uncertainty, drift, experiment guardrails, and a deterministic distance/time fallback. Explain how fairness goals interact with pure nearest-driver optimization.

When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.

## Answer outline

Ingest sequenced driver locations into a regional stream and latest-location store, index only fresh available supply in hierarchical geospatial cells, and search expanding rings for bounded candidate sets. Rank offers with ETA and policy, but atomically compare-and-swap trip and driver assignment through an idempotent state machine. Degrade hot cells safely, reject stale supply, reconcile ambiguous offers, and monitor location age, match latency, candidate depth, assignment invariants, cancellation, ETA error, and cost per completed trip.

## Primary sources

- [Uber H3 documentation](https://h3geo.org/docs/) (official-doc)
- [PostGIS spatial indexes](https://postgis.net/workshops/postgis-intro/indexing.html) (official-doc)
- [Google S2 Geometry](https://s2geometry.io/) (official-doc)
- [Lyft ETA reliability](https://eng.lyft.com/eta-estimated-time-of-arrival-reliability-at-lyft-d4ca2720bda8) (official-doc)
- [Uber DeepETA](https://www.uber.com/en-GB/blog/deepeta-how-uber-predicts-arrival-times/) (official-doc)

## Repair the mechanisms

- [Geo Systems](https://learn.significanthobbies.com/curriculum/concepts/location-transport.html)
- [Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime.html)
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing.html)
- [Unique ID Generation](https://learn.significanthobbies.com/curriculum/concepts/unique-id-generation.html)
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics.html)
