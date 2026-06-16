# ML / AI Internals Track

Projects where the interesting learning is *inside* the model or the inference
stack — not just "call an API". Ordered from deepest (build it yourself) to
shallower (route and consume).

---

## tinygpt (anchor)

**What:** Browser-capable tiny GPT trained from scratch in Python then ported to
WASM + WebGPU, with LoRA fine-tuning on the same base model.

**Why it's interesting:** This is the only fleet project where you own every
byte from the dataset through the forward pass. BPE tokenizer, softmax in
attention, LoRA weight decomposition, and gradient checkpointing all have live
code you can break and fix. Nothing else in the fleet teaches model mechanics at
this depth.

### Docs

| Doc | Purpose |
|-----|---------|
| [learn/README.md](../../../tinygpt/docs/learn/README.md) | Tour entry point for the learn/ subtree |
| [learn/curriculum.md](../../../tinygpt/docs/learn/curriculum.md) | 8-session structured curriculum |
| [learn/external-references.md](../../../tinygpt/docs/learn/external-references.md) | Curated papers + canonical sources (Karpathy, Annotated Transformer, etc.) |
| [study_guide.md](../../../tinygpt/docs/study_guide.md) | Concept-by-concept study guide keyed to the app's FSRS deck |
| [decision_log.md](../../../tinygpt/docs/decision_log.md) | Architectural decisions (WASM vs WebGPU, MLX vs PyTorch, LoRA rank choices) |
| [lessons.md](../../../tinygpt/docs/lessons.md) | Hard-won lessons from the build |
| [RETROSPECTIVE.md](../../../tinygpt/docs/RETROSPECTIVE.md) | Full retrospective |

The `learn/` subtree also has per-session deep dives:
`session-01-neural-net-basics.md` through `session-08-training-mechanics.md`,
plus specialist files on LLM mechanics fundamentals, ANE research, and eval
methodology.

---

## researchPapers

**What:** Pipeline that ingests ML/AI papers (arXiv, PDF), extracts structured
knowledge, and stores it for search and review.

**Why it's interesting:** The storage migration from Postgres to ClickHouse
(logged in the retro) is a real lesson in columnar vs row-oriented tradeoffs for
append-heavy workloads. The ingestion pipeline also exercises CF Workers AI at
the embedding layer.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../researchPapers/docs/decisions.md) | Schema choices, embedding strategy, storage backend |
| [lessons.md](../../../researchPapers/docs/lessons.md) | Lessons from ingestion pipeline |
| [learning/external-references.md](../../../researchPapers/docs/learning/external-references.md) | External references |
| [retros/2026-05-30-postgres-to-clickhouse.md](../../../researchPapers/docs/retros/2026-05-30-postgres-to-clickhouse.md) | Postgres → ClickHouse migration retro |
| [retros/2026-06-13-ram-aware-pipeline.md](../../../researchPapers/docs/retros/2026-06-13-ram-aware-pipeline.md) | RAM-aware pipeline design retro |

---

## high-signal

**What:** Curated signal aggregator — ingests feeds, ranks by quality, serves a
daily brief.

**Why it's interesting:** The ranking layer uses multi-LLM scoring in parallel
(Anthropic, Gemini) with a merging step, making it a live testbed for
prompt-engineering tradeoffs across providers. The data-service boundary doc
captures a non-obvious architectural constraint that applies to any fleet project
with a hybrid CF Workers + Turso setup.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../high-signal/docs/decisions.md) | LLM provider choices, ranking architecture, data boundaries |
| [lessons.md](../../../high-signal/docs/lessons.md) | Lessons on multi-LLM orchestration |
| [learning/external-references.md](../../../high-signal/docs/learning/external-references.md) | External references |
| [retros/2026-05-25-daily-brief-reframe.md](../../../high-signal/docs/retros/2026-05-25-daily-brief-reframe.md) | Product scope retro |
| [retros/2026-04-25-lab-phase-1.md](../../../high-signal/docs/retros/2026-04-25-lab-phase-1.md) | Lab phase 1 retro |

---

## looptv

**What:** AI-curated video loop that picks and sequences content based on topic
and mood signals.

**Why it's interesting:** The Workers-to-Pages migration retro contains a clear
account of why CF Pages Functions are the wrong tool for long-running streaming
AI responses — a constraint that affects every fleet project using streaming
completions.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../looptv/docs/decisions.md) | Architecture decisions, streaming approach |
| [lessons.md](../../../looptv/docs/lessons.md) | Lessons on CF streaming constraints |
| [learning/external-references.md](../../../looptv/docs/learning/external-references.md) | External references |
| [retros/2026-04-28-workers-to-pages.md](../../../looptv/docs/retros/2026-04-28-workers-to-pages.md) | Workers → Pages retro (the streaming constraint lesson) |

---

## email-manager

**What:** AI-assisted email triage and drafting layer on top of Gmail.

**Why it's interesting:** Exercises function-calling / tool-use patterns
extensively — the AI classifies, routes, and drafts in a single prompt chain.
The performance retro documents latency budgets for interactive AI features that
apply across the fleet.

### Docs

| Doc | Purpose |
|-----|---------|
| [decisions.md](../../../email-manager/docs/decisions.md) | Tool-use schema design, provider selection |
| [lessons.md](../../../email-manager/docs/lessons.md) | Lessons on prompt chain latency |
| [learning/external-references.md](../../../email-manager/docs/learning/external-references.md) | External references |
| [retros/2026-06-04-performance-and-landing-rework.md](../../../email-manager/docs/retros/2026-06-04-performance-and-landing-rework.md) | Performance rework retro |
| [retros/2026-04-25-cf-workers-migration.md](../../../email-manager/docs/retros/2026-04-25-cf-workers-migration.md) | CF Workers migration retro |

---

## Cross-track connection

The FSRS deck in this project (`swe-interview-prep`) currently has ML concepts
from TinyGPT (the `ml-*` concept IDs in `src/data/concepts.json`). See
[fsrs-deck-plan.md](fsrs-deck-plan.md) for a plan to extend the deck with
decisions and lessons from the other projects on this track.
