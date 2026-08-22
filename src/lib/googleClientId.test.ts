import { afterEach, describe, expect, it, vi } from 'vitest';

import { getGoogleClientId, PRODUCTION_GOOGLE_CLIENT_ID } from './googleClientId';

describe('getGoogleClientId', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('uses the public production client for builds without an injected client ID', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');

    expect(getGoogleClientId()).toBe(PRODUCTION_GOOGLE_CLIENT_ID);
  });

  it('prefers an explicitly injected client ID', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', ' preview-client ');

    expect(getGoogleClientId()).toBe('preview-client');
  });
});
