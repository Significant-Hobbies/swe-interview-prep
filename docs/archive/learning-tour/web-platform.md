# Web Platform Deep Cuts Track

Projects where the interesting learning is in the browser platform itself or
in the CF Workers / Pages platform pushed past its defaults — 3D physics in the
browser, vector search on the edge, MV3 extensions, geospatial LOD, autonomous
agent runtimes.

---

## ai-game

**What:** Browser 3D dungeon-crawler using React Three Fiber + Rapier physics,
with AI-driven NPC behavior running on CF Workers.

**Why it's interesting:** The Phaser-to-R3F migration retro documents a full
rewrite decision — the original Phaser.js choice and why R3F + Rapier ended up
being the right 3D-first stack. The web3d-architecture doc is the fleet's
most detailed treatment of Three.js scene graph management, Rapier rigid-body
colliders, and React reconciler integration for WebGL.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../ai-game/docs/decisions.md) | R3F vs Three.js raw, physics engine choice, NPC AI architecture |
| [lessons.md](../../../ai-game/docs/lessons.md) | 3D web performance lessons, R3F gotchas |
| [learning/external-references.md](../../../ai-game/docs/learning/external-references.md) | R3F, Rapier, drei references |
| [web3d-architecture.md](../../../ai-game/docs/web3d-architecture.md) | Deep-dive on 3D architecture |
| [retros/2026-05-21-phaser-to-r3f.md](../../../ai-game/docs/retros/2026-05-21-phaser-to-r3f.md) | Phaser → R3F rewrite retro |
| [retros/2026-06-12-single-to-cf-worker.md](../../../ai-game/docs/retros/2026-06-12-single-to-cf-worker.md) | Monolith → CF Worker split retro |

---

## starboard

**What:** Social bookmarking with semantic search, storing embeddings as
`F32_BLOB` in Turso (libSQL) and running similarity search on CF Workers AI.

**Why it's interesting:** Turso's `F32_BLOB` column type for storing raw
embedding vectors is not a commonly documented pattern — the decisions doc is the
canonical fleet reference for doing vector search without a dedicated vector DB.
The Vercel-to-Cloudflare migration retro explains the latency and cold-start
profile differences between the two platforms at the edge.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../starboard/docs/decisions.md) | F32_BLOB embedding storage, CF Workers AI embedding model choice |
| [lessons.md](../../../starboard/docs/lessons.md) | Edge vector search lessons |
| [learning/external-references.md](../../../starboard/docs/learning/external-references.md) | Turso, libSQL, CF Workers AI references |
| [retros/2026-04-25-vercel-to-cloudflare.md](../../../starboard/docs/retros/2026-04-25-vercel-to-cloudflare.md) | Vercel → Cloudflare migration retro |

---

## reader

**What:** Read-later app with a MV3 Chrome extension for saving pages and an
OpenNext-patched Next.js frontend.

**Why it's interesting:** The OpenNext patches expose exactly where the
Next.js App Router makes assumptions that break on non-Vercel edge runtimes —
a useful map of Next.js portability limits. The MV3 extension adds a genuine
browser extension layer to the fleet, including the service worker lifecycle and
content script isolation constraints.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../reader/docs/decisions.md) | OpenNext patch strategy, MV3 architecture choices |
| [lessons.md](../../../reader/docs/lessons.md) | OpenNext porting lessons, MV3 service worker lifecycle |
| [learning/external-references.md](../../../reader/docs/learning/external-references.md) | OpenNext, MV3 spec references |
| [retros/2026-04-25-firebase-to-cloudflare.md](../../../reader/docs/retros/2026-04-25-firebase-to-cloudflare.md) | Firebase → Cloudflare migration retro |

---

## open-historia

**What:** Interactive historical map using MapLibre GL JS with AI-as-engine for
place and event generation, rendering at multiple levels of detail.

**Why it's interesting:** MapLibre LOD rendering — loading vector tiles at the
right zoom level and blending AI-generated overlays — is a browser rendering
pattern the fleet doesn't cover anywhere else. The AI-as-engine design (the AI
generates the map content, not just annotations) is an interesting product
architecture question.

### Docs

open-historia's docs directory contains only a project context file — the
standard `decisions.md` / `lessons.md` convention has not been established yet.

| Doc | Purpose |
|-----|---------|
| [PROJECT_RECOMMENDATION_CONTEXT.md](../../../open-historia/docs/PROJECT_RECOMMENDATION_CONTEXT.md) | Project overview and context |

---

## saas-maker

**What:** Autonomous SaaS scaffolding agent — Droid — that runs inside CF
Containers, uses Durable Objects for orchestration state, and can self-modify
code within guardrails.

**Why it's interesting:** The most complex DO + Containers architecture in the
fleet. The `droid.md` and `symphony.md` docs capture the autonomous agent loop
design: how Droid receives tasks, checks out work, runs tools in a CF Container,
and reports back via DO state transitions. This is the fleet's closest analog to
a production agent runtime.

### Docs

| Doc | Purpose |
|-----|---------|
| [droid.md](../../../saas-maker/docs/droid.md) | Droid agent architecture and operational model |
| [symphony.md](../../../saas-maker/docs/symphony.md) | Symphony orchestration layer |
| [droid-roadmap.md](../../../saas-maker/docs/droid-roadmap.md) | Droid capability roadmap |
| [always-on-automation-setup.md](../../../saas-maker/docs/always-on-automation-setup.md) | Always-on automation setup runbook |

Note: saas-maker does not follow the standard `decisions.md` / `lessons.md` /
`retros/` convention — it has product-architecture docs instead.

---

## Cross-track connections

- The CF Durable Objects pattern in saas-maker and ai-game builds directly on
  the first-principles treatment in free-ai on the [systems track](systems-track.md).
- Turso (libSQL) is also the database in this project (`swe-interview-prep`) and
  in high-signal on the [ML track](ml-track.md) — starboard's vector search
  decisions are the deepest treatment of Turso's non-standard column types.
- The MapLibre LOD work in open-historia and the WebGL scene management in
  ai-game are the two browser rendering deep dives in the fleet.
