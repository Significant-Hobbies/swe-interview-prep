import type { Architecture, Decision, Upgrade } from './model';

export type ExtraUpgrade =
  | 'pool'
  | 'replicas'
  | 'shards'
  | 'queue'
  | 'workers'
  | 'storage'
  | 'cdn'
  | 'search'
  | 'stream'
  | 'regions'
  | 'failover'
  | 'cache-scale';
export interface ExtraArchitecture {
  pool?: boolean;
  replicas?: number;
  shards?: number;
  queue?: boolean;
  workers?: number;
  storage?: boolean;
  cdn?: boolean;
  search?: boolean;
  stream?: number;
  regions?: boolean;
  failover?: boolean;
  cacheSize?: number;
}
export const TOOLKIT: Decision[] = [
  {
    id: 'pool',
    group: 'Compute',
    components: ['app', 'pool', 'lb'],
    title: 'Pool database connections',
    subtitle: 'Bound concurrent database calls',
    hours: 10,
    upfront: 70,
    benefit:
      'Adds a shared 32-connection admission pool. Excess calls fail fast instead of stampeding the database.',
    tradeoff:
      'Adds 1ms per request. A small pool rejects useful work and can become the bottleneck; it does not create database capacity.',
  },
  {
    id: 'replicas',
    group: 'Data',
    components: ['db', 'replicas', 'shards'],
    title: 'Add a read replica',
    subtitle: 'Read capacity with replication lag',
    hours: 24,
    upfront: 160,
    benefit: 'Adds a separate read pool per primary, up to four replicas per shard.',
    tradeoff:
      'Each replica costs as much as its primary. Writes still use the primary; a 250ms replication window can serve stale reads.',
  },
  {
    id: 'shards',
    group: 'Data',
    components: ['db', 'replicas', 'shards'],
    title: 'Shard the database',
    subtitle: 'Split data and write contention',
    hours: 72,
    upfront: 400,
    benefit:
      'Doubles key partitions, up to eight. Each partition owns its primary and any read replicas.',
    tradeoff:
      'Multiplies database cost and increases engineering effort. Hot keys still overload one partition. Cross-shard transactions are outside this model.',
  },
  {
    id: 'queue',
    group: 'Messaging',
    components: ['app', 'queue', 'workers'],
    title: 'Add a job queue',
    subtitle: 'Acknowledge now, process later',
    hours: 24,
    upfront: 100,
    benefit:
      'Moves the workload’s background-job share into a bounded queue and includes one worker.',
    tradeoff:
      'Acknowledgement is not completion. Slow workers build backlog; a full queue rejects jobs. Transactional requests remain synchronous.',
  },
  {
    id: 'workers',
    group: 'Messaging',
    components: ['queue', 'workers', 'stream'],
    title: 'Add a worker',
    subtitle: 'Drain background work faster',
    hours: 8,
    upfront: 60,
    benefit: 'Adds one worker instance, up to eight. Requires a job queue or event stream.',
    tradeoff:
      'Adds $60/mo and more downstream pressure. Extra workers cannot fix a database bottleneck or a stream partition ceiling.',
  },
  {
    id: 'storage',
    group: 'Data',
    components: ['app', 'storage'],
    title: 'Add object storage',
    subtitle: 'Move blob requests out of MySQL',
    hours: 20,
    upfront: 100,
    benefit:
      'Routes the declared file/blob share to a separate object store instead of the relational database.',
    tradeoff:
      'Adds $90/mo. Blob requests pay 45ms service time; the object store has its own throughput ceiling. Transactional queries still need MySQL.',
  },
  {
    id: 'cdn',
    group: 'Edge',
    components: ['users', 'cdn', 'storage'],
    title: 'Add a CDN',
    subtitle: 'Serve eligible content at the edge',
    hours: 12,
    upfront: 80,
    benefit: 'Answers the workload’s public cacheable share before it reaches the app.',
    tradeoff:
      'Adds $120/mo. Personalized and write traffic still reaches origin. Assumes public content tolerates a 60-second TTL.',
  },
  {
    id: 'search',
    group: 'Data',
    components: ['app', 'search'],
    title: 'Add a search index',
    subtitle: 'Isolate search queries and indexing',
    hours: 36,
    upfront: 180,
    benefit: 'Routes declared search requests to a search cluster with a 1-second refresh window.',
    tradeoff:
      'Adds $220/mo. Index updates consume extra work and searches can be stale; low-search workloads gain little.',
  },
  {
    id: 'stream',
    group: 'Messaging',
    components: ['app', 'stream', 'workers'],
    title: 'Add stream partitions',
    subtitle: 'Replayable events and consumer lag',
    hours: 36,
    upfront: 180,
    benefit:
      'Starts a four-partition event log with one consumer, then doubles partitions up to sixteen. Replaces the job queue for background work if present.',
    tradeoff:
      'Adds retention and consumer lag. Producers can succeed while consumers lose expired messages. Workers and downstream storage still need capacity.',
  },
  {
    id: 'regions',
    group: 'Reliability',
    components: ['users', 'region', 'app'],
    title: 'Add a standby region',
    subtitle: 'Duplicate the application tier',
    hours: 48,
    upfront: 300,
    benefit: 'Creates a warm standby application region behind a regional traffic switch.',
    tradeoff:
      'Doubles app fleet cost and adds $150/mo. The data tier is shared; this is application-region resilience, not a replicated global database.',
  },
  {
    id: 'failover',
    group: 'Reliability',
    components: ['region', 'app'],
    title: 'Automate regional failover',
    subtitle: 'Restore routing after an outage',
    hours: 30,
    upfront: 200,
    benefit:
      'Cuts application-region failover from 30 seconds to 2 simulated seconds. Requires a standby region.',
    tradeoff:
      'Adds $100/mo and operational complexity. There is still a cutover outage, and shared database failure remains unprotected.',
  },
  {
    id: 'cache-scale',
    group: 'Edge',
    components: ['cache'],
    title: 'Scale the cache fleet',
    subtitle: 'More memory and cache concurrency',
    hours: 8,
    upfront: 80,
    benefit:
      'Doubles Redis instances, up to four, and improves working-set coverage within the declared cacheable share.',
    tradeoff:
      'Requires Redis. Multiplies cache cost; it cannot make writes or uncacheable data cacheable.',
  },
];
export function prerequisite(a: Architecture, id: Upgrade): string | null {
  if (id === 'workers' && !a.queue && !a.stream) return 'Add a job queue or event stream first.';
  if (id === 'failover' && !a.regions) return 'Add a standby region first.';
  if (id === 'cache-scale' && !a.cache) return 'Introduce Redis first.';
  if (id === 'queue' && a.stream) return 'The event stream already handles background work.';
  return null;
}
export function extraAvailable(a: Architecture, id: Upgrade): boolean {
  if (prerequisite(a, id)) return false;
  switch (id) {
    case 'replicas':
      return (a.replicas ?? 0) < 4;
    case 'shards':
      return (a.shards ?? 1) < 8;
    case 'workers':
      return (a.workers ?? 0) < 8;
    case 'stream':
      return (a.stream ?? 0) < 16;
    case 'cache-scale':
      return (a.cacheSize ?? 1) < 4;
    default:
      return !a[id as keyof ExtraArchitecture];
  }
}
export function extraUpgrade(a: Architecture, id: Upgrade): Architecture {
  const n = { ...a };
  switch (id) {
    case 'replicas':
      n.replicas = (n.replicas ?? 0) + 1;
      break;
    case 'shards':
      n.shards = (n.shards ?? 1) * 2;
      break;
    case 'workers':
      n.workers = (n.workers ?? 1) + 1;
      break;
    case 'cache-scale':
      n.cacheSize = (n.cacheSize ?? 1) * 2;
      break;
    case 'stream':
      n.stream = n.stream ? n.stream * 2 : 4;
      n.queue = false;
      n.workers ||= 1;
      break;
    case 'queue':
      n.queue = true;
      n.workers ||= 1;
      break;
    case 'pool':
    case 'storage':
    case 'cdn':
    case 'search':
    case 'regions':
    case 'failover':
      n[id] = true;
      break;
  }
  return n;
}
export function complexity(a: Architecture): number {
  return (
    (a.instances - 1) * 2 +
    (a.cache ? 3 : 0) +
    (a.pool ? 1 : 0) +
    (a.replicas ?? 0) * (a.shards ?? 1) * 2 +
    ((a.shards ?? 1) - 1) * 4 +
    (a.queue ? 3 : 0) +
    (a.workers ?? 0) +
    (a.storage ? 2 : 0) +
    (a.cdn ? 2 : 0) +
    (a.search ? 4 : 0) +
    (a.stream ? 6 : 0) +
    (a.regions ? 8 : 0) +
    (a.failover ? 4 : 0)
  );
}
export function projectHours(a: Architecture, d: Decision): number {
  return Math.ceil(d.hours * (1 + complexity(a) / 100));
}
export function extraCost(a: Architecture): number {
  const db = 45 * 2.8 ** a.database;
  return (
    db * ((a.shards ?? 1) * (1 + (a.replicas ?? 0)) - 1) +
    (a.pool ? 25 : 0) +
    (a.queue ? 40 : 0) +
    (a.workers ?? 0) * 60 +
    (a.storage ? 90 : 0) +
    (a.cdn ? 120 : 0) +
    (a.search ? 220 : 0) +
    (a.stream ? 50 * a.stream : 0) +
    (a.regions ? 150 + 24 * 2.6 ** a.app * a.instances : 0) +
    (a.failover ? 100 : 0) +
    (a.cache ? 180 * ((a.cacheSize ?? 1) - 1) : 0)
  );
}
export function validExtras(a: Architecture): boolean {
  for (const field of ['pool', 'queue', 'storage', 'cdn', 'search', 'regions', 'failover'] as const)
    if (a[field] !== undefined && typeof a[field] !== 'boolean') return false;
  const ranges = {
    replicas: [0, 1, 2, 3, 4],
    shards: [1, 2, 4, 8],
    workers: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    stream: [0, 4, 8, 16],
    cacheSize: [1, 2, 4],
  };
  for (const [key, values] of Object.entries(ranges)) {
    const value = a[key as keyof typeof ranges];
    if (value !== undefined && !values.includes(value)) return false;
  }
  return (
    !(a.failover && !a.regions) &&
    !(a.cacheSize && a.cacheSize > 1 && !a.cache) &&
    !(a.queue && a.stream) &&
    !((a.queue || a.stream) && !a.workers) &&
    !((a.workers ?? 0) > 0 && !a.queue && !a.stream)
  );
}
