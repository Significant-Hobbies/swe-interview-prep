# Hash and prefix API keys

> Generate key sk_live_abc123, store SHA-256 hash only, show prefix sk_live for support lookup. Why never store plaintext?

Canonical: https://learn.significanthobbies.com/curriculum/drills/hash-api-key

Generate key sk_live_abc123, store SHA-256 hash only, show prefix sk_live for support lookup. Why never store plaintext?

## The mechanism

An API key identifies a machine caller. Store only a hash (like a password), show the secret once, attach scopes, and support rotation — because a leaked key is inevitable.

## Expected evidence

Leak of DB does not expose usable secrets.

## Hints

- Prefix helps support find row.
- Rotate on compromise.

## Sources and practice

- [OWASP — API Security Top 10 (Broken Auth)](https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/)
- [Stripe — API key best practices](https://docs.stripe.com/keys)
- [Study API Keys](https://learn.significanthobbies.com/curriculum/concepts/api-keys)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/hash-api-key)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
