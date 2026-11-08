# Exponential backoff with full jitter

> Implement backoffDelays(attempts, baseMs, capMs, rand) returning the delay for each attempt using capped exponential backoff with FULL jitter: delay = rand() * min(capMs, baseMs * 2^attempt), floored to an integer. `rand` is a supplied function returning [0,1) so the result is deterministic under test. Attempt numbering starts at 0.

Canonical: https://learn.significanthobbies.com/curriculum/drills/backoff-with-jitter

Implement backoffDelays(attempts, baseMs, capMs, rand) returning the delay for each attempt using capped exponential backoff with FULL jitter: delay = rand() * min(capMs, baseMs * 2^attempt), floored to an integer. `rand` is a supplied function returning [0,1) so the result is deterministic under test. Attempt numbering starts at 0.

## The mechanism

A naive retry is a load multiplier aimed at a service that is already struggling, and synchronised clients retrying on the same schedule produce a thundering herd. Exponential backoff spreads them in time and jitter breaks the synchronisation; a retry budget caps the amplification. A circuit breaker is the admission that retrying is now pointless: after enough failures it fails fast, gives the dependency room to recover, then lets a trial request through. Retries are only safe at all if the operation is idempotent.

## Expected evidence

backoffDelays(4, 100, 1000, () => 1) -> [100, 200, 400, 800]

## Hints

- Cap the exponential FIRST, then apply jitter to the capped value — the other order defeats the cap.
- Full jitter means the delay is uniform in [0, ceiling), not ceiling ± a wobble.

## Sources and practice

- [Timeouts, retries and backoff with jitter (AWS)](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [Study Retries & Circuit Breakers](https://learn.significanthobbies.com/curriculum/concepts/retries-and-circuit-breakers)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/backoff-with-jitter)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
