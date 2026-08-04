# Design a ticket-booking platform

Design browse, virtual waiting room, seat holds, payment, oversell prevention, flash-crowd control, expiration, reconciliation, and fairness.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=ticket-booking-platform&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

Clarify reserved seats versus general admission, browse and search, sale start, hold duration, purchase limits, payment, refunds, transfer, anti-bot rules, and fairness. Assume reserved seats, globally visible availability, a ten-minute hold, and strict prevention of two confirmed orders for one seat. Availability displays may lag slightly, but hold and confirmation must be serialized. The system promises fair admission to the purchase path, not that every queued buyer receives a ticket.

Treat the product name as a conversation starter, not a specification. For a scarce-inventory ticket booking platform, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.

## 2. Capacity math

Assume a 50,000-seat event attracts five million waiting users and one million admission attempts in the first minute. That is about 16,700 admitted attempts/s if unbounded, so the waiting room must meter entrants to the proven hold/payment capacity. Estimate seat-map reads, hold writes, expiry timers, payment latency, and websocket or polling updates independently. Inventory cardinality is small; contention and burst shape dominate. Set admission from sustainable transaction rate and p99, not total web frontend capacity.

Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.

## 3. Architecture

A CDN serves event pages while a signed virtual waiting room meters clients using opaque positions or admission tokens. Browse reads a cacheable seat-map projection. The inventory service is authoritative for seat state and creates a hold through a transaction or conditional write on available seats. An order service records an idempotent pending order, payment is attempted outside the inventory lock, and successful authorization transitions held seats and order to confirmed through a recoverable state machine. Expiry workers release abandoned holds by version.

Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For a scarce-inventory ticket booking platform, the architecture should make an expiring inventory hold and idempotent order state machine under flash-crowd load visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.

## 4. Deep dive

Model each seat as available, held with hold ID and expiry, or sold with order ID. A multi-seat hold must succeed atomically or return a clear partial-policy result; row locks or conditional batch writes serialize contenders. Never keep a database lock open during an external payment. Instead, the hold reserves inventory, payment uses an idempotency key, and confirmation checks the same hold version before sale. Expiry uses a time-ordered index plus a source-of-truth check so delayed timers cannot release renewed or sold seats.

Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.

## 5. Failure handling

If payment times out, the outcome is ambiguous. Query by idempotency key before retrying and keep the hold until a bounded reconciliation window. Webhooks are deduplicated and only legal state transitions apply. During a flash crowd, the edge rejects invalid tokens, the waiting room caps admission, per-account/device limits slow bots, and inventory protects its transaction budget. If cache lags, the purchase write still rejects unavailable seats. Recovery reconciles payments, orders, holds, and seats before reopening admission.

Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.

## 6. Observability and cost

Measure waiting-room admission and abandonment, token validation, seat-map staleness, hold success/contention, transaction p99, hold expiry, payment ambiguity, confirmation latency, oversell invariant, bot challenges, refunds, and reconciliation backlog. Audit every inventory transition by actor and correlation ID. Cost per confirmed ticket includes queue traffic, seat-map fan-out, payment fees, fraud checks, support, and unused held inventory. Fairness metrics should detect whether retries, regions, or automation systematically bypass admission policy.

Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.

## 7. Common mistakes

Do not decrement an eventually consistent counter and call oversell solved, hold a database transaction across payment, trust the cached seat map on purchase, or release seats from an unchecked timer. Avoid allowing retries to create new orders and avoid sending all waiting users to inventory at sale start. “Exactly once payment” needs idempotency and reconciliation, not a broker setting. Define inventory state, legal transitions, ownership, expiry version, and the invariant that confirms at most one order per seat.

Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.

## 8. Harder follow-ups

For general admission, use an atomic remaining-capacity counter plus purchase quantity limits. Add adjacent-seat selection, accessible inventory, resale and transfer, refunds, dynamic pricing, promoter presales, and region-specific payment methods. Discuss queue fairness versus random lottery, bot detection false positives, data residency, event cancellation, and a full regional outage during sale. If ML scores fraud, keep deterministic purchase limits and explain feature freshness, model fallback, human appeal, and bias monitoring.

When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.

## Answer outline

Put flash crowds behind a signed virtual waiting room that meters admission to measured inventory and payment capacity. Keep an authoritative seat state machine—available, versioned hold, sold—and create multi-seat holds atomically. Pay outside locks with idempotency, confirm only against the same live hold, expire by version, and reconcile ambiguous processor outcomes and webhooks. Serve browse from projections but enforce purchases at inventory, and monitor contention, staleness, payment ambiguity, oversell invariants, fairness, and reconciliation backlog.

## Primary sources

- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html) (official-doc)
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests) (official-doc)
- [RFC 6585: HTTP 429](https://www.rfc-editor.org/rfc/rfc6585) (standard)

## Repair the mechanisms

- [Booking & Inventory](https://learn.significanthobbies.com/curriculum/concepts/booking-inventory.html)
- [Transaction Processing](https://learn.significanthobbies.com/curriculum/concepts/transaction-processing.html)
- [Isolation Levels & MVCC](https://learn.significanthobbies.com/curriculum/concepts/isolation-levels.html)
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html)
