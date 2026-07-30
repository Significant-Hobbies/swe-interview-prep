# Webhooks

Outbound event delivery: signing, retries, idempotent receivers.

- Difficulty: core
- Tracks: Backend

## Mental model

A webhook is the provider calling your server when something happens, instead of your server polling them. Three rules: verify the signature so you trust the sender, return 200 fast and queue the actual work, and assume the same event may be delivered more than once.



## Primary sources

- [Stripe — Webhooks](https://docs.stripe.com/webhooks) (doc)

## Practice

### Verify webhook HMAC

Body b, secret s, header HMAC-SHA256(s,b). Constant-time compare. Why reject if timestamp >5m old?

**Expected evidence:** Prevents replay; timing-safe compare prevents forgery leaks.

## Review prompts

- Why must a webhook receiver return 200 before doing the work, and what does that force on you?


## Prerequisites

- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html)

## Related concepts

- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)

## Learning paths

- No roadmap is assigned yet.
