import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import {
  createMediaProvider,
  MediaProviderError,
  verifyRealtimeKitWebhook,
} from './media-provider.mjs';

const configuredEnv = {
  REALTIMEKIT_ACCOUNT_ID: 'account',
  REALTIMEKIT_APP_ID: 'app',
  REALTIMEKIT_API_TOKEN: 'secret-token',
  REALTIMEKIT_PARTICIPANT_PRESET: 'player',
};

describe('RealtimeKit provider boundary', () => {
  it('fails explicitly but leaves game-state flows available when disabled', async () => {
    const provider = createMediaProvider({});
    expect(provider).toMatchObject({ kind: 'disabled', configured: false });
    await expect(provider.createMeeting({ matchId: 'm-1' })).rejects.toMatchObject({
      code: 'provider_disabled',
    });
  });

  it('creates rooms with recording and transcription off by default', async () => {
    const fetchImpl = vi.fn(async (_url, init) =>
      Response.json({ success: true, data: { id: 'meeting-1', status: 'ACTIVE' } })
    );
    const provider = createMediaProvider(configuredEnv, { fetchImpl });
    await expect(provider.createMeeting({ matchId: 'm-1' })).resolves.toEqual({
      meetingId: 'meeting-1',
      status: 'ACTIVE',
    });
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(request).toMatchObject({
      record_on_start: false,
      transcribe_on_end: false,
      summarize_on_end: false,
    });
    expect(fetchImpl.mock.calls[0][1].headers.get('authorization')).toBe('Bearer secret-token');
  });

  it('enrolls only participant-scoped identities', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        success: true,
        data: { id: 'provider-p-1', auth_token: 'participant-token' },
      })
    );
    const provider = createMediaProvider(configuredEnv, { fetchImpl });
    await expect(
      provider.addParticipant({ meetingId: 'meeting-1', participantId: 'p-1', displayName: 'Ada' })
    ).resolves.toEqual({ participantId: 'provider-p-1', authToken: 'participant-token' });
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(request).toMatchObject({ custom_participant_id: 'p-1', preset_name: 'player' });
  });

  it('maps provider failures without leaking response bodies', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ success: false, errors: [{ message: 'sensitive' }] }, { status: 503 })
    );
    const provider = createMediaProvider(configuredEnv, { fetchImpl });
    await expect(provider.createMeeting({ matchId: 'm-1' })).rejects.toEqual(
      expect.objectContaining({ code: 'provider_unavailable', retryable: true })
    );
    await expect(provider.createMeeting({ matchId: 'm-1' })).rejects.not.toThrow(/sensitive/);
  });

  it('cryptographically verifies signed provider webhooks and rejects tampering', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });
    const body = new TextEncoder().encode('{"event":"transcript.ready"}');
    const signature = sign('RSA-SHA256', body, privateKey).toString('base64');
    const fetchImpl = vi.fn(async () => Response.json({ data: { publicKey: publicKeyPem } }));
    await expect(verifyRealtimeKitWebhook({ rawBody: body, signature, fetchImpl })).resolves.toBe(
      true
    );
    await expect(
      verifyRealtimeKitWebhook({
        rawBody: new TextEncoder().encode('{"event":"tampered"}'),
        signature,
        fetchImpl,
      })
    ).resolves.toBe(false);
  });
});
