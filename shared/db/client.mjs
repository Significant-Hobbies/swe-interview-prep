let boundClient = null;

/** Refresh the isolate-local D1-compatible client used by shared handlers. */
export function setRequestDb(db) {
  boundClient = db;
}

export function getDb() {
  if (!boundClient) {
    throw new Error('Missing D1 database client');
  }
  return boundClient;
}
