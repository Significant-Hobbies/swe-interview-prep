## Why

The Learning OS can diagnose and remediate knowledge gaps, but it still asks the learner to choose what to study. Software Wars adds a direct competitive entry point: play first, discover weaknesses from evidence, feed those weaknesses into the existing concept and FSRS loop, and return to competition with measurable improvement.

The owner has explicitly requested both the short objective mode and the 30-minute tradeoff mode. This reopens feature development for this bounded product expansion despite the repository's prior maintenance-only status; unrelated roadmap expansion remains out of scope.

## What Changes

- Add a contextual `/wars` product surface with two independent modes:
  - **Blitz Wars**: 60–120 second objective battles against precomputed AI opponents, one-use asynchronous human ghosts, or challenge-link opponents.
  - **Tradeoff Wars**: scheduled 30-minute engineering battles with live video/audio, private artifacts, a synchronized requirement twist, artifact reveal, debate, player voting, and AI adjudication when votes disagree.
- Add server-owned, immutable competitive state: match snapshots, question/problem versions, attempts, submissions, votes, results, separate Blitz and Tradeoff ratings, rating events, match history, challenges, and leaderboards.
- Add a versioned, source-backed, server-only curriculum-wide question/problem bank. Every Blitz question has one canonical primary Learning OS concept plus optional supporting concepts, option-by-option explanations, a defensible answer, provenance, lifecycle status, and separately counted parameterized variants where valid.
- Derive Blitz track, roadmap, and concept queues from the canonical 19-track, 25-roadmap, 252-concept Learning OS catalogue. Wars does not maintain a second topic catalogue; queues remain visible with honest readiness counts even when their ranked depth is incomplete.
- Add precomputed and versioned AI opponent profiles. AI latency never affects scoring.
- Add post-match remediation that explains mistakes, records weak concepts through the existing authenticated FSRS path, and recommends the matching lesson or drill.
- Add Cloudflare RealtimeKit integration for Tradeoff media and post-meeting transcription, with a provider boundary and a graceful configuration-disabled state.
- Add a Cloudflare Worker with one Durable Object per live Tradeoff match for authoritative phases, deadlines, twist delivery, presence, reconnects, and voting. Media state remains separate from game state.
- Add shareable result and challenge routes that reveal outcomes without exposing ranked question content.
- Preserve the existing visual language and six-tab navigation. Today and Mock gain contextual entry points; Wars does not become a seventh primary tab in this change.
- Preserve guest-first browsing, while ranked play, durable ratings, human challenges, and live Tradeoff participation require authentication.

## Capabilities

### New Capabilities

- `blitz-wars`: Objective battle matchmaking, server-authoritative timing and scoring, AI/ghost/challenge opponents, rematches, history, and shareable outcomes.
- `tradeoff-wars`: Scheduled live engineering battles, RealtimeKit rooms, authoritative phase coordination, private artifact submission and reveal, debate transcripts, voting, and adjudication.
- `competitive-ratings`: Separate server-owned Blitz and Tradeoff ratings, provisional status, immutable rating events, and public leaderboards.
- `wars-content-governance`: Versioned ranked questions and tradeoff problems with sources, concepts, rubrics, explanations, lifecycle controls, and precomputed AI answers.
- `wars-learning-loop`: Deterministic battle evidence mapped into explanations, weak concepts, FSRS remediation, lesson/drill recommendations, and later variant resurfacing.

### Modified Capabilities

- Learning catalogue integration: canonical concepts, tracks, and roadmaps now define Wars discovery and scoped practice queues without changing their learning content or routes.

## Impact

- **Frontend:** new Wars routes, battle/result/history/leaderboard/challenge screens, shared battle components, Today/Mock entry points, and responsive media/workbench layouts.
- **API:** new authenticated and public Wars endpoints rather than extending the learning action registry with unrelated competitive mutations.
- **Data:** additive D1 migrations for competitive entities; R2 references for large artifact/transcript payloads; no request-time schema mutation.
- **Realtime:** a separately deployable Worker/Durable Object for live match state plus Cloudflare RealtimeKit REST, SDK, webhook, and transcription integration.
- **Dependencies:** add the official Cloudflare RealtimeKit Core and React packages because the existing application has no WebRTC media SDK. The focused two-person controls stay local; no general-purpose state, chart, or component framework is added.
- **Configuration:** document non-secret RealtimeKit app/account identifiers and keep API tokens/webhook secrets in Cloudflare-managed secrets. No secret or local env file is committed.
- **Operations:** manual deployment remains the release path. RealtimeKit, the live-match Worker, additive D1 migration, and Pages build require explicit operator steps and independent rollback controls.
- **Product status:** on completion, update canonical product docs and `PROJECT_STATUS.md` to record the owner-requested Software Wars expansion.
