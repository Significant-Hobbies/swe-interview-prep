import type { Company, Upgrade } from './model';
import { WORKLOADS } from './model';
import { pendingJobs, serviceHealthy } from './health';
import type { SimSnapshot } from '../vendor/breakscale/types';

// Stable public curriculum routes keep the full learning catalogue out of the game bundle.
export const LESSONS = {
  capacity: ['capacity-estimation', 'Capacity Estimation'],
  compute: ['compute-memory-storage-hierarchy', 'Compute, Memory & Storage Hierarchy'],
  balancing: ['load-balancing', 'Load Balancing'],
  indexing: ['secondary-index', 'Secondary Indexes'],
  caching: ['caching', 'Caching'],
  replicas: ['replication', 'Replication'],
  shards: ['sharding', 'Sharding'],
  queues: ['message-queues', 'Message Queues'],
  storage: ['object-storage', 'Object Storage'],
  cdn: ['cdn-edge-delivery', 'CDN & Edge Delivery'],
  search: ['inverted-index', 'Inverted Index'],
  streams: ['event-streaming-kafka', 'Event Streaming & Kafka'],
  recovery: ['distributed-failure-recovery', 'Distributed Failure Recovery'],
  reliability: ['reliability-fault-tolerance', 'Reliability & Fault Tolerance'],
  waiting: ['queueing-theory', 'Queueing Theory'],
} as const;
export type Lesson = keyof typeof LESSONS;
export const lessonHref = (id: Lesson) => `/curriculum/concepts/${LESSONS[id][0]}.html`;

export const TOOL_LEARNING: Record<
  Upgrade,
  { mechanism: Lesson; failure: Lesson; question: string }
> = {
  app: {
    mechanism: 'compute',
    failure: 'waiting',
    question: 'What happens when requests arrive faster than the app can finish them?',
  },
  horizontal: {
    mechanism: 'balancing',
    failure: 'reliability',
    question: 'Which shared dependency still limits every app instance?',
  },
  database: {
    mechanism: 'capacity',
    failure: 'waiting',
    question: 'Does more concurrency remove write contention?',
  },
  index: {
    mechanism: 'indexing',
    failure: 'indexing',
    question: 'How does maintaining an index change write cost?',
  },
  cache: {
    mechanism: 'caching',
    failure: 'caching',
    question: 'What reaches the origin when the cache is cold or unavailable?',
  },
  pool: {
    mechanism: 'waiting',
    failure: 'reliability',
    question: 'What happens to calls when all connection slots are occupied?',
  },
  replicas: {
    mechanism: 'replicas',
    failure: 'replicas',
    question: 'Can a fast replica still return stale data or fix primary write pressure?',
  },
  shards: {
    mechanism: 'shards',
    failure: 'shards',
    question: 'What happens when one key receives most of the traffic?',
  },
  queue: {
    mechanism: 'queues',
    failure: 'waiting',
    question: 'Does acknowledging a job mean the job finished?',
  },
  workers: {
    mechanism: 'queues',
    failure: 'streams',
    question: 'Is draining limited by worker count, partitions, or the database?',
  },
  storage: {
    mechanism: 'storage',
    failure: 'recovery',
    question: 'Which request path fails when blob storage is unavailable?',
  },
  cdn: {
    mechanism: 'cdn',
    failure: 'caching',
    question: 'Can your origin handle cache misses during an edge outage?',
  },
  search: {
    mechanism: 'search',
    failure: 'replicas',
    question: 'Can the index answer quickly before a recent write becomes visible?',
  },
  stream: {
    mechanism: 'streams',
    failure: 'streams',
    question: 'Will lagging consumers catch up before messages expire?',
  },
  regions: {
    mechanism: 'reliability',
    failure: 'recovery',
    question: 'Which shared services remain a single failure domain?',
  },
  failover: {
    mechanism: 'recovery',
    failure: 'reliability',
    question: 'What happens during cutover and when the shared database fails?',
  },
  'cache-scale': {
    mechanism: 'caching',
    failure: 'capacity',
    question: 'Is the workload cacheable enough to justify extra memory cost?',
  },
};

