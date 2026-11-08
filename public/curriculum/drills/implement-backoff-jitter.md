# Implement backoff with jitter

> Implement exponential backoff with full jitter for a retry loop, and route a message to a DLQ after N failed attempts.

Canonical: https://learn.significanthobbies.com/curriculum/drills/implement-backoff-jitter

Implement exponential backoff with full jitter for a retry loop, and route a message to a DLQ after N failed attempts.

## The mechanism

Retries fix transient failures; backoff with jitter stops a retry storm; a dead-letter queue catches messages that will never succeed so they stop blocking the queue and become debuggable. Scope: this card owns one mechanism, queue-side: poison messages, the dead-letter queue, and getting a stuck consumer moving again. Caller-side backoff, jitter and breakers are `retries-and-circuit-breakers`; the reasoning about ambiguous failure is `distributed-failure-recovery`.

## Expected evidence

Retry delays that grow exponentially and are randomized; poison messages land in a DLQ.

## Hints

- Full jitter: delay = random(0, base·2^attempt).
- Jitter de-syncs many clients retrying at once.

## Sources and practice

- [Timeouts, retries and backoff with jitter (AWS)](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [Study Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/implement-backoff-jitter)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
