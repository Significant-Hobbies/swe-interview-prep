export const PHASE_DURATIONS_MS = Object.freeze({
  check_in: 5 * 60_000,
  initial_solution: 9 * 60_000,
  twist: 15_000,
  revision: 7 * 60_000 + 45_000,
  reveal: 60_000,
  debate: 8 * 60_000,
  voting: 2 * 60_000,
});

const NEXT = Object.freeze({
  check_in: 'initial_solution',
  initial_solution: 'twist',
  twist: 'revision',
  revision: 'reveal',
  reveal: 'debate',
  debate: 'voting',
  voting: 'adjudicating',
});

export function initialTradeoffState({ matchId, prompt, hiddenTwist, nowMs }) {
  return {
    matchId,
    phase: 'check_in',
    phaseStartedAt: nowMs,
    phaseEndsAt: nowMs + PHASE_DURATIONS_MS.check_in,
    stateVersion: 1,
    eventCursor: 1,
    prompt,
    hiddenTwist,
    ready: { side_a: false, side_b: false },
    transcriptConsent: { side_a: false, side_b: false },
    votes: {},
    result: null,
    noShowClaimAvailableTo: null,
  };
}

export function visibleTradeoffState(state, side, nowMs) {
  const twistVisible = !['check_in', 'initial_solution'].includes(state.phase);
  const votesVisible = ['complete', 'review_required'].includes(state.phase);
  return {
    matchId: state.matchId,
    phase: state.phase,
    phaseStartedAt: state.phaseStartedAt,
    phaseEndsAt: state.phaseEndsAt,
    stateVersion: state.stateVersion,
    eventCursor: state.eventCursor,
    serverNow: nowMs,
    prompt: state.phase === 'check_in' ? null : state.prompt,
    hiddenTwist: twistVisible ? state.hiddenTwist : null,
    ready: state.ready,
    transcriptConsent: state.transcriptConsent,
    ownVote: state.votes[side] ?? null,
    votes: votesVisible ? state.votes : undefined,
    result: state.result,
    noShowClaimAvailableTo: state.noShowClaimAvailableTo,
  };
}

export function applyTradeoffCommand(state, command, { side, nowMs }) {
  if (command.expectedStateVersion !== state.stateVersion) {
    return { accepted: false, code: 'stale_state', state };
  }
  if (state.phaseEndsAt !== null && nowMs >= state.phaseEndsAt) {
    return { accepted: false, code: 'late', state };
  }
  if (command.type === 'ready' && state.phase === 'check_in') {
    const ready = { ...state.ready, [side]: true };
    let next = {
      ...state,
      ready,
      stateVersion: state.stateVersion + 1,
      eventCursor: state.eventCursor + 1,
    };
    if (ready.side_a && ready.side_b) next = advanceTradeoffState(next, nowMs, true);
    return { accepted: true, state: next };
  }
  if (command.type === 'transcript_consent' && ['reveal', 'debate'].includes(state.phase)) {
    return {
      accepted: true,
      state: {
        ...state,
        transcriptConsent: { ...state.transcriptConsent, [side]: Boolean(command.consent) },
        stateVersion: state.stateVersion + 1,
        eventCursor: state.eventCursor + 1,
      },
    };
  }
  if (
    command.type === 'vote' &&
    state.phase === 'voting' &&
    !state.votes[side] &&
    ['win', 'loss', 'draw'].includes(command.vote)
  ) {
    return {
      accepted: true,
      state: {
        ...state,
        votes: { ...state.votes, [side]: command.vote },
        stateVersion: state.stateVersion + 1,
        eventCursor: state.eventCursor + 1,
      },
    };
  }
  if (
    command.type === 'claim_no_show' &&
    state.phase === 'check_in' &&
    state.noShowClaimAvailableTo === side
  ) {
    return {
      accepted: true,
      state: {
        ...state,
        phase: 'complete',
        phaseEndsAt: null,
        result: side,
        stateVersion: state.stateVersion + 1,
        eventCursor: state.eventCursor + 1,
      },
    };
  }
  return {
    accepted: false,
    code: nowMs >= (state.phaseEndsAt ?? Infinity) ? 'late' : 'invalid_command',
    state,
  };
}

export function advanceTradeoffState(state, nowMs, force = false) {
  if (!force && (state.phaseEndsAt === null || nowMs < state.phaseEndsAt)) return state;
  if (state.phase === 'check_in' && !(state.ready.side_a && state.ready.side_b)) {
    const presentSide = state.ready.side_a ? 'side_a' : state.ready.side_b ? 'side_b' : null;
    return {
      ...state,
      noShowClaimAvailableTo: presentSide,
      phaseEndsAt: null,
      stateVersion: state.stateVersion + 1,
      eventCursor: state.eventCursor + 1,
    };
  }
  const phase = NEXT[state.phase];
  if (!phase) return state;
  const duration = PHASE_DURATIONS_MS[phase];
  return {
    ...state,
    phase,
    phaseStartedAt: nowMs,
    phaseEndsAt: duration === undefined ? null : nowMs + duration,
    stateVersion: state.stateVersion + 1,
    eventCursor: state.eventCursor + 1,
  };
}
