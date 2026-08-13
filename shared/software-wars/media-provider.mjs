const REALTIMEKIT_API_BASE = 'https://api.cloudflare.com/client/v4';
const WEBHOOK_PUBLIC_KEY_URL = 'https://api.realtime.cloudflare.com/.well-known/webhooks.json';

export class MediaProviderError extends Error {
  constructor(code, message, retryable = false) {
    super(message);
    this.name = 'MediaProviderError';
    this.code = code;
    this.retryable = retryable;
  }
}

function configured(env) {
  return Boolean(env.REALTIMEKIT_ACCOUNT_ID && env.REALTIMEKIT_APP_ID && env.REALTIMEKIT_API_TOKEN);
}

async function readProviderResponse(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    const retryable = response.status === 429 || response.status >= 500;
    throw new MediaProviderError(
      retryable ? 'provider_unavailable' : 'provider_rejected',
      retryable
        ? 'Realtime media is temporarily unavailable'
        : 'Realtime media request was rejected',
      retryable
    );
  }
  return payload?.data ?? payload;
}

export function createMediaProvider(env, { fetchImpl = fetch } = {}) {
  if (!configured(env)) {
    return {
      kind: 'disabled',
      configured: false,
      async createMeeting() {
        throw new MediaProviderError('provider_disabled', 'RealtimeKit is not configured');
      },
      async addParticipant() {
        throw new MediaProviderError('provider_disabled', 'RealtimeKit is not configured');
      },
      async refreshParticipantToken() {
        throw new MediaProviderError('provider_disabled', 'RealtimeKit is not configured');
      },
      async closeMeeting() {
        return { status: 'disabled' };
      },
      async configureTranscription() {
        return { status: 'disabled' };
      },
    };
  }

  const base = `${REALTIMEKIT_API_BASE}/accounts/${encodeURIComponent(env.REALTIMEKIT_ACCOUNT_ID)}/realtime/kit/${encodeURIComponent(env.REALTIMEKIT_APP_ID)}`;
  async function request(path, init = {}) {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${env.REALTIMEKIT_API_TOKEN}`);
    headers.set('content-type', 'application/json');
    const response = await fetchImpl(`${base}${path}`, { ...init, headers });
    return readProviderResponse(response);
  }

  return {
    kind: 'realtimekit',
    configured: true,
    async createMeeting({ matchId, transcriptionEnabled = false }) {
      const data = await request('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: `Software Wars · ${matchId}`,
          persist_chat: false,
          record_on_start: false,
          live_stream_on_start: false,
          transcribe_on_end: Boolean(transcriptionEnabled),
          summarize_on_end: false,
          session_keep_alive_time_in_secs: 300,
          ai_config: {
            transcription: {
              language: 'en-IN',
              profanity_filter: false,
              keywords: ['idempotency', 'sharding', 'consistency'],
            },
          },
        }),
      });
      return { meetingId: data.id, status: data.status ?? 'ACTIVE' };
    },
    async addParticipant({ meetingId, participantId, displayName, picture }) {
      const data = await request(`/meetings/${encodeURIComponent(meetingId)}/participants`, {
        method: 'POST',
        body: JSON.stringify({
          name: displayName,
          ...(picture ? { picture } : {}),
          preset_name: env.REALTIMEKIT_PARTICIPANT_PRESET || 'software-wars-player',
          custom_participant_id: participantId,
        }),
      });
      return {
        participantId: data.id,
        authToken: data.authToken ?? data.auth_token ?? data.token,
      };
    },
    async refreshParticipantToken({ meetingId, providerParticipantId }) {
      const data = await request(
        `/meetings/${encodeURIComponent(meetingId)}/participants/${encodeURIComponent(providerParticipantId)}/token`,
        { method: 'POST', body: '{}' }
      );
      return { authToken: data.authToken ?? data.auth_token ?? data.token };
    },
    async closeMeeting({ meetingId }) {
      const data = await request(`/meetings/${encodeURIComponent(meetingId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INACTIVE' }),
      });
      return { status: data.status };
    },
    async configureTranscription({ meetingId, enabled }) {
      const data = await request(`/meetings/${encodeURIComponent(meetingId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          transcribe_on_end: Boolean(enabled),
          summarize_on_end: false,
          record_on_start: false,
        }),
      });
      return { enabled: Boolean(data.transcribe_on_end) };
    },
  };
}

function pemToBytes(pem) {
  const base64 = pem
    .replace(/\\n/g, '')
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export async function verifyRealtimeKitWebhook({ rawBody, signature, fetchImpl = fetch }) {
  if (!signature) return false;
  const response = await fetchImpl(WEBHOOK_PUBLIC_KEY_URL, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok)
    throw new MediaProviderError(
      'webhook_key_unavailable',
      'Webhook verification key unavailable',
      true
    );
  const payload = await response.json();
  const publicKeyPem = payload?.data?.publicKey;
  if (!publicKeyPem)
    throw new MediaProviderError('webhook_key_invalid', 'Webhook verification key is invalid');
  const publicKey = await crypto.subtle.importKey(
    'spki',
    pemToBytes(publicKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const signatureBytes = Uint8Array.from(atob(signature), (character) => character.charCodeAt(0));
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signatureBytes, rawBody);
}
