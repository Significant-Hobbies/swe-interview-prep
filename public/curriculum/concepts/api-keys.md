# API Keys

Issuing, hashing, scoping, and rotating keys for machine clients.

- Difficulty: core
- Tracks: Backend

## Mental model

An API key identifies a machine caller. Store only a hash (like a password), show the secret once, attach scopes, and support rotation — because a leaked key is inevitable.

## Where it matters

Stripe, OpenAI, every developer platform.

## Common mistakes

- Storing API keys in plaintext
- No prefix, so leaked keys are unsearchable in logs
- No rotation or revocation path

## Primary sources

- [OWASP — API Security Top 10 (Broken Auth)](https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/) (doc)
- [Stripe — API key best practices](https://docs.stripe.com/keys) (doc)

## Practice

### Hash and prefix API keys

Generate key sk_live_abc123, store SHA-256 hash only, show prefix sk_live for support lookup. Why never store plaintext?

**Expected evidence:** Leak of DB does not expose usable secrets.

## Review prompts

- How should API keys be stored, and why?

## Build evidence

- **Reusable API key system** — Issue, hash, scope, and rotate API keys for machine clients.

## Prerequisites

- [HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle.html)

## Related concepts

- [Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems.html)
- [Rate Limiting](https://learn.significanthobbies.com/curriculum/concepts/rate-limiting.html)

## Learning paths

- [12-Month Advanced AI Infrastructure](https://learn.significanthobbies.com/curriculum/roadmaps/ai-infra-12-month.html)