export const FAILURE_LEARNING = {
  outage: {
    lesson: 'recovery',
    title: 'Component outage',
    question: 'Trace the failed dependency. Does your standby protect this failure domain?',
  },
  capacity: {
    lesson: 'waiting',
    title: 'Capacity pressure',
    question: 'Compare waiting work with utilization. Where does the request spend its time?',
  },
  writes: {
    lesson: 'shards',
    title: 'Write contention',
    question: 'Which operations must still serialize on the primary?',
  },
  hotShard: {
    lesson: 'shards',
    title: 'Uneven shard pressure',
    question: 'Compare partition utilization before adding more shards.',
  },
  cache: {
    lesson: 'caching',
    title: 'Low cache coverage',
    question: 'Is the cache cold, or is this traffic ineligible for reuse?',
  },
  stale: {
    lesson: 'replicas',
    title: 'Stale reads',
    question: 'Compare visibility delay with the workload’s consistency needs.',
  },
  backlog: {
    lesson: 'queues',
    title: 'Background delivery falling behind',
    question:
      'Compare arrival rate, drain rate and downstream capacity; acknowledgements are not completions.',
  },
  retention: {
    lesson: 'streams',
    title: 'Stream messages expiring',
    question: 'Can consumers drain the log within retention, given the partition ceiling?',
  },
  connections: {
    lesson: 'waiting',
    title: 'Connection calls refused',
    question: 'Are connection slots occupied by slow downstream work?',
  },
  workers: {
    lesson: 'recovery',
    title: 'Background processing errors',
    question: 'Where did delivery fail after the producer received an acknowledgement?',
  },
  runway: {
    lesson: 'capacity',
    title: 'Runway exhausted',
    question: 'Which capacity did you pay for, and which of it served useful demand?',
  },
  slo: {
    lesson: 'reliability',
    title: 'Service target missed',
    question:
      'Inspect errors and tail latency along the request path before choosing an intervention.',
  },
} satisfies Record<string, { lesson: Lesson; title: string; question: string }>;
export type Failure = keyof typeof FAILURE_LEARNING;

export function observedFailures(c: Company, s: SimSnapshot): Failure[] {
  const found: Failure[] = [];
  const nodes = Object.values(s.nodes);
  if (c.cash <= 0) found.push('runway');
  if (s.activeFailures.length) found.push('outage');
  if (nodes.some((n) => (n.staleReadRate ?? 0) >= 0.02)) found.push('stale');
  if ((s.nodes.stream?.retentionDropRate ?? 0) > 0) found.push('retention');
  if ((s.nodes.pool?.bulkheadRejectedRate ?? 0) > 0) found.push('connections');
  if ((s.nodes.workers?.errorRate ?? 0) >= 0.02) found.push('workers');
  const jobs = pendingJobs(s);
  const drain = s.nodes.workers?.throughput ?? 0;
  if (jobs > 0 && (drain <= 0 || jobs / drain >= 5)) found.push('backlog');
  const dbs = Object.entries(s.nodes)
    .filter(([id]) => id === 'db' || id.startsWith('db-'))
    .map(([, n]) => n);
  if (
    dbs.length > 1 &&
    Math.max(...dbs.map((n) => n.utilization)) > 0.85 &&
    Math.min(...dbs.map((n) => n.utilization)) < 0.5
  )
    found.push('hotShard');
  if (dbs.some((n) => n.queued > 4 || n.utilization > 0.85) && WORKLOADS[c.workload].read <= 0.5)
    found.push('writes');
  if (s.nodes.cache && (s.nodes.cache.hitRate ?? 1) < 0.3 && !serviceHealthy(s))
    found.push('cache');
  if (
    Object.entries(s.nodes).some(
      ([id, n]) => id !== 'users' && (n.queued > 4 || n.utilization > 0.85)
    )
  )
    found.push('capacity');
  if (!serviceHealthy(s) && !found.length) found.push('slo');
  return found;
}
