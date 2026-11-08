# Implement idempotency keys

> Add idempotency-key handling to a mutating endpoint: first request executes and stores the result; duplicates replay the stored result.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-idempotency-key

Add idempotency-key handling to a mutating endpoint: first request executes and stores the result; duplicates replay the stored result.

## The mechanism

Networks make retries inevitable, and retrying a POST can charge a card twice. An idempotency key lets the client say 'this is the same operation' — the server stores the first result and replays it for duplicates.

## Expected evidence

Two identical requests with the same key cause one effect.

## Hints

- Store key → result with an expiry.
- Guard against two concurrent requests with the same key.

## Sources and practice

- [Stripe — Designing robust APIs with idempotency](https://stripe.com/blog/idempotency)
- [Study Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-idempotency-key)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
