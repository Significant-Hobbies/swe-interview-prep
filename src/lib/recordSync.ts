export interface RecordSyncConfig<T> {
  localKey: string;
  action: string;
  field: string;
  toPayload: (id: string, entry: T) => Record<string, unknown>;
}

type Operation<T> = { id: string; operationId: string; entry: T };
type Envelope<T> = { data: Record<string, T>; pending: Operation<T>[] };
type SyncStatus = 'local-only' | 'pending' | 'failed' | 'synced';
type Snapshot<T> = Envelope<T> & { status: SyncStatus; error: string | null };

/** Durable outbox: one stable operation per edit, serialized across navigation. */
export class RecordSyncStore<T> {
  readonly key: string;
  readonly config: RecordSyncConfig<T>;
  readonly accountId: string | null;
  private state: Snapshot<T>;
  private readonly listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private inFlight = false;
  private active = false;
  private revision = 0;
  private activation = 0;
  private readonly requests = new Set<AbortController>();
  private persistChain: Promise<boolean> = Promise.resolve(true);
  // Every operationId this store has created, loaded, or adopted. Stops an
  // acknowledged operation from being resurrected by a stale stored envelope.
  private readonly seen = new Set<string>();
  // Records this store authored or adopted from the server this session. On a
  // shared-storage merge they outrank the stored copy; untouched records defer
  // to whatever another tab wrote more recently.
  private readonly touched = new Set<string>();

  constructor(config: RecordSyncConfig<T>, accountId: string | null) {
    this.config = config;
    this.accountId = accountId;
    this.key = accountId
      ? `${config.localKey}:account:${encodeURIComponent(accountId)}:v1`
      : config.localKey;
    const envelope = this.readStored();
    for (const operation of envelope.pending) this.seen.add(operation.operationId);
    this.state = { ...envelope, status: accountId ? 'pending' : 'local-only', error: null };
  }

