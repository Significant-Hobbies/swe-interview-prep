import { readFileSync } from 'node:fs';
import initSqlJs from 'sql.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { blitzQuestions } from '../data/software-wars/index.mjs';
import { WarsRepository } from './repository.mjs';

async function testClient() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(readFileSync(new URL('../../migrations/d1/0001_initial.sql', import.meta.url), 'utf8'));
  db.run(
    readFileSync(new URL('../../migrations/d1/0002_software_wars.sql', import.meta.url), 'utf8')
  );
  return {
    db,
    async execute(statement) {
      const sql = typeof statement === 'string' ? statement : statement.sql;
      const args = typeof statement === 'string' ? [] : (statement.args ?? []);
      if (/^\s*(SELECT|WITH)/i.test(sql)) {
        const prepared = db.prepare(sql);
        prepared.bind(args);
        const rows = [];
        while (prepared.step()) rows.push(prepared.getAsObject());
        prepared.free();
        return { rows, rowsAffected: 0 };
      }
      db.run(sql, args);
      return { rows: [], rowsAffected: db.getRowsModified() };
    },
  };
}

describe('Software Wars repository', () => {
  let client;
  let repository;
  const user = { id: 'user-1', name: 'Ada' };

  beforeEach(async () => {
    client = await testClient();
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: [user.id, 'google-1', 'ada@example.com', user.name],
    });
    let sequence = 0;
    repository = new WarsRepository(client, {
      env: {
        WARS_ENABLED: 'true',
        WARS_BLITZ_RANKED_ENABLED: 'true',
        JWT_SECRET: 'software-wars-test-secret-with-32-characters',
      },
      now: () => new Date('2026-08-13T10:00:00.000Z'),
      id: () => `id-${++sequence}`,
      rankedBlitzMinimum: 1,
    });
  });

  it('schedules a two-person Tradeoff room without exposing the prompt or twist', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const room = await repository.scheduleTradeoff(user, {
      opponentUserId: 'user-2',
      idempotencyKey: 'tradeoff-1',
      scheduledFor: '2026-08-13T10:10:00.000Z',
    });
    expect(room).toMatchObject({ status: 'scheduled', phase: 'scheduled', durationSeconds: 1800 });
    expect(room.problem.prompt).toBeNull();
    expect(room.problem.hiddenTwist).toBeNull();
  });

  it('keeps Tradeoff drafts private and rejects edits after reveal', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const room = await repository.scheduleTradeoff(user, {
      opponentUserId: 'user-2',
      idempotencyKey: 'tradeoff-artifacts',
      scheduledFor: '2026-08-13T10:10:00.000Z',
    });
    await client.execute({
      sql: "UPDATE war_matches SET status = 'active', phase = 'initial_solution' WHERE id = ?",
      args: [room.matchId],
    });
    await repository.saveTradeoffArtifact(user.id, room.matchId, {
      artifactType: 'text',
      content: 'Use a durable queue.',
      idempotencyKey: 'save-1',
    });
    expect(await repository.tradeoffArtifacts('user-2', room.matchId)).toEqual({
      revealed: false,
      artifacts: [],
    });
    await client.execute({
      sql: "UPDATE war_artifacts SET status = 'revealed', visibility = 'participants'",
    });
    await client.execute({
      sql: "UPDATE war_matches SET status = 'reveal', phase = 'reveal' WHERE id = ?",
      args: [room.matchId],
    });
    await expect(
      repository.saveTradeoffArtifact(user.id, room.matchId, {
        artifactType: 'text',
        content: 'Late edit',
        idempotencyKey: 'save-late',
      })
    ).rejects.toMatchObject({ code: 'late' });
    const opponentView = await repository.tradeoffArtifacts('user-2', room.matchId);
    expect(opponentView.revealed).toBe(true);
    expect(opponentView.artifacts[0]).toMatchObject({
      content: 'Use a durable queue.',
      editable: false,
    });
  });

  it('authorizes media by match membership and keeps provider-disabled rooms usable', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const room = await repository.scheduleTradeoff(user, {
      opponentUserId: 'user-2',
      idempotencyKey: 'tradeoff-media',
      scheduledFor: '2026-08-13T10:10:00.000Z',
    });
    await expect(repository.mediaAccess(user.id, room.matchId)).resolves.toEqual({
      available: false,
      provider: 'disabled',
      reason: 'RealtimeKit is not configured',
    });
    await expect(repository.mediaAccess('user-outsider', room.matchId)).rejects.toMatchObject({
      code: 'not_found',
    });
  });

  it('requires both participants before enabling transcript consent', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const room = await repository.scheduleTradeoff(user, {
      opponentUserId: 'user-2',
      idempotencyKey: 'tradeoff-consent',
      scheduledFor: '2026-08-13T10:10:00.000Z',
    });
    await expect(
      repository.setTranscriptConsent(user.id, room.matchId, true)
    ).resolves.toMatchObject({
      consent: { sideA: true, sideB: false },
      transcriptionEnabled: false,
      videoRecordingEnabled: false,
    });
    await expect(
      repository.setTranscriptConsent('user-2', room.matchId, true)
    ).resolves.toMatchObject({
      consent: { sideA: true, sideB: true },
      transcriptionEnabled: true,
      videoRecordingEnabled: false,
    });
  });

  it('creates an answer-safe ranked match and resumes it idempotently', async () => {
    const match = await repository.createBlitzMatch(user, {
      queueType: 'ranked_mix',
      questionCount: 5,
      durationSeconds: 90,
      idempotencyKey: 'create-1',
      seed: 4,
    });
    expect(match).toMatchObject({ status: 'active', ranked: true, queueType: 'ranked_mix' });
    expect(match.questions).toHaveLength(5);
    expect(match.questions[0]).not.toHaveProperty('correctOptionId');
    expect(match.questions[0]).not.toHaveProperty('explanation');
    expect(match.questions[0].options[0]).not.toHaveProperty('explanation');

    const retried = await repository.createBlitzMatch(user, {
      queueType: 'ranked_mix',
      idempotencyKey: 'create-1',
    });
    expect(retried.matchId).toBe(match.matchId);
  });

  it('finalizes once, exposes only post-match explanations, and applies rating/remediation', async () => {
    const match = await repository.createBlitzMatch(user, {
      queueType: 'ranked_mix',
      questionCount: 5,
      durationSeconds: 90,
      idempotencyKey: 'create-2',
      seed: 7,
    });

    for (const [index, safeQuestion] of match.questions.entries()) {
      const authored = blitzQuestions.find(({ id }) => id === safeQuestion.id);
      const optionId =
        index === 0
          ? authored.options.find(({ id }) => id !== authored.correctOptionId).id
          : authored.correctOptionId;
      await repository.submitBlitzAnswer(user.id, match.matchId, {
        questionId: authored.id,
        optionId,
        idempotencyKey: `answer-${index}`,
      });
    }

    const result = await repository.privateResult(user.id, match.matchId);
    expect(result.status).toBe('complete');
    expect(result.mistakes).toHaveLength(1);
    expect(result.mistakes[0]).toHaveProperty('correctAnswer');
    expect(result.mistakes[0]).toHaveProperty('explanation');
    expect(result.mistakes[0].options).toHaveLength(4);
    expect(result.mistakes[0].options[0]).toHaveProperty('explanation');
    expect(result.weaknesses[0]).toMatchObject({
      reviewScheduled: true,
      learnPath: `/concepts/${result.weaknesses[0].conceptId}`,
    });

    await repository.finalizeBlitzMatch(user.id, match.matchId);
    const events = await client.execute({
      sql: 'SELECT * FROM war_rating_events WHERE user_id = ? AND match_id = ?',
      args: [user.id, match.matchId],
    });
    expect(events.rows).toHaveLength(1);
    const rating = await repository.ratingFor(user.id, 'blitz');
    expect(rating.rankedMatches).toBe(1);
  });

  it('pairs a completed ranked human attempt as a one-use asynchronous ghost', async () => {
    const ghostUser = { id: 'user-2', name: 'Grace' };
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: [ghostUser.id, 'google-2', 'grace@example.com', ghostUser.name],
    });
    const source = await repository.createBlitzMatch(ghostUser, {
      queueType: 'ranked_mix',
      opponentType: 'ai',
      questionCount: 5,
      idempotencyKey: 'ghost-source',
      seed: 3,
    });
    await repository.finalizeBlitzMatch(ghostUser.id, source.matchId);

    const paired = await repository.createBlitzMatch(user, {
      queueType: 'ranked_mix',
      questionCount: 5,
      idempotencyKey: 'ghost-pair',
      seed: 9,
    });
    expect(paired.opponent).toEqual({ displayName: 'Grace', participantType: 'ghost' });
    expect(paired.questions.map(({ id }) => id)).toEqual(source.questions.map(({ id }) => id));

    const consumed = await client.execute({
      sql: 'SELECT consumed_by_match_id FROM war_attempts WHERE id = ?',
      args: [source.attemptId],
    });
    expect(consumed.rows[0].consumed_by_match_id).toBe(paired.matchId);

    await repository.finalizeBlitzMatch(user.id, paired.matchId);
    const ratingEvent = await client.execute({
      sql: 'SELECT opponent_type FROM war_rating_events WHERE user_id = ? AND match_id = ?',
      args: [user.id, paired.matchId],
    });
    expect(ratingEvent.rows[0].opponent_type).toBe('ghost');
  });

  it('keeps public result reads sanitized', async () => {
    const match = await repository.createBlitzMatch(user, {
      queueType: 'topic',
      topic: 'apis',
      questionCount: 5,
      idempotencyKey: 'create-3',
      seed: 2,
    });
    await repository.finalizeBlitzMatch(user.id, match.matchId);
    const shared = await repository.setResultVisibility(user.id, match.matchId, 'result');
    const publicResult = await repository.publicResult(shared.shareSlug);
    expect(publicResult).toMatchObject({ mode: 'blitz', questionCount: 5 });
    expect(JSON.stringify(publicResult)).not.toMatch(/stem|explanation|correctOption/);
  });

  it('publishes canonical coverage and creates an unranked concept queue', async () => {
    expect(repository.curriculumCoverage().totals).toEqual({
      tracks: 19,
      roadmaps: 26,
      concepts: 259,
    });
    const match = await repository.createBlitzMatch(user, {
      queueType: 'concept',
      queueId: 'idempotency',
      questionCount: 5,
      idempotencyKey: 'concept-queue',
      seed: 7,
    });
    expect(match).toMatchObject({ ranked: false, queueType: 'concept', queueId: 'idempotency' });
    expect(match.questions).toHaveLength(5);
    expect(match.questions.every(({ primaryConcept }) => primaryConcept.id === 'idempotency')).toBe(
      true
    );
  });

  it('accepts an authenticated challenge with the same immutable question versions', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const source = await repository.createBlitzMatch(user, {
      queueType: 'topic',
      topic: 'apis',
      questionCount: 5,
      idempotencyKey: 'challenge-source',
      seed: 5,
    });
    await repository.finalizeBlitzMatch(user.id, source.matchId);
    const challenge = await repository.createChallenge(user.id, {
      mode: 'blitz',
      sourceMatchId: source.matchId,
      idempotencyKey: 'challenge-create',
      rules: { durationSeconds: 90 },
    });
    const repeated = await repository.createChallenge(user.id, {
      mode: 'blitz',
      sourceMatchId: source.matchId,
      idempotencyKey: 'challenge-create',
      rules: { durationSeconds: 90 },
    });
    expect(repeated).toEqual(challenge);
    const storedChallenge = await client.execute({
      sql: 'SELECT token_hash FROM war_challenges WHERE id = ?',
      args: [challenge.id],
    });
    expect(storedChallenge.rows[0].token_hash).not.toBe(challenge.token);
    const accepted = await repository.acceptChallenge(
      { id: 'user-2', name: 'Grace' },
      challenge.token,
      { idempotencyKey: 'challenge-accept' }
    );
    expect(accepted).toMatchObject({ ranked: false, queueType: 'challenge' });
    expect(accepted.questions.map(({ id }) => id)).toEqual(source.questions.map(({ id }) => id));
    expect(accepted.opponent).toEqual({ displayName: 'Ada', participantType: 'ghost' });

    await repository.finalizeBlitzMatch('user-2', accepted.matchId);
    const state = await client.execute({
      sql: 'SELECT status, accepted_match_id FROM war_challenges WHERE id = ?',
      args: [challenge.id],
    });
    expect(state.rows[0]).toMatchObject({
      status: 'completed',
      accepted_match_id: accepted.matchId,
    });
  });

  it('turns an accepted Tradeoff invite into a scheduled two-person room', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const challenge = await repository.createChallenge(user.id, {
      mode: 'tradeoff',
      idempotencyKey: 'tradeoff-challenge-create',
      rules: { ranked: false },
    });
    const room = await repository.acceptChallenge(
      { id: 'user-2', name: 'Grace' },
      challenge.token,
      { idempotencyKey: 'tradeoff-challenge-accept' }
    );
    expect(room).toMatchObject({ status: 'scheduled', phase: 'scheduled', ranked: false });
    expect(room.opponent).toEqual({ displayName: 'Ada', participantType: 'human' });
    const state = await client.execute({
      sql: 'SELECT status, recipient_user_id, accepted_match_id FROM war_challenges WHERE id = ?',
      args: [challenge.id],
    });
    expect(state.rows[0]).toMatchObject({
      status: 'accepted',
      recipient_user_id: 'user-2',
      accepted_match_id: room.matchId,
    });
  });

  it('returns a participant-private Tradeoff result with rubric evidence and remediation', async () => {
    await client.execute({
      sql: 'INSERT INTO users (id, google_id, email, name) VALUES (?, ?, ?, ?)',
      args: ['user-2', 'google-2', 'grace@example.com', 'Grace'],
    });
    const room = await repository.scheduleTradeoff(user, {
      opponentUserId: 'user-2',
      idempotencyKey: 'tradeoff-result',
      scheduledFor: '2026-08-13T10:10:00.000Z',
    });
    await client.execute({
      sql: "UPDATE war_matches SET status = 'complete', phase = 'complete', result = 'side_a', finalized_at = ? WHERE id = ?",
      args: ['2026-08-13T10:40:00.000Z', room.matchId],
    });
    await client.execute({
      sql: `INSERT INTO war_evaluations (
        id, match_id, evaluation_type, status, evaluator_version, rubric_version,
        evidence_hash, result_json, operation_id, completed_at
      ) VALUES (?, ?, 'ai_adjudication', 'valid', 'tradeoff-adjudicator-v1', 'rubric-v1', ?, ?, ?, ?)`,
      args: [
        'evaluation-1',
        room.matchId,
        'evidence-hash',
        JSON.stringify({
          winner: 'side_a',
          reasoning: 'Ada defended the partition invariant with concrete failure handling.',
          rubricScores: [],
        }),
        'evaluation-operation-1',
        '2026-08-13T10:40:00.000Z',
      ],
    });
    await client.execute({
      sql: `INSERT INTO war_remediation_events (
        id, user_id, match_id, concept_id, evidence_type, fsrs_rating, evidence_json, operation_id
      ) VALUES (?, ?, ?, ?, 'tradeoff_rubric', 'hard', ?, ?)`,
      args: [
        'remediation-1',
        user.id,
        room.matchId,
        'rate-limiting',
        JSON.stringify({ strength: 'partial' }),
        'remediation-operation-1',
      ],
    });
    const result = await repository.tradeoffResult(user.id, room.matchId);
    expect(result).toMatchObject({
      status: 'complete',
      outcome: 'win',
      evaluation: {
        type: 'ai_adjudication',
        reasoning: 'Ada defended the partition invariant with concrete failure handling.',
      },
      weaknesses: [
        {
          conceptId: 'rate-limiting',
          reviewRating: 'hard',
          learnPath: '/concepts/rate-limiting',
        },
      ],
    });
    await repository.setResultVisibility(user.id, room.matchId, 'result');
    const publicResult = await repository.publicResult(result.shareSlug);
    expect(publicResult).toMatchObject({ mode: 'tradeoff', result: 'side_a' });
    expect(JSON.stringify(publicResult)).not.toContain('partition invariant');
  });

  it('supports leaderboard opt-out and immutable operator compensation events', async () => {
    const match = await repository.createBlitzMatch(user, {
      queueType: 'ranked_mix',
      opponentType: 'ai',
      questionCount: 5,
      idempotencyKey: 'correction-source',
    });
    await repository.finalizeBlitzMatch(user.id, match.matchId);
    await repository.setLeaderboardVisibility(user.id, 'blitz', false);
    expect(await repository.leaderboard('blitz')).toEqual([]);

    const source = await client.execute({
      sql: "SELECT id FROM war_rating_events WHERE user_id = ? AND match_id = ? AND event_type = 'result'",
      args: [user.id, match.matchId],
    });
    await expect(
      repository.correctRating(
        { ...user, isOwner: false },
        {
          compensatesEventId: source.rows[0].id,
          afterRating: 1510,
          idempotencyKey: 'correction-1',
        }
      )
    ).rejects.toMatchObject({ code: 'forbidden' });
    await expect(
      repository.correctRating(
        { ...user, isOwner: true },
        {
          compensatesEventId: source.rows[0].id,
          afterRating: 1510,
          idempotencyKey: 'correction-1',
        }
      )
    ).resolves.toMatchObject({ afterRating: 1510, compensatesEventId: source.rows[0].id });
    const events = await client.execute({
      sql: 'SELECT event_type, compensates_event_id FROM war_rating_events WHERE match_id = ? ORDER BY created_at',
      args: [match.matchId],
    });
    expect(events.rows).toHaveLength(2);
    expect(events.rows[1]).toMatchObject({
      event_type: 'correction',
      compensates_event_id: source.rows[0].id,
    });
    expect((await repository.ratingFor(user.id, 'blitz')).rating).toBe(1510);
  });
});
