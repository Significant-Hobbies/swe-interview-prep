# Design a video streaming platform

Design upload, transcoding, adaptive-bitrate packaging, CDN delivery, playback reliability, and cost controls for a YouTube or Netflix-style interview.

- [Start the closed-book case](https://learn.significanthobbies.com/mock?prompt=video-streaming-platform&from=guide)
- [Browse all system-design cases](https://learn.significanthobbies.com/system-design/)

## 1. Clarify the contract

Start by separating user-generated on-demand video from live streaming. Assume creators upload source files, viewers start playback within two seconds, the service supports multiple devices and regions, and availability matters more than immediate consistency of view counts. Ask about maximum duration, resolutions, copyright and moderation, private videos, captions, downloads, and whether the interviewer wants recommendations. Keep recommendation ranking out of the first playback design; it is a separate existing case.

Treat the product name as a conversation starter, not a specification. For on-demand video streaming, state what is in scope, what is explicitly excluded, who calls the system, which operation is user-visible, and whether consistency, availability, latency, durability, privacy, or cost dominates. Ask for average and peak traffic, object sizes, geographic distribution, retention, and the failure domain the design must survive. Then choose concrete assumptions and keep returning to them. This prevents a familiar brand from smuggling in dozens of features and gives the interviewer a clear way to challenge the design without changing the problem silently.

## 2. Capacity math

Assume 100 million daily viewers, two 20-minute sessions each, and a 5 Mb/s average delivered bitrate. That is 200 million sessions/day, roughly 2,315 average starts/s before peak factor, and about 7.5 gigabytes delivered per viewer-day. Egress dominates storage: multiply watched seconds by delivered bits/s, then model CDN hit ratio and regional prices. Separately estimate upload bytes/day and transcoding amplification: one source can produce several codecs, resolutions, audio tracks, thumbnails, and manifests.

Carry units through every estimate. Convert daily volume into average operations per second, multiply by an explicit peak factor, and separate reads, writes, background work, storage growth, and network egress. Estimate concurrent work with arrival rate multiplied by time in system when requests remain active. The purpose is not numerical theater: each result must change a queue, partition key, cache, retention policy, or fleet decision. Name the uncertainty with the largest architectural effect and explain how a load test or production measurement would replace the assumption before launch.

## 3. Architecture

The write path is resumable upload to object storage, metadata commit, durable transcode job, isolated workers, quality checks, packaging into segmented HLS renditions, and publication of an immutable manifest version. The read path is player to playback authorization, manifest service, CDN, and origin shield backed by object storage. Signed URLs or cookies protect private media. Metadata and entitlement remain strongly controlled while video segments are immutable and cacheable. Analytics events flow asynchronously so playback never waits for counters.

Describe one end-to-end request before listing components. Separate synchronous acceptance from asynchronous processing, identify the authoritative state, and say where idempotency, authorization, rate limits, and backpressure live. Keep the control plane—configuration, placement, rollout, and policy—out of the hot data path when possible. For on-demand video streaming, the architecture should make the upload-to-playback boundary and adaptive-bitrate delivery strategy visible rather than hiding it behind a generic queue and database. Name ownership boundaries and the event or state transition passed between them so retries and partial failure have defined semantics.

## 4. Deep dive

Adaptive bitrate is the critical path. Encode a ladder of renditions, segment each on aligned keyframes, and publish a master playlist only after required renditions pass validation. The client measures buffer, throughput, and device capability, then switches at segment boundaries. Smaller segments reduce startup and recovery time but increase request overhead and encoding inefficiency. HLS defines playlists and media segments; the design still must choose ladder, codec, segment duration, cache key, and manifest-version semantics for its workload.

Choose the mechanism that can invalidate the entire design and defend it with alternatives. Explain its data model, concurrency boundary, partition key, ordering or consistency guarantee, and what happens at the tail rather than only on average. Compare at least two workable choices, then select one using the stated contract. A strong deep dive also includes operational evidence: the metric that shows saturation, the invariant a test can assert, and the recovery action when the mechanism is wrong. This is where the answer demonstrates engineering judgment instead of diagram recall.

## 5. Failure handling

A bad codec rollout can generate corrupt high-resolution renditions while lower renditions remain healthy. Version transcoding templates, validate samples before publication, retain the prior manifest, and roll back by switching the metadata pointer rather than overwriting cached segments. If a CDN region misses heavily, shield the origin, apply request collapsing, preserve popular renditions, and shed expensive cold transformations. Upload jobs are idempotent by asset and rendition so retries cannot publish duplicate versions.

Walk through detection, containment, degraded service, recovery, and reconciliation in that order. Bound queues and retries before overload; include deadlines, jitter, retry budgets, poison-item isolation, and idempotent replay. Distinguish an unavailable dependency from an ambiguous outcome because the latter may already have committed a side effect. State which features can fail open, which must fail closed, and which can return stale data. Recovery is incomplete until duplicated, missing, or divergent work is reconciled and the system proves that the original invariant holds again.

## 6. Observability and cost

Track startup time, rebuffer ratio, fatal playback errors, rendition switches, delivered bitrate, CDN hit rate, origin fetches, transcode queue age, failed renditions, and time from upload completion to publish. Slice quality by ISP, region, device, codec, and content. Cost per watched hour combines CDN egress, origin egress, storage copies, and encoding compute. Netflix-style ML annotation or recommendation can enrich catalog metadata, but playback has a deterministic fallback when those models are unavailable.

Measure the user contract, work queues, resource saturation, correctness invariants, and spend separately. Use latency distributions rather than averages and break them down by operation, region, tenant, and outcome. Track queue age, retries, deduplication, throttling, and reconciliation because a green success rate can hide delayed or duplicated work. Tie cost to a useful unit such as a delivered notification, streamed minute, synchronized gigabyte, crawled document, matched trip, or confirmed booking. Capacity and cost dashboards should use the same workload dimensions as the interview estimates so assumptions can be replaced with evidence.

## 7. Common mistakes

Do not stream every byte through application servers, transcode synchronously during upload, use one bitrate, mutate segment URLs in place, or count a database replica as media delivery. Avoid merging live-stream latency requirements into an on-demand design without discussion. A CDN is not sufficient by itself: explain cache keys, origin protection, authorization, invalidation, range requests, and what the player does when one rendition or segment fails.

Weak answers usually jump to branded technology, omit the authoritative state, or claim exactly-once delivery without an idempotent effect. They calculate average QPS but ignore burst shape, fan-out, payload size, background amplification, and hot keys. Another common failure is promising multi-region availability without describing ownership, conflict handling, or spare capacity. Avoid treating a cache, message broker, or database as a magic box. Name the invariant each component protects and the trade-off it introduces. If a design choice would remain identical after the workload changed by one hundred times, the estimate probably did not inform the architecture.

## 8. Harder follow-ups

For live video, replace the offline transcode queue with a bounded real-time pipeline, shorter segments or chunks, and stricter end-to-end delay monitoring. For user uploads, add malware scanning, moderation, copyright fingerprints, and quarantine. For personalized encoding, decide whether content-aware ladders save enough egress to justify extra compute. For ML-assisted video classification from the supplied Netflix case study, discuss labeling, offline evaluation, confidence thresholds, human review, model versioning, and deterministic playback behavior when annotations are late.

When the interviewer changes a constraint, rebuild from the contract rather than patching the diagram. Consider data residency, abusive tenants, a tenfold burst, regional isolation, privacy deletion, multi-device concurrency, and a dependency that times out after committing. Explain which assumptions and components change and which invariant remains. Also connect the case to modern ML where relevant: ranking, anomaly detection, forecasting, moderation, or ETA models add freshness, evaluation, fallback, and online-offline consistency requirements, but they do not replace the deterministic serving and correctness path. End with the first experiment that would reduce the largest remaining uncertainty.

## Answer outline

Accept resumable uploads into object storage, asynchronously transcode and validate aligned adaptive-bitrate renditions, then atomically publish an immutable manifest version. Authorize playback separately and serve manifests and segments through a shielded CDN. Size from starts, watched seconds, bitrate, upload volume, and transcode amplification; protect origin during misses, roll back bad renditions by manifest version, and operate on startup, rebuffering, playback errors, CDN hit rate, queue age, and cost per watched hour.

## Primary sources

- [RFC 8216: HTTP Live Streaming](https://www.rfc-editor.org/rfc/rfc8216) (standard)
- [Apple HTTP Live Streaming documentation](https://developer.apple.com/streaming/) (official-doc)
- [Netflix Open Connect overview](https://openconnect.netflix.com/en/) (official-doc)
- [Netflix video annotation framework](https://netflixtechblog.com/video-annotator-building-video-classifiers-using-vision-language-models-and-active-learning-8ebdda0b2db4) (official-doc)

## Repair the mechanisms

- [Streaming Media](https://learn.significanthobbies.com/curriculum/concepts/streaming-media)
- [CDN & Edge Delivery](https://learn.significanthobbies.com/curriculum/concepts/cdn-edge-delivery)
- [Object Storage](https://learn.significanthobbies.com/curriculum/concepts/object-storage)
- [Queueing Theory](https://learn.significanthobbies.com/curriculum/concepts/queueing-theory)
- [Observability](https://learn.significanthobbies.com/curriculum/concepts/monitoring-analytics)
