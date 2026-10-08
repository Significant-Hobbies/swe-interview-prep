# swe-interview-prep SEO sprint roadmap

> Note: this repo is **maintenance-only since 2026-07-10** (`STATUS.md`). These
> phases are queued intent, not active work — resume only if the owner lifts
> maintenance mode; until then the indexing loop below still runs passively.

Satellite playbook (see `saas-maker/tooling/skills/seo-sprint`). Baseline
(28d ending 2026-09-18): **8,274 imp · 2 clicks · pos 24 · 23 indexed / 300
pending** — big impression volume on junk queries; real queries rank but get
zero clicks.

## Evidence

- **Junk signal**: most top impressions are `"indocad" …` copied-content
  searches at pos 2–3 — don't optimize for these; they're people hunting a
  leaked package, not interview prep.
- **Real signal**: `"explain_estimated_rows"` pos 7 — Postgres EXPLAIN
  internals. Curriculum content is surfacing for genuine technical questions.

## Phases

- [ ] **Phase 1 — topic landing pages for real interview queries.** From the
  curriculum: system design, Postgres/database internals, behavioral, coding
  patterns. Each page = the actual curriculum section + practice questions,
  not a stub. Target the query classes where pos is already 2–8.
- [ ] **Phase 2 — question pages.** One page per curriculum question with a
  real worked answer — the "<question> interview" long tail. Buildable from
  `shared/data`.
- [ ] **Phase 3 — company-tagged pages** ("<company> interview questions")
  only where the curriculum genuinely covers that company's known pattern —
  don't fabricate company specificity.
- [ ] **Phase 4 — indexing + CTR.** 300 pending churn via the daily agent;
  pages at pos 2–8 with 0 clicks need title/snippet work (the scoreboard
  flags them as `striking-distance`).

## Rules

- Never write an answer the curriculum doesn't actually teach — interview
  searchers spot fake prep instantly.
- Register each phase: `seo-scoreboard.mjs register --project
  swe-interview-prep --lane editorial|programmatic --summary "…"`.
