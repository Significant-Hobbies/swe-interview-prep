/**
 * Owner-facing analytics — the fixed 4-event taxonomy.
 *
 * EVERY fleet project emits exactly these four events — `signup`, `activated`,
 * `core_action`, `returned` — so a single PostHog project can build one
 * cross-fleet funnel (signup -> activated -> core_action) and a D1/D7
 * retention insight, with no custom dashboard.
 *
 * Every event carries a `project` property. This is what makes per-app and
 * cross-fleet views possible from one PostHog login.
 *
 * This is a Vite SPA, so the wrapper is browser-only. PostHog is initialized
 * once by `installBrowserMonitoring()` (see `foundry-monitoring.ts`).
 */

import { track } from "@saas-maker/posthog-client";

const PROJECT = "swe-interview-prep" as const;

/**
 * The product-specific action behind a `core_action` event.
 * Loop exists to help you actually practise for SWE interviews:
 *  - `concept_reviewed`    — a concept was self-rated in spaced repetition.
 *  - `code_run`            — code was executed in the playground.
 *  - `explanation_graded`  — a Feynman-gate explanation was graded.
 */
export type CoreAction =
  | "concept_reviewed"
  | "code_run"
  | "explanation_graded";

/**
 * The fixed taxonomy. Do NOT add events here — the whole point is that all
 * fleet projects emit the same four. Product-specific detail goes in
 * `CoreAction` (or as extra properties), never as a new top-level event name.
 */
interface AnalyticsEventMap {
  /** First session after an account is created. */
  signup: { project: typeof PROJECT };
  /** The user reaches first real value — their first study action. */
  activated: { project: typeof PROJECT };
  /** The thing the product exists to do. */
  core_action: { project: typeof PROJECT; action: CoreAction };
  /** A return session by a user with prior activity. */
  returned: { project: typeof PROJECT };
}

function emit<K extends keyof AnalyticsEventMap>(
  event: K,
  props: Omit<AnalyticsEventMap[K], "project">,
): void {
  try {
    track(event, { project: PROJECT, ...props });
  } catch {
    // Analytics must NEVER break a user flow. Swallow and move on.
  }
}

const ACTIVATED_KEY = "swe-interview-prep:activated";

/** Fire once, on the first session after an account is created. */
export function trackSignup(): void {
  emit("signup", {});
}

/**
 * Fire once, when the user first reaches real product value — their first
 * study action. De-duplicated per browser via localStorage so it stays a true
 * once-per-user milestone.
 */
export function trackActivated(): void {
  try {
    if (localStorage.getItem(ACTIVATED_KEY)) return;
    localStorage.setItem(ACTIVATED_KEY, "1");
  } catch {
    // localStorage unavailable (private mode) — fall through and still emit.
  }
  emit("activated", {});
}

/** Fire on each completion of a core product action. */
export function trackCoreAction(action: CoreAction): void {
  // The first core action is also the activation milestone.
  trackActivated();
  emit("core_action", { action });
}

/** Fire on session start for a user who has prior activity. */
export function trackReturned(): void {
  emit("returned", {});
}
