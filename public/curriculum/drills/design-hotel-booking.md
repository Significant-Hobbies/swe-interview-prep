# Hotel booking system

> Design a hotel-room booking system: search availability for a date range, hold a room during checkout, finalize the reservation. Address concurrent bookers fighting for the last room.

Canonical: https://learn.significanthobbies.com/curriculum/drills/design-hotel-booking

Design a hotel-room booking system: search availability for a date range, hold a room during checkout, finalize the reservation. Address concurrent bookers fighting for the last room.

## The mechanism

Booking systems are about "holds" — a reservation is itself a write that blocks other people. Pick aggressive hold expirations, treat overbooking as a business policy (not a bug), and choose optimistic vs pessimistic locking based on how often collisions actually happen.

## Expected evidence

Inventory model + hold/confirm flow + the consistency strategy (optimistic vs pessimistic).

## Hints

- A hold is itself a write — model it.
- Expire holds aggressively (5-10 min).

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Shopify — Scaling inventory reservations](https://shopify.engineering/scaling-inventory-reservations)
- [Optimistic Offline Lock (Fowler, PoEAA catalog)](https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html)
- [PostgreSQL — Explicit Locking (SELECT FOR UPDATE)](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Study Booking & Inventory](https://learn.significanthobbies.com/curriculum/concepts/booking-inventory)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/design-hotel-booking)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
