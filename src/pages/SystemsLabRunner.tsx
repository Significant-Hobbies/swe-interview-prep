import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clipboard,
  FileJson2,
  ExternalLink,
  FastForward,
  FlaskConical,
  Lock,
  Play,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import FeynmanGate from '../components/FeynmanGate';
import ConfigurationWorkshop from '../components/simulation/ConfigurationWorkshop';
import { Badge, Button, Card, EmptyState, PageShell, SectionTitle } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { getSystemsLab } from '../data/systems-labs';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { trackSystemsLabAction } from '../lib/analytics';
import { comparePrediction, createSimulation, reduceSimulation } from '../lib/simulation/engine';
import {
  createSimulationReplay,
  parseSimulationReplay,
  serializeSimulationReplay,
} from '../lib/simulation/replay';
import type {
  ActorStatus,
  EvidenceRecord,
  ScenarioDefinition,
  SimulationAction,
  SimulationSnapshot,
  SystemsLabDefinition,
} from '../lib/simulation/types';
import {
  completeSystemsLabAttempt,
  createSystemsLabAttempt,
  freezeSystemsLabPrediction,
  hasStaleSystemsLabAttempt,
  latestCompatibleAttempt,
  loadSystemsLabAttempts,
  reuseVerifiedSystemsLabConfiguration,
  saveSystemsLabAttempt,
  type SystemsLabAttempt,
  updateSystemsLabConfiguration,
  updateSystemsLabExplanation,
} from '../lib/systemsLabAttempts';

const STATUS_TONE: Record<ActorStatus, string> = {
  idle: 'text-white/45 border-white/10',
  queued: 'text-sky-200 border-sky-300/20',
  running: 'text-sky-200 border-sky-300/20',
  waiting: 'text-amber-200 border-amber-300/20',
  healthy: 'text-emerald-200 border-emerald-300/20',
  degraded: 'text-amber-200 border-amber-300/20',
  failed: 'text-rose-200 border-rose-300/20',
  blocked: 'text-rose-200 border-rose-300/20',
  complete: 'text-emerald-200 border-emerald-300/20',
};

function snapshotForAttempt(
  lab: SystemsLabDefinition,
  scenarioId: string,
  attempt: SystemsLabAttempt
): SimulationSnapshot {
  const initial = createSimulation(lab, scenarioId);
  return attempt.status === 'completed' || attempt.status === 'explained'
    ? reduceSimulation(lab, initial, { type: 'finish' })
    : initial;
}

function actionsForAttempt(attempt: SystemsLabAttempt): SimulationAction[] {
  return attempt.status === 'completed' || attempt.status === 'explained'
    ? [{ type: 'finish' }]
    : [];
}

function explainBackArtifact(
  lab: SystemsLabDefinition,
  scenario: ScenarioDefinition,
  attempt: SystemsLabAttempt,
  snapshot: SimulationSnapshot
): string {
  const outcomeEvidence = snapshot.evidence
    .filter((item) => scenario.expectedOutcome.evidenceIds.includes(item.id))
    .map((item) => ({
      actor: snapshot.actorStates[item.actorId]?.label ?? item.actorId,
      truthPlane: item.truthPlane,
      label: item.label,
      value: item.value,
      detail: item.detail,
    }));

  return JSON.stringify(
    {
      lab: lab.title,
      definitionVersion: lab.version,
      scenario: scenario.title,
      controls: scenario.controls,
      frozenPrediction: scenario.predictionOptions.find(
        (option) => option.id === attempt.predictionId
      )?.label,
      predictionCorrect: attempt.predictionCorrect,
      expectedOutcome: scenario.expectedOutcome.summary,
      finalActors: Object.fromEntries(
        Object.values(snapshot.actorStates).map((actor) => [
          actor.label,
          { truthPlane: actor.truthPlane, status: actor.status, detail: actor.detail },
        ])
      ),
      decisiveEvidence: outcomeEvidence,
      configuration: {
        passed: attempt.configurationPassed === true,
        evidenceIds: attempt.configurationEvidenceIds ?? [],
      },
    },
    null,
    2
  );
}

