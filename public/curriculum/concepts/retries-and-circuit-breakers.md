# Retries & Circuit Breakers

Backoff, jitter, budgets, and breakers — retrying without turning a blip into an outage.

- Difficulty: core
- Tracks: Backend

## Mental model

A naive retry is a load multiplier aimed at a service that is already struggling, and synchronised clients retrying on the same schedule produce a thundering herd. Exponential backoff spreads them in time and jitter breaks the synchronisation; a retry budget caps the amplification. A circuit breaker is the admission that retrying is now pointless: after enough failures it fails fast, gives the dependency room to recover, then lets a trial request through. Retries are only safe at all if the operation is idempotent.

## Where it matters

The difference between a dependency blip and a cascading outage, and the first thing a postmortem examines.

## Common mistakes

- Retrying non-idempotent writes, so a timeout becomes a double charge
- Backoff without jitter, which keeps every client synchronised and reproduces the herd
- Retrying at several layers at once — three layers of three retries is twenty-seven requests
- Retrying a 4xx: the request is wrong, and repeating it will not make it right

## Primary sources

- [Timeouts, retries and backoff with jitter (AWS)](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) (doc)

## Practice

### Exponential backoff with full jitter

Implement backoffDelays(attempts, baseMs, capMs, rand) returning the delay for each attempt using capped exponential backoff with FULL jitter: delay = rand() * min(capMs, baseMs * 2^attempt), floored to an integer. `rand` is a supplied function returning [0,1) so the result is deterministic under test. Attempt numbering starts at 0.

**Expected evidence:** backoffDelays(4, 100, 1000, () => 1) -> [100, 200, 400, 800]

## Review prompts

- A dependency slows down, clients retry three times at each of three layers, and the outage gets worse. Trace the amplification and name the two mechanisms that stop it.


## Prerequisites

- [Idempotency](https://learn.significanthobbies.com/curriculum/concepts/idempotency.html)

## Related concepts

- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html)
- [Retries & DLQ](https://learn.significanthobbies.com/curriculum/concepts/retries-dlq.html)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html)
