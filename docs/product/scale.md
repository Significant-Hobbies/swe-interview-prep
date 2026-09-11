# Scale in Play

Scale is the persistent systems game at `/play/scale`. Play replaces Wars in primary navigation; all `/wars/*` URLs remain available. The focused workbench loads separately from the learning shell, including its worker and engine. It inherits SWE typography and uses the existing black workbench theme. No additional production dependency is required.

## State and fidelity

Company saves are device-local and partitioned by signed-in account or guest. Signing in does not upload or transfer a guest company. Web Locks prevent concurrent writers where supported; an optimistic save check protects other browsers. Leaving the route saves the latest worker snapshot and terminates the worker. The standalone prototype's origin-local saves are not imported automatically.

Game and sandbox share one seeded request-level engine. The shared toolkit supports 17 interventions across compute, data, edge delivery, messaging, and reliability. It does not implement arbitrary graph wiring or real cloud pricing. Offline progress is bounded and pauses for incident review. Progress is gameplay state, not evidence of mastery.

## Hands-on exercises

The existing Systems Lab runners include optional Platform Lab guides for GitOps migrations, trace sampling, and metrics ingestion. Teaching content lives in `docs/learning/platform/` and is rendered directly from Markdown. These exercises require the existing external local lab and its sibling vault-common chart. SWE does not bundle private infrastructure, execute terminal commands, or claim to verify cluster evidence. A portable kit remains follow-up work until that dependency is replaced and runtime checks pass.

## Third-party provenance