export default function SystemsLabRunner() {
  const { labId } = useParams();
  const lab = labId ? getSystemsLab(labId) : undefined;

  if (!lab) {
    return (
      <PageShell>
        <EmptyState
          icon={<FlaskConical className="h-5 w-5" />}
          title="Systems Lab not found"
          hint="The lab may have moved or the definition ID is invalid."
        />
        <Link to="/labs" className="mt-5 inline-flex min-h-11 items-center text-sm text-white/60">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Systems Lab
        </Link>
      </PageShell>
    );
  }

  return <Runner lab={lab} />;
}

function Runner({ lab }: { lab: SystemsLabDefinition }) {
  const { user } = useAuth();
  const accountScope = user?.id ?? 'guest';
  const [attempts, setAttempts] = useState(() => loadSystemsLabAttempts(accountScope));
  const [scenarioId, setScenarioId] = useState(lab.defaultScenarioId);
  const scenario = lab.scenarios.find((candidate) => candidate.id === scenarioId)!;
  const storedAttempt = latestCompatibleAttempt(attempts, lab, scenarioId);
  const [attempt, setAttempt] = useState<SystemsLabAttempt>(
    () =>
      storedAttempt ??
      reuseVerifiedSystemsLabConfiguration(
        createSystemsLabAttempt(accountScope, lab, scenarioId),
        attempts
      )
  );
  const [predictionDraft, setPredictionDraft] = useState(attempt.predictionId ?? '');
  const [snapshot, setSnapshot] = useState(() => snapshotForAttempt(lab, scenarioId, attempt));
  const [replayActions, setReplayActions] = useState<SimulationAction[]>(() =>
    actionsForAttempt(attempt)
  );
  const [replayDraft, setReplayDraft] = useState('');
  const [replayMessage, setReplayMessage] = useState('');
  const [importedReplay, setImportedReplay] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState(attempt.explanation);
  const [feynmanOpen, setFeynmanOpen] = useState(false);
  const staleAttempt = hasStaleSystemsLabAttempt(attempts, lab, scenarioId);

  const selectedEvidence = snapshot.evidence.find((item) => item.id === selectedEvidenceId);
  const decisiveEvidence = snapshot.evidence.filter((item) =>
    scenario.expectedOutcome.evidenceIds.includes(item.id)
  );
  const hasFrozenPrediction = attempt.status !== 'draft' && Boolean(attempt.predictionId);
  const canExecute = hasFrozenPrediction || importedReplay;

  useEffect(() => {
    const scopedAttempts = loadSystemsLabAttempts(accountScope);
    const scopedAttempt =
      latestCompatibleAttempt(scopedAttempts, lab, scenarioId) ??
      reuseVerifiedSystemsLabConfiguration(
        createSystemsLabAttempt(accountScope, lab, scenarioId),
        scopedAttempts
      );
    setAttempts(scopedAttempts);
    setAttempt(scopedAttempt);
    setPredictionDraft(scopedAttempt.predictionId ?? '');
    setSnapshot(snapshotForAttempt(lab, scenarioId, scopedAttempt));
    setReplayActions(actionsForAttempt(scopedAttempt));
    setImportedReplay(false);
    setReplayMessage('');
    setSelectedEvidenceId(null);
    setExplanation(scopedAttempt.explanation);
  }, [accountScope]);

  useEffect(() => {
    trackSystemsLabAction('opened', {
      labId: lab.id,
      definitionVersion: lab.version,
    });
  }, [lab.id, lab.version]);

  function persist(next: SystemsLabAttempt) {
    setAttempt(next);
    setAttempts(saveSystemsLabAttempt(next));
  }

  function loadScenario(nextScenarioId: string) {
    const nextStored = latestCompatibleAttempt(attempts, lab, nextScenarioId);
    const nextAttempt =
      nextStored ??
      reuseVerifiedSystemsLabConfiguration(
        createSystemsLabAttempt(accountScope, lab, nextScenarioId),
        attempts
      );
    setScenarioId(nextScenarioId);
    setAttempt(nextAttempt);
    setPredictionDraft(nextAttempt.predictionId ?? '');
    setSnapshot(snapshotForAttempt(lab, nextScenarioId, nextAttempt));
    setReplayActions(actionsForAttempt(nextAttempt));
    setImportedReplay(false);
    setReplayDraft('');
    setReplayMessage('');
    setSelectedEvidenceId(null);
    setExplanation(nextAttempt.explanation);
    setFeynmanOpen(false);
  }

  function beginNewAttempt() {
    const next = reuseVerifiedSystemsLabConfiguration(
      createSystemsLabAttempt(accountScope, lab, scenarioId),
      attempts
    );
    setAttempt(next);
    setPredictionDraft('');
    setSnapshot(createSimulation(lab, scenarioId));
    setReplayActions([]);
    setImportedReplay(false);
    setReplayDraft('');
    setReplayMessage('');
    setSelectedEvidenceId(null);
    setExplanation('');
    setFeynmanOpen(false);
  }

  function freezePrediction() {
    if (!predictionDraft) return;
    const next = freezeSystemsLabPrediction(attempt, predictionDraft);
    persist(next);
    trackSystemsLabAction('prediction_frozen', {
      labId: lab.id,
      scenarioId,
      definitionVersion: lab.version,
    });
  }

  function execute(action: SimulationAction) {
    if (!canExecute || snapshot.phase === 'complete') return;
    const nextSnapshot = reduceSimulation(lab, snapshot, action);
    setSnapshot(nextSnapshot);
    setReplayActions((current) => [...current, action]);

    if (!importedReplay && nextSnapshot.phase === 'complete' && attempt.status === 'predicted') {
      const result = comparePrediction(scenario, nextSnapshot, attempt.predictionId!);
      const nextAttempt = completeSystemsLabAttempt(attempt, result);
      persist(nextAttempt);
      trackSystemsLabAction('completed', {
        labId: lab.id,
        scenarioId,
        definitionVersion: lab.version,
      });
    }
  }

  function resetRuntime() {
    setSnapshot(createSimulation(lab, scenarioId));
    setReplayActions([]);
    setImportedReplay(false);
    setReplayMessage('');
  }

  async function copyReplay() {
    const serialized = serializeSimulationReplay(
      createSimulationReplay(lab, scenarioId, replayActions)
    );
    setReplayDraft(serialized);
    try {
      await navigator.clipboard.writeText(serialized);
      setReplayMessage('Replay copied. It contains only lab IDs and deterministic actions.');
    } catch {
      setReplayMessage('Replay prepared below. Copy the JSON manually.');
    }
  }

  function loadReplay() {
    try {
      const { replay, snapshot: importedSnapshot } = parseSimulationReplay(lab, replayDraft);
      const nextAttempt =
        latestCompatibleAttempt(attempts, lab, replay.scenarioId) ??
        reuseVerifiedSystemsLabConfiguration(
          createSystemsLabAttempt(accountScope, lab, replay.scenarioId),
          attempts
        );
      setScenarioId(replay.scenarioId);
      setAttempt(nextAttempt);
      setPredictionDraft(nextAttempt.predictionId ?? '');
      setExplanation(nextAttempt.explanation);
      setSnapshot(importedSnapshot);
      setReplayActions(replay.actions);
      setSelectedEvidenceId(null);
      setFeynmanOpen(false);
      setImportedReplay(true);
      setReplayMessage(
        'Replay loaded in observation mode. Imported execution cannot update mastery.'
      );
    } catch (error) {
      setReplayMessage(error instanceof Error ? error.message : 'Replay could not be loaded.');
    }
  }

  function inspectEvidence(item: EvidenceRecord) {
    setSelectedEvidenceId(item.id);
    trackSystemsLabAction('evidence_checked', {
      labId: lab.id,
      scenarioId,
      definitionVersion: lab.version,
    });
  }

  function handleConfigurationValidation(
    passed: boolean,
    evidenceIds: string[],
    files: Record<string, string>
  ) {
    persist(updateSystemsLabConfiguration(attempt, passed, evidenceIds, files));
  }

  function saveExplanation(nextExplanation: string) {
    setExplanation(nextExplanation);
    if (attempt.status !== 'completed' && attempt.status !== 'explained') return;
    persist(
      updateSystemsLabExplanation(
        attempt,
        nextExplanation,
        attempt.explanationGrade,
        attempt.masteryStatus === 'applied'
      )
    );
  }

  function handleExplanationGraded(grade: number) {
    const next = updateSystemsLabExplanation(attempt, explanation, grade, true);
    persist(next);
    trackSystemsLabAction('explanation_graded', {
      labId: lab.id,
      scenarioId,
      definitionVersion: lab.version,
    });
  }

  const explanationArtifact = useMemo(
    () => explainBackArtifact(lab, scenario, attempt, snapshot),
    [attempt, lab, scenario, snapshot]
  );

  return (
    <PageShell wide>
      <Link
        to="/labs"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Systems Lab
      </Link>

      <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              {lab.eyebrow}
            </span>
            <Badge>definition v{lab.version}</Badge>
            <Badge tone="emerald">local only</Badge>
            <Badge tone={lab.fidelity.level === 'modeled' ? 'amber' : 'sky'}>
              {lab.fidelity.level.replace('-', ' ')}
            </Badge>
          </div>
          <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {lab.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/55">{lab.summary}</p>
        </div>
        <div className="font-mono text-xs text-white/40">
          <div>{scenario.transitions.length} deterministic transitions</div>
          <div className="mt-1">{lab.actors.length} independent actors</div>
        </div>
      </div>

      <section className="mb-8">
        <SectionTitle>1 · Configure the case</SectionTitle>
        <Card className="p-4 sm:p-5">
          <label htmlFor="systems-lab-scenario" className="text-sm font-medium text-white">
            Scenario
          </label>
          <select
            id="systems-lab-scenario"
            value={scenarioId}
            onChange={(event) => loadScenario(event.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 sm:max-w-xl"
          >
            {lab.scenarios.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title}
              </option>
            ))}
          </select>
          <p className="mt-2 max-w-3xl text-xs leading-relaxed text-white/50">{scenario.summary}</p>

          <div className="mt-5 grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-3">
            {lab.controls.map((control) => {
              const option = control.options.find(
                (candidate) => candidate.value === scenario.controls[control.id]
              );
              return (
                <div key={control.id} className="bg-black p-3">
                  <div className="text-xs text-white/45">{control.label}</div>
                  <div className="mt-1 font-mono text-xs text-white">
                    {option?.label ?? String(scenario.controls[control.id])}
                  </div>
                </div>
              );
            })}
          </div>

          {staleAttempt && (
            <p className="mt-4 text-xs text-amber-200">
              An older attempt exists for a different definition version. It remains stored, but
              cannot be reused as evidence for this version.
            </p>
          )}
        </Card>
      </section>

      <section className="mb-8">
        <SectionTitle>2 · Freeze a prediction</SectionTitle>
        <Card className="p-4 sm:p-5">
          <fieldset disabled={attempt.status !== 'draft'}>
            <legend className="text-sm font-medium text-white">{scenario.predictionPrompt}</legend>
            <div className="mt-4 space-y-2">
              {scenario.predictionOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    predictionDraft === option.id
                      ? 'border-white/30 bg-white/[0.06] text-white'
                      : 'border-white/10 text-white/65 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="prediction"
                    value={option.id}
                    checked={predictionDraft === option.id}
                    onChange={() => setPredictionDraft(option.id)}
                    className="mt-0.5 h-4 w-4 accent-sky-400"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {attempt.status === 'draft' ? (
              <Button
                onClick={freezePrediction}
                disabled={!predictionDraft}
                className="min-h-11 rounded-md px-4"
              >
                <Lock className="h-4 w-4" /> Freeze prediction
              </Button>
            ) : (
              <div className="inline-flex min-h-11 items-center gap-2 text-sm text-emerald-200">
                <Check className="h-4 w-4" /> Prediction frozen
              </div>
            )}
            {(attempt.status === 'completed' || attempt.status === 'explained') && (
              <Button tone="ghost" onClick={beginNewAttempt} className="min-h-11 rounded-md px-4">
                Retry with a new prediction
              </Button>
            )}
          </div>
        </Card>
      </section>

      <section className="mb-8">
        <SectionTitle>3 · Build a working configuration</SectionTitle>
        <ConfigurationWorkshop
          key={`${attempt.id}:${lab.configurationChallenge.id}`}
          challenge={lab.configurationChallenge}
          passed={attempt.configurationPassed === true}
          initialFiles={attempt.configurationFiles ?? {}}
          onValidationChange={handleConfigurationValidation}
        />
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              4 · Run the model
            </h2>
            <p className="mt-2 text-xs text-white/45">
              Virtual tick {snapshot.tick} · {snapshot.phase} · {snapshot.eventLog.length}/
              {scenario.transitions.length} transitions
            </p>
          </div>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Simulation controls</legend>
            <Button
              tone="ghost"
              onClick={() => execute({ type: 'start' })}
              disabled={!canExecute || snapshot.phase !== 'ready'}
              className="min-h-11 rounded-md"
            >
              <Play className="h-4 w-4" /> Start
            </Button>
            <Button
              tone="ghost"
              onClick={() => execute({ type: 'step' })}
              disabled={!canExecute || snapshot.phase === 'complete'}
              className="min-h-11 rounded-md"
            >
              <StepForward className="h-4 w-4" /> Step
            </Button>
            <Button
              tone="ghost"
              onClick={() => execute({ type: 'advance' })}
              disabled={!canExecute || snapshot.phase === 'complete'}
              className="min-h-11 rounded-md"
            >
              <ChevronRight className="h-4 w-4" /> Next decision
            </Button>
            <Button
              onClick={() => execute({ type: 'finish' })}
              disabled={!canExecute || snapshot.phase === 'complete'}
              className="min-h-11 rounded-md"
            >
              <FastForward className="h-4 w-4" /> Finish
            </Button>
            <Button tone="subtle" onClick={resetRuntime} className="min-h-11 rounded-md">
              <RotateCcw className="h-4 w-4" /> Replay
            </Button>
          </fieldset>
        </div>

        {!canExecute && (
          <div className="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100">
            Freeze a prediction to enable the simulator. Observation comes after commitment.
          </div>
        )}

        {importedReplay && (
          <div className="mb-4 rounded-lg border border-sky-300/20 bg-sky-400/[0.06] px-4 py-3 text-sm text-sky-100">
            Observation mode: this imported replay is reproducible, but it cannot complete an
            attempt or update mastery.
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
          <Card className="overflow-hidden">
            <div className="border-b border-white/[0.08] px-4 py-3">
              <h3 className="text-sm font-medium text-white">Actors and truth planes</h3>
            </div>
            <div className="divide-y divide-white/[0.08]">
              {Object.values(snapshot.actorStates).map((actor) => (
                <div
                  key={actor.id}
                  className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-start"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-white">{actor.label}</span>
                      <span
                        className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${STATUS_TONE[actor.status]}`}
                      >
                        {actor.status}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
                      {actor.truthPlane} · {actor.kind}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs leading-relaxed text-white/55">{actor.detail}</p>
                    {Object.keys(actor.metrics).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] text-white/40">
                        {Object.entries(actor.metrics).map(([key, value]) => (
                          <span key={key}>
                            {key}=<span className="text-white/70">{String(value)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-white/[0.08] px-4 py-3">
              <h3 className="text-sm font-medium text-white">Ordered event log</h3>
            </div>
            {snapshot.eventLog.length === 0 ? (
              <div className="p-6 text-sm text-white/40">No transitions applied yet.</div>
            ) : (
              <ol className="divide-y divide-white/[0.08]">
                {snapshot.eventLog.map((event) => (
                  <li
                    key={event.transitionId}
                    className="grid grid-cols-[auto_1fr] gap-3 px-4 py-3"
                  >
                    <span className="font-mono text-[10px] tabular-nums text-white/35">
                      t{event.tick}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-white">{event.title}</div>
                      <p className="mt-1 text-xs leading-relaxed text-white/45">
                        {event.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
        <p className="sr-only" aria-live="polite">
          Simulation is {snapshot.phase} at virtual tick {snapshot.tick}.
        </p>
      </section>

      <section className="mb-8">
        <SectionTitle>Share a deterministic replay</SectionTitle>
        <Card className="p-4 sm:p-5">
          <p className="max-w-3xl text-xs leading-relaxed text-white/50">
            Replay JSON contains the lab ID, definition version, scenario, ordered actions, and a
            final-state fingerprint. It contains no credentials, explanation, identity, or live
            system data.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button tone="ghost" onClick={copyReplay} className="min-h-11 rounded-md">
              <Clipboard className="h-4 w-4" /> Copy current replay
            </Button>
            <Button
              tone="ghost"
              onClick={loadReplay}
              disabled={replayDraft.trim().length === 0}
              className="min-h-11 rounded-md"
            >
              <FileJson2 className="h-4 w-4" /> Load replay
            </Button>
          </div>
          <label
            htmlFor="systems-lab-replay"
            className="mt-4 block text-xs font-medium text-white/65"
          >
            Versioned replay JSON
          </label>
          <textarea
            id="systems-lab-replay"
            value={replayDraft}
            onChange={(event) => {
              setReplayDraft(event.target.value);
              setReplayMessage('');
            }}
            rows={6}
            spellCheck={false}
            placeholder="Copy a replay here or paste one to inspect it."
            className="mt-2 w-full resize-y rounded-md border border-white/15 bg-black p-3 font-mono text-xs leading-relaxed text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
          />
          {replayMessage && (
            <p className="mt-2 text-xs leading-relaxed text-white/55" aria-live="polite">
              {replayMessage}
            </p>
          )}
        </Card>
      </section>

      <section className="mb-8">
        <SectionTitle>5 · Inspect actor-owned evidence</SectionTitle>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
          <Card className="overflow-hidden">
            {snapshot.evidence.length === 0 ? (
              <div className="p-6 text-sm text-white/40">
                Evidence appears only when its producing transition runs.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08]">
                {snapshot.evidence.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => inspectEvidence(item)}
                    className={`grid min-h-14 w-full gap-2 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/50 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] ${
                      selectedEvidenceId === item.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-white">{item.label}</span>
                        {item.decisive && <Badge tone="amber">decisive</Badge>}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-white/35">
                        t{item.tick} · {item.truthPlane} · {item.kind}
                      </div>
                    </div>
                    <div className="font-mono text-xs text-white/70">{String(item.value)}</div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            {selectedEvidence ? (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Produced by {snapshot.actorStates[selectedEvidence.actorId]?.label}
                </div>
                <h3 className="mt-2 text-base font-semibold text-white">
                  {selectedEvidence.label}
                </h3>
                <div className="mt-3 break-words rounded-md border border-white/10 bg-black p-3 font-mono text-sm text-white">
                  {String(selectedEvidence.value)}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {selectedEvidence.detail}
                </p>
              </>
            ) : (
              <div className="flex min-h-32 items-center justify-center text-center text-sm text-white/40">
                Select an evidence record to inspect its owner and meaning.
              </div>
            )}
          </Card>
        </div>
      </section>

      {snapshot.phase === 'complete' && (
        <section className="mb-8">
          <SectionTitle>6 · Compare outcome and explain it back</SectionTitle>
          <Card className="p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div>
                <div className="flex items-center gap-2">
                  {!importedReplay && attempt.predictionCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <CircleDot className="h-5 w-5 text-amber-300" />
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {importedReplay
                      ? 'Imported replay outcome'
                      : attempt.predictionCorrect
                        ? 'Your prediction matched'
                        : 'Your prediction missed'}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {scenario.expectedOutcome.summary}
                </p>
                <div className="mt-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
                    Decisive records
                  </div>
                  <ul className="mt-2 space-y-2">
                    {decisiveEvidence.map((item) => (
                      <li key={item.id} className="text-xs leading-relaxed text-white/55">
                        <span className="font-mono text-white">{item.label}</span>
                        {' — '}
                        {item.detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {importedReplay ? (
                <div className="rounded-lg border border-white/10 p-4">
                  <h3 className="text-sm font-medium text-white">Observation only</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Imported actions can be inspected and replayed, but explanations and mastery
                    remain attached only to a prediction you freeze yourself.
                  </p>
                  <Button
                    tone="ghost"
                    onClick={beginNewAttempt}
                    className="mt-4 min-h-11 rounded-md"
                  >
                    Start a scored attempt
                  </Button>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="systems-lab-explanation"
                    className="text-sm font-medium text-white"
                  >
                    Explain the causal chain
                  </label>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">
                    Name the branch or controller decision, the decisive evidence, and one nearby
                    counterfactual that would change the outcome.
                  </p>
                  <textarea
                    id="systems-lab-explanation"
                    value={explanation}
                    onChange={(event) => saveExplanation(event.target.value)}
                    rows={8}
                    placeholder="I predicted… The mechanism selected… The evidence proves… If this input changed…"
                    className="mt-3 w-full resize-y rounded-md border border-white/15 bg-black p-3 text-sm leading-relaxed text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {user ? (
                      <Button
                        onClick={() => setFeynmanOpen(true)}
                        disabled={
                          explanation.trim().length < 30 || attempt.configurationPassed !== true
                        }
                        className="min-h-11 rounded-md px-4"
                      >
                        Grade causal explanation
                      </Button>
                    ) : (
                      <div className="text-xs leading-relaxed text-white/45">
                        Saved locally. Sign in to grade this explanation and apply FSRS mastery.
                      </div>
                    )}
                    {attempt.explanationGrade !== null && (
                      <Badge tone={attempt.explanationGrade >= 70 ? 'emerald' : 'amber'}>
                        grade {attempt.explanationGrade}/100 · mastery {attempt.masteryStatus}
                      </Badge>
                    )}
                  </div>
                  {attempt.configurationPassed !== true && (
                    <p className="mt-2 text-xs leading-relaxed text-amber-200/80">
                      Validate the Build mode configuration before grading this explanation.
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </section>
      )}

      <section className="grid gap-6 border-t border-white/[0.08] pt-8 lg:grid-cols-3">
        <div>
          <SectionTitle>Learning objectives</SectionTitle>
          <ul className="space-y-2">
            {lab.learningObjectives.map((objective) => (
              <li key={objective} className="flex gap-2 text-sm leading-relaxed text-white/55">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
                {objective}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {lab.conceptIds.map((conceptId) => (
              <Link
                key={conceptId}
                to={`/concepts/${conceptId}`}
                className="inline-flex min-h-11 items-center rounded-md border border-white/10 px-3 text-xs text-white/60 hover:border-white/20 hover:text-white"
              >
                {CONCEPT_BY_ID[conceptId]?.name ?? conceptId}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Verification provenance</SectionTitle>
          <p className="mb-3 text-xs leading-relaxed text-white/45">{lab.fidelity.summary}</p>
          <div className="space-y-3">
            {lab.provenance.map((record) => (
              <a
                key={record.id}
                href={`${record.repository}/blob/${record.revision}/${record.sourcePaths[0]}`}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-md border border-white/10 px-3 py-3 hover:border-white/20"
              >
                <span className="inline-flex items-center gap-1.5 text-sm text-white/75 group-hover:text-white">
                  {record.project} <ExternalLink className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1 block font-mono text-[10px] text-white/40">
                  {record.revision.slice(0, 12)} · {record.method} · {record.license}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-white/40">
                  {record.note}
                </span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Primary sources</SectionTitle>
          <div className="space-y-3">
            {lab.sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-md border border-white/10 px-3 py-3 hover:border-white/20"
              >
                <span className="inline-flex items-center gap-1.5 text-sm text-white/75 group-hover:text-white">
                  {source.label} <ExternalLink className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-white/40">
                  {source.note}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FeynmanGate
        open={feynmanOpen}
        onClose={() => setFeynmanOpen(false)}
        problem={scenario.predictionPrompt}
        problemId={`systems-lab:${lab.id}:${scenario.id}:v${lab.version}`}
        conceptIds={lab.conceptIds}
        artifact={{
          type: 'systems-lab',
          title: `${lab.title}: ${scenario.title}`,
          context: explanationArtifact,
        }}
        onGraded={handleExplanationGraded}
      />
    </PageShell>
  );
}
