import { createClient } from '@libsql/client';

let client = null;
/** Request-scoped DB override (Cloudflare worker bridge). */
let requestClient = null;

export function setRequestDb(db) {
  requestClient = db;
}

export function clearRequestDb() {
  requestClient = null;
}

export function getDb() {
  if (requestClient) return requestClient;
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    }

    client = createClient({ url, authToken });
  }
  return client;
}
