# Idempotent POST retry

> POST returns 503 after 30s. Client retries. Safe without Idempotency-Key? When is 409 vs 200 on duplicate?

Canonical: https://learn.significanthobbies.com/curriculum/drills/http-idempotent-retry

POST returns 503 after 30s. Client retries. Safe without Idempotency-Key? When is 409 vs 200 on duplicate?

## The mechanism

An HTTP request is a journey: resolve DNS, open a TCP connection, negotiate TLS, send the request, the server routes and responds, the connection is reused or closed. Latency and failures hide in each hop.

## Expected evidence

Unsafe without key; Idempotency-Key makes retry safe; duplicate returns cached 200.

## Hints

- 503 may mean server processed request.
- GET is safe; POST is not.

## Sources and practice

- [MDN — An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [Study HTTP Lifecycle](https://learn.significanthobbies.com/curriculum/concepts/http-lifecycle)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/http-idempotent-retry)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
