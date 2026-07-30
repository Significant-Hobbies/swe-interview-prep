# Auth Systems

OAuth2, JWT, session, RBAC.

- Difficulty: core
- Tracks: Backend

## Mental model

Authentication proves who you are; authorization decides what you may do. JWTs are stateless and fast but hard to revoke; sessions are revocable but need a store. Pick per the revocation requirement.

## Where it matters

OAuth2/OIDC, every multi-user product.

## Common mistakes

- Confusing authentication with authorization
- Long-lived JWTs with no revocation strategy
- Trusting client-supplied roles

## Primary sources

- [OAuth 2.0](https://oauth.net/2/) (doc)
- [Introduction to JSON Web Tokens](https://jwt.io/introduction) (doc)

## Practice

### JWT revocation tradeoff

User logs out. Session store vs JWT blacklist vs short TTL+refresh — pick one for banking app, justify.

**Expected evidence:** Short-lived JWT + refresh rotation or server session for instant revoke.

## Review prompts

- What is the core tradeoff between JWTs and server sessions?

## Build evidence

- **Reusable API key system** — Issue, hash, scope, and rotate API keys for machine clients.

## Prerequisites

- [API Design](https://learn.significanthobbies.com/curriculum/concepts/api-design.html)

## Related concepts

- [API Keys](https://learn.significanthobbies.com/curriculum/concepts/api-keys.html)

## Learning paths

- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w.html)
