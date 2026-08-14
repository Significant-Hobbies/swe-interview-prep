# Design cloud file storage

Design resumable chunked uploads, metadata, multi-device synchronization, versioning, conflict handling, sharing, durability, and storage cost.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=cloud-file-storage&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

Ask about file and account limits, folders, sharing, offline editing, version history, conflict semantics, encryption, regional residency, and whether collaborative character-level editing is required. Assume desktop and mobile clients synchronize ordinary files across devices, upload resumes after interruption, metadata changes appear quickly, file bytes are durable, and concurrent whole-file edits create explicit versions rather than silent last-writer loss. Character-level collaboration belongs to the separate collaborative-document case.

Treat the product name as a conversation starter, not a specification. For multi-device cloud file storage, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.

## 2. Capacity math

Assume 50 million daily users, 20 metadata reads and two changed-file uploads per user-day, average changed bytes of 8 MB, and a 5× workday peak. That yields about 11,600 average metadata operations/s, 1,160 uploads/s, and 800 TB/day of logical changed data before deduplication and replication. Estimate chunk-index entries, versions, download egress, multipart concurrency, notification fan-out, and garbage-collection delay. Storage growth depends more on retained versions and duplicate content than account count.

Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.

## 3. Architecture

Clients split files into deterministic chunks, hash them, ask which hashes are missing, upload missing chunks directly to object storage with scoped URLs, then commit a metadata version referencing the ordered chunk list. A strongly consistent metadata service owns paths, parents, permissions, versions, and change sequence. A per-user or namespace change log lets devices fetch deltas from a cursor. Download reconstructs authorized versions from chunks, usually through CDN or object storage, while asynchronous scanners and lifecycle jobs remain off the commit path.

Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For multi-device cloud file storage, the architecture should make content-addressed chunk transfer coordinated by strongly versioned metadata visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.

## 4. Deep dive

The metadata commit is a compare-and-swap on the observed file version. If device A and B edit version 7 offline, A may create version 8; B cannot overwrite it blindly and instead creates a conflict version referencing its own chunk list. Chunks are immutable and content-addressed, so retransmission and deduplication are safe, but authorization is checked through metadata rather than possession of a hash. Chunk size balances dedupe and resume granularity against index, request, and reconstruction overhead; use representative files to choose it.

Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.

## 5. Failure handling

An upload session records expected chunks, ownership, expiry, and final metadata intent. Missing or repeated chunk uploads are harmless; only an authorized atomic commit makes a version visible. Orphan chunks remain unreferenced until delayed mark-and-sweep proves they are not reachable from any retained version. If the client times out after commit, retrying with the same operation ID returns the committed version. Regional object failure serves another replica while metadata avoids acknowledging versions whose required durability has not been reached.

Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.

## 6. Observability and cost

Measure sync convergence time, metadata p99, upload resume success, conflict rate, bytes avoided by dedupe, orphan backlog, chunk availability, change-log lag, permission failures, download throughput, and durability-repair queue age. Cost per stored and synchronized gigabyte includes replicated object bytes, versions, chunk-index metadata, requests, egress, scanning, and garbage collection. A Dropbox ML file-organization feature from the supplied CSV can consume committed metadata asynchronously; synchronization cannot depend on its prediction.

Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.

## 7. Common mistakes

Do not proxy all file bytes through application servers, store large blobs in the metadata database, use path as an immutable identity, or implement last-writer-wins without surfacing lost edits. Content hashes are not authorization tokens. Avoid deleting a chunk as soon as one version drops it, because another file or delayed commit may still reference it. A vague “use S3” answer misses resumability, metadata atomicity, change cursors, conflicts, version retention, sharing, and reconciliation.

Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.

## 8. Harder follow-ups

Add team shared folders with namespace-level ordering and permission inheritance. Handle very large files with parallel multipart upload and bounded client memory. Support end-to-end encryption while explaining the loss of server-side dedupe and scanning. Discuss cross-region metadata ownership, legal holds, ransomware recovery, millions of tiny files, rename of huge folders, and selective sync. If semantic search or ML organization is added, define index freshness, deletion propagation, authorization filters, and fallback to deterministic filename metadata.

When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.

## Answer outline

Synchronize immutable content-addressed chunks separately from strongly versioned metadata. Clients upload only missing chunks directly to object storage, then atomically compare-and-swap a metadata version and consume per-namespace change logs. Make retries idempotent, surface concurrent edits as conflict versions, delay chunk garbage collection until reachability is proven, and serve durable replicas. Operate on convergence, metadata latency, resume success, conflicts, dedupe savings, orphan backlog, durability repair, and total cost per synchronized gigabyte.

## Primary sources

- [Dropbox content hash](https://www.dropbox.com/developers/reference/content-hash) (official-doc)
- [Amazon S3 strong consistency](https://aws.amazon.com/s3/consistency/) (official-doc)
- [RFC 9110 HTTP conditional requests](https://www.rfc-editor.org/rfc/rfc9110) (standard)
- [Dropbox ML file organization](https://dropbox.tech/machine-learning/smart-move-ml-ai-file-organization-automation) (official-doc)

## Repair the mechanisms

- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage)
- [Storage Engines](https://learn.significanthobbies.com/curriculum/concepts/storage-retrieval)
- [Conflict Resolution](https://learn.significanthobbies.com/curriculum/concepts/conflict-resolution)
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication)
- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency)
