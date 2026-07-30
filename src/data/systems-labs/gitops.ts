import {
  emitEvidence,
  projectHealth,
  queuedReconciliation,
  retryWithBackoff,
  sequenceTransitions,
  type TransitionDraft,
} from '../../lib/simulation/primitives';
import type {
  ActorDefinition,
  EvidenceDefinition,
  ScenarioDefinition,
  SystemsLabDefinition,
  TruthPlane,
} from '../../lib/simulation/types';
import { gitopsConfigurationChallenge } from './configuration-challenges';

const actors: ActorDefinition[] = [
  {
    id: 'git',
    label: 'Git repository',
    kind: 'source',
    truthPlane: 'source',
    description: 'The desired manifests and revision Argo CD reads.',
    initialStatus: 'idle',
    initialDetail: 'main points at the previously reconciled commit.',
  },
  {
    id: 'argocd',
    label: 'Argo CD application',
    kind: 'controller',
    truthPlane: 'controller',
    description:
      'Projects Git desired state and cluster observations into sync and operation state.',
    initialStatus: 'healthy',
    initialDetail: 'Synced and Healthy at the previous revision.',
    initialMetrics: { syncStatus: 'Synced', healthStatus: 'Healthy', operationPhase: 'Succeeded' },
  },
  {
    id: 'eso',
    label: 'External Secrets Operator',
    kind: 'controller',
    truthPlane: 'controller',
    description: 'Asynchronously reconciles an ExternalSecret into a Kubernetes Secret.',
    initialStatus: 'idle',
    initialDetail: 'No reconcile for the new ExternalSecret has run.',
  },
  {
    id: 'secret',
    label: 'Kubernetes Secret',
    kind: 'resource',
    truthPlane: 'resource',
    description: 'The namespaced Secret the migration Job and Deployment consume.',
    initialStatus: 'idle',
    initialDetail: 'The new credential revision is not present.',
  },
  {
    id: 'job',
    label: 'Migration Job',
    kind: 'workload',
    truthPlane: 'process',
    description: 'Runs the schema migration before the application rollout.',
    initialStatus: 'idle',
    initialDetail: 'The Job has not been created.',
    initialMetrics: { failedPods: 0, backoffLimit: 2 },
  },
  {
    id: 'database',
    label: 'Database revision',
    kind: 'storage',
    truthPlane: 'storage',
    description: 'The durable schema state, independent of Job and Argo status.',
    initialStatus: 'healthy',
    initialDetail: 'Revision 41 is applied.',
    initialMetrics: { revision: 41, dirty: false },
  },
  {
    id: 'deployment',
    label: 'Application Deployment',
    kind: 'workload',
    truthPlane: 'user-visible',
    description: 'The application rollout that expects schema revision 42 and the new Secret.',
    initialStatus: 'healthy',
    initialDetail: 'The previous release is serving traffic.',
    initialMetrics: { readyReplicas: 3, release: 'previous' },
  },
];

function evidence(
  id: string,
  actorId: string,
  truthPlane: TruthPlane,
  label: string,
  value: string | number | boolean,
  detail: string,
  decisive = false
): EvidenceDefinition {
  return emitEvidence({
    id,
    actorId,
    truthPlane,
    kind: truthPlane === 'storage' ? 'record' : truthPlane === 'process' ? 'log' : 'state',
    label,
    value,
    detail,
    decisive,
  });
}

