# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the owner, studying software engineering deeply enough to
recognize mechanisms, make trade-offs, implement systems, and explain the
result. Public visitors can browse the curriculum and use guest learning
surfaces, but team administration and multi-tenant learning workflows are not
product goals.

## Product Purpose

The product is a personal SWE learning OS. It consolidates concepts, drills,
code and diagram work, projects, Socratic help, explain-backs, and spaced
repetition into one loop: Concept → Drill → Build → Review → Apply. Success
means retained causal understanding backed by an artifact or evidence, not
content consumption or completed screens.

## Positioning

The differentiating mechanism is an evidence-gated learning loop: learners
make or inspect something, explain it in their own words, and use the result to
update adaptive review. Coding, system design, production engineering, AI
engineering, and interview practice share the same mastery model instead of
living in separate tools.

## Operating Context

The application is a React web SPA with public curriculum pages and guest-first
interactive routes. Learners move among Dashboard, Learn, Practice, Wars,
Playground, Progress, Build Lab, source material, and adaptive sessions.
Monaco supports code work, Excalidraw supports diagrams, the Socratic companion
probes understanding, and Feynman/understanding checks feed FSRS review.
Authenticated state persists through the existing backend; guest state remains
account-scoped in the browser.

## Capabilities and Constraints

- The product covers DSA, LLD/HLD, backend and platform engineering,
  distributed systems, AI engineering, developer tools, application
  engineering, behavioral practice, and adjacent foundations.
- Every route remains usable in guest mode; authentication primarily adds
  durable cross-device progress.
- The Socratic AI must not give direct solutions.
- Learning content under `docs/learning/` is routed product content and retains
  stable slugs.
- Canonical curriculum data drives both the interactive app and generated
  public curriculum.
- Every ranked Blitz question must have one explicit canonical Learn concept,
  authoritative sources, and authored reasoning for every answer option.
- Dashboard answers “what should I learn today?” with one deterministic
  recovery, retention, or progression priority and an explicit evidence
  contract before showing optional history or catalogue context.
- Decision labs, formulas, and paper contracts may produce local evidence, but
  only the existing authenticated Feynman-to-FSRS path may grant mastery.
- Learn Inference is represented as a 42-section companion path that links to
  the canonical book; the product stores original summaries and retrieval
  prompts, not copied source bodies.
- Focused study and decision-lab drafts are account-scoped, version-aware
  continuity state. Completing a draft is evidence, not mastery.
- Blitz ratings and Tradeoff ratings are separate; ranked state, deadlines,
  answers, and match outcomes remain server-owned.
- Production remains a Vite/React application on Cloudflare Pages with Pages
  Functions and Cloudflare D1; production deploys are manual.
- Schema changes are additive, and new dependencies or production services
  require explicit approval.

## Brand Commitments

- Keep the existing repository and product names unchanged.
- Preserve the direct, rigorous, engineer-to-engineer voice.
- “No learning without an artifact” remains the central commitment.
- Avoid gamified completion theatre, fabricated mastery, and AI answers that
  bypass the learner’s reasoning.

## Evidence on Hand

The repository contains the shipped application, tests, 250 canonical
concepts, 19 tracks, 24 roadmaps, drills, artifacts, generated curriculum
pages, source catalogs, FSRS state handling, and Feynman grading. These are
product evidence. The project has no customer testimonials, commercial usage
claims, or benchmark claims that future work may invent.

## Product Principles

1. Require an artifact, decision, prediction, or other inspectable evidence.
2. Make the learner explain causality instead of rewarding recognition.
3. Prefer primary sources and exact implementation truth over summaries.
4. Keep practice safe and accessible without weakening the real mechanism.
5. Preserve one mastery loop across concepts, drills, builds, and simulations.

## Accessibility & Inclusion

Interactive learning must remain keyboard-operable, responsive from compact
mobile layouts through desktop workspaces, legible without color-only state,
and compatible with reduced-motion preferences.
