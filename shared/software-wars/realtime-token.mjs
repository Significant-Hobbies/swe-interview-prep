import { WAR_LIMITS } from './contracts.mjs';

function base64UrlEncode(input) {
  const bytes = input instanceof Uint8Array ? input : new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmacKey(secret, usages) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('Realtime signing secret must contain at least 32 characters');
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages
  );
}

export async function mintRealtimeToken(claims, secret, now = new Date()) {
  const issuedAt = Math.floor(now.getTime() / 1_000);
  const header = { alg: 'HS256', typ: 'JWT', kid: 'wars-realtime-v1' };
  const payload = {
    iss: 'swe-learning-os',
    aud: 'software-wars-worker',
    iat: issuedAt,
    exp: issuedAt + WAR_LIMITS.realtimeTokenSeconds,
    jti: crypto.randomUUID(),
    ...claims,
  };
  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret, ['sign']),
    new TextEncoder().encode(unsigned)
  );
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifyRealtimeToken(token, secret, now = new Date()) {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = String(token ?? '').split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;
    const unsigned = `${encodedHeader}.${encodedPayload}`;
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret, ['verify']),
      base64UrlDecode(encodedSignature),
      new TextEncoder().encode(unsigned)
    );
    if (!valid) return null;
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedHeader)));
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)));
    const currentSeconds = Math.floor(now.getTime() / 1_000);
    if (header.alg !== 'HS256' || header.kid !== 'wars-realtime-v1') return null;
    if (payload.iss !== 'swe-learning-os' || payload.aud !== 'software-wars-worker') return null;
    if (!payload.matchId || !payload.userId || !payload.participantId || !payload.side) return null;
    if (payload.exp <= currentSeconds || payload.iat > currentSeconds + 30) return null;
    return payload;
  } catch {
    return null;
  }
}
