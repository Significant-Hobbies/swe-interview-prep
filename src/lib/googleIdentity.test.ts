import { describe, expect, it, vi } from 'vitest';

import { type GoogleIdentityApi, renderGoogleIdentityButton } from './googleIdentity';

describe('renderGoogleIdentityButton', () => {
  it('initializes popup auth once and renders every visible Google button', () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    const api = { initialize, renderButton } as GoogleIdentityApi;
    const onCredential = vi.fn(async () => {});

    for (const size of ['medium', 'large'] as const) {
      renderGoogleIdentityButton({
        api,
        parent: {} as HTMLElement,
        clientId: 'client-id',
        size,
        text: 'signin_with',
        theme: 'filled_black',
        onCredential,
      });
    }

    expect(initialize).toHaveBeenCalledOnce();
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'client-id', ux_mode: 'popup', itp_support: true })
    );
    expect(renderButton).toHaveBeenCalledTimes(2);

    const config = initialize.mock.calls[0]?.[0];
    config?.callback({ credential: 'test-google-credential' });
    expect(onCredential).toHaveBeenCalledWith('test-google-credential');
  });
});
