import { campaignLoad, freshCampaign, validCampaign, type Campaign } from './campaign';
import {
  extraAvailable,
  extraCost,
  extraUpgrade,
  validExtras,
  TOOLKIT,
  type ExtraArchitecture,
  type ExtraUpgrade,
} from './toolkit';
import { expandedTopology } from './topology';
import { defaultConfig } from '../vendor/breakscale/presets';
import type { SimNode, Topology } from '../vendor/breakscale/types';

export type Workload = 'saas' | 'commerce' | 'analytics' | 'social' | 'inference';
export type Upgrade = 'app' | 'horizontal' | 'database' | 'index' | 'cache' | ExtraUpgrade;
export interface Architecture extends ExtraArchitecture {
  app: number;
  instances: number;
  database: number;
  indexed: boolean;
  cache: boolean;
}
interface Project {
  kind: Upgrade;
  remaining: number;
  total: number;
}
export interface JournalEntry {
  id: number;
  hour: number;
  title: string;
  detail: string;
  tone: 'good' | 'warn' | 'neutral';
}
export interface Company {
  campaign?: Campaign;
  version: 1;
  scenario?: Workload;
  run?: { stableHours: number; completedAt?: number; continued: boolean };
  hours: number;
  users: number;
  cash: number;
  architecture: Architecture;
  workload: Workload;
  project: Project | null;
  events: JournalEntry[];
  launched: boolean;
  growth: boolean;
  paused: boolean;
  cacheAge: number;
  savedAt: number;
  pendingJobs?: number;
  outageUntil?: number;
}
export interface Decision {
  group?: string;
  components?: string[];
  id: Upgrade;
  title: string;
  subtitle: string;
  hours: number;
  upfront: number;
  benefit: string;
  tradeoff: string;
}
export const DECISIONS: Decision[] = [
  {
    id: 'database',
    title: 'Upgrade MySQL',
    subtitle: 'More room on one machine',
    hours: 2,
    upfront: 40,
    benefit: 'Doubles concurrent database work. Useful for both reads and writes.',
    tradeoff: 'Recurring cost grows faster than capacity. Write contention remains.',
  },
  {
    id: 'index',
    title: 'Optimize the query path',
    subtitle: 'Do less work per request',
    hours: 36,
    upfront: 120,
    benefit: 'Profiles and indexes the repeated read path. Largest benefit for read-heavy traffic.',
    tradeoff: 'Takes engineering time. Index maintenance adds write work.',
  },
  {
    id: 'cache',
    title: 'Introduce Redis',
    subtitle: 'Keep repeat reads off MySQL',
    hours: 18,
    upfront: 80,
    benefit: 'Serves eligible repeat reads from memory. Warms gradually after deployment.',
    tradeoff:
      'Adds $180/mo. Low-cacheability workloads benefit less. Assumes eligible reads tolerate a 30-second TTL.',
  },
  {
    id: 'app',
    title: 'Upgrade the app server',
    subtitle: 'More compute, same architecture',
    hours: 1,
    upfront: 20,
    benefit: 'Doubles application concurrency without adding another service.',
    tradeoff: 'Does not increase database capacity. Larger machines become expensive.',
  },
  {
    id: 'horizontal',
    title: 'Add an app instance',
    subtitle: 'Spread requests across servers',
    hours: 8,
    upfront: 60,
    benefit: 'Adds an application instance and a load balancer on the first rollout.',
    tradeoff: 'Adds running cost. All instances still share the same database.',
  },
  ...TOOLKIT,
];
export const WORKLOADS = {
  saas: {
    title: 'Tiny SaaS',
    difficulty: 'Easy',
    inspiration: 'A small subscription app',
    label: 'Read-heavy SaaS',
    read: 0.9,
    cacheable: 0.82,
    appMs: 18,
    users: 200,
    cash: 2400,
    growth: 0.18,
    trafficPerUser: 0.35,
    revenuePerUser: 2.5,
    description: 'Repeated dashboard reads, a forgiving budget, and time to learn the basics.',
    lesson: 'Learn when to optimize a query, buy a bigger machine, or add a cache.',
  },
  commerce: {
    title: 'Online store',
    difficulty: 'Medium',
    inspiration: 'A growing ecommerce shop',
    label: 'Catalog and checkout',
    read: 0.72,
    cacheable: 0.55,
    appMs: 25,
    users: 400,
    cash: 1800,
    growth: 0.25,
    trafficPerUser: 0.28,
    revenuePerUser: 2,
    description: 'Catalog reads can be cached. Checkout writes keep reaching the database.',
    lesson: 'Balance a fast browsing experience against a growing transactional path.',
  },
  analytics: {
    title: 'Event analytics',
    difficulty: 'Hard',
    inspiration: 'An event ingestion product',
    label: 'Write-heavy analytics',
    read: 0.2,
    cacheable: 0.12,
    appMs: 18,
    users: 450,
    cash: 1500,
    growth: 0.3,
    trafficPerUser: 0.22,
    revenuePerUser: 1.8,
    description: 'Frequent event ingestion. Most work cannot be served from a cache.',
    lesson: 'Read optimizations can make a write-heavy system more expensive without fixing it.',
  },
  social: {
    title: 'Social network',
    difficulty: 'Expert',
    inspiration: 'Facebook-style challenge',
    label: 'Personalized social feed',
    read: 0.7,
    cacheable: 0.35,
    appMs: 32,
    users: 650,
    cash: 1200,
    growth: 0.45,
    trafficPerUser: 0.25,
    revenuePerUser: 1.2,
    description: 'Personalized reads, frequent updates, fast audience growth, and thin margins.',
    lesson:
      'Handle growing read and write pressure with limited reusable cache content. Social graphs and fan-out are not modeled. Standby regions protect app compute; the data tier stays shared.',
  },
  inference: {
    title: 'AI gateway',
    difficulty: 'Expert',
    inspiration: 'OpenRouter-style challenge',
    label: 'Expensive AI requests',
    read: 0.55,
    cacheable: 0.08,
    appMs: 80,
    users: 200,
    cash: 1200,
    growth: 0.4,
    trafficPerUser: 0.35,
    revenuePerUser: 4,
    description: 'Slow request processing, little cache reuse, and a rapidly growing client base.',
    lesson:
      'Diagnose application concurrency before scaling the database. Provider quotas, token economics, streaming and model routing are not modeled yet.',
  },
};
export const companyProfile = (c: Company) => WORKLOADS[c.scenario ?? 'saas'];
export const freshCompany = (scenario: Workload = 'saas', campaign = true): Company => ({
  ...(campaign ? { campaign: freshCampaign() } : {}),
  scenario,
  version: 1,
  hours: 0,
  users: WORKLOADS[scenario].users,
  cash: WORKLOADS[scenario].cash,
  architecture: {
    app: 0,
    instances: 1,
    database: 0,
    indexed: false,
    cache: false,
  },
  workload: scenario,
  project: null,
  events: [
    {
      id: 0,
      hour: 0,
      title: WORKLOADS[scenario].title,
      detail: WORKLOADS[scenario].description + ' ' + WORKLOADS[scenario].lesson,
      tone: 'good',
    },
  ],
  launched: false,
  growth: true,
  paused: false,
  cacheAge: 0,
  savedAt: Date.now(),
});
export const revenue = (c: Company) => c.users * companyProfile(c).revenuePerUser;
export const traffic = (c: Company) =>
  Math.min(5000, c.users * companyProfile(c).trafficPerUser * campaignLoad(c));
