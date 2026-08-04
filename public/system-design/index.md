# System design interview questions you can actually practice

Move beyond prompt lists. Every case covers scoping, capacity estimation, high-level design,
a critical-path deep dive, failure injection, and evidence-backed review. Reference answers stay
hidden during closed-book practice.

## AI systems

### Design LLM inference at 10K RPS

Design a production LLM inference service that sustains 10,000 requests per second. Explain how you turn that headline into capacity, architecture, overload, and reliability decisions.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=llm-inference-10k-rps&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/llm-inference-10k-rps.html)

### Design production RAG

Design retrieval-augmented generation over a large, frequently changing document corpus with permissions and citations.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=production-rag&from=guide)

### Design a multi-tenant LLM gateway

Design an API gateway in front of multiple LLM models and providers for thousands of tenants.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=multi-tenant-llm-gateway&from=guide)

### Design real-time recommendations

Design a real-time recommendation service for a large consumer application.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=real-time-recommendations&from=guide)

## Social and real-time

### Design real-time chat

Design real-time one-to-one and group chat for 50 million daily active users.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=real-time-chat&from=guide)

### Design a ranked news feed

Design a ranked home feed for 100 million users with celebrity accounts, freshness, and moderation.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=ranked-news-feed&from=guide)

### Design a photo-sharing platform

Design an Instagram-like photo-sharing service with uploads, transformations, privacy, feeds, likes, and safe deletion. Focus on media and social-delivery boundaries.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=photo-sharing-platform&from=guide)

### Design a notification delivery service

Design push, email, SMS, and in-app notification delivery with user preferences, priorities, quotas, retries, provider failure, and duplicate control.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=notification-delivery-service&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/notification-delivery-service.html)

## Media and collaboration

### Design a video streaming platform

Design an on-demand video platform for creator uploads and global playback. Focus on the reusable upload, transcode, package, authorize, and CDN-delivery pattern rather than recommendations.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=video-streaming-platform&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/video-streaming-platform.html)

### Design a collaborative document editor

Design a Google Docs-like editor with real-time multi-user edits, offline work, presence, history, permissions, and deterministic convergence.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=collaborative-document-editor&from=guide)

## Infrastructure and storage

### Design a URL shortener

Design a global URL-shortening service with custom aliases, analytics, expiration, and abuse controls.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=url-shortener&from=guide)

### Design a distributed rate limiter

Design a global, multi-tenant rate limiter for an API gateway with burst allowances and regional enforcement.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-rate-limiter&from=guide)

### Design a web crawler

Design a web-scale crawler that discovers, fetches, deduplicates, stores, and recrawls useful pages while obeying robots policy and host politeness.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=web-crawler&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/web-crawler.html)

### Design a distributed cache

Design a low-latency distributed cache with partitioning, replication, TTL, eviction, invalidation, node failure, hot keys, and stampede protection.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-cache&from=guide)

### Design search autocomplete

Design typeahead suggestions for a large search product with prefix lookup, ranking, trends, personalization, freshness, moderation, and low latency.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=search-autocomplete&from=guide)

### Design cloud file storage

Design Dropbox or Google Drive-style file synchronization with resumable uploads, folders, sharing, versions, offline conflicts, durability, and efficient transfer.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=cloud-file-storage&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/cloud-file-storage.html)

### Design a distributed key-value store

Design a Dynamo-style distributed key-value store with partitioning, replication, tunable consistency, durability, rebalancing, repair, and compaction.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-key-value-store&from=guide)

## Commerce and marketplaces

### Design a ride-sharing platform

Design an Uber or Lyft-style marketplace with driver locations, nearby matching, dispatch offers, atomic trip assignment, live trip state, ETA, and regional spikes.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=ride-sharing-platform&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/ride-sharing-platform.html)

### Design a ticket-booking platform

Design Ticketmaster-style reserved-seat booking with event browse, a virtual waiting room, expiring holds, payments, oversell prevention, bots, and flash crowds.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=ticket-booking-platform&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/ticket-booking-platform.html)

### Design a payment-processing system

Design a payment system with authorization, capture, refunds, idempotency, webhooks, an auditable ledger, processor timeouts, reconciliation, and fraud controls.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=payment-processing-system&from=guide)

## How scoring works

The fixed case rubric scores requirements, capacity, architecture, critical-path judgment, and
reliability separately. Missed dimensions link to targeted concepts and drills. Practice-only cases
do not emit placeholder public guides.
