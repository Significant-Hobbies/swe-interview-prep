# Cognitive Fitness Roadmap — 2026-05-29

**Status:** Historical planning snapshot — superseded by the personal-use closure in `PROJECT_STATUS.md` (2026-07-10). Items below are paused candidates, not active planned work.

## Frame

Reposition the Learning OS as **cognitive fitness via hard novel problems at the edge of skill in the user's chosen domain (SWE)**. FAANG-pass is a byproduct of the intensity, not the framing. Defensible mechanism per the research is **cognitive reserve** (resilience to later cognitive decline through compounding crystallized intelligence in a complex domain), not raising fluid intelligence — fluid intelligence is mostly fixed after ~25.

See `src/pages/About.tsx` for the in-product research-basis section.

## What landed (v1, 2026-05-29)

- **Focus mode** — toggle in Playground that hides Companion + disables auto-tagger. Counts toggle-on sessions per rolling 7 days (Playground header + Progress tile). Implements the "audit offloaded capacities periodically" design principle (Kosmyna et al. 2025 EEG, Lee et al. 2025 critical-thinking, Dahmani-Bohbot GPS atrophy).
- **Per-track adaptive ELO** — static problem ratings from `difficulty` (intro=1200, core=1600, advanced=2000); per-track user ELO in `useUserElo`; provisional K=40 for first 10 solves, K=24 after. Practice page reorders drills by proximity to user's ELO + "Recommended for your level" row. Progress tab shows per-track ELO. Implements desirable-difficulty calibration (Bjork) without visible-progress-bar gamification.

## Historical deferred candidates — ranked by leverage

### Former near-term order (paused)

1. **Failure signal for ELO**
   - Today, ELO can only go up — there's no "couldn't solve" path. The system is over-optimistic.
   - Minimum: a "Couldn't solve" button next to "Mark solved" in `DrillWorkspace`. Calls `recordResult(track, problemElo, 0)`.
   - Optional: time-out-based auto-fail after N minutes idle on a drill.

2. **Cold-start self-declare UI**
   - All tracks default to 1500. Provisional K=40 makes the first ~10 solves move you fast, but it's still ~10 solves before suggestions are calibrated.
   - Minimum: a Settings panel lets you set per-track starting ELO. 4 anchored bands (1100/1400/1700/2000 = beginner/comfortable/working pro/senior).

3. **Desirable-difficulty defaults**
   - Cross-track interleaving in Practice review queue (mix concepts across tracks, not blocked by track).
   - Retrieval-over-recognition in concept review prompts (free-recall textarea by default, not multiple-choice).
   - FSRS tuning toward edge-of-forgetting intervals (current default may be too safe).
   - All invisible; research-load-bearing (Bjork, Roediger-Karpicke, interleaving meta-analyses).

4. **FAANG-as-byproduct reframe**
   - Copy update across `About.tsx`, `Layout.tsx` (nav labels?), Mock tab subtitle, landing page.
   - The current framing is interview-prep with cognitive-fitness as subtext. Invert: cognitive-fitness with Mock as the proof point.

5. **Static reading list / research surface in About**
   - Already added in this commit; revise as the library grows.

### Medium-term

6. **AI-as-judge for solution quality** (`FeynmanGate` extension)
   - Today's signal is binary (solved / not). AI judge would evaluate the *solution* — correctness, approach optimality, edge cases, complexity — and feed a quality score into the ELO update.
   - Risk: shallow grading, prompt-injection from your own code/comments, cost per solve.
   - Reuses the FeynmanGate AI prompt pattern.