function baseGitAndSync(): TransitionDraft[] {
  return [
    {
      id: 'git-main-moves',
      at: 1,
      actorId: 'git',
      title: 'main advances',
      description: 'A merge moves the mutable branch reference from commit a1 to commit a2.',
      patch: { status: 'complete', detail: 'main now resolves to commit a2.' },
      evidence: [
        evidence(
          'git-resolved-revision',
          'git',
          'source',
          'Resolved revision',
          'a2',
          'Argo resolves targetRevision: main at comparison time.'
        ),
      ],
    },
    {
      id: 'argo-detects-diff',
      at: 2,
      actorId: 'argocd',
      title: 'Desired state changes',
      description: 'Automated sync observes manifests from a2 differ from live resources.',
      patch: {
        status: 'queued',
        detail: 'Sync operation queued for commit a2.',
        metrics: { syncStatus: 'OutOfSync', healthStatus: 'Healthy', operationPhase: 'Running' },
      },
      evidence: [
        evidence(
          'argo-out-of-sync',
          'argocd',
          'controller',
          'Sync status',
          'OutOfSync',
          'The live resource set does not yet match commit a2.'
        ),
      ],
    },
    {
      id: 'argo-applies-wave-minus-two',
      at: 3,
      actorId: 'argocd',
      title: 'Wave -2 applied',
      description: 'Argo applies the ExternalSecret custom resource before later waves.',
      patch: {
        status: 'running',
        detail: 'Wave -2 applied; another controller must now create the Secret.',
      },
      evidence: [
        evidence(
          'argo-wave-minus-two-applied',
          'argocd',
          'operation',
          'Applied wave',
          -2,
          'Argo knows the ExternalSecret object was applied, not that its target Secret exists.'
        ),
      ],
      checkpoint: 'decision',
    },
  ];
}

function healthyScenario(): ScenarioDefinition {
  const transitions = sequenceTransitions([
    ...baseGitAndSync(),
    ...queuedReconciliation({
      id: 'eso-reconcile',
      at: 4,
      actorId: 'eso',
      queuedDetail: 'The ExternalSecret event is waiting in the ESO work queue.',
      runningDetail: 'ESO reads the provider value and writes the namespaced Secret.',
    }),
    {
      id: 'secret-created',
      at: 6,
      actorId: 'secret',
      title: 'Secret materialized',
      description: 'The Kubernetes Secret exists with the expected key and resource version.',
      patch: { status: 'healthy', detail: 'database-url exists at resourceVersion 812.' },
      evidence: [
        evidence(
          'secret-ready',
          'secret',
          'resource',
          'Secret exists',
          true,
          'The API server contains the target Secret and required key.',
          true
        ),
      ],
    },
    {
      id: 'migration-starts',
      at: 7,
      actorId: 'job',
      title: 'Wave -1 Job starts',
      description: 'Argo applies the migration Job after the Secret dependency is healthy.',
      patch: { status: 'running', detail: 'Migration pod is running with revision 42.' },
      evidence: [
        evidence(
          'job-pod-running',
          'job',
          'process',
          'Pod phase',
          'Running',
          'The first migration pod started successfully.'
        ),
      ],
    },
    {
      id: 'database-revision-advances',
      at: 8,
      actorId: 'database',
      title: 'Revision 42 committed',
      description: 'The migration transaction records revision 42 in durable storage.',
      patch: {
        status: 'complete',
        detail: 'Revision 42 is applied and clean.',
        metrics: { revision: 42, dirty: false },
      },
      evidence: [
        evidence(
          'database-revision-42',
          'database',
          'storage',
          'Schema revision',
          42,
          'The revision table contains a completed revision 42.',
          true
        ),
      ],
    },
    {
      id: 'migration-completes',
      at: 9,
      actorId: 'job',
      title: 'Job completes',
      description: 'The Job controller observes the required successful completion.',
      patch: {
        status: 'complete',
        detail: 'Job condition Complete=True.',
        metrics: { failedPods: 0 },
      },
      evidence: [
        evidence(
          'job-complete',
          'job',
          'process',
          'Job condition',
          'Complete',
          'Kubernetes reports Complete=True.'
        ),
      ],
    },
    {
      id: 'deployment-rolls-out',
      at: 10,
      actorId: 'deployment',
      title: 'Wave 0 rolls out',
      description: 'The new application release starts after the migration Job is healthy.',
      patch: {
        status: 'healthy',
        detail: 'The new release has three ready replicas.',
        metrics: { readyReplicas: 3, release: 'a2' },
      },
      evidence: [
        evidence(
          'deployment-ready',
          'deployment',
          'user-visible',
          'Ready replicas',
          3,
          'All desired replicas for release a2 are Ready.',
          true
        ),
      ],
    },
    projectHealth({
      id: 'argo-projects-success',
      at: 11,
      actorId: 'argocd',
      status: 'healthy',
      detail: 'All managed resources match a2 and the sync operation succeeded.',
      label: 'Application projection',
      value: 'Synced / Healthy / Succeeded',
      decisive: true,
    }),
  ]);
  transitions[transitions.length - 1].patch = {
    ...transitions[transitions.length - 1].patch,
    metrics: { syncStatus: 'Synced', healthStatus: 'Healthy', operationPhase: 'Succeeded' },
  };

  return {
    id: 'healthy',
    title: 'All controllers converge',
    summary: 'ESO produces the Secret, the migration commits, and wave 0 rolls out.',
    controls: { secretReconcile: 'ready', migration: 'succeeds', migrationResource: 'tracked' },
    predictionPrompt: 'After main moves to a2, which durable outcome should you expect?',
    predictionOptions: [
      {
        id: 'rollout-completes',
        label: 'Schema revision 42 commits and release a2 becomes Ready.',
      },
      { id: 'argo-only', label: 'Argo becomes Synced before the Secret or database changes.' },
      { id: 'old-release', label: 'The old release stays live because waves never resume.' },
    ],
    correctPredictionId: 'rollout-completes',
    entryTransitionId: transitions[0].id,
    transitions,
    expectedOutcome: {
      summary: 'Every controller converges, revision 42 is durable, and release a2 is Ready.',
      actorStates: {
        argocd: 'healthy',
        secret: 'healthy',
        job: 'complete',
        database: 'complete',
        deployment: 'healthy',
      },
      evidenceIds: [
        'secret-ready',
        'database-revision-42',
        'deployment-ready',
        'argo-projects-success-evidence',
      ],
    },
  };
}

