// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ChallengePanel } from './ChallengePanel';
import { freshCompany } from './game/model';
import { Runtime } from './game/runtime';

it('announces failure after endless play and offers the restart action', async () => {
  const company = freshCompany();
  company.cash = 0;
  company.hours = 40;
  company.run = { stableHours: 24, completedAt: 30, continued: true };
  const container = document.createElement('div');
  const root = createRoot(container);
  const restart = vi.fn();
  try {
    await act(async () =>
      root.render(
        <ChallengePanel view={new Runtime(company).view()} send={vi.fn()} restart={restart} />
      )
    );
    expect(container.querySelector('h2')?.textContent).toBe('Your company ran out of cash.');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Runway exhausted');
    const button = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Restart this project'
    );
    await act(async () => button?.click());
    expect(restart).toHaveBeenCalledOnce();
    expect(container.textContent).not.toContain('Keep growing');
  } finally {
    await act(async () => root.unmount());
  }
});
