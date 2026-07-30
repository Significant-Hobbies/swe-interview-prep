# Payments

Idempotency, sagas, double-entry.

- Difficulty: core
- Tracks: Backend

## Mental model

Payment systems are several systems agreeing about money: the card network, the processor, your database, and accounting. Treat every state change like a ledger entry, use idempotency keys on every request, and reconcile against the processor daily.



## Primary sources

- [Stripe Payments documentation](https://docs.stripe.com/payments) (doc)

## Practice

### Idempotent charge

Double-click Pay sends two POST /charge with same Idempotency-Key. How many charges?

**Expected evidence:** One charge; second returns same receipt.

## Review prompts

- The charge succeeded at the processor but your service crashed before writing the row. What mechanism recovers this, and why is a retry not enough?


## Prerequisites

- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)
- [Replication](https://learn.significanthobbies.com/curriculum/concepts/replication.html)

## Related concepts

- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)

## Learning paths

- No roadmap is assigned yet.
