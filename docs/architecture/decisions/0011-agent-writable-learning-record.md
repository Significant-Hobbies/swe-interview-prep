# ADR 0011: Agent-writable learning record over a native MCP server

Date: 2026-11
Status: Accepted

## Context

The ChatGPT connection was read-only: the SaaS Maker gateway adapted four
`GET /api/mcp/*` projections and the public catalogs, and nothing an external
assistant learned about the learner could be stored. The owner now wants
ChatGPT to act as teacher, assessor and course designer, with SWE Interview
Prep as the durable record of what the learner knows, wants to learn, has
learned and should explore next — including learning from articles, papers
and other resources outside the curriculum.

The earlier contract also said conversation could never change progress.
That rule protected product FSRS mastery from unsupported claims; it did not
anticipate structured, attributed assessment evidence.

## Decision

1. **Native MCP server in the product.** `POST /api/mcp` speaks stateless
   Streamable HTTP JSON-RPC (`shared/learning-record/mcp-server.mjs`). The
   gateway route switches from an adapter to a native proxy with a per-tool
   scope allowlist (the Anchor pattern). The product still re-verifies the
   Auth0 token, maps the Google subject to `users.google_id` and enforces the
   owner check.
2. **Two scopes.** Every tool needs `swe-interview-prep.read`. Mutations also
   need `swe-interview-prep.write` in the delegated `scope` claim, checked by
   both the gateway and the product.
3. **A separate, additive record.** Migration `0004_adaptive_learning.sql`
   adds learner profiles, knowledge states, courses, sessions, resources,
   assessments, curriculum gaps, priority overrides and mutation receipts.
   No existing table changes.
4. **Evidence, not activity, moves knowledge.** Only `submit_assessment`
   changes an assessed level. Self-assessment is stored as self-reported.
   Completing a session or lesson, or reading a resource, records exposure
   and interest only. A subject with no assessed evidence is "unassessed",
   never beginner. Knowledge state is replayable from assessments, so a
   deleted assessment is recomputed rather than left stale.
5. **Product FSRS mastery is unchanged.** `concept_mastery` stays owned by
   in-product reviews and explain-backs. The adaptive recommender reads both
   signals.
6. **Courses are learner-specific; the curriculum stays global.** Courses
   reference curriculum concept ids and may carry free-text topics where the
   curriculum is thin. Gaps are recorded with a validated `concepts.json`
   entry so an agent with GitHub access can open a PR; learning never waits
   for that PR.
7. **Safe retries.** Create-style mutations require an `idempotencyKey`;
   created ids derive from it, and receipts replay the original response.
   Resources deduplicate by canonical URL.

## Alternatives considered

- **Keep the adapter and add write operations to it.** The adapter maps tools
  to fixed `GET` paths; writes would need a second, parallel contract in
  another repository for every tool.
- **Write agent claims straight into FSRS mastery.** Mixes two evidence models
  and lets one ambiguous conversation reschedule product reviews.
- **Have the product open curriculum PRs itself.** Requires a GitHub token in
  the product and duplicates what the agent's GitHub connector already does.

## Consequences

- The old `GET /api/mcp/*` endpoints remain for compatibility; the native
  server supersedes them for the ChatGPT connection.
- ADR 0005 still binds the in-product companion. The MCP tools continue to
  withhold stored review answers, expected outputs and reference solutions.
- The Auth0 API must define `swe-interview-prep.write`, and the gateway must
  be deployed with the native route before write tools work in production.
- `/record` gives the learner a read-only view; it is never required.
