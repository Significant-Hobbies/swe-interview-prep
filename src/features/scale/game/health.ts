import type { SimSnapshot } from '../vendor/breakscale/types';
export function pendingJobs(s: SimSnapshot): number {
  if (s.nodes.stream) return Math.ceil(s.nodes.stream.consumerLag ?? 0);
  return (
    (s.nodes.queue?.queued ?? 0) + (s.nodes.workers?.queued ?? 0) + (s.nodes.workers?.inFlight ?? 0)
  );
}
export function serviceHealthy(s: SimSnapshot): boolean {
  const jobs = pendingJobs(s);
  const drain = s.nodes.workers?.throughput ?? 0;
  return (
    s.system.errorRate < 0.02 &&
    s.system.p99 < 500 &&
    (jobs === 0 || (drain > 0 && jobs / drain < 5)) &&
    (s.nodes.workers?.errorRate ?? 0) < 0.02 &&
    (s.nodes.stream?.retentionDropRate ?? 0) === 0 &&
    Object.values(s.nodes).every((n) => (n.staleReadRate ?? 0) < 0.02)
  );
}
