import { MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const API_BASE = 'https://api.sassmaker.com';
const CATALOG_ID = 'swe-interview-prep';
const PUBLISHABLE_KEY_PATTERN = /^pk_[a-z0-9]+$/;
const CONFIG_TIMEOUT_MS = 8_000;

const LAUNCHER_URL = 'https://sassmaker.com/feedback-launcher.js';
type FeedbackOptions = { apiKey: string; pageUrl: string; pageTitle: string };
type FeedbackLauncher = {
  mountSharedFooterFeedback: (node: HTMLElement, options: FeedbackOptions) => void;
  openSharedFooterFeedback: (node: HTMLElement, options: FeedbackOptions) => void;
  unmountSharedFooterFeedback: (node: HTMLElement) => void;
};

function getLauncher(): FeedbackLauncher | null {
  const candidate = (window as Window & { SaasMakerFeedback?: FeedbackLauncher }).SaasMakerFeedback;
  return candidate &&
    typeof candidate.mountSharedFooterFeedback === 'function' &&
    typeof candidate.openSharedFooterFeedback === 'function' &&
    typeof candidate.unmountSharedFooterFeedback === 'function'
    ? candidate
    : null;
}

export function SaaSMakerFeedback() {
  const [projectKey, setProjectKey] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const host = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const mounted = useRef<{
    node: HTMLDivElement;
    api: FeedbackLauncher;
  } | null>(null);
  const pending = useRef<HTMLScriptElement | null>(null);
  const loadTimeout = useRef<number | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), CONFIG_TIMEOUT_MS);

    void fetchFeedbackProjectKey(controller.signal)
      .then((key) => {
        if (active && key) setProjectKey(key);
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      isMounted.current = false;
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
      if (loadTimeout.current !== null) window.clearTimeout(loadTimeout.current);
      if (pending.current) {
        pending.current.onload = null;
        pending.current.onerror = null;
        pending.current.remove();
        pending.current = null;
      }
      const widget = mounted.current;
      mounted.current = null;
      if (widget) {
        try {
          widget.api.unmountSharedFooterFeedback(widget.node);
        } finally {
          widget.node.remove();
        }
      }
    };
  }, []);

  function open(api: FeedbackLauncher) {
    if (!isMounted.current || !projectKey || !host.current) return;
    // The shared dialog remembers the active element for focus restoration.
    trigger.current?.focus();
    const options = {
      apiKey: projectKey,
      pageUrl: window.location.origin + window.location.pathname,
      pageTitle: document.title,
    };
    try {
      if (mounted.current) {
        mounted.current.api.openSharedFooterFeedback(mounted.current.node, options);
      } else {
        // A fresh node avoids the launcher's retained mounted dataset marker.
        const node = document.createElement('div');
        host.current.append(node);
        mounted.current = { node, api };
        api.mountSharedFooterFeedback(node, options);
      }
      setStatus('idle');
    } catch {
      const widget = mounted.current;
      mounted.current = null;
      if (widget) {
        try {
          widget.api.unmountSharedFooterFeedback(widget.node);
        } finally {
          widget.node.remove();
        }
      }
      setStatus('error');
    }
  }

  function handleOpen() {
    trigger.current?.focus();
    if (pending.current) return;
    const api = getLauncher();
    if (api) {
      open(api);
      return;
    }
    setStatus('loading');
    const script = document.createElement('script');
    script.src = LAUNCHER_URL;
    script.async = true;
    pending.current = script;
    const finish = () => {
      if (loadTimeout.current !== null) window.clearTimeout(loadTimeout.current);
      loadTimeout.current = null;
      script.onload = null;
      script.onerror = null;
      script.remove();
      pending.current = null;
    };
    script.onload = () => {
      if (pending.current !== script) return;
      finish();
      if (!isMounted.current) return;
      const loaded = getLauncher();
      if (loaded) open(loaded);
      else setStatus('error');
    };
    script.onerror = () => {
      if (pending.current !== script) return;
      finish();
      if (isMounted.current) setStatus('error');
    };
    loadTimeout.current = window.setTimeout(() => {
      finish();
      if (isMounted.current) setStatus('error');
    }, CONFIG_TIMEOUT_MS);
    document.head.append(script);
  }

  if (!projectKey) return null;
  return (
    <>
      <div ref={host} />
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2">
        {status === 'error' && (
          <p
            role="status"
            className="max-w-64 rounded-md border border-white/15 bg-neutral-950 p-3 text-sm text-neutral-200"
          >
            Feedback couldn’t load. Please try again.
          </p>
        )}
        <button
          ref={trigger}
          type="button"
          onClick={handleOpen}
          aria-busy={status === 'loading'}
          className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-neutral-900 px-4 text-sm text-neutral-200 hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <MessageSquare aria-hidden="true" size={16} />
          {status === 'loading'
            ? 'Loading feedback…'
            : status === 'error'
              ? 'Retry feedback'
              : 'Feedback'}
        </button>
      </div>
    </>
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
