// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Scale from './Scale';
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'learner' } }) }));
vi.mock('../features/scale/ScaleWorkbench', () => ({
  default: ({
    scenario,
    saveKey,
    chooseProject,
  }: {
    scenario: string;
    saveKey: string;
    chooseProject: () => void;
  }) => (
    <section>
      <p>{scenario}</p>
      <code>{saveKey}</code>
      <button onClick={chooseProject}>Choose project</button>
    </section>
  ),
}));
function HistoryBack() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Browser back</button>;
}

describe('Scale project selection', () => {
  let root: Root;
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  const click = (text: string) => {
    const button = [...container.querySelectorAll('button')].find((e) =>
      e.textContent?.includes(text)
    );
    if (!button) throw new Error(text);
    button.click();
  };
  it('returns to the picker with browser Back instead of unexpectedly starting SaaS', async () => {
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={['/play/scale']}>
          <HistoryBack />
          <Scale />
        </MemoryRouter>
      )
    );
    expect(container.querySelectorAll('.project-option')).toHaveLength(5);
    await act(async () => click('AI gateway'));
    expect(container.textContent).toContain(
      'swe:scale:company:v1:account:learner:project:inference'
    );
    await act(async () => click('Browser back'));
    expect(container.querySelector('h1')?.textContent).toBe('What are you building?');
    await act(async () => click('Tiny SaaS'));
    expect(container.querySelector('code')?.textContent).toBe(
      'swe:scale:company:v1:account:learner'
    );
  });
  it('opens a direct profile URL and allows choosing a different run', async () => {
    await act(async () =>
      root.render(
        <MemoryRouter initialEntries={['/play/scale?project=social']}>
          <Scale />
        </MemoryRouter>
      )
    );
    expect(container.textContent).toContain('social');
    await act(async () => click('Choose project'));
    expect(container.querySelectorAll('.project-option')).toHaveLength(5);
  });
});
