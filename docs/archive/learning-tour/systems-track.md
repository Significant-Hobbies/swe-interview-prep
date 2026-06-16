# Systems / Non-standard Runtimes Track

Projects where the interesting learning lives below the React layer — in the
runtime itself, the OS interface, a compiled language, or a platform-specific
API. Ordered from closest-to-metal to most cloud-native.

---

## port-whisperer

**What:** Rust CLI that watches open ports and network connections via `lsof`,
surfacing process-to-port mappings with low overhead.

**Why it's interesting:** Parsing `lsof` output reliably across macOS and Linux
is a surprisingly non-trivial systems problem — the decisions doc captures the
edge cases. This is the fleet's only pure Rust CLI, making the lessons doc a
concise reference for Rust CLI idioms (clap, serde, error handling) applied to a
real problem.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../port-whisperer/docs/decisions.md) | Rust CLI architecture, lsof parsing strategy, cross-platform concerns |
| [lessons.md](../../../port-whisperer/docs/lessons.md) | Rust CLI lessons |
| [learning/external-references.md](../../../port-whisperer/docs/learning/external-references.md) | Rust references, lsof internals |
| [retros/2026-05-23-stability-phase.md](../../../port-whisperer/docs/retros/2026-05-23-stability-phase.md) | Stability phase retro |

---

## event-forecast

**What:** Event prediction service backed by Rust (Rocket), storing time-series
signals in TimescaleDB.

**Why it's interesting:** Rocket + TimescaleDB is a non-default fleet stack
choice. The decisions doc explains why TimescaleDB's hypertables beat a plain
Postgres table for append-heavy event streams and what the Rocket async model
buys over Actix-web for this workload. The OSS integration evaluation is a
useful reference any time a fleet project considers a time-series backend.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../event-forecast/docs/decisions.md) | Rocket vs Actix, TimescaleDB design decisions |
| [lessons.md](../../../event-forecast/docs/lessons.md) | Rust + Rocket lessons |
| [learning/external-references.md](../../../event-forecast/docs/learning/external-references.md) | TimescaleDB, Rocket docs |
| [oss-integration-evaluation.md](../../../event-forecast/docs/oss-integration-evaluation.md) | Time-series OSS landscape evaluation |

Note: the `docs/retros/` directory exists but is empty as of the tour's last
verification — no retro link added.

---

## pace

**What:** Swift/SwiftUI iOS/macOS app using Apple Foundation Models (on-device
LLM inference) and WhisperKit for local speech recognition.

**Why it's interesting:** Apple Foundation Models and WhisperKit are the fleet's
deepest dive into on-device inference — no cloud round-trip, privacy-preserving,
constrained by ANE availability. The architecture doc captures the SwiftUI
concurrency model (actors, MainActor, structured concurrency) as applied to
streaming LLM output. tinygpt's `docs/learn/ane-research/` subtree is the
complementary reference for the hardware side.

### Docs

| Doc | Purpose |
|-----|---------|
| [architecture.md](../../../pace/docs/architecture.md) | SwiftUI + Foundation Models + WhisperKit architecture |
| [roadmap.md](../../../pace/docs/roadmap.md) | Feature roadmap |

Note: pace does not follow the standard `decisions.md` / `lessons.md` /
`retros/` convention — it has architecture-first docs instead. The tinygpt
handoff doc at
[tinygpt/docs/pace-handoff-2026-06-10.md](../../../tinygpt/docs/pace-handoff-2026-06-10.md)
covers the cross-project integration.

---

## free-ai

**What:** CF Durable Objects-based health-state tracker that routes requests to
free-tier AI endpoints, managing per-provider quota state in a DO.

**Why it's interesting:** Durable Objects as a state machine for quota/rate-limit
tracking is a pattern that shows up across the fleet. The decisions doc is the
most explicit articulation in the fleet of *when* to use a DO versus a KV
namespace versus a database row for mutable state.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../free-ai/docs/decisions.md) | DO vs KV vs DB state design, quota management architecture |
| [lessons.md](../../../free-ai/docs/lessons.md) | CF Durable Objects lessons |
| [cheap-models-guide.md](../../../free-ai/docs/cheap-models-guide.md) | Provider cost/quality matrix |
| [cloudflare-cost-guardrails.md](../../../free-ai/docs/cloudflare-cost-guardrails.md) | CF cost guardrails runbook |
| [free-ai-credits-guide.md](../../../free-ai/docs/free-ai-credits-guide.md) | Free-tier credit guide |

Note: free-ai has no `docs/retros/` directory.

---

## Cross-track connections

- The on-device inference thread (pace + WhisperKit) connects to tinygpt's ANE
  research in [ml-track.md](ml-track.md).
- The CF Durable Objects pattern from free-ai reappears in ai-game and saas-maker
  on the [web-platform track](web-platform.md).
- Go WASM in this project (`swe-interview-prep`) shares the "compile a systems
  language to the browser" insight with the WASM port in tinygpt.