function delayedSecretScenario(): ScenarioDefinition {
  const transitions = sequenceTransitions([
    ...baseGitAndSync(),
    ...queuedReconciliation({
      id: 'eso-delayed',
      at: 4,
      actorId: 'eso',
      queuedDetail: 'ESO has not yet dequeued the ExternalSecret reconcile.',
      runningDetail: 'ESO starts after two later virtual ticks.',
    }),
    {
      id: 'argo-waits-for-secret',
      at: 6,
      actorId: 'argocd',
      title: 'Later waves wait',
      description: 'The operation remains Running while the wave -2 dependency is not healthy.',
      patch: {
        status: 'waiting',
        detail: 'Wave -1 is not applied; the target Secret is still absent.',
        metrics: {
          syncStatus: 'OutOfSync',
          healthStatus: 'Progressing',
          operationPhase: 'Running',
        },
      },
      evidence: [
        evidence(
          'argo-wave-wait',
          'argocd',
          'operation',
          'Next wave',
          -2,
          'Argo remains on the first unhealthy or out-of-sync wave.',
          true
        ),
      ],
      checkpoint: 'decision',
    },
    {
      id: 'delayed-secret-created',
      at: 8,
      actorId: 'secret',
      title: 'Secret eventually materializes',
      description: 'ESO writes the target Secret after the delay.',
      patch: { status: 'healthy', detail: 'database-url now exists at resourceVersion 813.' },
      evidence: [
        evidence(
          'delayed-secret-ready',
          'secret',
          'resource',
          'Secret exists',
          true,
          'The asynchronous reconcile eventually created the target.',
          true
        ),
      ],
    },
    {
      id: 'delayed-migration-completes',
      at: 9,
      actorId: 'job',
      title: 'Migration runs',
      description: 'Once the dependency is ready, wave -1 runs and completes.',
      patch: { status: 'complete', detail: 'Job condition Complete=True.' },
    },
    {
      id: 'delayed-db-commits',
      at: 9,
      actorId: 'database',
      title: 'Revision 42 committed',
      description: 'The database records the migration after the delayed start.',
      patch: {
        status: 'complete',
        detail: 'Revision 42 is applied and clean.',
        metrics: { revision: 42, dirty: false },
      },
      evidence: [
        evidence(
          'delayed-database-revision-42',
          'database',
          'storage',
          'Schema revision',
          42,
          'Delay changed time, not the final durable result.',
          true
        ),
      ],
    },
    {
      id: 'delayed-deployment-ready',
      at: 10,
      actorId: 'deployment',
      title: 'Rollout resumes',
      description: 'Wave 0 reaches three ready replicas after the delayed prerequisite.',
      patch: {
        status: 'healthy',
        detail: 'Release a2 is Ready after the ESO delay.',
        metrics: { readyReplicas: 3, release: 'a2' },
      },
      evidence: [
        evidence(
          'delayed-deployment-evidence',
          'deployment',
          'user-visible',
          'Release',
          'a2',
          'The rollout was delayed rather than bypassed.',
          true
        ),
      ],
    },
    {
      id: 'delayed-argo-success',
      at: 11,
      actorId: 'argocd',
      title: 'Application converges',
      description: 'The application eventually becomes Synced and Healthy.',
      patch: {
        status: 'healthy',
        detail: 'All waves completed after the delayed reconcile.',
        metrics: { syncStatus: 'Synced', healthStatus: 'Healthy', operationPhase: 'Succeeded' },
      },
    },
  ]);

  return {
    id: 'secret-delayed',
    title: 'ESO reconcile is delayed',
    summary: 'Argo applies a custom resource, then waits while another controller catches up.',
    controls: { secretReconcile: 'delayed', migration: 'succeeds', migrationResource: 'tracked' },
    predictionPrompt: 'What does the ESO delay change?',
    predictionOptions: [
      { id: 'time-only', label: 'Later waves wait; the final rollout can still succeed.' },
      {
        id: 'argo-creates-secret',
        label: 'Argo creates the Secret directly to keep waves moving.',
      },
      { id: 'migration-bypasses', label: 'The migration runs without its Secret.' },
    ],
    correctPredictionId: 'time-only',
    entryTransitionId: transitions[0].id,
    transitions,
    expectedOutcome: {
      summary:
        'The operation pauses on its dependency, then converges after ESO produces the Secret.',
      actorStates: {
        argocd: 'healthy',
        secret: 'healthy',
        database: 'complete',
        deployment: 'healthy',
      },
      evidenceIds: [
        'argo-wave-wait',
        'delayed-secret-ready',
        'delayed-database-revision-42',
        'delayed-deployment-evidence',
      ],
    },
  };
}

