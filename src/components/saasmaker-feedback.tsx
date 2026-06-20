import "@saas-maker/feedback/dist/index.css";
import "@saas-maker/testimonials/dist/index.css";
import "@saas-maker/changelog-widget/dist/index.css";

import { lazy, Suspense } from "react";

const API_KEY = import.meta.env.VITE_SAASMAKER_API_KEY ?? "";
const API_BASE = "https://api.sassmaker.com";

const FeedbackWidget = lazy(async () => {
  const mod = await import("@saas-maker/feedback");
  return { default: mod.FeedbackWidget };
});

const TestimonialWall = lazy(async () => {
  const mod = await import("@saas-maker/testimonials");
  return { default: mod.TestimonialWall };
});

const ChangelogTimeline = lazy(async () => {
  const mod = await import("@saas-maker/changelog-widget");
  return { default: mod.ChangelogTimeline };
});

export function SaaSMakerFeedback() {
  if (!API_KEY) return null;
  return (
    <Suspense fallback={null}>
      <FeedbackWidget
        projectId={API_KEY}
        apiBaseUrl={API_BASE}
        position="bottom-right"
        theme="dark"
        triggerText="Give feedback"
      />
    </Suspense>
  );
}

export function SaaSMakerTestimonials() {
  if (!API_KEY) return null;
  return (
    <Suspense fallback={null}>
      <TestimonialWall projectId={API_KEY} apiBaseUrl={API_BASE} theme="dark" layout="grid" />
    </Suspense>
  );
}

export function SaaSMakerChangelog() {
  if (!API_KEY) return null;
  return (
    <Suspense fallback={null}>
      <ChangelogTimeline projectId={API_KEY} apiBaseUrl={API_BASE} theme="dark" />
    </Suspense>
  );
}