  /** Read the shared envelope; another tab may have written since our last persist. */
  private readStored(): Envelope<T> {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key) || 'null');
      if (!saved || typeof saved !== 'object') return { data: {}, pending: [] };
      if (!this.accountId) return { data: saved, pending: [] };
      return {
        data: saved.data && typeof saved.data === 'object' ? saved.data : {},
        pending: Array.isArray(saved.pending) ? saved.pending : [],
      };
    } catch {
      return { data: {}, pending: [] };
    }
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private publish(patch: Partial<Snapshot<T>>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  private reportPersistenceFailure(error: string) {
    this.publish({ status: 'failed', error });
    return false;
  }

  private async commitPersist(): Promise<boolean> {
    const locks = globalThis.navigator?.locks;
    if (!locks) {
      return this.reportPersistenceFailure(
        'This browser cannot guarantee durable multi-tab saves. Use a supported browser, then retry.'
      );
    }
    try {
      return await locks.request(`${this.key}:writer`, { mode: 'exclusive' }, async () => {
        // Merge inside the Web Lock. localStorage has no compare-and-swap, so
        // reading before acquiring the lock would still lose another tab's
        // operation between read and setItem.
        const stored = this.readStored();
        const adopted: Operation<T>[] = [];
        for (const operation of stored.pending) {
          if (this.seen.has(operation.operationId)) continue;
          adopted.push(operation);
        }
        const pending = [...adopted, ...this.state.pending];
        const data: Record<string, T> = { ...stored.data };
        for (const id of this.touched) {
          if (id in this.state.data) data[id] = this.state.data[id];
        }
        for (const operation of pending) data[operation.id] = operation.entry;
        try {
          localStorage.setItem(this.key, JSON.stringify(this.accountId ? { data, pending } : data));
        } catch {
          return this.reportPersistenceFailure(
            'Changes are not saved in this browser. Free storage and retry before leaving.'
          );
        }
        // Adoption is committed only after storage succeeds. Otherwise a retry
        // would skip the other tab's operation without ever retaining it locally.
        for (const operation of adopted) this.seen.add(operation.operationId);
        this.publish({
          data,
          pending,
          ...(this.accountId && pending.length && this.state.status === 'synced'
            ? { status: 'pending' as const }
            : {}),
        });
        return true;
      });
    } catch {
      return this.reportPersistenceFailure(
        'Could not acquire the durable multi-tab save lock. Keep this tab open and retry.'
      );
    }
  }

  private persist(): Promise<boolean> {
    // Merge rather than overwrite: another tab sharing this storage key may
    // hold newer entries or undelivered operations. Adopted operations are
    // flushed like our own; receipts make any double delivery a no-op.
    const commit = this.persistChain.then(() => this.commitPersist());
    this.persistChain = commit.catch(() => false);
    return commit;
  }

  set(id: string, update: T | ((previous: T | undefined) => T)) {
    const entry =
      typeof update === 'function'
        ? (update as (previous: T | undefined) => T)(this.state.data[id])
        : update;
    const operationId = crypto.randomUUID();
    this.seen.add(operationId);
    this.touched.add(id);
    const pending = this.accountId ? [...this.state.pending, { id, entry, operationId }] : [];
    this.revision += 1;
    this.publish({
      data: { ...this.state.data, [id]: entry },
      pending,
      error: null,
      status: this.accountId ? 'pending' : 'local-only',
    });
    void this.persist().then((saved) => {
      if (!saved || !this.accountId) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => void this.flush(), 500);
    });
  }

  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    this.activation += 1;
    if (!active) {
      clearTimeout(this.timer);
      for (const request of this.requests) request.abort();
      return;
    }
    void this.reconcile();
    void this.flush();
  }

  private async request(init: RequestInit = {}) {
    const controller = new AbortController();
    this.requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      return await fetch(
        `/api/learning?action=${this.config.action}&accountId=${encodeURIComponent(this.accountId ?? '')}`,
        {
          credentials: 'include',
          ...init,
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
      this.requests.delete(controller);
    }
  }

  async reconcile() {
    if (!this.active || !this.accountId) return;
    const revision = this.revision;
    const activation = this.activation;
    try {
      const response = await this.request();
      if (!response.ok)
        throw new Error('Could not read account progress. Your local changes remain available.');
      const remote = (await response.json())[this.config.field] || {};
      if (!this.active || activation !== this.activation || revision !== this.revision) return;
      for (const id of Object.keys(remote)) this.touched.add(id);
      const data = { ...this.state.data, ...remote };
      for (const operation of this.state.pending) data[operation.id] = operation.entry;
      this.publish({ data });
      if (!this.active || activation !== this.activation) return;
      if (!(await this.persist())) return;
      if (!this.active || activation !== this.activation || revision !== this.revision) return;
      if (!this.state.pending.length) this.publish({ status: 'synced', error: null });
    } catch (error) {
      if (this.active && activation === this.activation)
        this.publish({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Account sync failed.',
        });
    }
  }

  retry = () => {
    void this.persist().then((saved) => {
      if (!saved) return;
      this.publish({ error: null, status: this.accountId ? 'pending' : 'local-only' });
      void this.reconcile();
      void this.flush();
    });
  };

  async flush() {
    clearTimeout(this.timer);
    if (this.inFlight) return;
    this.inFlight = true;
    if (!this.active || !this.accountId || !this.state.pending.length) {
      this.inFlight = false;
      return;
    }
    const activation = this.activation;
    try {
      if (!(await this.persist())) return;
      if (!this.active || activation !== this.activation) return;
      while (this.active && activation === this.activation && this.state.pending.length) {
        const operation = this.state.pending[0];
        const response = await this.request({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...this.config.toPayload(operation.id, operation.entry),
            accountId: this.accountId,
            operationId: operation.operationId,
          }),
        });
        if (!response.ok)
          throw new Error(
            'Saved in this browser, but account sync failed. Retry when connected to the original account.'
          );
        if (!this.active || activation !== this.activation) return;
        this.revision += 1;
        this.publish({
          pending: this.state.pending.filter((item) => item.operationId !== operation.operationId),
          error: null,
        });
        if (!(await this.persist())) return;
        if (!this.active || activation !== this.activation) return;
      }
      if (this.active && activation === this.activation) {
        this.publish({ status: 'synced', error: null });
        void this.reconcile();
      }
    } catch (error) {
      if (this.active && activation === this.activation)
        this.publish({
          status: 'failed',
          error:
            error instanceof Error ? error.message : 'Account sync failed; local work is retained.',
        });
    } finally {
      this.inFlight = false;
      if (this.active && activation !== this.activation) void this.flush();
    }
  }
}

const stores = new Map<string, RecordSyncStore<unknown>>();
let activeAccount: string | null = null;

export function activateRecordAccount(accountId: string | null) {
  activeAccount = accountId;
  for (const store of stores.values())
    store.setActive(Boolean(accountId) && store.accountId === accountId);
}

export function getRecordStore<T>(
  config: RecordSyncConfig<T>,
  accountId: string | null
): RecordSyncStore<T> {
  const key = JSON.stringify([config.localKey, accountId]);
  if (!stores.has(key)) {
    const store = new RecordSyncStore(config, accountId);
    stores.set(key, store as RecordSyncStore<unknown>);
  }
  return stores.get(key) as RecordSyncStore<T>;
}

export function retryRecordSync() {
  for (const store of stores.values()) {
    if (store.accountId === activeAccount) store.retry();
  }
}
