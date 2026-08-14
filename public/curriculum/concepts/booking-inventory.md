# Booking & Inventory

Reservation, hold-confirm, optimistic locking.

- Difficulty: advanced
- Tracks: System Design

## Mental model

Booking systems are about "holds" — a reservation is itself a write that blocks other people. Pick aggressive hold expirations, treat overbooking as a business policy (not a bug), and choose optimistic vs pessimistic locking based on how often collisions actually happen.



## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [Shopify — Scaling inventory reservations](https://shopify.engineering/scaling-inventory-reservations) (article)
- [Optimistic Offline Lock (Fowler, PoEAA catalog)](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html) (doc)
- [PostgreSQL — Explicit Locking (SELECT FOR UPDATE)](https://www.postgresql.org/docs/current/explicit-locking.html) (doc)

## Practice

### Hotel booking system

Design a hotel-room booking system: search availability for a date range, hold a room during checkout, finalize the reservation. Address concurrent bookers fighting for the last room.

**Expected evidence:** Inventory model + hold/confirm flow + the consistency strategy (optimistic vs pessimistic).

## Review prompts

- When should a booking flow take a pessimistic lock instead of an optimistic version check?


## Prerequisites

- [State Machines](https://learn.significanthobbies.com/curriculum/concepts/state-management)
- [Concurrency Design](https://learn.significanthobbies.com/curriculum/concepts/concurrency-design)

## Related concepts

- None assigned.

## Learning paths

- [LLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/lld-practice)
