# Design a notification delivery service

Design preference-aware push, email, SMS, and in-app notification fan-out with quotas, deduplication, retries, provider failure, and observability.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=notification-delivery-service&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

Clarify transactional versus marketing messages, push/email/SMS/in-app channels, urgency, delay tolerance, user preferences, quiet hours, locale, ordering, and regulatory opt-outs. Assume upstream products submit a notification intent, not provider-formatted payloads. Transactional security alerts have a tighter latency and delivery contract than campaigns. Decide whether the API promises durable acceptance or actual delivery, and define duplicate tolerance because external providers generally offer at-least-once effects rather than a universal exactly-once guarantee.

Treat the product name as a conversation starter, not a specification. For multi-channel notification delivery, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.

## 2. Capacity math

Assume 100 million users, 20 notification intents per user-day, average fan-out of 1.4 eligible channels, and a 10× campaign burst. Two billion intents/day is about 23,150 average intents/s and 32,400 channel deliveries/s before peak; the burst can exceed 300,000 deliveries/s. Estimate payload storage by retention, preference reads, template rendering work, provider quotas, and retry amplification. Partition capacity by priority and channel because one slow SMS provider must not consume the push-alert budget.

Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.

## 3. Architecture

The producer calls an authenticated idempotent intake API. The service validates schema, stores the intent and outbox atomically, then publishes to a durable log. A preference and policy stage resolves consent, quiet hours, locale, frequency caps, and eligible channels. Template rendering creates versioned provider payloads. Channel queues feed independently scaled adapters for APNs, FCM, web push, email, and SMS. Delivery receipts update attempt state asynchronously; an in-app inbox uses durable per-user records rather than relying on device push.

Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For multi-channel notification delivery, the architecture should make durable fan-out with user preferences, deduplication, and provider-specific backpressure visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.

## 4. Deep dive

Use one stable notification ID and an idempotency key derived from producer, event, recipient, and semantic type. Persist an attempt state machine per channel: pending, leased, sent-to-provider, acknowledged when available, terminal, or retryable. Workers claim bounded batches with visibility leases. Provider success means acceptance, not necessarily device display, so preserve that distinction in APIs and metrics. Per-user ordering is scoped only where product semantics require it; global ordering would destroy throughput without improving the experience.

Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.

## 5. Failure handling

When one provider throttles, its adapter honors retry-after, lowers concurrency, opens a circuit, and reschedules with exponential backoff and jitter. Priority queues preserve security alerts while campaigns pause. A dead-letter path records terminal payload or credential errors without hot-looping. If the worker times out after provider acceptance, the idempotency record prevents an immediate duplicate where provider APIs support collapse or dedupe keys; otherwise the product explicitly tolerates rare duplicates and makes message effects idempotent.

Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.

## 6. Observability and cost

Measure intake durability, policy suppression, queue age, provider acceptance, device or user engagement when available, retries, duplicates, dead letters, and latency by priority/channel/provider. Track preference-store latency and template failures separately from delivery failures. Cost per accepted and engaged notification exposes expensive SMS fallbacks and wasteful campaigns. The supplied Uber out-of-app recommendation case study is a useful ML extension: model decisions must respect deterministic eligibility, frequency caps, experiments, and a safe non-personalized fallback.

Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.

## 7. Common mistakes

Do not call every provider synchronously from the product request, place all channels and priorities in one queue, ignore opt-outs, or report provider acceptance as confirmed human delivery. Avoid retrying invalid tokens forever and avoid generating templates inside opaque provider adapters. Exactly-once delivery to phones is not a credible promise; specify idempotent intake, bounded retries, provider semantics, collapse keys where supported, and deduplicated user-visible effects.

Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.

## 8. Harder follow-ups

Add scheduled campaigns by materializing recipients gradually rather than enqueueing a global spike. Handle quiet hours using recipient time zones and policy evaluated near send time. For multi-region intake, choose a home region per notification or a globally unique idempotency record. Discuss device-token rotation, privacy deletion, per-tenant quotas, localization rollout, and fallback from push to SMS. If personalization ranks messages, evaluate incremental value and cap frequency before scoring so optimization cannot violate user policy.

When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.

## Answer outline

Accept idempotent notification intents durably, resolve preferences and policy, render versioned templates, and fan out to isolated priority/channel queues. Provider adapters use leases, quotas, retry-after, jitter, circuits, and dead letters; attempt state distinguishes provider acceptance from user delivery. Preserve critical traffic during provider failure, make effects deduplicated rather than claiming universal exactly-once delivery, and monitor queue age, suppression, acceptance, retries, duplicates, engagement, and cost per useful notification.

## Primary sources

- [RFC 8030: Generic Event Delivery Using HTTP Push](https://www.rfc-editor.org/rfc/rfc8030) (standard)
- [Firebase Cloud Messaging architecture](https://firebase.google.com/docs/cloud-messaging/fcm-architecture) (official-doc)
- [Apple Push Notification service](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server) (official-doc)
- [Uber out-of-app recommendation system](https://www.uber.com/en-GB/blog/personalized-marketing-at-scale/) (official-doc)

## Repair the mechanisms

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues)
- [Webhooks](https://learn.significanthobbies.com/curriculum/concepts/webhooks)
- [Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers)
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency)
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics)
