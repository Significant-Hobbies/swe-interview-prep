import type { Command, View } from './game/runtime';
import { pendingJobs } from './game/health';

export function InfrastructureMetrics({
  view,
  selected,
  send,
}: {
  view: View;
  selected: string;
  send: (c: Command) => void;
}) {
  const stats = view.snapshot.nodes[selected];
  const failed = view.snapshot.activeFailures.some((f) => f.nodeId === selected);
  const shards = Object.entries(view.snapshot.nodes).filter(
    ([id]) => id === 'db' || id.startsWith('db-')
  );
  const readings: Array<[string, string]> = [];
  if (
    (selected === 'search' ||
      ((selected === 'db' || selected.startsWith('db-')) && view.architecture.replicas)) &&
    stats?.staleReadRate !== undefined
  )
    readings.push(['Stale reads', `${(stats.staleReadRate * 100).toFixed(1)}%`]);
  if (stats?.consumerLag !== undefined)
    readings.push(
      ['Consumer lag', `${Math.ceil(stats.consumerLag)} jobs`],
      ['Expired messages', `${(stats.retentionDropRate ?? 0).toFixed(1)}/s`]
    );
  if (selected === 'queue' || selected === 'workers')
    readings.push(
      ['Pending background jobs', `${pendingJobs(view.snapshot)}`],
      ['Worker completions', `${Math.round(view.snapshot.nodes.workers?.throughput ?? 0)}/s`]
    );
  if (selected === 'pool')
    readings.push(
      ['Connections in use', `${stats?.bulkheadInFlight ?? 0} / 32`],
      ['Refused calls', `${(stats?.bulkheadRejectedRate ?? 0).toFixed(1)}/s`]
    );
  if (selected === 'region')
    readings.push(
      ['Serving region', stats?.failingOver ? 'Switching…' : `${(stats?.activeRegion ?? 0) + 1}`],
      ['Reachable regions', `${stats?.regionsHealthy ?? 0} / 2`]
    );
  if (selected === 'shards')
    readings.push(
      [
        'Busiest partition',
        `${Math.round(Math.max(...shards.map(([, n]) => n.utilization)) * 100)}%`,
      ],
      [
        'Least busy partition',
        `${Math.round(Math.min(...shards.map(([, n]) => n.utilization)) * 100)}%`,
      ]
    );
  return (
    <>
      {readings.map(([label, value]) => (
        <div className="inspector-detail" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
      {view.sandbox && selected === 'shards' && (
        <label className="fault-control">
          Hot-key traffic · {Math.round(view.hotKey * 100)}%
          <input
            aria-label="Hot-key traffic"
            type="range"
            min="0"
            max="0.95"
            step="0.05"
            value={view.hotKey}
            onChange={(e) => send({ type: 'hot-key', value: Number(e.target.value) })}
          />
        </label>
      )}
      {view.sandbox && selected !== 'users' && (
        <div className="fault-control">
          <button
            className="secondary"
            onClick={() => send({ type: 'fault', node: selected, active: !failed })}
          >
            {failed ? 'Restore component' : 'Simulate outage'}
          </button>
          <small>Sandbox only. Editing the architecture clears injected faults.</small>
        </div>
      )}
    </>
  );
}
