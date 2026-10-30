import { initialEntry, type InitialEntry } from './learnerState';

declare global {
  interface Window {
    __sweEntry?: InitialEntry & {
      enabled: boolean;
      settingsPending: boolean;
      capture?: (event: MouseEvent) => void;
    };
  }
}

/** Recheck authority at bootstrap; an earlier guest hint never wins over storage. */
export function preparePublicEntry(root: HTMLElement): boolean {
  const state = window.__sweEntry;
  const entry = initialEntry();
  const hydrate = Boolean(
    state?.enabled && root.hasAttribute('data-public-prerender') && entry.prerender
  );
  if (state?.capture) document.removeEventListener('click', state.capture, true);
  root.querySelector('button[aria-label="Settings"]')?.removeAttribute('aria-busy');
  if (!hydrate) {
    if (state) state.settingsPending = false;
    document.documentElement.removeAttribute('data-public-entry');
    if (root.hasAttribute('data-public-prerender')) root.replaceChildren();
    root.removeAttribute('data-public-prerender');
    const shell = document.getElementById('lcp-shell');
    if (shell) shell.hidden = false;
    const returningShell = document.getElementById('public-entry-shell');
    if (returningShell) returningShell.hidden = !entry.returning;
  }
  return hydrate;
}

export function consumeInitialSettings(): boolean {
  const state = window.__sweEntry;
  if (!state?.settingsPending) return false;
  state.settingsPending = false;
  return true;
}
