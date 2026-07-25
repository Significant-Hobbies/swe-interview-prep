# Learning OS — Start Here

A curated set of roadmaps and references for learning systems software in 2026. Every concept points at the canonical external source (paper, blog series, talk, official doc) rather than re-explaining it.

## Philosophy

- **Mechanism-first.** Understand how things work, not just how to use them.
- **Lean on the canonical source.** If Karpathy already explained attention, link to Karpathy. Don't paraphrase.
- **Offer alternatives when quality diverges.** CS224n PDF + Illustrated Transformer + Annotated Transformer for attention; CS231n + Karpathy for optimization; JAX scaling book + HF playbook for training at scale — pick one path, not the only path.
- **Six slots per topic (ideal).** Video · paper · blog · book · problem (drill) · write (explain-back prompt). We link out for all four media types so you can learn at your own pace; gaps are visible until curated.
- **No learning without an artifact.** Every roadmap ends in something shipped — code, a benchmark, or a written explainer.
- **Honest scope.** Every doc states up front what it covers and what it doesn't.
- **Don't read passively.** If you can't explain a concept to a duck in three sentences, you don't know it yet.
- **These are mine, in public.** The roadmaps reflect what I want to learn. Useful to me even if nobody else reads them — that's the point.

## Where do I start?

| Your situation | Start here |
|---|---|
| "I want a map of all of SWE so I know what the field even contains" | [The SE Landscape (2026)](./swe-landscape.md) |
| "I want a breadth checklist for interview prep" | [Interview prep](./interview-prep.md) |
| "I want the design rounds — LLD + HLD" | [System design](./system-design.md) |
| "I want to learn how databases *actually work* (internals)" | [Disk-First DB roadmap](./db-roadmap.md) |
| "I want one mental model that covers V8, JVM, Go runtime, vLLM, Workers" | [Runtime roadmap](./runtime-roadmap.md) |
| "I want to see how real ML systems work in production" | [ML system design case studies](./ml-case-studies.md) |
| "I want retrieval / search / vector / RAG depth" | 9-Day Reset → 30-Day Retrieval → 90-Day AI Search & Infra → 12-Month Advanced AI Infra (in-app `/learn`) |
| "I want OS, cloud, containers, distributed systems, and reliability" | Systems Foundations → Infrastructure & Platforms → Distributed Systems (in-app `/learn`) |
| "I want models, inference, agents, and rigorous AI evaluation" | AI Models & Training → Inference & Serving → Agent Systems → Evaluation & AI Reliability (in-app `/learn`) |
| "I want code intelligence and complete application engineering" | Developer Tools & Code Intelligence → Application Engineering (in-app `/learn`) |
| "I want vision, voice, robotics, or spatial interfaces" | Multimodal & Spatial Computing (in-app `/learn`) |
| "I'm new to systems software entirely" | [SE Landscape](./swe-landscape.md), skim every domain first |

## All docs

The four AI roadmaps are one progressive curriculum at four horizons — not four independent paths. The rest are standalone.

| Doc | Shape | Good for |
|---|---|---|
| [The SE Landscape (2026)](./swe-landscape.md) | broad map | One page per major systems-software domain |
| [Interview prep](./interview-prep.md) | checklist | Breadth-first topic audit — map gaps to roadmaps |
| [System design](./system-design.md) | catalogue | LLD patterns + HLD components + the canonical "design X" practice problems |
| [Disk-First Databases & RAM](./db-roadmap.md) | 12-month roadmap | DB internals: storage engines, execution, distributed |
| [Runtime — what every runtime has to do](./runtime-roadmap.md) | 12-month roadmap | Cross-cutting: V8, JVM, Go, BEAM, vLLM, Workers as one shape |
| [ML system design case studies](./ml-case-studies.md) | catalogue | 450 production ML write-ups, grouped by category |
| 9-Day Reset → 12-Month AI Infra | in-app `/learn` | Retrieval, ANN, RAG, storage progression |
| Systems Foundations → Distributed Systems | in-app `/learn` | OS, hardware, networks, cloud, containers, orchestration, reliability, workflows |
| AI Models & Training → AI Reliability | in-app `/learn` | Transformers, training, inference engines, agents, evals, verification |
| Developer Tools → Application Engineering | in-app `/learn` | Code intelligence, testing, remediation, web/mobile, UX, real-time, product |
| Multimodal & Spatial Computing | in-app `/learn` | Vision, audio, generation, on-device inference, robotics, spatial interfaces, HCI |

## How to actually learn from this

1. **Pick one roadmap.** Don't read three in parallel.
2. **Run the loop per concept** — read the canonical source → do the drill → write a one-paragraph explanation in your own words → schedule an FSRS review.
3. **Ship the artifact at each milestone.** No artifact = no learning.
4. **Run one benchmark per system you study.** Especially in the DB roadmap.
5. **Re-audit links.** Some URLs rotate yearly (CMU 15-445, MIT 6.1810, Lucene codec). Each doc has a *Maintenance notes* section flagging which.

## Prerequisites

These roadmaps assume you can program (in any language). They don't teach programming, CS fundamentals, or basic math from zero.

If you need foundations first:

- **Programming** — [CS50 (Harvard, free)](https://cs50.harvard.edu/x/) · [Python crash course](https://ehmatthes.github.io/pcc_3e/)
- **Data structures & algorithms** — [NeetCode roadmap (free)](https://neetcode.io/roadmap) · [Stanford CS161](https://stanford-cs161.github.io/) · the project's own [DSA track](/learn)
- **CS math** — [3Blue1Brown — Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra) · [Khan Academy — Probability](https://www.khanacademy.org/math/statistics-probability) · [MIT 18.06 (Strang)](https://web.mit.edu/18.06/www/)
- **Working developer environment** — git, a real editor, a Unix shell; [Missing Semester (MIT)](https://missing.csail.mit.edu/) is the canonical course on what nobody teaches you.

## Coverage boundary

The expanded catalog gives each requested area a sequenced applied-engineering
path, but it does not claim research-specialist completeness:

- **Product / business depth** — the Product and Application Engineering tracks cover positioning, distribution, analytics, and UX; monetisation and company-building remain adjacent. Follow [Lenny's Newsletter](https://www.lennysnewsletter.com/), [First Round Review](https://review.firstround.com/), or [Stratechery](https://stratechery.com/) for depth.
- **Research-frontier depth** — the AI Models and Multimodal paths cover mechanisms and applied systems, not exhaustive research coverage. [Lil'Log](https://lilianweng.github.io/) and [The Gradient](https://thegradient.pub/) remain useful frontier maps.
- **Embedded / firmware / electronics** — [Memfault Interrupt blog](https://interrupt.memfault.com/blog/), [Embedded.fm podcast](https://embedded.fm/).
- **Quantum computing** — [Quantum Country (Andy Matuschak)](https://quantum.country/), [Quantum Algorithm Zoo](https://quantumalgorithmzoo.org/).

---

## Conventions

- **External over internal.** Where a canonical source exists, link to it. Don't re-author.
- **Short pages.** Target 150–300 lines each. The catalogue docs (system-design, ml-case-studies) are necessarily longer.
- **Frontmatter dates.** Each doc says when it was last audited so you know how stale a recommendation might be.
- **Maintenance notes.** Each doc has a bottom section flagging rotating URLs and dead links so re-audits are mechanical.

Last index update: 2026-07-25.