export const cost = (a: Architecture) =>
  24 * 2.6 ** a.app * a.instances +
  45 * 2.8 ** a.database +
  (a.instances > 1 ? 20 : 0) +
  (a.cache ? 180 : 0) +
  extraCost(a);
export const engineeringCost = (c: Company) => (c.project ? 600 : 0);
export function upgrade(a: Architecture, kind: Upgrade): Architecture {
  const n = { ...a };
  if (kind === 'app') n.app = Math.min(3, n.app + 1);
  if (kind === 'horizontal') n.instances = Math.min(6, n.instances + 1);
  if (kind === 'database') n.database = Math.min(3, n.database + 1);
  if (kind === 'index') n.indexed = true;
  if (kind === 'cache') n.cache = true;
  return extraUpgrade(n, kind);
}
export function available(a: Architecture, id: Upgrade) {
  if (TOOLKIT.some((d) => d.id === id)) return extraAvailable(a, id);
  return id === 'index'
    ? !a.indexed
    : id === 'cache'
      ? !a.cache
      : id === 'horizontal'
        ? a.instances < 6
        : id === 'app'
          ? a.app < 3
          : a.database < 3;
}
export function topology(a: Architecture, rps: number, workload: Workload, warm = 1): Topology {
  const w = WORKLOADS[workload];
  const nodes: SimNode[] = [];
  const add = (
    id: string,
    kind: SimNode['kind'],
    label: string,
    x: number,
    patch: Partial<SimNode['config']>
  ) =>
    nodes.push({
      id,
      kind,
      label,
      x,
      y: 210,
      config: { ...defaultConfig(kind), ...patch },
    });
  add('users', 'client', 'Your users', 40, {
    rps,
    readFraction: w.read,
    timeoutMs: 1500,
  });
  if (a.instances > 1) add('lb', 'lb', 'Load balancer', 265, {});
  add('app', 'service', 'App server', a.instances > 1 ? 490 : 300, {
    capacity: 8 * 2 ** a.app,
    instances: a.instances,
    serviceMs: w.appMs,
    queueLimit: 96,
    timeoutMs: 1200,
    readFraction: w.read,
  });
  if (a.cache)
    add('cache', 'cache', 'Redis', a.instances > 1 ? 715 : 560, {
      hitRate: w.cacheable * w.read * warm,
      serviceMs: 2,
      readFraction: w.read,
    });
  // A calibrated workload-average service time, not an assertion about hardware QPS.
  // Indexes reduce read service from 30 to 8ms but raise write work from 30 to 36ms.
  const dbMs = a.indexed ? w.read * 8 + (1 - w.read) * 36 : 30;
  add('db', 'db', 'MySQL', a.cache ? (a.instances > 1 ? 940 : 820) : a.instances > 1 ? 715 : 560, {
    capacity: 6 * 2 ** a.database,
    serviceMs: dbMs,
    serviceCv: 0.65,
    queueLimit: 64,
    readFraction: w.read,
    lockMs: 1.5,
  });
  return expandedTopology(
    {
      nodes,
      edges: nodes.slice(1).map((n, i) => ({
        id: `${nodes[i].id}-${n.id}`,
        from: nodes[i].id,
        to: n.id,
        weight: 1,
        latencyMs: 1,
      })),
    },
    a,
    w,
    warm
  );
}
export function log(
  c: Company,
  title: string,
  detail: string,
  tone: JournalEntry['tone'] = 'neutral'
) {
  c.events = [
    { id: (c.events[0]?.id ?? 0) + 1, hour: c.hours, title, detail, tone },
    ...c.events,
  ].slice(0, 30);
}
export function parseSave(raw: string | null): Company | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(raw) as Company;
    if (!validCampaign(c?.campaign)) return null;
    const a = c.architecture;
    const finite = (n: unknown) => typeof n === 'number' && Number.isFinite(n);
    if (
      c.version !== 1 ||
      !a ||
      !finite(c.hours) ||
      c.hours < 0 ||
      !finite(c.users) ||
      c.users < 0 ||
      !finite(c.cash) ||
      !finite(c.savedAt) ||
      !finite(c.cacheAge) ||
      !Object.hasOwn(WORKLOADS, c.workload) ||
      (c.scenario !== undefined && !Object.hasOwn(WORKLOADS, c.scenario))
    )
      return null;
    if (
      ![a.app, a.database].every((n) => Number.isInteger(n) && n >= 0 && n <= 3) ||
      !Number.isInteger(a.instances) ||
      a.instances < 1 ||
      a.instances > 6 ||
      typeof a.indexed !== 'boolean' ||
      typeof a.cache !== 'boolean'
    )
      return null;
    if (
      ![c.paused, c.growth, c.launched].every((n) => typeof n === 'boolean') ||
      !Array.isArray(c.events) ||
      c.events.length > 30 ||
      !c.events.every(
        (e) =>
          finite(e.id) &&
          finite(e.hour) &&
          typeof e.title === 'string' &&
          typeof e.detail === 'string' &&
          ['good', 'warn', 'neutral'].includes(e.tone)
      )
    )
      return null;
    if (
      c.project &&
      (!DECISIONS.some((d) => d.id === c.project?.kind) ||
        !finite(c.project.total) ||
        !finite(c.project.remaining) ||
        c.project.remaining < 0 ||
        c.project.remaining > c.project.total)
    )
      return null;
    if (
      c.run !== undefined &&
      (!c.run ||
        !finite(c.run.stableHours) ||
        c.run.stableHours < 0 ||
        c.run.stableHours > 24 ||
        typeof c.run.continued !== 'boolean' ||
        (c.run.completedAt !== undefined &&
          (!finite(c.run.completedAt) || c.run.completedAt < 0 || c.run.completedAt > c.hours)) ||
        (c.run.continued && c.run.completedAt === undefined))
    )
      return null;
    if (!validExtras(a)) return null;
    if (c.outageUntil !== undefined && (!finite(c.outageUntil) || c.outageUntil < 0)) return null;
    if (
      c.pendingJobs !== undefined &&
      (!Number.isInteger(c.pendingJobs) || c.pendingJobs < 0 || c.pendingJobs > 10000)
    )
      return null;
    return c;
  } catch {
    return null;
  }
}
