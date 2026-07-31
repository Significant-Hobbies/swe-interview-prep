import { ArrowRight, CheckCircle2, Clock3, FlaskConical, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, PageHeader, PageShell } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { systemsLabs } from '../data/systems-labs';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { loadSystemsLabAttempts } from '../lib/systemsLabAttempts';

export default function SystemsLabs() {
  const { user } = useAuth();
  const accountScope = user?.id ?? 'guest';
  const attempts = loadSystemsLabAttempts(accountScope);

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Systems Lab"
        title="Make the mechanism move."
        subtitle="Predict first. Run a deterministic system one transition at a time. Then defend the outcome with evidence owned by the component that produced it."
        actions={
          <Badge tone="emerald">
            <ShieldCheck className="h-3 w-3" /> Local simulation only
          </Badge>
        }
      />

      <div className="mb-10 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-black p-4">
          <div className="font-mono text-xs text-white">No credentials</div>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            The runner cannot reach a cluster, cloud account, repository, or database.
          </p>
        </div>
        <div className="bg-black p-4">
          <div className="font-mono text-xs text-white">Virtual time</div>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Every transition is checked in, replayable, and independent of wall-clock timing.
          </p>
        </div>
        <div className="bg-black p-4">
          <div className="font-mono text-xs text-white">Build mode</div>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Repair manifests and pipeline configuration before the explanation can be graded.
          </p>
        </div>
        <div className="bg-black p-4">
          <div className="font-mono text-xs text-white">Evidence gated</div>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Clicking through earns nothing. A graded causal explanation is the mastery gate.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        {systemsLabs.map((lab, index) => {
          const completed = new Set(
            attempts
              .filter(
                (attempt) =>
                  attempt.labId === lab.id &&
                  attempt.definitionVersion === lab.version &&
                  (attempt.status === 'completed' || attempt.status === 'explained')
              )
              .map((attempt) => attempt.scenarioId)
          ).size;
          const explained = attempts.filter(
            (attempt) =>
              attempt.labId === lab.id &&
              attempt.definitionVersion === lab.version &&
              attempt.status === 'explained'
          ).length;

          return (
            <Link
              key={lab.id}
              to={`/labs/${lab.id}`}
              className={`group block bg-black px-5 py-6 transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/50 sm:px-7 ${
                index > 0 ? 'border-t border-white/[0.08]' : ''
              }`}
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-white/45" aria-hidden="true" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                      {lab.eyebrow}
                    </span>
                    <Badge>v{lab.version}</Badge>
                    <Badge tone={lab.fidelity.level === 'modeled' ? 'amber' : 'sky'}>
                      {lab.fidelity.level.replace('-', ' ')}
                    </Badge>
                    {explained > 0 && (
                      <Badge tone="emerald">
                        <CheckCircle2 className="h-3 w-3" /> Explained
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    {lab.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">
                    {lab.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lab.conceptIds.map((conceptId) => (
                      <span
                        key={conceptId}
                        className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/55"
                      >
                        {CONCEPT_BY_ID[conceptId]?.name ?? conceptId}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-8 lg:min-w-52">
                  <div className="font-mono text-xs text-white/55">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {lab.estimatedMinutes} min
                    </div>
                    <div className="mt-1.5 tabular-nums">
                      {completed}/{lab.scenarios.length} scenarios complete
                    </div>
                    <div className="mt-1.5 tabular-nums">
                      {lab.configurationChallenge.slots.length} setup checks
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-white/55">
        These are intentionally models, not emulators. They preserve the controller boundaries and
        evidence relationships needed to reason correctly, while refusing every real credential and
        side effect.
      </p>
    </PageShell>
  );
}
