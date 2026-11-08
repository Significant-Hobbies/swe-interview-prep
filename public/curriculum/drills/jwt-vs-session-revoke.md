# JWT revocation tradeoff

> User logs out. Session store vs JWT blacklist vs short TTL+refresh — pick one for banking app, justify.

Canonical: https://learn.significanthobbies.com/curriculum/drills/jwt-vs-session-revoke

User logs out. Session store vs JWT blacklist vs short TTL+refresh — pick one for banking app, justify.

## The mechanism

Authentication proves who you are; authorization decides what you may do. JWTs are stateless and fast but hard to revoke; sessions are revocable but need a store. Pick per the revocation requirement.

## Expected evidence

Short-lived JWT + refresh rotation or server session for instant revoke.

## Hints

- Stateless JWT cannot revoke without blocklist.
- Sessions need store.

## Sources and practice

- [OAuth 2.0](https://oauth.net/2/)
- [Introduction to JSON Web Tokens](https://jwt.io/introduction)
- [Study Auth Systems](https://learn.significanthobbies.com/curriculum/concepts/auth-systems)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/jwt-vs-session-revoke)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
