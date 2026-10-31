// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initialEntryScript } from './learnerState';
import { consumeInitialSettings, preparePublicEntry } from './publicEntry';

const sourceHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
const rootGuardCss = sourceHtml.match(
  /<style>\s*(#root\[data-public-prerender\][\s\S]*?)<\/style>/
)?.[1];
if (!rootGuardCss) throw new Error('Actual public-entry visibility stylesheet is missing');

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  document.body.innerHTML =
    '<div id="lcp-shell"><div id="public-entry-shell" hidden></div></div><div id="root" data-public-prerender><button aria-label="Settings">Settings</button><a href="/learn">Start</a></div>';
  const style = document.createElement('style');
  style.id = 'public-entry-fixture-style';
  style.textContent = rootGuardCss;
  document.head.append(style);
});
afterEach(() => {
  if (window.__sweEntry?.capture)
    document.removeEventListener('click', window.__sweEntry.capture, true);
  delete window.__sweEntry;
  document.documentElement.removeAttribute('data-public-entry');
  document.body.replaceChildren();
  document.getElementById('public-entry-fixture-style')?.remove();
});
function start() {
  new Function('window', 'document', 'location', 'localStorage', initialEntryScript(true))(
    window,
    document,
    window.location,
    localStorage
  );
}
describe('prerender interaction handoff', () => {
  it.each([
    ['profile', 'dsa-prep-profile', { id: 'fixture' }],
    ['progress', 'swe-os:notes', [{ id: 'fixture-note', body: 'Public fixture' }]],
  ] as const)('client-renders if initial %s disappears before bootstrap', (_kind, key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    start();
    const root = document.getElementById('root')!;
    expect(window.__sweEntry?.prerender).toBe(false);
    expect(getComputedStyle(root).display).toBe('none');
    localStorage.removeItem(key);
    const hydrate = preparePublicEntry(root);
    expect({ hydrate, display: getComputedStyle(root).display }).toEqual({
      hydrate: false,
      display: 'block',
    });
    expect(root.childElementCount).toBe(0);
    expect(root.hasAttribute('data-public-prerender')).toBe(false);
  });
  it('keeps real anchor destinations and transfers one early Settings intent to the actual modal', () => {
    start();
    const button = document.querySelector('button')!;
    button.click();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(document.querySelector('a')?.getAttribute('href')).toBe('/learn');
    expect(preparePublicEntry(document.getElementById('root')!)).toBe(true);
    expect(button.hasAttribute('aria-busy')).toBe(false);
    expect(consumeInitialSettings()).toBe(true);
    expect(consumeInitialSettings()).toBe(false);
  });
  it('revalidates a profile arriving before bootstrap and leaves normal client routing in control', () => {
    start();
    document.querySelector('button')!.click();
    localStorage.setItem('dsa-prep-profile', JSON.stringify({ id: 'fixture' }));
    const root = document.getElementById('root')!;
    expect(preparePublicEntry(root)).toBe(false);
    expect(root.hasAttribute('data-public-prerender')).toBe(false);
    expect(document.documentElement.hasAttribute('data-public-entry')).toBe(false);
    expect(document.getElementById('public-entry-shell')!.hidden).toBe(false);
    expect(consumeInitialSettings()).toBe(false);
  });
});
