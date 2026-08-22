## 1. Competitive Foundations

- [x] 1.1 Add an additive `0002_software_wars.sql` D1 migration with content, match, attempt, artifact, vote, evaluation, challenge, rating, report, and remediation tables plus required indexes and idempotency constraints.
- [x] 1.2 Add the pinned official Cloudflare RealtimeKit Core/React production dependencies and document why each dependency is required.
- [x] 1.3 Define shared Software Wars domain types, status enums, opaque identifiers, API envelopes, visibility rules, and size limits without importing server answer material into client modules.
- [x] 1.4 Implement and unit-test pure Blitz scoring, server-deadline checks, question selection/cooldown policy, vote compatibility, Tradeoff phase transitions, and conservative remediation mapping.
- [x] 1.5 Implement and unit-test versioned competitive Elo at 1500 with K=48 for matches 1–10, K=24 thereafter, reciprocal human events, fixed AI ratings, rounding, and idempotent fixtures.

## 2. Ranked Content and AI Opponents

- [x] 2.1 Create the server-only `shared/data/software-wars/` authoring schema and loaders for Blitz questions, deterministic variants, Tradeoff problems/twists/rubrics, AI profiles, and precomputed answers.
- [x] 2.2 Add a deterministic content validator for IDs/versions, concept mappings, sources, unique options, answer/rubric completeness, lifecycle state, variant domains, AI coverage, and launch thresholds; expose it as a repo script and test it.
- [x] 2.3 Author and validate at least 300 reviewed active Backend Fundamentals Blitz questions with difficulty/concept coverage and source-backed explanations.
- [x] 2.4 Author and validate at least 20 reviewed Tradeoff problems with hidden twists, evaluation rubrics, concepts, and authoritative sources.
- [x] 2.5 Add versioned precomputed AI opponent fixtures with fixed ratings and complete answer coverage for every active Blitz question version.
- [x] 2.6 Replace the 300-item variant-inflated gate with 1,200 editorially approved active `contentKey` values across 12 topic-owned banks and report candidates and variants separately.
- [x] 2.7 Add an authored explanation to every option and return complete option reasoning only after match authorization permits answer disclosure.
- [x] 2.8 Add normalized duplicate, option-set duplicate, and conservative near-duplicate validation plus per-topic and per-difficulty coverage minimums.
- [x] 2.9 Expand precomputed AI opponent snapshots to every active playable question version and require at least 3,600 stored answers for the 1,200-question base bank.
- [x] 2.10 Add focused content-contract tests proving distinct-base counting, variant separation, complete explanations, duplicate rejection, balanced coverage, and answer-safe client bundles.
- [x] 2.11 Add a required canonical `primaryConceptId` to every Blitz question, validate all primary/supporting concept IDs, and expose answer-safe concept identity without exposing answer material.
- [x] 2.12 Derive a server-safe Wars curriculum coverage manifest from canonical tracks, roadmaps, milestones, and concepts, including zero-coverage entries and active/candidate counts.
- [x] 2.13 Replace hard-coded topic filtering with server-side track, roadmap, and concept queue resolution; snapshot queue type/id and keep scoped queues unranked.

## 3. Wars Data and API Layer

- [x] 3.1 Add a Wars repository layer over the existing database adapter for content snapshots, match membership, attempts, answers, artifacts, challenges, reports, results, and immutable event writes.
- [x] 3.2 Extend the production Pages catch-all and local development parity with explicit public, authenticated, provider-webhook, and operator Wars route handling.
- [x] 3.3 Implement launch-status, sanitized public leaderboard, public result, and challenge-preview reads with visibility and content-leakage tests.
- [x] 3.4 Implement authenticated Blitz create/resume/answer/finalize endpoints with server timestamps, idempotency, AI matching, one-use human ghost pairing, abandonment, and deterministic scoring.
- [x] 3.5 Implement challenge creation/acceptance, rematch, match history, report submission, and sanitized result sharing.
- [x] 3.6 Implement server-owned mode ratings, immutable rating events, public opt-out, leaderboard queries, and operator-only compensating correction flow.
- [x] 3.7 Implement post-match remediation writes through the existing concept mastery contract, including explanation/recommendation responses and idempotent FSRS updates.

## 4. Tradeoff Durable Realtime Control

- [x] 4.1 Add a separately deployable Wars Worker configuration with a Durable Object binding, environment declarations, and local development commands without committing secrets.
- [x] 4.2 Implement short-lived match-scoped realtime token minting and validation shared between Pages and the Wars Worker.
- [x] 4.3 Implement the Tradeoff Durable Object state machine, persistent absolute deadlines, alarms, hibernating WebSocket presence, authorized event replay, phase broadcasts, no-show handling, and reconnect recovery.
- [x] 4.4 Implement authenticated Tradeoff scheduling/check-in and Durable Object bootstrap APIs with membership and state-version checks.
- [x] 4.5 Add two-client deterministic tests for simultaneous twist delivery, late mutation rejection, reconnect recovery, duplicate messages, phase alarms, and no-show outcomes.

## 5. Tradeoff Artifacts, Media, and Adjudication