function failedSecretScenario(): ScenarioDefinition {
  const transitions = sequenceTransitions([
    ...baseGitAndSync(),
    ...queuedReconciliation({
      id: 'eso-provider-error',
      at: 4,
      actorId: 'eso',
      queuedDetail: 'ESO queues the ExternalSecret.',
      runningDetail: 'ESO calls the provider for the referenced secret.',
    }),
    {
      id: 'eso-reconcile-fails',
      at: 6,
      actorId: 'eso',
      title: 'Provider lookup fails',
      description: 'The referenced provider key does not exist.',
      patch: { status: 'failed', detail: 'Ready=False: SecretSyncedError.' },
      evidence: [
        evidence(
          'eso-ready-false',
          'eso',
          'controller',
          'ExternalSecret condition',
          'Ready=False',
          'ESO owns this failure; Argo only observes the custom resource status.',
          true
        ),
      ],
    },
    {
      id: 'secret-remains-absent',
      at: 6,
      actorId: 'secret',
      title: 'Secret is absent',
      description: 'No target Secret was created.',
      patch: { status: 'failed', detail: 'database-url does not exist.' },
      evidence: [
        evidence(
          'secret-absent',
          'secret',
          'resource',
          'Secret exists',
          false,
          'The API server has no target Secret.',
          true
        ),
      ],
      checkpoint: 'decision',
    },
    {
      id: 'job-never-starts',
      at: 7,
      actorId: 'job',
      title: 'Migration remains blocked',
      description: 'Wave -1 is never applied because the dependency did not become healthy.',
      patch: { status: 'blocked', detail: 'No Job exists for revision 42.' },
      evidence: [
        evidence(
          'job-not-created',
          'job',
          'process',
          'Job exists',
          false,
          'There are no migration pods or Job conditions.'
        ),
      ],
    },
    {
      id: 'argo-operation-fails',
      at: 10,
      actorId: 'argocd',
      title: 'Sync times out',
      description: 'The operation ends without applying later waves.',
      patch: {
        status: 'failed',
        detail: 'Sync operation failed waiting for wave -2.',
        metrics: { syncStatus: 'OutOfSync', healthStatus: 'Degraded', operationPhase: 'Failed' },
      },
      evidence: [
        evidence(
          'argo-operation-failed',
          'argocd',
          'operation',
          'Operation phase',
          'Failed',
          'The application never reached later waves.',
          true
        ),
      ],
    },
    {
      id: 'old-deployment-remains',
      at: 10,
      actorId: 'deployment',
      title: 'Old release remains',
      description: 'The previous release continues serving because wave 0 never ran.',
      patch: {
        status: 'healthy',
        detail: 'The previous release still has three ready replicas.',
        metrics: { readyReplicas: 3, release: 'previous' },
      },
    },
  ]);

  return {
    id: 'secret-fails',
    title: 'ESO cannot produce the Secret',
    summary: 'A provider error keeps the target resource absent and blocks every later wave.',
    controls: { secretReconcile: 'fails', migration: 'not-started', migrationResource: 'tracked' },
    predictionPrompt: 'Which evidence proves why release a2 never starts?',
    predictionOptions: [
      { id: 'eso-and-secret', label: 'ESO Ready=False plus an absent target Secret.' },
      { id: 'git', label: 'The Git commit exists on main.' },
      { id: 'old-pods', label: 'The previous release still has Ready pods.' },
    ],
    correctPredictionId: 'eso-and-secret',
    entryTransitionId: transitions[0].id,
    transitions,
    expectedOutcome: {
      summary:
        'The source revision exists, but ESO fails, the Secret stays absent, and later waves do not run.',
      actorStates: { argocd: 'failed', eso: 'failed', secret: 'failed', job: 'blocked' },
      evidenceIds: ['eso-ready-false', 'secret-absent', 'argo-operation-failed'],
    },
  };
}

