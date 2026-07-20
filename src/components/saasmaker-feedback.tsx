import '@saas-maker/feedback/dist/index.css';

import { lazy, Suspense } from 'react';

const API_KEY = import.meta.env.VITE_SAASMAKER_API_KEY ?? '';
const API_BASE = 'https://api.sassmaker.com';

const FeedbackWidget = lazy(async () => {
  const mod = await import('@saas-maker/feedback');
  return { default: mod.FeedbackWidget };
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