- [x] 5.1 Implement private Tradeoff draft save, phase-boundary freeze, content hashing, D1/R2 storage selection, immutable reveal, and participant/public authorization rules.
- [x] 5.2 Implement a RealtimeKit provider interface with configured and disabled adapters for meeting creation, participant enrollment/token refresh, room closure, transcription request state, and provider error mapping.
- [x] 5.3 Implement signed RealtimeKit webhook ingestion, duplicate delivery protection, transcript consent enforcement, queued transcript copying to project-owned R2, and retention metadata.
- [x] 5.4 Add the Wars Queue producer/consumer and dead-letter configuration for transcript ingestion and versioned AI adjudication.
- [x] 5.5 Implement private voting, compatible-vote finalization, structured rubric adjudication, schema validation, retries, review-required fallback, and Tradeoff rating/remediation finalization.
- [x] 5.6 Test provider-disabled behavior, media token authorization, webhook verification/retries, transcript consent, artifact privacy, evaluation failures, and exactly-once finalization.

## 6. Preserve-Lane Wars Interface

- [x] 6.1 Create the preserve-lane Fleet design receipt and capture the existing Today and Mock surfaces before implementation.
- [x] 6.2 Add lazy-loaded `/wars` hub, mode/rating cards, launch-status handling, recent history, and contextual Today/Mock entry points without changing primary navigation.
- [x] 6.3 Build the accessible Blitz setup and battle workspace with topic/Ranked Mix choice, opponent state, server-synchronized timer, keyboard-operable answers, reconnect state, and mobile layout.
- [x] 6.4 Build Blitz result, mistake review, weakness cards, lesson/drill/review actions, rematch, challenge creation/acceptance, history, leaderboard, and sanitized public result surfaces.
- [x] 6.5 Build Tradeoff scheduling/check-in and the responsive wide workbench with phase strip, prompt/twist disclosure, private text/code/schema/pseudocode/diagram artifacts, autosave/freeze/reveal, and reconnect state.
- [x] 6.6 Compose RealtimeKit participant tiles, device setup, mute, camera, screen-share, connection, consent, and disabled-provider states into the Tradeoff workbench.
- [x] 6.7 Build debate, private voting, adjudication-pending/review-required, final result, transcript/artifact visibility, rematch, report, and sharing surfaces.
- [x] 6.8 Add route/component tests for authentication upgrades, active-match answer secrecy, phase visibility, public sanitization, focus management, reduced motion, and 44px compact controls.
- [x] 6.9 Replace the Blitz topic selector with searchable canonical track, roadmap, and concept discovery, readiness counts, internal Learn links, and disabled states for scopes with fewer than five active questions.
- [x] 6.10 Link question metadata, mistake review, and weakness Learn actions directly to the canonical primary concept route.
- [x] 6.11 Add a Solo Tradeoff setup path with ephemeral OpenAI-compatible endpoint/key/model fields, explicit browser-direct disclosure, and no rating or authentication requirement.
- [x] 6.12 Generate an independent AI artifact, apply the shared twist without learner-draft leakage, reveal/debate against the frozen artifact, and return unranked rubric-oriented feedback.
- [x] 6.13 Compose the Tradeoff artifact surface from the existing controlled Monaco and Excalidraw tools, with combined notes/code/diagram state, compact panel switching, and read-only freeze behavior.
- [x] 6.14 Make guest Play the primary Blitz and Tradeoff action; keep unranked local battles functional without signup and present authentication only as the upgrade for durable competitive features.

## 7. Integration and Operations

- [x] 7.1 Add PostHog events and server observability for queue choice, match start/completion/abandonment, immediate rematch, challenge send/accept/complete, mistake review, media failures, adjudication outcomes, and rating sharing without logging answers or private artifacts.
- [x] 7.2 Add documented non-secret configuration to examples and Cloudflare bindings; document required RealtimeKit, R2, Queue, Durable Object, webhook, and secret setup without touching local or production secrets.
- [x] 7.3 Update canonical product, surface, architecture, data-flow, command, environment, deployment, and privacy documentation for Software Wars and its recording/transcription policy.
- [x] 7.4 Add operator runbooks for launch gating, content retirement/report review, rating correction, provider outage, queue backlog, cost containment, and rollback.
- [x] 7.5 Update `PROJECT_STATUS.md`, `PRODUCT.md`, and relevant navigation/product counts only after the implemented feature and checks satisfy the accepted specs.

## 8. Verification and Design Review

- [x] 8.1 Run the smallest relevant unit/API/component checks after each implementation group and resolve regressions before widening verification.
- [x] 8.2 Run the content validator, migration verification, full Vitest suite, typecheck, lint, docs validation, and production build.
- [x] 8.3 Run Playwright with two browser contexts and fake media for Blitz challenge/ghost and Tradeoff phase/reconnect/vote flows; record any live-provider checks that remain manual.
- [x] 8.4 Inspect `/wars`, Blitz, results, leaderboards, challenges, and Tradeoff at 390, 768, and 1440 pixels; capture after screenshots and resolve all overflow, input, and accessibility issues.
- [x] 8.5 Run Impeccable critique, polish, and audit; meet repository score floors with zero unresolved P0/P1 findings and complete the design receipt.
- [x] 8.6 Obtain the owner's final `keep` or delegated design decision, validate the design workflow receipt, and run strict OpenSpec validation before archiving.
- [x] 8.7 Prove Solo Tradeoff credentials never enter browser storage, backend requests, telemetry, or rendered error text; test provider failure, retry, phase progression, and compact layouts.
- [x] 8.8 Test combined artifact autosave/freeze behavior and guest-first Wars entry, then inspect the shared Tradeoff workspace at 390, 768, and 1440 pixels.
