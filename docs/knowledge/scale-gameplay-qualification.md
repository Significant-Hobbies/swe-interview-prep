# Scale gameplay qualification — 2026-09-11

Four projects reached the existing 5× / profitable / 24-hour stability finish through browser controls. These runs demonstrate playable paths and tool discovery, not full production fidelity or coverage of every possible architecture. No game state or worker clock was injected.

## Runs

Three repeatable Playwright campaigns used normal 4× speed, paid engineering, the grouped catalogue, launch, growth and hold-growth controls. Each reloaded the completed company and downloaded a debrief.

| Project | Strategy | Result |
| --- | --- | --- |
| Tiny SaaS | Query optimization and one app upgrade before launch | Completed |
| Online store | Three database upgrades, indexing and two app upgrades before launch | Completed |
| AI gateway | Three database upgrades, indexing, three app upgrades and another app instance before launch | Completed |
| Event analytics | Launch first; inspect database saturation; compare vertical scaling with sharding in Sandbox; deploy two shards, then increase database and app capacity | Completed at hour 372.8; 2,517 users; $1,959 cash; 279ms p99; zero observed errors |

The analytics run was interactive browser play. At 341 offered requests/sec, the original database reached 100% utilization with 64 queued requests and 57% errors. A sampled larger-database experiment improved throughput from 163 to 287/sec but retained 13% errors. Two small shards produced a sampled 319/sec with no errors; their $114/month running cost compared with $150/month for the larger single database, but sharding required $400 setup and 72 engineering hours. Measurements were taken at different simulation windows, so they are observations rather than a controlled benchmark.

The sharded company encountered further database pressure as growth resumed. One database upgrade and one app upgrade restored headroom. Two scheduled application outages occurred during the run. Holding growth above the user target allowed the company to complete. The inspector and catalogue exposed the required interventions without an undiscoverable unlock. Screenshots and downloaded debriefs are under `artifacts/design/scale-learning/`. Automated campaign coverage is in `tests/e2e/scale-campaigns.spec.ts`.

## Findings and repairs

The incident explanation could blame the busiest database during an application outage. Active outages now take precedence over capacity diagnosis, and the journal labels the incident as a component outage. The inspector no longer says “Room to grow” for an explicitly failed component. A single harmless pending job could previously mask stale-read diagnosis; backlog explanations now require a missing drain or at least five seconds of pending work. Regression tests cover both cases.

All 17 interventions now link to existing mechanism and failure-mode lessons. All 12 currently classified failure families have curriculum mappings. Tests verify exact concept IDs/titles, generated local destinations, mapping coverage, and signal classification. Desktop/mobile browser checks expand all tool disclosures, read Sharding in a separate tab, preserve a paused company, and expose recovery learning during an injected outage. External references within curriculum pages were not re-audited.

## Remaining gameplay limits

Buying sufficient capacity before launch bypassed incidents in three campaigns. The chapter often ends before the first scheduled outage; resilience is consequently optional for many winning paths. Queue, stream, cache, replica, CDN and search interventions were not required by these four winning strategies. Separate causal integration tests cover their effects, but these campaigns do not establish that each is necessary or well balanced in gameplay.

Analytics recovered from prolonged severe errors while retaining revenue and user count. Current economics do not model churn, trust damage, missed job deadlines or lost purchases. Workload-specific correctness and recovery objectives would make these consequences meaningful. AI provider routing/quotas/token economics and actual social fan-out remain unmodeled. Repeated incident messages can push earlier decisions out of the 30-entry journal. Historical incidents currently retain explanations but not their exact contextual lesson selection.

Track these follow-ups in [issue 99](https://github.com/Significant-Hobbies/swe-interview-prep/issues/99). Do not add arbitrary mandatory-tool checklists to make every component appear necessary. The next gameplay work should introduce workload-specific objectives and failure consequences that make different valid architectures worth comparing. Changes are local; no deployment was performed.

## Campaign follow-up

New companies now face a launch spotlight and maintenance event before the sustainability finish. Both require 14 healthy company hours within a 24-hour window. The player chooses risk and reward; poor service loses customers, missed events can be retried, and emergency mitigation trades the maximum reward down to one quarter. Weekly outages are reserved for endless play in these companies.

Interactive SaaS evidence: launched with the starter architecture and chose the ambitious spotlight. It failed with 0.3 healthy hours and no payout; the audience fell from roughly 600 to 568. After preserving the company, holding growth, buying query optimization and one app upgrade, the same ambitious event achieved 24 healthy hours and paid $450. A cautious maintenance window then achieved 19.2 healthy hours and paid $144. The company completed at hour 224.7 with 1,179 users, $3,198.68 cash, $107.40/month infrastructure, and 54 total customers lost across the run. The debrief is `artifacts/design/scale-campaign/saas-recovery-debrief.md`. This verifies a recoverable setback and a successful alternative to buying the largest database. It is one operator's playthrough, not evidence of broad player enjoyment.

Balance corrections from testing: cancelling the ambitious option initially paid more than completing the cautious option; reducing the mitigation multiplier from one half to one quarter removes that shortcut. Unannounced weekly outages could drop a held audience below the final user target; they now belong to endless play after the two announced campaign events. Runtime tests exercise all five profiles, legacy saves, explicit choice, Sandbox isolation, failure replay, bounded churn, malformed campaign state and one-time rewards.

Final campaign checks: 957 tests across 117 files pass. Twelve desktop/mobile browser cases pass, including three full campaigns on each viewport class. Two mobile cases were interrupted by a development-server reload during the first combined run; both passed when rerun against the frozen production preview. Lint, typecheck, production build, route size budgets, documentation and whitespace checks pass. Event screenshots at 390/768/1440 retain the SWE theme and have no horizontal page overflow. No commit or deployment was performed.

## Release qualification

The code-health gate treats the pinned MIT engine as vendored code: its public
exports/types and upstream duplication/complexity are retained. Exactly four
known two-module dispatch cycles are allowed; new cycles still fail. Engine
behavior remains covered by the test suite. First-party Scale has an isolated
initial complexity budget (15 functions over the general threshold, maximum
CCN 58, 174 lines, four parameters). This is recorded maintenance debt, not a
claim that those functions were simplified. Track reduction in issue 99.
The existing application budget is unchanged in violation count and tighter
in maximum function length after extracting shared attempt restoration.
First-party duplication limits also decreased. Unused first-party exports were
removed; dependency, test, typecheck and coverage gates remain enabled.

Release gate: `pnpm quality` passed with 957 tests across 117 files, coverage,
format/lint/typecheck, static health checks, docs, build and size budgets.
Three newly reported development-tooling advisories were patched through
transitive overrides: sharp 0.35.4, js-yaml 4.3.2 and smol-toml 1.7.1.
Five previously accepted high-severity transitive advisories remain tracked in
issue 61; the gate reports zero unexpected severe advisories.
