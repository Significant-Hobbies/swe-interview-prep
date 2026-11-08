# Idempotent charge

> Double-click Pay sends two POST /charge with same Idempotency-Key. How many charges?

Canonical: https://learn.significanthobbies.com/curriculum/drills/payment-idempotency

Double-click Pay sends two POST /charge with same Idempotency-Key. How many charges?

## The mechanism

Payment systems are several systems agreeing about money: the card network, the processor, your database, and accounting. Treat every state change like a ledger entry, use idempotency keys on every request, and reconcile against the processor daily.

## Expected evidence

One charge; second returns same receipt.

## Hints

- Store key → result mapping 24h.
- Network retries are normal.

## Sources and practice

- [Stripe Payments documentation](https://docs.stripe.com/payments)
- [Study Payments](https://learn.significanthobbies.com/curriculum/concepts/ecommerce-payments)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/payment-idempotency)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
