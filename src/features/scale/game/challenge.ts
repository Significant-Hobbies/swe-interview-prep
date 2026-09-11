import { pendingJobs, serviceHealthy } from './health';
import { complexity } from './toolkit';
import type { SimSnapshot } from '../vendor/breakscale/types';
import { companyProfile, cost, engineeringCost, revenue, WORKLOADS } from './model';
import type { Company } from './model';

export const targetUsers = (c: Company) => companyProfile(c).users * 5;
export const monthlyProfit = (c: Company, s: SimSnapshot['system']) =>
  revenue(c) * (1 - Math.min(1, s.errorRate)) - cost(c.architecture) - engineeringCost(c);
export const challengeComplete = (c: Company) => c.run?.completedAt !== undefined;
export const challengeStopped = (c: Company) => challengeComplete(c) && !c.run?.continued;

export function diagnosis(c: Company, s: SimSnapshot): string {
  if (s.activeFailures.length)
    return 'A component is unavailable. Inspect the failed dependency and its failure domain before adding capacity. A standby application region cannot protect shared data services.';
  if (serviceHealthy(s))
    return 'Service is within target. Watch monthly profit and leave capacity for the next traffic increase.';
  const jobs = pendingJobs(s);
  const drain = s.nodes.workers?.throughput ?? 0;
  if (jobs > 0 && (drain <= 0 || jobs / drain >= 5))
    return 'Check background delivery as well as foreground latency. Compare queue depth, worker throughput and downstream pressure. More workers help only if the data tier has room; stream partitions cap consumer parallelism.';
  if (Object.values(s.nodes).some((n) => (n.staleReadRate ?? 0) >= 0.02))
    return 'Reads are fast but stale. Replication or index refresh has not caught up with writes. Extra query capacity does not remove that consistency window.';
  const node = Object.entries(s.nodes)
    .filter(([id]) => id !== 'users')
    .sort((a, b) => b[1].queued - a[1].queued || b[1].utilization - a[1].utilization)[0]?.[0];
  if (node === 'app')
    return 'Requests are waiting at the app tier. Compare a larger app machine with another instance. Both add compute capacity, but neither removes database work.';
  if (node === 'db' || node?.startsWith('db-'))
    return WORKLOADS[c.workload].read > 0.5
      ? 'Database work is backing up. Compare indexing, read replicas, a larger database, and caching eligible reads. Indexes add write cost; Redis needs time to warm and cannot remove writes.'
      : 'Write-heavy database work is backing up. A larger database adds concurrency, but write locking still limits throughput. Indexing adds write cost and caching removes only eligible reads. Compare sharding to split write contention, and test hot-key traffic in Sandbox.';
  return 'Requests are missing the service target. Inspect waiting requests and utilization along the request path, then compare a single change in Sandbox.';
}

export function debrief(c: Company, snapshot: SimSnapshot): string {
  return `# Scale — ${companyProfile(c).title}

Outcome: ${c.cash <= 0 ? 'Runway exhausted' : challengeComplete(c) ? 'Challenge completed' : 'In progress'}
Company hours: ${c.hours.toFixed(1)}${challengeComplete(c) ? `; challenge completed at ${c.run?.completedAt?.toFixed(1)}` : ''}
Users: ${Math.floor(c.users)} / ${targetUsers(c)} target
Cash: $${c.cash.toFixed(2)}
Monthly profit: $${monthlyProfit(c, snapshot.system).toFixed(2)}
p99: ${snapshot.system.p99.toFixed(0)} ms; errors: ${(snapshot.system.errorRate * 100).toFixed(1)}%

${c.campaign ? `Campaign: ${c.campaign.stage}/2 events cleared; ${c.campaign.attempts} attempts; $${c.campaign.earned} earned; ${Math.floor(c.campaign.lostUsers)} customers lost to service failures.` : ''}

## Architecture
App size: ${c.architecture.app + 1}; instances: ${c.architecture.instances}
Database size: ${c.architecture.database + 1}; indexing: ${c.architecture.indexed}; Redis: ${c.architecture.cache}
Shards: ${c.architecture.shards ?? 1}; replicas per primary: ${c.architecture.replicas ?? 0}
Queue: ${!!c.architecture.queue}; stream partitions: ${c.architecture.stream ?? 0}; workers: ${c.architecture.workers ?? 0}
Object storage: ${!!c.architecture.storage}; CDN: ${!!c.architecture.cdn}; search: ${!!c.architecture.search}
Connection pool: ${!!c.architecture.pool}; standby region: ${!!c.architecture.regions}; automatic failover: ${!!c.architecture.failover}
Complexity: ${complexity(c.architecture)}; pending background jobs: ${pendingJobs(snapshot)}
Infrastructure: $${cost(c.architecture).toFixed(2)}/month

## Recent decisions and incidents
${[...c.events]
  .reverse()
  .map((e) => `- Hour ${e.hour.toFixed(1)}: ${e.title}. ${e.detail}`)
  .join('\n')}

## Reflect
- What evidence identified your bottleneck?
- Which alternative did you reject, and why?
- What would fail first at twice the traffic?

## Model assumptions
${companyProfile(c).lesson}
Prices and growth rates are fictional. This simplified capacity simulation is not a production sizing tool. The journal retains the 30 most recent entries.
`;
}
