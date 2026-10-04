import '@saas-maker/feedback/dist/index.css';

import { lazy, Suspense, useEffect, useState } from 'react';

const API_BASE = 'https://api.sassmaker.com';
const CATALOG_ID = 'swe-interview-prep';
const PUBLISHABLE_KEY_PATTERN = /^pk_[a-z0-9]+$/;
const CONFIG_TIMEOUT_MS = 8_000;

const FeedbackWidget = lazy(async () => {
  const mod = await import('@saas-maker/feedback');
  return { default: mod.FeedbackWidget };
});

export function SaaSMakerFeedback() {
  const [projectKey, setProjectKey] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), CONFIG_TIMEOUT_MS);

    void fetchFeedbackProjectKey(controller.signal)
      .then((key) => {
        if (active && key) setProjectKey(key);
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (!projectKey) return null;
  return (
    <Suspense fallback={null}>
      <FeedbackWidget
        projectId={projectKey}
        apiBaseUrl={API_BASE}
        position="bottom-right"
        theme="dark"
        accentColor="#171717"
        triggerText="Feedback"
      />
    </Suspense>
  );
}

export async function fetchFeedbackProjectKey(signal: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/v1/capture-config/${CATALOG_ID}`, {
      headers: { accept: 'application/json' },
      signal,
    });
    if (!response.ok) return null;

    const config: unknown = await response.json();
    if (typeof config !== 'object' || config === null) return null;

    const projectKey = (config as { api_key?: unknown }).api_key;
    return typeof projectKey === 'string' && PUBLISHABLE_KEY_PATTERN.test(projectKey)
      ? projectKey
      : null;
  } catch {
    return null;
  }
}
