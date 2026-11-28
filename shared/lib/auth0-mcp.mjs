import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUDIENCE = 'https://mcp.significanthobbies.com/swe-interview-prep/mcp';
const REQUIRED_SCOPE = 'swe-interview-prep.read';
export const SWE_INTERVIEW_PREP_WRITE_SCOPE = 'swe-interview-prep.write';
const MAX_TOKEN_LIFETIME_SECONDS = 3_600;
const CLOCK_TOLERANCE_SECONDS = 60;
const GOOGLE_SUBJECT = /^google-oauth2\|([A-Za-z0-9._-]{3,256})$/u;

let cachedIssuer;
let cachedRemoteJwks;

function auth0Issuer(value) {
  try {
    const url = new URL(value ?? '');
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      !url.hostname.endsWith('.auth0.com')
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function stringClaims(value) {
  if (typeof value === 'string') return value.split(/\s+/u).filter(Boolean);
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value;
  return [];
}

function remoteJwks(issuer) {
  if (cachedIssuer !== issuer || !cachedRemoteJwks) {
    cachedIssuer = issuer;
    cachedRemoteJwks = createRemoteJWKSet(new URL('.well-known/jwks.json', issuer), {
      cacheMaxAge: 300_000,
      cooldownDuration: 30_000,
      timeoutDuration: 5_000,
    });
  }
  return cachedRemoteJwks;
}

/**
 * Verify the gateway-forwarded Auth0 token and return the Google subject plus
 * granted scopes. Write access is honoured only from the delegated `scope`
 * claim (what the user consented to), matching the gateway's own check.
 */
export async function verifySweInterviewPrepAuth0Grant(token, env, getKey) {
  const issuer = auth0Issuer(env.AUTH0_ISSUER);
  if (!issuer) return null;
  try {
    const { payload } = await jwtVerify(token, getKey ?? remoteJwks(issuer), {
      algorithms: ['RS256'],
      audience: AUDIENCE,
      clockTolerance: CLOCK_TOLERANCE_SECONDS,
      issuer,
      requiredClaims: ['iss', 'aud', 'sub', 'exp', 'iat'],
    });
    const match = typeof payload.sub === 'string' ? GOOGLE_SUBJECT.exec(payload.sub) : null;
    const permissions = new Set([
      ...stringClaims(payload.scope),
      ...stringClaims(payload.scopes),
      ...stringClaims(payload.permissions),
    ]);
    if (
      !match ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= payload.iat ||
      payload.exp - payload.iat > MAX_TOKEN_LIFETIME_SECONDS + CLOCK_TOLERANCE_SECONDS ||
      !permissions.has(REQUIRED_SCOPE)
    ) {
      return null;
    }
    const delegated = new Set(stringClaims(payload.scope));
    const scopes = [REQUIRED_SCOPE];
    if (delegated.has(SWE_INTERVIEW_PREP_WRITE_SCOPE)) scopes.push(SWE_INTERVIEW_PREP_WRITE_SCOPE);
    return match[1] ? { googleId: match[1], scopes } : null;
  } catch {
    return null;
  }
}

export async function verifySweInterviewPrepAuth0Subject(token, env, getKey) {
  return (await verifySweInterviewPrepAuth0Grant(token, env, getKey))?.googleId ?? null;
}

export const SWE_INTERVIEW_PREP_MCP_AUDIENCE = AUDIENCE;
