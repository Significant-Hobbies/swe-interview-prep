# Learning OS — Start Here

A curated set of phased roadmaps for learning systems software in 2026.
Each one points at the canonical external source for every concept
(paper, blog series, talk, official doc) rather than re-explaining it.

## Philosophy

- **Mechanism-first.** Understand how things work, not just how to use
  them.
- **Lean on the canonical source.** If Karpathy already explained
  attention, link to Karpathy. Don't paraphrase.
- **No learning without an artifact.** Every roadmap ends in something
  shipped — code, a benchmark, or a written explainer.
- **Honest scope.** Every roadmap states up front what it covers and
  what it doesn't.
- **Don't read passively.** If you can't explain a concept to a duck in
  three sentences, you don't know it yet.
- **These are mine, in public.** The roadmaps reflect what I want to
  learn. They are useful to me even if nobody else reads them — that's
  the point. If they help someone else along the way, that's bonus.

## Where do I start?

| Your situation | Start here |
|---|---|
| "I want a map of all of SWE so I know what the field even contains" | [The SE Landscape (2026)](./swe-landscape.md) |
| "I want to learn how databases *actually work* (internals)" | [Disk-First DB roadmap](./db-roadmap.md) |
| "I want to be effective with SQL / Postgres at work" | [DB roadmap → *What this doesn't cover*](./db-roadmap.md#what-this-roadmap-doesnt-cover--read-these-instead) |
| "I want one mental model that covers V8, JVM, Go runtime, vLLM, Workers" | [Runtime roadmap](./runtime-roadmap.md) |
| "I want retrieval / search / vector / RAG depth" | 9-Day Reset → 30-Day Retrieval → 90-Day AI Search & Infra → 12-Month Advanced AI Infra (in-app `/learn`) |
| "I want one of LLMs / Streaming / Compilers / OS / etc." | [SE Landscape](./swe-landscape.md), then branch a dedicated roadmap |
| "I'm new to systems software entirely" | [SE Landscape](./swe-landscape.md), skim every domain first |

## All roadmaps (7)

The four AI roadmaps are one progressive curriculum at four horizons —
not four independent paths. DB, Runtime, and SE Landscape are standalone.

| Roadmap | Horizon | Source | Good for |
|---|---|---|---|
| 9-Day Reset | 9 days | `/learn` | Break inertia by shipping a BM25 ranker |
| 30-Day Retrieval Basics | 30 days | `/learn` | Lexical + vector + hybrid search |
| 90-Day AI Search & Infra | 90 days | `/learn` | The core curriculum — retrieval, ANN, RAG, storage |
| 12-Month Advanced AI Infra | 12 months | `/learn` | Long-arc depth across search, vector, AI, storage, design |
| [Disk-First Databases & RAM](./db-roadmap.md) | 12 months | this doc | DB internals: storage engines, execution, distributed |
| [Runtime — what every runtime has to do](./runtime-roadmap.md) | 12 months | this doc | Cross-cutting: V8, JVM, Go, BEAM, vLLM, Workers as one shape |
| [The SE Landscape (2026)](./swe-landscape.md) | broad map | this doc | One page per major systems-software domain |

## How to actually learn from this

1. **Pick one roadmap.** Don't read three in parallel.
2. **Run the loop per concept** — read the canonical source → do the
   drill → write a one-paragraph explanation in your own words →
   schedule an FSRS review.
3. **Ship the artifact at each milestone.** No artifact = no learning.
4. **Run one benchmark per system you study.** Especially in the DB
   roadmap — for any DB you read about, produce one measurement and a
   paragraph explaining where RAM went.
5. **Re-audit links.** Some URLs rotate yearly (CMU 15-445, MIT 6.1810,
   Lucene codec). Each doc has a *Maintenance notes* section at the
   bottom flagging which.

## Prerequisites

These roadmaps assume you can program (in any language). They don't teach
programming, CS fundamentals, or basic math from zero.

If you need foundations first:

- **Programming** — [CS50 (Harvard, free)](https://cs50.harvard.edu/x/) ·
  [Python crash course](https://ehmatthes.github.io/pcc_3e/)
- **Data structures & algorithms** — [NeetCode roadmap (free)](https://neetcode.io/roadmap) ·
  [Stanford CS161](https://stanford-cs161.github.io/) ·
  the project's own [DSA track](/learn) (`dsa`)
- **CS math (linear algebra, probability, calc)** —
  [3Blue1Brown — Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra) ·
  [Khan Academy — Probability](https://www.khanacademy.org/math/statistics-probability) ·
  [MIT 18.06 (Strang)](https://web.mit.edu/18.06/www/)
- **Working developer environment** — git, a real editor, a Unix shell;
  [Missing Semester (MIT)](https://missing.csail.mit.edu/) is the
  canonical course on what nobody teaches you.

## Adjacent but not covered here

These intentionally live outside the systems-software focus:

- **Product / business** — positioning, distribution, monetisation,
  design. The project's `product` track touches it; for depth, follow
  [Lenny's Newsletter](https://www.lennysnewsletter.com/),
  [First Round Review](https://review.firstround.com/),
  [Stratechery](https://stratechery.com/).
- **ML research frontier beyond LLMs** — vision, robotics, RL.
  [Lil'Log](https://lilianweng.github.io/) and
  [The Gradient](https://thegradient.pub/) are good entry points.
- **Embedded / firmware / electronics** — [Memfault Interrupt blog](https://interrupt.memfault.com/blog/),
  [Embedded.fm podcast](https://embedded.fm/).
- **Quantum computing** — [Quantum Country (Andy Matuschak)](https://quantum.country/),
  [Quantum Algorithm Zoo](https://quantumalgorithmzoo.org/).

---

## Conventions

- **External over internal.** Where a canonical source exists (paper,
  blog series, talk, official docs), link to it. Don't re-author.
- **Short pages.** 150–300 lines each. Long monoliths split into
  per-topic pages.
- **Frontmatter dates.** Each doc says when it was last audited so you
  know how stale a recommendation might be.
- **Maintenance notes.** Each doc has a bottom section flagging rotating
  URLs and dead links so re-audits are mechanical.

Last index update: 2026-06-16.