function migrationFailureScenario(): ScenarioDefinition {
  const retryDrafts = retryWithBackoff({
    id: 'migration-pod',
    at: 8,
    actorId: 'job',
    attempts: 3,
    backoffTicks: 2,
    attemptDetail: (attempt) =>
      `Migration pod attempt ${attempt} exits after the non-transactional DDL step.`,
    finalPatch: {
      status: 'failed',
      detail: 'Job condition Failed=True after backoffLimit is exceeded.',
      metrics: { failedPods: 3, backoffLimit: 2 },
    },
    evidenceForAttempt: (attempt) => [
      evidence(
        `migration-attempt-${attempt}-failed`,
        'job',
        'process',
        'Failed pod',
        attempt,
        `Kubernetes counts failed pod ${attempt} toward the Job backoff limit.`,
        attempt === 3
      ),
    ],
  });
  const transitions = sequenceTransitions([
    ...baseGitAndSync(),
    ...queuedReconciliation({
      id: 'eso-before-failed-migration',
      at: 4,
      actorId: 'eso',
      queuedDetail: 'ESO queues the reconcile.',
      runningDetail: 'ESO writes the credential successfully.',
    }),
    {
      id: 'migration-secret-ready',
      at: 6,
      actorId: 'secret',
      title: 'Secret materialized',
      description: 'The migration dependency exists.',
      patch: { status: 'healthy', detail: 'database-url exists.' },
    },
    {
      id: 'migration-job-starts',
      at: 7,
      actorId: 'job',
      title: 'Wave -1 Job starts',
      description: 'The first migration pod starts.',
      patch: { status: 'running', detail: 'Attempt 1 is running.' },
    },
    {
      id: 'database-partial-change',
      at: 8,
      actorId: 'database',
      title: 'Partial DDL persists',
      description: 'A non-transactional schema change persists before the migration process exits.',
      patch: {
        status: 'degraded',
        detail: 'Revision remains 41, but one revision-42 DDL step exists.',
        metrics: { revision: 41, dirty: true },
      },
      evidence: [
        evidence(
          'database-dirty-revision',
          'database',
          'storage',
          'Revision state',
          '41 / dirty',
          'Durable storage contains a partial change even though no Job succeeded.',
          true
        ),
      ],
      checkpoint: 'decision',
    },
    ...retryDrafts,
    {
      id: 'argo-sees-job-failure',
      at: 13,
      actorId: 'argocd',
      title: 'Sync hook/resource fails',
      description: 'Argo observes the failed Job and does not apply wave 0.',
      patch: {
        status: 'failed',
        detail: 'Sync operation failed in wave -1.',
        metrics: { syncStatus: 'OutOfSync', healthStatus: 'Degraded', operationPhase: 'Failed' },
      },
      evidence: [
        evidence(
          'argo-wave-minus-one-failed',
          'argocd',
          'operation',
          'Failed wave',
          -1,
          'The operation stops before the Deployment wave.',
          true
        ),
      ],
    },
    {
      id: 'deployment-blocked',
      at: 13,
      actorId: 'deployment',
      title: 'Rollout blocked',
      description: 'Release a2 never starts against the dirty database.',
      patch: {
        status: 'blocked',
        detail: 'The previous release remains; release a2 was not applied.',
        metrics: { readyReplicas: 3, release: 'previous' },
      },
      evidence: [
        evidence(
          'new-rollout-not-applied',
          'deployment',
          'user-visible',
          'Release',
          'previous',
          'Wave 0 never applied release a2.',
          true
        ),
      ],
    },
  ]);

  return {
    id: 'migration-fails',
    title: 'Migration partially applies, then exhausts retries',
    summary: 'A failed Job is not proof that the database stayed unchanged.',
    controls: {
      secretReconcile: 'ready',
      migration: 'partial-fails',
      migrationResource: 'tracked',
    },
    predictionPrompt: 'After the first pod exits, which state is safest to assume?',
    predictionOptions: [
      {
        id: 'dirty-db',
        label: 'The database may be partially changed; inspect durable revision evidence.',
      },
      { id: 'unchanged-db', label: 'A failed Job guarantees the database rolled back.' },
      { id: 'retry-success', label: 'backoffLimit guarantees a later retry succeeds.' },
    ],
    correctPredictionId: 'dirty-db',
    entryTransitionId: transitions[0].id,
    transitions,
    expectedOutcome: {
      summary:
        'The Job fails after three failed pods, the database is dirty, and wave 0 remains blocked.',
      actorStates: { argocd: 'failed', job: 'failed', database: 'degraded', deployment: 'blocked' },
      evidenceIds: [
        'database-dirty-revision',
        'migration-attempt-3-failed',
        'argo-wave-minus-one-failed',
        'new-rollout-not-applied',
      ],
    },
  };
}

