import { describe, expect, it } from 'vitest';

import {
  comparePrediction,
  createSimulation,
  reduceSimulation,
  replaySimulation,
  serializeSnapshot,
} from './engine';
import { emitEvidence, sequenceTransitions } from './primitives';
import type { SystemsLabDefinition } from './types';
import { validateLabDefinition } from './validate';

function fixtureLab(): SystemsLabDefinition {
  return {
    id: 'fixture',
    version: 1,
    eyebrow: 'Test',
    title: 'Fixture lab',
    summary: 'A deterministic fixture.',
    estimatedMinutes: 1,
    conceptIds: ['known-concept'],
    learningObjectives: ['Observe state.'],
    controls: [
      {
        id: 'mode',
        label: 'Mode',
        description: 'Fixture mode.',
        options: [{ value: 'healthy', label: 'Healthy' }],
      },
    ],
    actors: [
      {
        id: 'controller',
        label: 'Controller',
        kind: 'controller',
        truthPlane: 'controller',
        description: 'Fixture actor.',
        initialStatus: 'idle',
        initialDetail: 'Waiting.',
      },
    ],
    scenarios: [
      {
        id: 'healthy',
        title: 'Healthy',
        summary: 'Completes.',
        controls: { mode: 'healthy' },
        predictionPrompt: 'What happens?',
        predictionOptions: [
          { id: 'completes', label: 'It completes.' },
          { id: 'fails', label: 'It fails.' },
        ],
        correctPredictionId: 'completes',
        entryTransitionId: 'queued',
        transitions: sequenceTransitions([
          {
            id: 'queued',
            at: 1,
            actorId: 'controller',
            title: 'Queued',
            description: 'Work queued.',
            patch: { status: 'queued', detail: 'Queued.' },
            checkpoint: 'decision',
          },
          {
            id: 'complete',
            at: 2,
            actorId: 'controller',
            title: 'Complete',
            description: 'Work complete.',
            patch: { status: 'complete', detail: 'Complete.' },
            evidence: [
              emitEvidence({
                id: 'completion-record',
                actorId: 'controller',
                truthPlane: 'controller',
                kind: 'state',
                label: 'Completion',
                value: true,
                detail: 'The controller reports completion.',
                decisive: true,
              }),
            ],
          },
        ]),
        expectedOutcome: {
          summary: 'The controller completes.',
          actorStates: { controller: 'complete' },
          evidenceIds: ['completion-record'],
        },
      },
    ],
    defaultScenarioId: 'healthy',
    configurationChallenge: {
      id: 'fixture-config',
      title: 'Fixture configuration',
      summary: 'Repair the fixture.',
      objective: 'Make the fixture ready.',
      requirements: ['Set mode to ready.'],
      files: [
        {
          id: 'config',
          label: 'Config',
          path: 'fixture.yaml',
          language: 'yaml',
          starter: '# @slot mode\nmode: broken\n',
        },
      ],
      slots: [
        {
          id: 'mode',
          fileId: 'config',
          marker: '# @slot mode',
          expectedLine: 'mode: ready',
          label: 'Mode is ready',
          hint: 'Repair the mode.',
          evidence: 'Mode is ready.',
        },
      ],
    },
    fidelity: {
      level: 'modeled',
      summary: 'Test fixture.',
    },
    provenance: [],
    sources: [],
  };
}

describe('simulation engine', () => {
  it('starts, steps, advances, finishes, and resets without mutating prior snapshots', () => {
    const lab = fixtureLab();
    const initial = createSimulation(lab);
    const started = reduceSimulation(lab, initial, { type: 'start' });
    const stepped = reduceSimulation(lab, started, { type: 'step' });
    const finished = reduceSimulation(lab, stepped, { type: 'finish' });
    const reset = reduceSimulation(lab, finished, { type: 'reset' });

    expect(initial.phase).toBe('ready');
    expect(initial.actorStates.controller.status).toBe('idle');
    expect(started.phase).toBe('running');
    expect(stepped.actorStates.controller.status).toBe('queued');
    expect(finished.phase).toBe('complete');
    expect(finished.actorStates.controller.status).toBe('complete');
    expect(finished.evidence.map((item) => item.id)).toEqual(['completion-record']);
    expect(reset).toEqual(initial);
  });

  it('replays identical inputs to byte-equivalent snapshots', () => {
    const lab = fixtureLab();
    const actions = [{ type: 'start' }, { type: 'step' }, { type: 'finish' }] as const;
    const first = replaySimulation(lab, 'healthy', [...actions]);
    const second = replaySimulation(lab, 'healthy', [...actions]);

    expect(serializeSnapshot(first)).toBe(serializeSnapshot(second));
  });

  it('advances to the next decision checkpoint without passing it', () => {
    const lab = fixtureLab();
    const paused = reduceSimulation(lab, createSimulation(lab), { type: 'advance' });

    expect(paused.phase).toBe('paused');
    expect(paused.eventLog.map((event) => event.transitionId)).toEqual(['queued']);
    expect(paused.nextTransitionId).toBe('complete');
  });

  it('compares predictions only after completion and returns decisive evidence', () => {
    const lab = fixtureLab();
    const scenario = lab.scenarios[0];
    const complete = reduceSimulation(lab, createSimulation(lab), { type: 'finish' });

    expect(comparePrediction(scenario, complete, 'completes')).toMatchObject({
      isCorrect: true,
      correctPredictionId: 'completes',
    });
    expect(comparePrediction(scenario, complete, 'completes').decisiveEvidence).toHaveLength(1);
    expect(() => comparePrediction(scenario, createSimulation(lab), 'completes')).toThrow(
      /must complete/
    );
  });
});

describe('definition validation', () => {
  it('accepts a complete reachable definition', () => {
    expect(validateLabDefinition(fixtureLab(), new Set(['known-concept']))).toEqual([]);
  });

  it('fails closed on missing targets, unknown concepts, and unreachable transitions', () => {
    const lab = fixtureLab();
    lab.conceptIds = ['missing-concept'];
    lab.scenarios[0].transitions[0].next = 'missing-transition';
    lab.scenarios[0].transitions.push({
      id: 'orphan',
      at: 9,
      actorId: 'controller',
      title: 'Orphan',
      description: 'Cannot run.',
      next: null,
    });

    const issues = validateLabDefinition(lab, new Set(['known-concept']));
    expect(issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Unknown concept'),
        expect.stringContaining('Unknown transition target'),
        expect.stringContaining('unreachable'),
      ])
    );
  });

  it('detects cycles rather than letting finish loop forever', () => {
    const lab = fixtureLab();
    lab.scenarios[0].transitions[1].next = 'queued';

    expect(validateLabDefinition(lab).map((issue) => issue.message)).toContain(
      'Cycle detected at transition "queued".'
    );
  });
});
