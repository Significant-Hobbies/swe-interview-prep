# Real-time Systems

WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.

- Difficulty: core
- Tracks: Distributed Systems, System Design

## Mental model

Realtime messaging is two problems wearing one name. On the server it is long-lived connections plus fan-out: WebSockets are stateful, which constrains your load balancer, and choosing per-channel versus per-user fan-out is the central design decision. On the client it is maintaining a local projection of remote state that survives disconnects and reordering — so the protocol needs message identity, a sequence number, a reconnect-and-catch-up path, and a reconciliation rule for optimistic updates the server later rejects.


## Common mistakes

- Sticky sessions as the only fan-out plan, so one hot channel pins to one node
- No sequence number, leaving the client unable to tell a reconnect gap from an ordering swap
- Optimistic UI with no reconciliation path when the server rejects the write

## Primary sources

- [System Design Primer](https://github.com/donnemartin/system-design-primer) (article)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455) (paper)
- [MDN — The WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (doc)
- [Real-time communication at scale with Elixir at Discord](https://elixir-lang.org/blog/2020/10/08/real-time-communication-at-scale-with-elixir-at-discord/) (article)

## Practice

### Realtime chat system

Design a Slack-like chat: 1:1 + channels, presence, delivery + read receipts, offline message queue. Pick the wire protocol and how messages fan out.

**Expected evidence:** Connection layer + message storage + the fan-out strategy for a 10k-member channel.

### Design exercise: Real-time Application Engineering

WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling. Implement designOutline() returning non-empty values for: connectionLifecycle, ordering, reconciliation. Each value must name a concrete mechanism or decision.

**Expected evidence:** A design outline with connectionLifecycle, ordering, reconciliation plus an explicit failure mode or trade-off.

## Review prompts

- Why do WebSockets constrain your load balancer in ways HTTP requests do not?
- Optimistic UI applies the change locally before the server confirms. What has to be designed for that not to corrupt state?

## Build evidence

- **Synthesize: Distributed Systems** — Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure. Produce one working system, benchmark, or evidence-backed design that integrates the path.
- **Synthesize: Application Engineering** — Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product. Produce one working system, benchmark, or evidence-backed design that integrates the path.

## Prerequisites

- [Message Queues](https://learn.significanthobbies.com/curriculum/concepts/message-queues.html)

## Related concepts

- None assigned.

## Learning paths

- [12-Week Application Engineering](https://learn.significanthobbies.com/curriculum/roadmaps/application-engineering-12w.html)
- [12-Week Distributed Systems](https://learn.significanthobbies.com/curriculum/roadmaps/distributed-systems-12w.html)
- [HLD Practice](https://learn.significanthobbies.com/curriculum/roadmaps/hld-practice.html)
- [The Software Engineering Landscape (2026)](https://learn.significanthobbies.com/curriculum/roadmaps/swe-landscape.html)