`src/features/scale/vendor/breakscale` contains MIT-licensed simulation source and engine tests from [Breakscale](https://github.com/xevrion/breakscale/tree/781b7258d0f0fc8c06199795e554d4ac8031ccde), pinned at `781b7258d0f0fc8c06199795e554d4ac8031ccde`. Its LICENSE is preserved. The upstream canvas annotation test is retained as a reference because the upstream UI is not included. Vendor source is excluded from formatting to preserve upstream comparison; executable engine tests remain included.

Historical DM Sans and Manrope assets and licenses remain under `public/scale/fonts`, but Scale no longer imports or requests them; it inherits SWE’s Geist typography. Scale's own game and interface were brought from the local standalone prototype; no upstream UI was copied.

The learning app keeps its existing JavaScript and 50 KB CSS budgets. Scale is a separate lazy route with its own 10 KB CSS, 33 KB interface, and 40 KB worker gzip budgets. This prevents the optional game from inflating the initial learning route; the worker and Scale stylesheet load only when entering Scale.

## Projects and difficulty

The project picker offers Tiny SaaS, Online store, Event analytics, Social network (Facebook-style), and AI gateway (OpenRouter-style). Each profile changes the starting traffic, cash, growth, revenue per user, read fraction, cache eligibility, and application service time. Both expert profiles use the existing chapter-one engine; social graph fan-out, geographically distributed data, provider quotas, token billing, streaming, and model routing remain outside the model. Expert labels describe the pressure and budget within this game, not fidelity to either company.

Each profile gets its own account-scoped local save. SaaS retains the previous save key for compatibility. Switching via the project selector unmounts and saves the previous game, and then starts or resumes the selected profile. Reset affects only that profile. The project is encoded in the route query so reloads retain the selection.

## Completed challenge loop

Every project has a bounded challenge: launch the product, reach five times its initial users, and sustain positive monthly operating profit, p99 below 500 ms, and errors below 2% for 24 continuous company hours. Missing any condition resets the stability timer. Holding organic growth is a valid way to stabilize. Sandbox freezes company time and cannot grant progress.

Completion pauses the company for review. Keep growing explicitly enters optional endless play; a later bankruptcy remains visible without erasing the earlier achievement. The current architecture, recent decisions, economics, model assumptions, and reflection prompts can be downloaded as a Markdown debrief. The journal retains the latest 30 entries, so this is not a complete event archive or a save backup. Runway exhaustion preserves the architecture for sandbox investigation and offers a confirmed restart of the selected project.

Challenge progress is additive to version-one saves; existing saves begin with zero qualifying hours. Offline catch-up also stops at completion. Background jobs are restored by count with reconstructed keys and timing; a restored backlog pauses the company for review. Deterministic playthrough tests exercise all five profiles using paid upgrades, ordinary growth, and positive cash through the finish. Analytics traffic is balanced within the available database tiers; the write-lock ceiling remains part of the model.

## Expanded infrastructure and fidelity

Engineering exposes all 17 options through five native disclosure groups. The inspector shows context-relevant options and a Browse all tools action. Tools are available immediately; only architectural prerequisites and affordability restrict deployment. Sandbox uses the same catalogue without spending or engineering waits. A connection pool, read replicas, key-based sharding, a job queue with scalable workers, object storage, CDN, search, partitioned streaming, standby app region, automatic failover, and cache fleet scaling extend the original five actions.

Read replicas have distinct read pools, one primary write pool, a 250ms visibility window, and primary write contention. Sharding routes each key to one independent primary/replica set. Sandbox hot-key controls force a share of requests onto the first partition. This models independent contention domains, not distributed transactions or rebalancing physical data.

Workload routing declares separate background-job, blob, search and public-cacheable shares per project. Without the corresponding service, those requests retain the original application/database path. Object storage and search move their share to independent service pools; search includes indexing work and a refresh delay. CDN answers its eligible public share before origin. These are synthetic workload shares rather than a real application's request taxonomy. Cache and replica read classification are probabilistic and do not establish request-level correctness guarantees.

Queues acknowledge before workers finish. Streams acknowledge producers separately, impose a partition ceiling on consumers, and expire messages beyond retention. Health requires foreground p99 below 500ms and errors below 2%, fewer than five seconds of background backlog at the observed drain rate, worker errors below 2%, no observed retention drops, and stale reads below 2%. Challenge stability uses this combined health check, so fast acknowledgements cannot hide a stuck background pipeline. Pending jobs survive sandbox branching exactly within the same runtime; reloads and stream migrations replay unfinished counts with reconstructed keys, not exact event history. This is not an exactly-once delivery guarantee.

Complexity adds a visible percentage to future engineering project durations. Every machine, replica and partition contributes to recurring cost. Standby regions duplicate only application compute; database, cache and other services remain shared failure domains. Automatic failover shortens a regional cutover from 30 to 2 request-simulation seconds. After launch, a deterministic 12-company-hour application outage begins every 168 company hours, so resilience has a game consequence. Sandbox also supports component outage/restore and hot-key experiments. Editing sandbox architecture clears injected faults.

The vendored engine retains its upstream license. Small local extensions add key-based partition dispatch, optional primary write contention for replicas, pending-job replay, and propagation of request keys through queue messages. `game/toolkit.test.ts` covers these integration behaviors alongside the retained upstream suite. Visual evidence lives under `artifacts/design/scale-toolkit/`; deployment remains separate.

## Contextual learning and playthrough evidence

Every toolkit intervention includes an optional mechanism and failure-mode disclosure linking to existing public curriculum pages. Twelve observed signal categories cover outages, capacity, write contention, hot shards, low cache coverage, stale reads, background backlog, stream retention, connection refusals, worker errors, runway and otherwise unexplained SLO misses. These are investigation clues, not root-cause proof. Links open separately; the game retains its pause setting. Reading neither gates tools nor grants mastery. Historical journal entries do not yet preserve the associated lesson selection.

The [September gameplay qualification](../knowledge/scale-gameplay-qualification.md) records four completed browser campaigns, resource validation, and the remaining gameplay gaps.

## Campaign events for new companies

New companies include two explicit decisions before the sustainable-growth finish: a launch spotlight (1.25× or 2× offered traffic) and app-host maintenance (4 or 8 company hours of outage). Each lasts 24 company hours and needs 14 measured healthy hours. Cautious choices offer up to $180; ambitious choices up to $450. Actual rewards scale with healthy time. Limiting the rollout or cancelling maintenance removes the extra pressure but reduces the maximum payout to one quarter, so immediate cancellation is not more lucrative than a successful cautious choice.

Offers and results pause for review. The clock can still be resumed to perform engineering before accepting an offer. Sandbox preserves company state; neither it nor offline catch-up chooses an approach. Missed events pay nothing and can be retried with the same architecture. Completed events cannot pay twice. Service failures gradually lose customers, bounded by the initial audience, even when organic growth is held. This is a simplified churn model rather than customer-specific behavior.

Both event successes are required before the original 5×/24-hour sustainability objective can complete. Recurring weekly outages resume in endless play; the bounded campaign uses its announced maintenance event. Saves without campaign state retain the old rules. Restart creates a new campaign; no existing company is reset automatically. Event state and progress survive reload. The debrief includes attempts, rewards and customers lost.

The dedicated lazy interface budget grows from 30 to 33 KB gzip for campaign state, choices and review UI; the observed interface is about 32 KB. Initial learning-route, stylesheet and worker budgets remain unchanged. This adds no production dependency.