function hookOnlyFailureScenario(): ScenarioDefinition {
  const transitions = sequenceTransitions([
    ...baseGitAndSync(),
    ...queuedReconciliation({
      id: 'eso-before-hook',
      at: 4,
      actorId: 'eso',
      queuedDetail: 'ESO queues the reconcile.',
      runningDetail: 'ESO writes the target Secret.',
    }),
    {
      id: 'hook-secret-ready',
      at: 6,
      actorId: 'secret',
      title: 'Secret materialized',
      description: 'The hook has its credential.',
      patch: { status: 'healthy', detail: 'database-url exists.' },
    },
    {
      id: 'hook-job-starts',
      at: 7,
      actorId: 'job',
      title: 'Sync hook starts',
      description: 'Argo creates an ephemeral migration hook for the operation.',
      patch: { status: 'running', detail: 'The migration hook pod is running.' },
      evidence: [
        evidence(
          'hook-created',
          'job',
          'operation',
          'Hook phase',
          'Running',
          'The hook belongs to the sync operation rather than ordinary desired resources.'
        ),
      ],
    },
    {
      id: 'hook-database-dirty',
      at: 8,
      actorId: 'database',
      title: 'Partial DDL persists',
      description: 'The hook exits after a non-transactional DDL step.',
      patch: {
        status: 'degraded',
        detail: 'Revision 41 is dirty with a partial revision-42 change.',
        metrics: { revision: 41, dirty: true },
      },
      evidence: [
        evidence(
          'hook-database-dirty-evidence',
          'database',
          'storage',
          'Revision state',
          '41 / dirty',
          'The database is independently damaged even if the hook object is deleted.',
          true
        ),
      ],
    },
    {
      id: 'hook-fails',
      at: 9,
      actorId: 'job',
      title: 'Hook fails',
      description: 'The hook reaches a failed terminal phase.',
      patch: { status: 'failed', detail: 'Hook phase Failed.' },
      evidence: [
        evidence(
          'hook-failed',
          'job',
          'operation',
          'Hook phase',
          'Failed',
          'The sync-operation history owns this evidence.',
          true
        ),
      ],
      checkpoint: 'decision',
    },
    {
      id: 'argo-hook-operation-failed',
      at: 10,
      actorId: 'argocd',
      title: 'Operation fails while resources compare equal',
      description: 'Tracked resources can still match Git even though the hook operation failed.',
      patch: {
        status: 'degraded',
        detail: 'Ordinary resources are Synced; the latest operation Failed.',
        metrics: { syncStatus: 'Synced', healthStatus: 'Healthy', operationPhase: 'Failed' },
      },
      evidence: [
        evidence(
          'argo-synced-operation-failed',
          'argocd',
          'controller',
          'Independent projection',
          'Synced / Healthy / Failed',
          'Sync status and operation result answer different questions.',
          true
        ),
      ],
    },
    {
      id: 'hook-old-deployment-remains',
      at: 10,
      actorId: 'deployment',
      title: 'Old release remains healthy',
      description: 'The tracked Deployment still matches Git at the old release.',
      patch: {
        status: 'healthy',
        detail: 'Three old-release replicas are Ready.',
        metrics: { readyReplicas: 3, release: 'previous' },
      },
    },
  ]);

  return {
    id: 'hook-only-fails',
    title: 'Ephemeral migration hook fails',
    summary: 'Ordinary sync and health projections can look calm after an operation-only failure.',
    controls: { secretReconcile: 'ready', migration: 'partial-fails', migrationResource: 'hook' },
    predictionPrompt: 'Which combination can truthfully exist after the hook fails?',
    predictionOptions: [
      {
        id: 'split-truth',
        label: 'Resources Synced, old workload Healthy, latest operation Failed, database dirty.',
      },
      { id: 'all-red', label: 'Every Argo status must become Failed.' },
      { id: 'db-clean', label: 'Deleting the hook restores the database.' },
    ],
    correctPredictionId: 'split-truth',
    entryTransitionId: transitions[0].id,
    transitions,
    expectedOutcome: {
      summary:
        'The application can compare Synced while operation history and database evidence show failure.',
      actorStates: {
        argocd: 'degraded',
        job: 'failed',
        database: 'degraded',
        deployment: 'healthy',
      },
      evidenceIds: ['hook-database-dirty-evidence', 'hook-failed', 'argo-synced-operation-failed'],
    },
  };
}

