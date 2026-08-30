import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { describe, expect, it } from 'vitest';

import {
  SWE_INTERVIEW_PREP_MCP_AUDIENCE,
  verifySweInterviewPrepAuth0Subject,
} from './auth0-mcp.mjs';

const issuer = 'https://fleet-test.us.auth0.com/';

async function fixture() {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  const keySet = createLocalJWKSet({ keys: [{ ...publicJwk, alg: 'RS256', kid: 'swe-test' }] });
  return {
    keySet,
    async token(overrides = {}) {
      const now = Math.floor(Date.now() / 1000);
      const claims = {
        permissions: overrides.permissions ?? ['swe-interview-prep.read'],
      };
      return new SignJWT(claims)
        .setProtectedHeader({ alg: 'RS256', kid: 'swe-test' })
        .setIssuer(issuer)
        .setAudience(overrides.aud ?? SWE_INTERVIEW_PREP_MCP_AUDIENCE)
        .setSubject(overrides.sub ?? 'google-oauth2|google-user-1')
        .setIssuedAt(overrides.iat ?? now)
        .setExpirationTime(overrides.exp ?? now + 300)
        .sign(privateKey);
    },
  };
}

describe('SWE Interview Prep Auth0 MCP verification', () => {
  it('accepts only the exact audience, Google subject, permission, and bounded lifetime', async () => {
    const signed = await fixture();
    const env = { AUTH0_ISSUER: issuer };
    await expect(
      verifySweInterviewPrepAuth0Subject(await signed.token(), env, signed.keySet)
    ).resolves.toBe('google-user-1');

    for (const overrides of [
      { aud: 'https://mcp.significanthobbies.com/reader/mcp' },
      { permissions: ['reader.read'] },
      { sub: 'auth0|not-google' },
      { exp: Math.floor(Date.now() / 1000) + 7_200 },
    ]) {
      await expect(
        verifySweInterviewPrepAuth0Subject(await signed.token(overrides), env, signed.keySet)
      ).resolves.toBeNull();
    }
  });

  it('fails closed for an invalid issuer configuration', async () => {
    const signed = await fixture();
    await expect(
      verifySweInterviewPrepAuth0Subject(
        await signed.token(),
        { AUTH0_ISSUER: 'https://example.com/' },
        signed.keySet
      )
    ).resolves.toBeNull();
  });
});
