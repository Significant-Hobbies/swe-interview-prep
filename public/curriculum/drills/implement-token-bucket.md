# Implement a token-bucket rate limiter

> Implement a token bucket: tokens refill at a fixed rate, each request spends one, an empty bucket returns 429 with Retry-After.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-token-bucket

Implement a token bucket: tokens refill at a fixed rate, each request spends one, an empty bucket returns 429 with Retry-After.

## The mechanism

Rate limiting protects a shared resource from any one caller. Token bucket is the workhorse: tokens refill at a steady rate, each request spends one, an empty bucket means 429 — allowing bursts up to the bucket size.

## Expected evidence

Allows bursts up to bucket size, then throttles to the refill rate.

## Hints

- Compute refill lazily from elapsed time.
- Set Retry-After from time-to-next-token.

## Sources and practice

- [429 Too Many Requests (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429)
- [Study Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-token-bucket)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
