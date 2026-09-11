// @vitest-environment happy-dom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScaleWorkbench from './ScaleWorkbench';

const workers: Array<{
  terminate: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
}> = [];
class FakeWorker {
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    workers.push(this);
  }
}

describe('Scale route lifecycle', () => {
  let root: Root;
  let container: HTMLDivElement;
  let request: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    workers.length = 0;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    vi.stubGlobal('Worker', FakeWorker);
    request = vi.fn(async (_name, _options, callback) => callback({ name: 'company' }));
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request } });
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });
  it('acquires one writer and creates one worker during StrictMode replay', async () => {
    await act(async () =>
      root.render(
        <StrictMode>
          <MemoryRouter>
            <ScaleWorkbench saveKey="test:scale:guest" />
          </MemoryRouter>
        </StrictMode>
      )
    );
    expect(request).toHaveBeenCalledTimes(1);
    expect(workers).toHaveLength(1);
    expect(workers[0].postMessage).toHaveBeenCalledWith({
      type: 'init',
      company: null,
      scenario: 'saas',
    });
    await act(async () => root.render(<div>Left game</div>));
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
  });
  it('offers an exit without starting a worker when another tab owns the company', async () => {
    request.mockImplementation(async (_name, _options, callback) => callback(null));
    await act(async () =>
      root.render(
        <MemoryRouter>
          <ScaleWorkbench saveKey="test:scale:locked" />
        </MemoryRouter>
      )
    );
    expect(workers).toHaveLength(0);
    expect(container.textContent).toContain('already running in another tab');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/play');
  });
});
