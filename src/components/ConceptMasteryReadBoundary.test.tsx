// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ConceptMasteryReadBoundary } from './ConceptMasteryReadBoundary';

it('keeps a draft mounted but unavailable until a failed read is retried', async () => {
  const node = document.createElement('div');
  document.body.append(node);
  const root = createRoot(node);
  const refresh = vi.fn().mockResolvedValue(undefined);
  const view = (loading: boolean, error: string | null) => (
    <ConceptMasteryReadBoundary loading={loading} error={error} refresh={refresh}>
      <input defaultValue="Synthetic retained draft" />
      <button type="button">Again</button>
    </ConceptMasteryReadBoundary>
  );
  try {
    await act(async () => root.render(view(true, null)));
    const input = node.querySelector('input')!;
    input.value = 'Edited local draft';
    expect(node.querySelector('[role=status]')?.textContent).toContain('Loading concept mastery');
    expect(input.parentElement?.hasAttribute('inert')).toBe(true);
    await act(async () => root.render(view(false, 'Synthetic read failure (503).')));
    expect(node.querySelector('[role=alert]')?.textContent).toContain('(503)');
    const retry = node.querySelector('[role=alert] button') as HTMLButtonElement;
    await act(async () => retry.click());
    expect(refresh).toHaveBeenCalledOnce();
    await act(async () => root.render(view(false, null)));
    expect(node.querySelector('input')).toBe(input);
    expect(input.value).toBe('Edited local draft');
    expect(input.parentElement?.hasAttribute('inert')).toBe(false);
    expect(node.querySelector('[role=alert],[role=status]')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});
