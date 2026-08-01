import { getDb } from './client.mjs';

/**
 * Compatibility guard for handlers that historically initialized Turso at
 * request time. D1 schema changes are now applied deterministically from
 * migrations/d1 before the Pages deployment is switched.
 */
export async function initDatabase() {
  getDb();
}
