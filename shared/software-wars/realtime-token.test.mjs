import { describe, expect, it } from 'vitest';
import { mintRealtimeToken, verifyRealtimeToken } from './realtime-token.mjs';

const secret = 'test-only-realtime-signing-secret-at-least-32-chars';
const claims = { matchId: 'match-1', userId: 'user-1', participantId: 'p-1', side: 'side_a' };

describe('match-scoped realtime tokens', () => {
  it('round-trips authorized match membership', async () => {
    const now = new Date('2026-08-13T10:00:00.000Z');
    const token = await mintRealtimeToken(claims, secret, now);
    expect(await verifyRealtimeToken(token, secret, now)).toMatchObject(claims);
  });

  it('rejects tampering and expiry', async () => {
    const issued = new Date('2026-08-13T10:00:00.000Z');
    const token = await mintRealtimeToken(claims, secret, issued);
    expect(await verifyRealtimeToken(`${token}x`, secret, issued)).toBeNull();
    expect(
      await verifyRealtimeToken(token, secret, new Date('2026-08-13T10:06:00.000Z'))
    ).toBeNull();
  });
});
