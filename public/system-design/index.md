# System design interview questions you can actually practice

Move beyond prompt lists. Every case covers scoping, capacity estimation, high-level design,
a critical-path deep dive, failure injection, and evidence-backed review. Reference answers stay
hidden during closed-book practice.

## AI systems

### Design LLM inference at 10K RPS

Design a production LLM inference service that sustains 10,000 requests per second. Explain how you turn that headline into capacity, architecture, overload, and reliability decisions.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=llm-inference-10k-rps&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/llm-inference-10k-rps)

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
- [Read the worked guide](https://learn.significanthobbies.com/system-design/notification-delivery-service)

### Design a proximity search service

Design a service that returns open businesses within a radius, filtered by category and ranked by distance, for a global consumer application.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=proximity-search-service&from=guide)

### Design a nearby friends service

Design an opt-in feature that shows which friends are nearby and updates within seconds as people move, while making privacy and battery cost first-class constraints.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=nearby-friends-service&from=guide)

### Design a real-time gaming leaderboard

Design a leaderboard for a global game with seasonal, regional, and friends-only rankings, real-time score updates, anti-cheat review, and stable end-of-season results.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=gaming-leaderboard&from=guide)

## Media and collaboration

### Design a video streaming platform

Design an on-demand video platform for creator uploads and global playback. Focus on the reusable upload, transcode, package, authorize, and CDN-delivery pattern rather than recommendations.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=video-streaming-platform&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/video-streaming-platform)

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
- [Read the worked guide](https://learn.significanthobbies.com/system-design/web-crawler)

### Design a distributed cache

Design a low-latency distributed cache with partitioning, replication, TTL, eviction, invalidation, node failure, hot keys, and stampede protection.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-cache&from=guide)

### Design search autocomplete

Design typeahead suggestions for a large search product with prefix lookup, ranking, trends, personalization, freshness, moderation, and low latency.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=search-autocomplete&from=guide)

### Design cloud file storage

Design Dropbox or Google Drive-style file synchronization with resumable uploads, folders, sharing, versions, offline conflicts, durability, and efficient transfer.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=cloud-file-storage&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/cloud-file-storage)

### Design a distributed key-value store

Design a Dynamo-style distributed key-value store with partitioning, replication, tunable consistency, durability, rebalancing, repair, and compaction.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-key-value-store&from=guide)

### Design a distributed unique ID generator

Design a service that issues globally unique, roughly time-sortable 64-bit IDs to thousands of application servers across regions without a database round trip per ID.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-unique-id-generator&from=guide)

### Design a maps and routing platform

Design a driving-directions service that returns routes and ETAs across a continent, incorporates live traffic, and can serve map tiles separately from route computation.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=maps-routing-platform&from=guide)

### Design a distributed message queue

Design a multi-tenant distributed queue for asynchronous jobs and event streams with durable retention, consumer groups, backpressure, and at-least-once delivery.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-message-queue&from=guide)

### Design a metrics monitoring platform

Design a multi-tenant metrics platform that ingests counters, gauges, and histograms, supports dashboard queries and recording rules, and evaluates reliable alerts.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=metrics-monitoring-platform&from=guide)

### Design a distributed email service

Design a transactional email platform that accepts API requests, renders templates, delivers through SMTP, handles retries and bounces, and protects sender reputation.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=distributed-email-service&from=guide)

### Design an object storage service

Design an S3-like object storage service with buckets, immutable object versions, multipart uploads, ranged reads, checksums, lifecycle policies, and regional durability.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=object-storage-service&from=guide)

## Commerce and marketplaces

### Design a ride-sharing platform

Design an Uber or Lyft-style marketplace with driver locations, nearby matching, dispatch offers, atomic trip assignment, live trip state, ETA, and regional spikes.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=ride-sharing-platform&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/ride-sharing-platform)

### Design a ticket-booking platform

Design Ticketmaster-style reserved-seat booking with event browse, a virtual waiting room, expiring holds, payments, oversell prevention, bots, and flash crowds.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=ticket-booking-platform&from=guide)
- [Read the worked guide](https://learn.significanthobbies.com/system-design/ticket-booking-platform)

### Design a payment-processing system

Design a payment system with authorization, capture, refunds, idempotency, webhooks, an auditable ledger, processor timeouts, reconciliation, and fraud controls.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=payment-processing-system&from=guide)

### Design an ad click aggregation system

Design an ad click pipeline that powers near-real-time campaign dashboards and produces auditable daily billing aggregates despite duplicates, retries, bots, and late events.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=ad-click-aggregation-system&from=guide)

### Design a hotel reservation system

Design a hotel booking platform that searches room availability and prevents overselling across multi-night stays, retries, payment delays, and expiring holds.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=hotel-reservation-system&from=guide)

### Design a digital wallet

Design a digital wallet that supports deposits, peer-to-peer transfers, merchant payments, refunds, and withdrawals while maintaining auditable balances across retries and external settlement.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=digital-wallet-system&from=guide)

### Design a stock exchange

Design the core of a stock exchange that accepts limit and market orders, matches by price-time priority, publishes market data, and recovers without reordering or duplicating trades.

- [Start closed-book practice](https://learn.significanthobbies.com/mock?prompt=stock-exchange&from=guide)

## How scoring works

The fixed case rubric scores requirements, capacity, architecture, critical-path judgment, and
reliability separately. Missed dimensions link to targeted concepts and drills. Practice-only cases
do not emit placeholder public guides.