7. **LLM-anchored problem rating refinement** (Option #2 from May 2026 discussion)
   - Only if the tier-default banding (intro=1200, core=1600, advanced=2000) feels "very off" after use.
   - One-time script: each problem rated by LLM with calibration anchors (LeetCode Medium = 1500, ICPC Finals = 2500, etc.). Rating committed to JSON as a per-problem override.
   - User flagged distrust of LLM-generated values being committed (`memory: feedback-llm-output-trust`). Surface every rating for review before commit.

8. **Mock interview ELO**
   - Per-track ELO presently updates only via drill solves. Mock interviews could feed in too — at the end of a mock, AI judges performance + difficulty + assigns a score that updates ELO across the relevant tracks (e.g. system-design mock affects backend + databases + system-design tracks).

9. **Playground ELO / artifact-ELO**
   - Playground is freeform; doesn't have a difficulty rating. Could be inferred from concepts tagged via `useTagger` after the session. Speculative; defer until basic loop has data.

10. **DB sync of user ELO**
    - Currently localStorage-only. Mirror the existing hybrid pattern: localStorage for guests, DB-backed for signed-in users. Requires a new `user_elo` table + `/api/learning?action=elo` endpoint.

### Cross-project (fleet integrations)

These require coordination with adjacent projects under `../`. See `memory: project-fleet-architecture-vision` for the email-as-identity inter-app pattern.

11. **psiScore → intensity gating** (`../today-little-log` → `swe-interview-prep`)
    - today-little-log exposes `GET /api/today-state` returning `{ psiScore, sleep, energy }` for the current user
    - swe-interview-prep reads this and gates drill intensity by recovery state (low psiScore → suggest easier drill or rest day, not at-ELO)
    - First fleet integration; tests whether the lifestyle→intensity loop the research most strongly endorses changes behavior
    - Auth: shared service token + `X-Fleet-User-Email` header. No unified-auth migration needed.

12. **Reading-seeds-problems** (`../reader` → `swe-interview-prep`)
    - reader exposes recent article tags / concepts captured
    - swe-interview-prep biases problem suggestions toward concepts you've been reading about (closes the read → drill → build loop)
    - More speculative than #11 — defer until psiScore integration teaches us whether cross-app signals actually change behavior.

13. **Reader: production-leaning rewrite** (`../reader`)
    - Today's AI summary in reader is consumption-leaning (atrophy risk per Kosmyna 2025 / Lee 2025).
    - Flip to production-leaning: AI summary becomes optional, gated behind "explain back first" (FeynmanGate-style for articles).
    - Out of scope for swe-interview-prep — flagged as fleet-level architecture decision.

### Architecture / long-term

14. **Fleet inter-app comms framework**
    - Codify the email-as-identity pattern as a small shared TS module that all three projects depend on (`@fleet/inter-app-auth` or similar — not yet a real package).
    - Shared service-token validation, email-header parsing, request signing for hardening (signed JWT instead of plaintext email when multi-user becomes a thing).
    - Defer until at least 2 inter-app integrations exist; YAGNI before that.

15. **Mobile (PWA-ify swe-interview-prep)**
    - Mobile-first nav already exists in `Layout.tsx`. Adding PWA installable shell (vite-plugin-pwa) is roughly half a day.
    - Use case is the coupling layer — quick checks (intensity recommendation, focus toggle, focus-session count, daily review) — not deep work.
    - today-little-log already PWA-shaped; this would catch swe-interview-prep up.
    - User said "drop the mobile thing for now" 2026-05-29 — revisit when other pieces stabilize.

## Out of scope (deliberately)

- **Visible leaderboards, badges, streak-anxiety mechanics, levels.** ELO numbers visible on Progress is intentional and bounded (audit, not goal). Don't dress this up further.
- **Brain-training mini-games.** No far transfer (Simons 2016, Melby-Lervåg). Anti-pattern for this project.
- **Native iOS / Android apps.** Solo project; PWA covers it.
- **Multi-user.** Solo by design. Multi-user adds auth bridging, per-user data partitioning, content moderation — all unrelated to the cognitive-fitness mission.

## Open questions (decisions deferred)

- Should ELO be hidden during solve, hybrid (visible on Progress + small label in Practice), or fully visible (Strava-style)? Currently hybrid. Revisit if it skews behavior.
- Does the "no-tools mode" toggle change behavior at all, or does it sit unused? Decide after 2-3 weeks of use; if unused, rip it back out and document the lesson.
- Should solving a drill while in focus mode be weighted higher in ELO (no AI help = more impressive solve)? Probably yes; not implemented yet.
