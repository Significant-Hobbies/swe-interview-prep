import { defaultConfig } from '../vendor/breakscale/presets';
import type { NodeConfig, NodeKind, SimEdge, SimNode, Topology } from '../vendor/breakscale/types';
import type { Architecture } from './model';

interface WorkloadShape {
  title: string;
  read: number;
  cacheable: number;
  appMs: number;
}
const WORK_SHARES: Record<
  string,
  { background: number; blobs: number; search: number; public: number }
> = {
  'Tiny SaaS': { background: 0.1, blobs: 0.08, search: 0.1, public: 0.12 },
  'Online store': { background: 0.15, blobs: 0.15, search: 0.2, public: 0.3 },
  'Event analytics': { background: 0.65, blobs: 0.04, search: 0.05, public: 0.01 },
  'Social network': { background: 0.3, blobs: 0.2, search: 0.15, public: 0.12 },
  'AI gateway': { background: 0.08, blobs: 0.02, search: 0.02, public: 0.01 },
};
export function cacheHitRate(a: Architecture, w: WorkloadShape, warm: number): number {
  return Math.min(1, w.cacheable * (1 + 0.1 * Math.log2(a.cacheSize ?? 1))) * w.read * warm;
}
export function expandedTopology(
  base: Topology,
  a: Architecture,
  w: WorkloadShape,
  warm: number
): Topology {
  if (
    !a.pool &&
    !a.replicas &&
    !a.shards &&
    !a.queue &&
    !a.storage &&
    !a.cdn &&
    !a.search &&
    !a.stream &&
    !a.regions &&
    !a.cacheSize
  )
    return base;
  const nodes: SimNode[] = [];
  const edges: SimEdge[] = [];
  const add = (id: string, kind: NodeKind, label: string, config: Partial<NodeConfig> = {}) => {
    nodes.push({
      id,
      kind,
      label,
      x: 40 + (nodes.length % 3) * 250,
      y: 100 + Math.floor(nodes.length / 3) * 175,
      config: { ...defaultConfig(kind), ...config },
    });
    return id;
  };
  const wire = (from: string, to: string, weight = 1) =>
    edges.push({ id: `${from}-${to}`, from, to, weight, latencyMs: 1 });
  nodes.push(base.nodes[0]);
  let entry = 'users';
  if (a.cdn) {
    wire(
      entry,
      add('cdn', 'cdn', 'CDN', {
        hitRate: WORK_SHARES[w.title].public * w.read,
        capacity: 256,
        serviceMs: 2,
      })
    );
    entry = 'cdn';
  }
  if (a.instances > 1) {
    wire(entry, add('lb', 'lb', 'Load balancer'));
    entry = 'lb';
  }
  const shares = WORK_SHARES[w.title];
  const asynchronous = !!(a.queue || a.stream);
  const appConfig = {
    capacity: 8 * 2 ** a.app,
    instances: a.instances,
    serviceMs: w.appMs * (asynchronous ? 1 - shares.background * 0.5 : 1),
    queueLimit: 96,
    timeoutMs: 1200,
  };
  const apps = [add('app', 'service', 'App server', appConfig)];
  if (a.regions) {
    apps.push(add('standby', 'service', 'Standby app', appConfig));
    wire(
      entry,
      add('region', 'region', 'Regional routing', {
        regions: 2,
        activeRegion: 0,
        failoverMs: a.failover ? 2000 : 30000,
      })
    );
    for (const app of apps) wire('region', app);
  } else wire(entry, 'app');
  const router = add('routes', 'lb', 'Workload routing', { capacity: 256, serviceMs: 0.2 });
  for (const app of apps) wire(app, router);
  let backend = 'db';
  if (a.pool) {
    backend = add('pool', 'bulkhead', 'Connection pool', {
      capacity: 32,
      bulkheadMax: 32,
      queueLimit: 128,
      serviceMs: 1,
    });
  }
  const dbInput = (a.shards ?? 1) > 1 ? 'shards' : 'db';
  if (a.pool) wire('pool', dbInput);
  else backend = dbInput;
  if (a.cache) {
    add('cache', 'cache', 'Redis', {
      hitRate: cacheHitRate(a, w, warm),
      instances: a.cacheSize ?? 1,
      serviceMs: 2,
    });
    wire('cache', backend);
    backend = 'cache';
  }
  const partitions = a.shards ?? 1;
  if (partitions > 1)
    add('shards', 'lb', 'Shard router', {
      partitionRouting: true,
      hotKeyFraction: 0,
      capacity: 256,
      serviceMs: 2,
    });
  const dbMs = a.indexed ? w.read * 8 + (1 - w.read) * 36 : 30;
  for (let i = 0; i < partitions; i++) {
    const id = i === 0 ? 'db' : `db-${i}`;
    add(
      id,
      a.replicas ? 'replica' : 'db',
      partitions > 1 ? `MySQL shard ${i + 1}` : a.replicas ? 'MySQL + replicas' : 'MySQL',
      {
        capacity: 6 * 2 ** a.database,
        serviceMs: dbMs,
        serviceCv: 0.65,
        queueLimit: 64,
        readFraction: w.read,
        lockMs: 1.5,
        primaryLockMs: 1.5,
        replicaCount: a.replicas ?? 1,
        replicationLagMs: 250,
      }
    );
    if (partitions > 1) wire('shards', id);
  }
  const jobs = asynchronous ? shares.background : 0;
  const blobs = a.storage ? shares.blobs : 0;
  const search = a.search ? shares.search : 0;
  wire(router, backend, 1 - jobs - blobs - search);
  if (a.storage)
    wire(
      router,
      add('storage', 'objectstore', 'Object storage', { capacity: 64, serviceMs: 45 }),
      blobs
    );
  if (a.search)
    wire(
      router,
      add('search', 'searchindex', 'Search index', {
        capacity: 24,
        serviceMs: 8,
        indexMs: 30,
        indexLagMs: 1000,
        readFraction: 0.9,
      }),
      search
    );
  if (asynchronous) {
    const broker = add(
      a.stream ? 'stream' : 'queue',
      a.stream ? 'streambroker' : 'queue',
      a.stream ? 'Event stream' : 'Job queue',
      { queueLimit: a.stream ? 10000 : 2000, partitions: a.stream ?? 4 }
    );
    wire(router, broker, jobs);
    const workers = add('workers', a.stream ? 'service' : 'worker', 'Workers', {
      instances: a.workers ?? 1,
      capacity: 4,
      serviceMs: w.appMs * 2,
      queueLimit: 64,
      timeoutMs: 1500,
    });
    wire(broker, workers);
    wire(workers, a.pool ? 'pool' : dbInput);
  }
  // Keep request sources before their dependencies in the compact canvas.
  const depth = new Map<string, number>([['users', 0]]);
  for (let pass = 0; pass < nodes.length; pass++)
    for (const edge of edges)
      if (depth.has(edge.from))
        depth.set(edge.to, Math.max(depth.get(edge.to) ?? 0, depth.get(edge.from)! + 1));
  nodes.sort((a, b) => (depth.get(a.id) ?? 0) - (depth.get(b.id) ?? 0));
  return { nodes, edges };
}