export const gitopsLab: SystemsLabDefinition = {
  id: 'gitops-secret-migration',
  version: 1,
  eyebrow: 'Systems Lab 01',
  title: 'GitOps, secrets, and migration truth',
  summary:
    'Follow one revision through Argo CD, ESO, a Kubernetes Job, durable schema state, and a rollout without collapsing their independent truth planes.',
  estimatedMinutes: 24,
  conceptIds: ['containers-kubernetes', 'infrastructure-automation'],
  learningObjectives: [
    'Distinguish Git, controller, resource, process, storage, and workload evidence.',
    'Explain why applying an ExternalSecret is not the same as producing a Secret.',
    'Predict how sync waves react to delayed and failed prerequisites.',
    'Recognize the quiet failure mode of operation-only migration hooks.',
  ],
  actors,
  controls: [
    {
      id: 'secretReconcile',
      label: 'ESO result',
      description: 'What happens when ESO reconciles the ExternalSecret.',
      options: [
        { value: 'ready', label: 'Ready' },
        { value: 'delayed', label: 'Delayed' },
        { value: 'fails', label: 'Fails' },
      ],
    },
    {
      id: 'migration',
      label: 'Migration result',
      description: 'What the migration process does after it starts.',
      options: [
        { value: 'succeeds', label: 'Succeeds' },
        { value: 'partial-fails', label: 'Partially fails' },
        { value: 'not-started', label: 'Never starts' },
      ],
    },
    {
      id: 'migrationResource',
      label: 'Migration ownership',
      description: 'Whether the Job remains a tracked resource or exists only as a sync hook.',
      options: [
        { value: 'tracked', label: 'Tracked Job' },
        { value: 'hook', label: 'Sync hook' },
      ],
    },
  ],
  scenarios: [
    healthyScenario(),
    delayedSecretScenario(),
    failedSecretScenario(),
    migrationFailureScenario(),
    hookOnlyFailureScenario(),
  ],
  defaultScenarioId: 'healthy',
  configurationChallenge: gitopsConfigurationChallenge,
  fidelity: {
    level: 'source-verified',
    summary:
      'Key controller, hook, Job-health, and secret-reconciliation rules are reviewed against pinned upstream source.',
  },
  provenance: [
    {
      id: 'argocd-gitops-engine',
      project: 'Argo CD',
      repository: 'https://github.com/argoproj/argo-cd',
      revision: '2f7eee24a6c5eb08b9c8f4bc62dbf1ea45ec6391',
      sourcePaths: [
        'gitops-engine/pkg/health/health_job.go',
        'gitops-engine/pkg/health/health_test.go',
        'gitops-engine/pkg/sync/sync_context.go',
        'gitops-engine/pkg/sync/sync_context_test.go',
      ],
      license: 'Apache-2.0',
      verifiedOn: '2026-07-30',
      method: 'source-review',
      note: 'Health assessment and sync-operation behavior anchor the independent Argo planes.',
    },
    {
      id: 'external-secrets-controller',
      project: 'External Secrets Operator',
      repository: 'https://github.com/external-secrets/external-secrets',
      revision: '35cb34857081753691fae5334596adc63597f1fc',
      sourcePaths: [
        'apis/externalsecrets/v1/conditions_test.go',
        'pkg/controllers/externalsecret/externalsecret_controller_test.go',
        'providers/v1/fake/fake_test.go',
      ],
      license: 'Apache-2.0',
      verifiedOn: '2026-07-30',
      method: 'source-review',
      note: 'Controller conditions and the fake provider anchor asynchronous reconciliation cases.',
    },
  ],
  sources: [
    {
      label: 'Argo CD: Sync phases and waves',
      href: 'https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/',
      note: 'Ordering, wave health gates, and controller delay.',
    },
    {
      label: 'Argo CD: Automated sync policy',
      href: 'https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/',
      note: 'How Git changes trigger an automated sync.',
    },
    {
      label: 'External Secrets Operator: ExternalSecret API',
      href: 'https://external-secrets.io/latest/api/externalsecret/',
      note: 'Refresh policies and target Secret reconciliation.',
    },
    {
      label: 'Kubernetes: Jobs',
      href: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/',
      note: 'Retry accounting, backoffLimit, and terminal conditions.',
    },
  ],
};
