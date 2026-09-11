import deploy from '../../docs/learning/platform/deploy.md?raw';
import tracing from '../../docs/learning/platform/tracing.md?raw';
import metrics from '../../docs/learning/platform/metrics.md?raw';

export const platformLessons: Record<string, { name: string; content: string }> = {
  'gitops-secret-migration': { name: 'Migration waves on real controllers', content: deploy },
  'trace-propagation-sampling': {
    name: 'Trace propagation in a running service',
    content: tracing,
  },
  'metrics-discovery-ingestion': { name: 'Follow a metric into storage', content: metrics },
};
