# Verify webhook HMAC

> Body b, secret s, header HMAC-SHA256(s,b). Constant-time compare. Why reject if timestamp >5m old?

Canonical: https://learn.significanthobbies.com/curriculum/drills/webhook-signature-verify

Body b, secret s, header HMAC-SHA256(s,b). Constant-time compare. Why reject if timestamp >5m old?

## The mechanism

A webhook is the provider calling your server when something happens, instead of your server polling them. Three rules: verify the signature so you trust the sender, return 200 fast and queue the actual work, and assume the same event may be delivered more than once.

## Expected evidence

Prevents replay; timing-safe compare prevents forgery leaks.

## Hints

- Sign raw body bytes.
- Include timestamp in signed payload.

## Sources and practice

- [Stripe — Webhooks](https://docs.stripe.com/webhooks)
- [Study Webhooks](https://learn.significanthobbies.com/curriculum/concepts/webhooks)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/webhook-signature-verify)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
