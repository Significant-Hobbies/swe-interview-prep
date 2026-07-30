import { describe, expect, it } from 'vitest';

import { tracingLab } from '../../data/systems-labs';
import { createSimulationReplay, parseSimulationReplay, serializeSimulationReplay } from './replay';

describe('versioned simulation replay', () => {
  it('round-trips a deterministic action sequence', () => {
    const actions = [
      { type: 'start' as const },
      { type: 'advance' as const },
      { type: 'finish' as const },
    ];
    const first = createSimulationReplay(tracingLab, 'remote-unsampled-default', actions);
    const serialized = serializeSimulationReplay(first);
    const parsed = parseSimulationReplay(tracingLab, serialized);

    expect(parsed.replay).toEqual(first);
    expect(parsed.snapshot.phase).toBe('complete');
    expect(parsed.snapshot.actorStates.collector.metrics.receivedSpans).toBe(0);
    expect(
      serializeSimulationReplay(
        createSimulationReplay(tracingLab, 'remote-unsampled-default', actions)
      )
    ).toBe(serialized);
  });

  it('rejects unknown actions, stale definitions, and changed fingerprints', () => {
    const replay = createSimulationReplay(tracingLab, 'root-ratio-samples', [{ type: 'finish' }]);

    expect(() =>
      parseSimulationReplay(
        tracingLab,
        JSON.stringify({ ...replay, actions: [{ type: 'connect-to-cluster' }] })
      )
    ).toThrow(/malformed action/);
    expect(() =>
      parseSimulationReplay(
        tracingLab,
        JSON.stringify({ ...replay, definitionVersion: tracingLab.version + 1 })
      )
    ).toThrow(/definition/);
    expect(() =>
      parseSimulationReplay(
        tracingLab,
        JSON.stringify({ ...replay, finalSnapshotFingerprint: '00000000' })
      )
    ).toThrow(/fingerprint/);
  });
});
