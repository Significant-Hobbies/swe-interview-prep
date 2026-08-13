import { describe, expect, it } from 'vitest';
import {
  advanceTradeoffState,
  applyTradeoffCommand,
  initialTradeoffState,
  visibleTradeoffState,
} from './tradeoff-state.mjs';

function initial() {
  return initialTradeoffState({
    matchId: 'm-1',
    prompt: 'Design it',
    hiddenTwist: 'Lose a region',
    nowMs: 0,
  });
}

describe('two-client Tradeoff coordination', () => {
  it('starts both ready clients on the same initial-solution deadline', () => {
    const a = applyTradeoffCommand(
      initial(),
      { type: 'ready', expectedStateVersion: 1 },
      { side: 'side_a', nowMs: 100 }
    );
    const b = applyTradeoffCommand(
      a.state,
      { type: 'ready', expectedStateVersion: 2 },
      { side: 'side_b', nowMs: 200 }
    );
    expect(b.state.phase).toBe('initial_solution');
    expect(visibleTradeoffState(b.state, 'side_a', 200).phaseEndsAt).toBe(
      visibleTradeoffState(b.state, 'side_b', 200).phaseEndsAt
    );
  });

  it('reveals the twist simultaneously and rejects stale duplicate commands', () => {
    let state = initial();
    state = applyTradeoffCommand(
      state,
      { type: 'ready', expectedStateVersion: 1 },
      { side: 'side_a', nowMs: 1 }
    ).state;
    state = applyTradeoffCommand(
      state,
      { type: 'ready', expectedStateVersion: 2 },
      { side: 'side_b', nowMs: 2 }
    ).state;
    expect(visibleTradeoffState(state, 'side_a', 2).hiddenTwist).toBeNull();
    state = advanceTradeoffState(state, state.phaseEndsAt);
    expect(visibleTradeoffState(state, 'side_a', state.phaseStartedAt).hiddenTwist).toBe(
      'Lose a region'
    );
    expect(visibleTradeoffState(state, 'side_b', state.phaseStartedAt).hiddenTwist).toBe(
      'Lose a region'
    );
    expect(
      applyTradeoffCommand(
        state,
        { type: 'ready', expectedStateVersion: 1 },
        { side: 'side_a', nowMs: 3 }
      )
    ).toMatchObject({ accepted: false, code: 'stale_state' });
  });

  it('recovers the same authoritative snapshot after reconnect', () => {
    const state = advanceTradeoffState(
      { ...initial(), phase: 'debate', phaseEndsAt: 10_000, stateVersion: 9, eventCursor: 12 },
      5_000
    );
    expect(visibleTradeoffState(state, 'side_a', 5_000)).toMatchObject({
      phase: 'debate',
      stateVersion: 9,
      eventCursor: 12,
      serverNow: 5_000,
    });
  });

  it('rejects late voting mutations and offers no-show claims only to the ready player', () => {
    const state = { ...initial(), phase: 'voting', phaseEndsAt: 100, stateVersion: 5 };
    expect(
      applyTradeoffCommand(
        state,
        { type: 'vote', vote: 'win', expectedStateVersion: 5 },
        { side: 'side_a', nowMs: 101 }
      )
    ).toMatchObject({ accepted: false, code: 'late' });
    const checkedIn = applyTradeoffCommand(
      initial(),
      { type: 'ready', expectedStateVersion: 1 },
      { side: 'side_a', nowMs: 10 }
    ).state;
    expect(advanceTradeoffState(checkedIn, checkedIn.phaseEndsAt)).toMatchObject({
      noShowClaimAvailableTo: 'side_a',
    });
  });
});
