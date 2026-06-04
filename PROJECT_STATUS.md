# Project Status

Last updated: 2026-06-04

## Current Scope

Interview Coder is an interview-prep app for DSA, low-level design, system design, and behavioral preparation. It combines a code editor, diagramming, AI hints, spaced repetition, LeetCode import, and progress tracking.

## Done

- The app deploys to Cloudflare Pages with Pages Functions as the backend.
- Turso, Google One Tap auth, R2-backed Go WASM support, PostHog, and multi-provider AI are documented.
- Core surfaces include Monaco coding, Excalidraw diagrams, AI help, progress tracking, spaced repetition, pattern-based learning, and LeetCode import.
- Local frontend and local AI server workflows are documented.
- Audit fixes addressed unauthenticated API access, JWT fallback behavior, progress persistence, Google API key exposure, and related high-risk paths.

## Planned Next

1. Bring stale migration and deployment docs into alignment with the Cloudflare Pages Functions architecture.
2. Verify the full auth, progress, AI, and deploy checklist against current Cloudflare configuration.
3. Add focused regression tests around previously fixed auth/API paths.
4. Improve prep flows so DSA, LLD, system design, and behavioral practice feel like one coherent study system.

## Deferred / Parked

- Vercel/serverless migration instructions are stale and should not guide new work.
- Broad ATS/job-application features are out of scope.
- New backend providers or auth modes are deferred until the Cloudflare path is stable.
