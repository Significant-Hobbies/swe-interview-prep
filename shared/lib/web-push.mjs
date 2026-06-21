/**
 * Minimal Web Push sender for Cloudflare Workers (VAPID + fetch).
 */

function b64url(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importVapidPrivateKey(base64Key) {
  const raw = Uint8Array.from(atob(base64Key.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  return crypto.subtle.importKey('pkcs8', raw, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

async function createVapidJwt(audience, subject, publicKey, privateKey) {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ aud: audience, exp, sub: subject })));
  const unsigned = `${header}.${payload}`;
  const key = await importVapidPrivateKey(privateKey);
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${b64url(sig)}`;
}

export async function sendWebPush(subscription, payload, vapidKeys) {
  const { endpoint, keys } = subscription;
  const audience = new URL(endpoint).origin;
  const jwt = await createVapidJwt(
    audience,
    vapidKeys.subject || 'mailto:digest@loop.local',
    vapidKeys.publicKey,
    vapidKeys.privateKey,
  );

  const body = JSON.stringify(payload);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `vapid t=${jwt}, k=${vapidKeys.publicKey}`,
      'Content-Type': 'application/json',
      TTL: '86400',
    },
    body,
  });

  return { ok: res.ok, status: res.status };
}