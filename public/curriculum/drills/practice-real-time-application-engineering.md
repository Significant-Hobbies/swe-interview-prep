# Design exercise: Real-time Application Engineering

> WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling. Implement designOutline() returning non-empty values for: connectionLifecycle, ordering, reconciliation. Each value must name a concrete mechanism or decision.

Canonical: https://learn.significanthobbies.com/curriculum/drills/practice-real-time-application-engineering

WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling. Implement designOutline() returning non-empty values for: connectionLifecycle, ordering, reconciliation. Each value must name a concrete mechanism or decision.

## The mechanism

Realtime messaging is two problems wearing one name. On the server it is long-lived connections plus fan-out: WebSockets are stateful, which constrains your load balancer, and choosing per-channel versus per-user fan-out is the central design decision. On the client it is maintaining a local projection of remote state that survives disconnects and reordering — so the protocol needs message identity, a sequence number, a reconnect-and-catch-up path, and a reconciliation rule for optimistic updates the server later rejects.

## Expected evidence

A design outline with connectionLifecycle, ordering, reconciliation plus an explicit failure mode or trade-off.

## Hints

- Name the failure mode before selecting the mechanism.

## Sources and practice

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [MDN — The WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Real-time communication at scale with Elixir at Discord](https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/)
- [Study Real-time Systems](https://learn.significanthobbies.com/curriculum/concepts/messaging-realtime)
- [Try the interactive drill](https://learn.significanthobbies.com/drills/practice-real-time-application-engineering)
- [All practice briefs](https://learn.significanthobbies.com/curriculum/drills/)
