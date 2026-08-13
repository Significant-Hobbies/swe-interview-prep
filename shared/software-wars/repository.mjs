import {
  aiAnswers,
  aiOpponents,
  blitzQuestions,
  buildWarsCurriculumManifest,
  loadActiveBlitzQuestions,
  loadActiveTradeoffProblems,
  safeBlitzQuestion,
  resolveWarsQueueConceptIds,
  tradeoffProblems,
} from '../data/software-wars/index.mjs';
import { RANKED_LAUNCH_MINIMUMS } from '../data/software-wars/authoring-schema.mjs';
import { reviewConcept } from '../lib/fsrs.mjs';
import { WAR_RULES_VERSION } from './contracts.mjs';
import { buildRatingEvent, rateAiMatch } from './competitive-elo.mjs';
import {
  compareBlitzScores,
  isBeforeDeadline,
  mapBlitzRemediation,
  selectBlitzQuestions,
} from './logic.mjs';
import { mintRealtimeToken } from './realtime-token.mjs';
import { createMediaProvider, verifyRealtimeKitWebhook } from './media-provider.mjs';

function parseJson(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function envFlag(env, key, fallback = false) {
  const value = env?.[key];
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function challengeToken(userId, idempotencyKey, secret) {
  if (typeof secret !== 'string' || secret.length < 32) {
    throw Object.assign(new Error('Challenge token signing is not configured'), {
      code: 'disabled',
    });
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`software-wars-challenge:v1:${userId}:${idempotencyKey}`)
  );
  return bytesToHex(new Uint8Array(signature));
}

async function challengeTokenHash(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(token)));
  return bytesToHex(new Uint8Array(digest));
}

function publicIdentity(row) {
  return {
    displayName: row.display_name_snapshot,
    participantType: row.participant_type,
  };
}

export class WarsRepository {
  constructor(
    client,
    {
      env = {},
      now = () => new Date(),
      id = () => crypto.randomUUID(),
      rankedBlitzMinimum = RANKED_LAUNCH_MINIMUMS.distinctBlitzQuestions,
    } = {}
  ) {
    this.client = client;
    this.env = env;
    this.now = now;
    this.id = id;
    this.rankedBlitzMinimum = rankedBlitzMinimum;
  }

  async execute(sql, args = []) {
    return this.client.execute({ sql, args });
  }

  observe(event, properties = {}) {
    console.info('software_wars_event', {
      event,
      at: this.now().toISOString(),
      ...properties,
    });
  }

  launchStatus() {
    const activeBlitzQuestions = loadActiveBlitzQuestions();
    const distinctBlitzQuestions = new Set(activeBlitzQuestions.map(({ contentKey }) => contentKey))
      .size;
    const activeTradeoffProblems = loadActiveTradeoffProblems().length;
    const enabled = envFlag(this.env, 'WARS_ENABLED', true);
    return {
      enabled,
      blitzPreviewEnabled: enabled && envFlag(this.env, 'WARS_BLITZ_PREVIEW_ENABLED', true),
      blitzRankedEnabled:
        enabled &&
        envFlag(this.env, 'WARS_BLITZ_RANKED_ENABLED', false) &&
        distinctBlitzQuestions >= this.rankedBlitzMinimum,
      tradeoffPreviewEnabled: enabled && envFlag(this.env, 'WARS_TRADEOFF_PREVIEW_ENABLED', true),
      tradeoffRankedEnabled:
        enabled &&
        envFlag(this.env, 'WARS_TRADEOFF_RANKED_ENABLED', false) &&
        activeTradeoffProblems >= RANKED_LAUNCH_MINIMUMS.tradeoffProblems,
      mediaConfigured: Boolean(
        this.env.REALTIMEKIT_ACCOUNT_ID &&
          this.env.REALTIMEKIT_APP_ID &&
          this.env.REALTIMEKIT_API_TOKEN
      ),
      content: {
        authoredCandidateBlitzQuestions: new Set(blitzQuestions.map(({ contentKey }) => contentKey))
          .size,
        activeBlitzQuestions: activeBlitzQuestions.length,
        activeBlitzQuestionVersions: activeBlitzQuestions.length,
        distinctAuthoredBlitzQuestions: distinctBlitzQuestions,
        activeTradeoffProblems,
        blitzLaunchMinimum: RANKED_LAUNCH_MINIMUMS.distinctBlitzQuestions,
        tradeoffLaunchMinimum: RANKED_LAUNCH_MINIMUMS.tradeoffProblems,
      },
    };
  }

  curriculumCoverage() {
    return buildWarsCurriculumManifest(blitzQuestions);
  }

  async ratingFor(userId, mode) {
    const result = await this.execute('SELECT * FROM war_ratings WHERE user_id = ? AND mode = ?', [
      userId,
      mode,
    ]);
    const row = result.rows[0];
    if (!row) {
      return { rating: 1500, rankedMatches: 0, wins: 0, draws: 0, losses: 0, version: 0 };
    }
    return {
      rating: row.rating,
      rankedMatches: row.ranked_matches,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      version: row.version,
    };
  }

  async ratingsForUser(userId) {
    const [blitz, tradeoff] = await Promise.all([
      this.ratingFor(userId, 'blitz'),
      this.ratingFor(userId, 'tradeoff'),
    ]);
    return {
      blitz: { mode: 'blitz', ...blitz, provisional: blitz.rankedMatches <= 10 },
      tradeoff: { mode: 'tradeoff', ...tradeoff, provisional: tradeoff.rankedMatches <= 10 },
    };
  }

  async setLeaderboardVisibility(userId, mode, visible) {
    if (!['blitz', 'tradeoff'].includes(mode)) {
      throw Object.assign(new Error('Unknown rating mode'), { code: 'bad_request' });
    }
    const current = await this.ratingFor(userId, mode);
    await this.execute(
      `INSERT INTO war_ratings (
        id, user_id, mode, rating, ranked_matches, wins, draws, losses,
        leaderboard_visible, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(user_id, mode) DO UPDATE SET
        leaderboard_visible = excluded.leaderboard_visible,
        version = war_ratings.version + 1, updated_at = datetime('now')`,
      [
        this.id(),
        userId,
        mode,
        current.rating,
        current.rankedMatches,
        current.wins,
        current.draws,
        current.losses,
        visible ? 1 : 0,
      ]
    );
    return { mode, leaderboardVisible: Boolean(visible) };
  }

  async correctRating(operator, input) {
    if (!operator?.isOwner) {
      throw Object.assign(new Error('Operator access is required'), { code: 'forbidden' });
    }
    const operationId = String(input.idempotencyKey || '').slice(0, 128);
    const afterRating = Number(input.afterRating);
    if (!operationId || !Number.isInteger(afterRating) || afterRating <= 0) {
      throw Object.assign(new Error('A positive afterRating and idempotencyKey are required'), {
        code: 'bad_request',
      });
    }
    const sourceRows = await this.execute(
      `SELECT * FROM war_rating_events WHERE id = ? AND event_type = 'result'`,
      [input.compensatesEventId]
    );
    const source = sourceRows.rows[0];
    if (!source) throw Object.assign(new Error('Rating event not found'), { code: 'not_found' });
    const existing = await this.execute(`SELECT * FROM war_rating_events WHERE operation_id = ?`, [
      operationId,
    ]);
    if (existing.rows[0]) {
      return {
        eventId: existing.rows[0].id,
        beforeRating: existing.rows[0].before_rating,
        afterRating: existing.rows[0].after_rating,
      };
    }
    const current = await this.ratingFor(source.user_id, source.mode);
    const eventId = this.id();
    await this.execute(
      `INSERT INTO war_rating_events (
        id, user_id, mode, match_id, event_type, before_rating, after_rating,
        score, opponent_type, opponent_rating_snapshot, algorithm_version,
        compensates_event_id, operation_id, created_at
      ) VALUES (?, ?, ?, ?, 'correction', ?, ?, ?, 'operator', ?, ?, ?, ?, ?)`,
      [
        eventId,
        source.user_id,
        source.mode,
        source.match_id,
        current.rating,
        afterRating,
        source.score,
        source.opponent_rating_snapshot,
        source.algorithm_version,
        source.id,
        operationId,
        this.now().toISOString(),
      ]
    );
    await this.execute(
      `UPDATE war_ratings SET rating = ?, version = version + 1, updated_at = ?
       WHERE user_id = ? AND mode = ?`,
      [afterRating, this.now().toISOString(), source.user_id, source.mode]
    );
    return { eventId, beforeRating: current.rating, afterRating, compensatesEventId: source.id };
  }

  async leaderboard(mode, limit = 50) {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));
    const result = await this.execute(
      `SELECT r.rating, r.ranked_matches, r.wins, r.draws, r.losses,
              u.name, u.picture
       FROM war_ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.mode = ? AND r.leaderboard_visible = 1
       ORDER BY CASE WHEN r.ranked_matches > 10 THEN 0 ELSE 1 END,
                r.rating DESC, r.ranked_matches DESC, r.updated_at ASC
       LIMIT ?`,
      [mode, safeLimit]
    );
    return result.rows.map((row, index) => ({
      rank: index + 1,
      displayName: row.name,
      avatarUrl: row.picture || undefined,
      rating: row.rating,
      rankedMatches: row.ranked_matches,
      provisional: row.ranked_matches <= 10,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
    }));
  }

  async ensureContentVersion(question) {
    await this.execute(
      `INSERT INTO war_content_versions (
        id, content_type, content_key, version, variant_key, status, topic, difficulty,
        concept_ids_json, source_refs_json, content_hash, reviewed_at, activated_at
      ) VALUES (?, 'blitz_question', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING`,
      [
        question.id,
        question.contentKey,
        question.version,
        question.variantKey ?? 'base',
        question.status,
        question.topic,
        question.difficulty,
        JSON.stringify(question.conceptIds),
        JSON.stringify(question.sources),
        question.id,
        question.review.reviewedAt,
        question.review.reviewedAt,
      ]
    );
  }

  async ensureTradeoffContentVersion(problem) {
    await this.execute(
      `INSERT INTO war_content_versions (
        id, content_type, content_key, version, variant_key, status, topic, difficulty,
        concept_ids_json, source_refs_json, content_hash, reviewed_at, activated_at
      ) VALUES (?, 'tradeoff_problem', ?, ?, 'base', ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING`,
      [
        problem.id,
        problem.contentKey,
        problem.version,
        problem.status,
        problem.topic,
        problem.difficulty,
        JSON.stringify(problem.conceptIds),
        JSON.stringify(problem.sources),
        problem.id,
        problem.review.reviewedAt,
        problem.review.reviewedAt,
      ]
    );
  }

  async ensureAiOpponent(opponent, selectedQuestions) {
    await this.execute(
      `INSERT INTO war_ai_opponents (
        id, profile_key, version, display_name, provider, model_name, model_snapshot,
        benchmark_version, published_rating, accuracy, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING`,
      [
        opponent.id,
        opponent.profileKey,
        opponent.version,
        opponent.displayName,
        opponent.provider,
        opponent.modelName,
        opponent.modelSnapshot,
        opponent.benchmarkVersion,
        opponent.publishedRating,
        opponent.accuracy,
        opponent.status,
      ]
    );
    for (const question of selectedQuestions) {
      const answer = aiAnswers.find(
        ({ aiOpponentId, questionId }) => aiOpponentId === opponent.id && questionId === question.id
      );
      await this.execute(
        `INSERT INTO war_ai_answers (
          id, ai_opponent_id, content_version_id, selected_option_id, explanation
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(ai_opponent_id, content_version_id) DO NOTHING`,
        [answer.id, opponent.id, question.id, answer.selectedOptionId, answer.explanation]
      );
    }
  }

  async createBlitzMatch(user, input) {
    const queueType = input.queueType ?? 'ranked_mix';
    const ranked = queueType === 'ranked_mix';
    const scopedQueue = ['track', 'roadmap', 'concept'].includes(queueType);
    const persistedQueueType = scopedQueue ? 'topic' : queueType;
    const queueId = scopedQueue ? String(input.queueId ?? '') : null;
    const eligibleConceptIds = scopedQueue ? resolveWarsQueueConceptIds(queueType, queueId) : null;
    if (scopedQueue && !eligibleConceptIds) {
      throw Object.assign(new Error('Unknown curriculum queue'), { code: 'bad_request' });
    }
    const launch = this.launchStatus();
    if (!launch.blitzPreviewEnabled)
      throw Object.assign(new Error('Blitz preview is disabled'), { code: 'disabled' });
    if (ranked && !launch.blitzRankedEnabled) {
      throw Object.assign(new Error('Ranked Blitz is not enabled by the operator'), {
        code: 'ranked_disabled',
      });
    }
    const questionCount = Math.max(5, Math.min(10, Number(input.questionCount) || 7));
    const durationSeconds = Math.max(60, Math.min(120, Number(input.durationSeconds) || 90));
    const idempotencyKey = String(input.idempotencyKey || '').slice(0, 128);
    if (!idempotencyKey)
      throw Object.assign(new Error('idempotencyKey is required'), { code: 'bad_request' });

    const existing = await this.execute(
      'SELECT id FROM war_matches WHERE created_by_user_id = ? AND create_idempotency_key = ?',
      [user.id, idempotencyKey]
    );
    if (existing.rows[0]) return this.resumeBlitzMatch(user.id, existing.rows[0].id);

    const rating = await this.ratingFor(user.id, 'blitz');
    const ghostRows =
      ranked && input.opponentType !== 'ai' && !input.aiOpponentId
        ? await this.execute(
            `SELECT a.id AS ghost_attempt_id, a.question_order_json,
                    p.user_id AS ghost_user_id, p.display_name_snapshot,
                    p.rating_snapshot, m.question_count
             FROM war_attempts a
             JOIN war_participants p ON p.id = a.participant_id
             JOIN war_matches m ON m.id = a.match_id
             WHERE a.is_ranked_ghost = 1 AND a.status = 'complete'
               AND a.consumed_by_match_id IS NULL AND p.user_id != ?
               AND ABS(COALESCE(p.rating_snapshot, 1500) - ?) <= 250
             ORDER BY ABS(COALESCE(p.rating_snapshot, 1500) - ?), a.completed_at ASC
             LIMIT 1`,
            [user.id, rating.rating, rating.rating]
          )
        : { rows: [] };
    const ghost = ghostRows.rows[0] ?? null;
    const recentResult = await this.execute(
      `SELECT content_snapshot_json FROM war_matches
       WHERE created_by_user_id = ? AND mode = 'blitz'
       ORDER BY created_at DESC LIMIT 3`,
      [user.id]
    );
    const recentContentIds = recentResult.rows.flatMap(
      (row) => parseJson(row.content_snapshot_json, {}).questionIds ?? []
    );
    const remediation = await this.execute(
      `SELECT concept_id FROM war_remediation_events
       WHERE user_id = ? AND evidence_type = 'blitz_miss'
       ORDER BY created_at DESC LIMIT 20`,
      [user.id]
    );
    const weakConceptIds = remediation.rows.map(({ concept_id }) => concept_id);
    const ghostQuestionIds = ghost ? parseJson(ghost.question_order_json, []) : [];
    let selectedQuestions;
    try {
      selectedQuestions = ghost
        ? ghostQuestionIds
            .map((id) => blitzQuestions.find((question) => question.id === id))
            .filter(Boolean)
        : selectBlitzQuestions({
            questions: loadActiveBlitzQuestions(),
            count: questionCount,
            topic: queueType === 'topic' ? input.topic : undefined,
            eligibleConceptIds,
            recentContentIds,
            weakConceptIds,
            seed: Number(input.seed) || this.now().getUTCDate(),
          });
    } catch (error) {
      if (error instanceof RangeError) {
        throw Object.assign(new Error(error.message), { code: 'bad_request' });
      }
      throw error;
    }
    const requestedOpponent = aiOpponents.find(
      ({ id, status }) => id === input.aiOpponentId && status === 'active'
    );
    const opponent = ghost
      ? null
      : (requestedOpponent ?? aiOpponents.find(({ status }) => status === 'active'));
    if (!ghost && !opponent)
      throw Object.assign(new Error('No AI opponent is available'), {
        code: 'opponent_unavailable',
      });

    for (const question of selectedQuestions) await this.ensureContentVersion(question);
    if (opponent) await this.ensureAiOpponent(opponent, selectedQuestions);

    const matchId = this.id();
    const humanParticipantId = this.id();
    const aiParticipantId = this.id();
    const attemptId = this.id();
    const startedAt = this.now();
    const deadlineAt = new Date(startedAt.getTime() + durationSeconds * 1_000);
    const snapshot = {
      questionIds: selectedQuestions.map(({ id }) => id),
      queueType,
      ...(queueId ? { queueId } : {}),
      questionGeneratorVersions: selectedQuestions.map(
        ({ generator }) => generator?.id ?? 'authored-base-v1'
      ),
      ...(ghost
        ? { ghostAttemptId: ghost.ghost_attempt_id }
        : {
            opponentId: opponent.id,
            opponentBenchmarkVersion: opponent.benchmarkVersion,
          }),
    };

    await this.execute(
      `INSERT INTO war_matches (
        id, mode, queue_type, ranked, status, rules_version, content_snapshot_json,
        duration_seconds, question_count, public_slug, created_by_user_id,
        create_idempotency_key, started_at, deadline_at
      ) VALUES (?, 'blitz', ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matchId,
        persistedQueueType,
        ranked ? 1 : 0,
        WAR_RULES_VERSION,
        JSON.stringify(snapshot),
        durationSeconds,
        selectedQuestions.length,
        this.id(),
        user.id,
        idempotencyKey,
        startedAt.toISOString(),
        deadlineAt.toISOString(),
      ]
    );
    await this.execute(
      `INSERT INTO war_participants (
        id, match_id, side, participant_type, user_id, display_name_snapshot,
        rating_snapshot, status, joined_at
      ) VALUES (?, ?, 'side_a', 'human', ?, ?, ?, 'active', ?)`,
      [humanParticipantId, matchId, user.id, user.name, rating.rating, startedAt.toISOString()]
    );
    if (ghost) {
      const claimed = await this.execute(
        `UPDATE war_attempts SET consumed_by_match_id = ?, updated_at = ?
         WHERE id = ? AND consumed_by_match_id IS NULL`,
        [matchId, startedAt.toISOString(), ghost.ghost_attempt_id]
      );
      if (claimed.rowsAffected === 0) {
        throw Object.assign(new Error('The selected ghost was already paired; retry the match'), {
          code: 'opponent_unavailable',
        });
      }
      await this.execute(
        `INSERT INTO war_participants (
          id, match_id, side, participant_type, user_id, ghost_attempt_id,
          display_name_snapshot, rating_snapshot, status, joined_at
        ) VALUES (?, ?, 'side_b', 'ghost', ?, ?, ?, ?, 'complete', ?)`,
        [
          aiParticipantId,
          matchId,
          ghost.ghost_user_id,
          ghost.ghost_attempt_id,
          ghost.display_name_snapshot,
          ghost.rating_snapshot,
          startedAt.toISOString(),
        ]
      );
    } else {
      await this.execute(
        `INSERT INTO war_participants (
          id, match_id, side, participant_type, ai_opponent_id, display_name_snapshot,
          rating_snapshot, status, joined_at
        ) VALUES (?, ?, 'side_b', 'ai', ?, ?, ?, 'complete', ?)`,
        [
          aiParticipantId,
          matchId,
          opponent.id,
          opponent.displayName,
          opponent.publishedRating,
          startedAt.toISOString(),
        ]
      );
    }
    await this.execute(
      `INSERT INTO war_attempts (
        id, match_id, participant_id, status, question_order_json, started_at, deadline_at
      ) VALUES (?, ?, ?, 'active', ?, ?, ?)`,
      [
        attemptId,
        matchId,
        humanParticipantId,
        JSON.stringify(snapshot.questionIds),
        startedAt.toISOString(),
        deadlineAt.toISOString(),
      ]
    );

    this.observe('match_start', {
      matchId,
      mode: 'blitz',
      queueType,
      queueId,
      ranked,
      opponentType: ghost ? 'ghost' : 'ai',
    });

    return {
      matchId,
      attemptId,
      status: 'active',
      ranked,
      queueType,
      queueId,
      serverNow: startedAt.toISOString(),
      deadlineAt: deadlineAt.toISOString(),
      answeredQuestionIds: [],
      questions: selectedQuestions.map(safeBlitzQuestion),
      opponent: ghost
        ? { displayName: ghost.display_name_snapshot, participantType: 'ghost' }
        : { displayName: opponent.displayName, participantType: 'ai' },
    };
  }

  async attemptForUser(userId, matchId) {
    const result = await this.execute(
      `SELECT a.*, m.ranked, m.queue_type, m.status AS match_status,
              m.content_snapshot_json, m.deadline_at AS match_deadline_at,
              p.id AS participant_id
       FROM war_attempts a
       JOIN war_matches m ON m.id = a.match_id
       JOIN war_participants p ON p.id = a.participant_id
       WHERE m.id = ? AND p.user_id = ?`,
      [matchId, userId]
    );
    return result.rows[0] ?? null;
  }

  async resumeBlitzMatch(userId, matchId) {
    const attempt = await this.attemptForUser(userId, matchId);
    if (!attempt) throw Object.assign(new Error('Match not found'), { code: 'not_found' });
    if (attempt.match_status === 'complete') return this.privateResult(userId, matchId);
    const snapshot = parseJson(attempt.content_snapshot_json, { questionIds: [] });
    const answerRows = await this.execute(
      'SELECT content_version_id FROM war_answers WHERE attempt_id = ?',
      [attempt.id]
    );
    const opponentRows = await this.execute(
      `SELECT display_name_snapshot, participant_type FROM war_participants
       WHERE match_id = ? AND participant_type != 'human' LIMIT 1`,
      [matchId]
    );
    return {
      matchId,
      attemptId: attempt.id,
      status: attempt.status,
      ranked: Boolean(attempt.ranked),
      queueType: ['track', 'roadmap', 'concept'].includes(snapshot.queueType)
        ? snapshot.queueType
        : attempt.queue_type,
      queueId: ['track', 'roadmap', 'concept'].includes(snapshot.queueType)
        ? (snapshot.queueId ?? null)
        : null,
      serverNow: this.now().toISOString(),
      deadlineAt: attempt.deadline_at,
      answeredQuestionIds: answerRows.rows.map(({ content_version_id }) => content_version_id),
      questions: snapshot.questionIds
        .map((id) => blitzQuestions.find((question) => question.id === id))
        .filter(Boolean)
        .map(safeBlitzQuestion),
      opponent: publicIdentity(opponentRows.rows[0]),
    };
  }

  async submitBlitzAnswer(userId, matchId, input) {
    const attempt = await this.attemptForUser(userId, matchId);
    if (!attempt) throw Object.assign(new Error('Match not found'), { code: 'not_found' });
    const receivedAt = this.now();
    if (!isBeforeDeadline(receivedAt, attempt.deadline_at)) {
      await this.finalizeBlitzMatch(userId, matchId);
      throw Object.assign(new Error('The match deadline has passed'), { code: 'late' });
    }
    const snapshot = parseJson(attempt.content_snapshot_json, { questionIds: [] });
    if (!snapshot.questionIds.includes(input.questionId)) {
      throw Object.assign(new Error('Question is not part of this match'), { code: 'bad_request' });
    }
    const question = blitzQuestions.find(({ id }) => id === input.questionId);
    if (!question?.options.some(({ id }) => id === input.optionId)) {
      throw Object.assign(new Error('Unknown answer option'), { code: 'bad_request' });
    }
    const operationId = String(input.idempotencyKey || '').slice(0, 128);
    if (!operationId)
      throw Object.assign(new Error('idempotencyKey is required'), { code: 'bad_request' });
    const elapsed = Math.max(0, receivedAt.getTime() - Date.parse(attempt.started_at));
    await this.execute(
      `INSERT INTO war_answers (
        id, attempt_id, content_version_id, selected_option_id, is_correct,
        response_ms, operation_id, received_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(attempt_id, operation_id) DO NOTHING`,
      [
        this.id(),
        attempt.id,
        question.id,
        input.optionId,
        input.optionId === question.correctOptionId ? 1 : 0,
        elapsed,
        operationId,
        receivedAt.toISOString(),
      ]
    );
    const answers = await this.execute(
      'SELECT content_version_id FROM war_answers WHERE attempt_id = ?',
      [attempt.id]
    );
    if (answers.rows.length >= snapshot.questionIds.length) {
      return this.finalizeBlitzMatch(userId, matchId);
    }
    return {
      accepted: true,
      questionId: question.id,
      answeredCount: answers.rows.length,
      questionCount: snapshot.questionIds.length,
      serverNow: receivedAt.toISOString(),
      deadlineAt: attempt.deadline_at,
    };
  }

  async applyRemediation(userId, matchId, answerRows) {
    const recommendations = [];
    for (const answer of answerRows) {
      const question = blitzQuestions.find(({ id }) => id === answer.content_version_id);
      if (!question) continue;
      const mapped = mapBlitzRemediation({ isCorrect: Boolean(answer.is_correct) });
      for (const conceptId of question.conceptIds) {
        const eventId = this.id();
        const operationId = `${matchId}:${conceptId}:${mapped.evidenceType}`;
        const inserted = await this.execute(
          `INSERT INTO war_remediation_events (
            id, user_id, match_id, content_version_id, concept_id, evidence_type,
            fsrs_rating, evidence_json, operation_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, match_id, concept_id, evidence_type) DO NOTHING`,
          [
            eventId,
            userId,
            matchId,
            question.id,
            conceptId,
            mapped.evidenceType,
            mapped.fsrsRating,
            JSON.stringify({
              selectedOptionId: answer.selected_option_id,
              isCorrect: Boolean(answer.is_correct),
            }),
            operationId,
          ]
        );
        if (inserted.rowsAffected > 0 && mapped.fsrsRating) {
          const masteryRows = await this.execute(
            'SELECT * FROM concept_mastery WHERE user_id = ? AND concept_id = ?',
            [userId, conceptId]
          );
          const next = reviewConcept(masteryRows.rows[0] ?? null, mapped.fsrsRating, this.now());
          await this.execute(
            `INSERT INTO concept_mastery (
              id, user_id, concept_id, stability, difficulty, elapsed_days,
              scheduled_days, reps, lapses, state, last_review, due, confidence
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, concept_id) DO UPDATE SET
              stability = excluded.stability, difficulty = excluded.difficulty,
              elapsed_days = excluded.elapsed_days, scheduled_days = excluded.scheduled_days,
              reps = excluded.reps, lapses = excluded.lapses, state = excluded.state,
              last_review = excluded.last_review, due = excluded.due,
              confidence = excluded.confidence, updated_at = datetime('now')`,
            [
              this.id(),
              userId,
              conceptId,
              next.stability,
              next.difficulty,
              next.elapsed_days,
              next.scheduled_days,
              next.reps,
              next.lapses,
              next.state,
              next.last_review,
              next.due,
              next.confidence,
            ]
          );
          await this.execute('UPDATE war_remediation_events SET applied_at = ? WHERE id = ?', [
            this.now().toISOString(),
            eventId,
          ]);
        }
        if (!answer.is_correct) {
          recommendations.push({
            conceptId,
            rating: mapped.fsrsRating,
            learnPath: `/concepts/${encodeURIComponent(conceptId)}`,
            drillPath: `/practice?concept=${encodeURIComponent(conceptId)}`,
          });
        }
      }
    }
    return recommendations;
  }

  async finalizeBlitzMatch(userId, matchId) {
    const existing = await this.execute('SELECT status FROM war_matches WHERE id = ?', [matchId]);
    if (existing.rows[0]?.status === 'complete') return this.privateResult(userId, matchId);
    const attempt = await this.attemptForUser(userId, matchId);
    if (!attempt) throw Object.assign(new Error('Match not found'), { code: 'not_found' });
    const snapshot = parseJson(attempt.content_snapshot_json, { questionIds: [] });
    const answerResult = await this.execute(
      'SELECT * FROM war_answers WHERE attempt_id = ? ORDER BY received_at ASC',
      [attempt.id]
    );
    const answersByQuestion = new Map(
      answerResult.rows.map((row) => [row.content_version_id, row])
    );
    for (const questionId of snapshot.questionIds) {
      if (!answersByQuestion.has(questionId)) {
        const unanswered = {
          id: this.id(),
          attempt_id: attempt.id,
          content_version_id: questionId,
          selected_option_id: null,
          is_correct: 0,
          response_ms: 0,
          operation_id: `${attempt.id}:${questionId}:expired`,
          received_at: this.now().toISOString(),
        };
        await this.execute(
          `INSERT INTO war_answers (
            id, attempt_id, content_version_id, selected_option_id, is_correct,
            response_ms, operation_id, received_at
          ) VALUES (?, ?, ?, NULL, 0, 0, ?, ?)
          ON CONFLICT(attempt_id, content_version_id) DO NOTHING`,
          [unanswered.id, attempt.id, questionId, unanswered.operation_id, unanswered.received_at]
        );
        answersByQuestion.set(questionId, unanswered);
      }
    }
    const humanAnswers = [...answersByQuestion.values()];
    const opponentResult = await this.execute(
      `SELECT p.*, o.id AS opponent_id, o.published_rating
       FROM war_participants p
       LEFT JOIN war_ai_opponents o ON o.id = p.ai_opponent_id
       WHERE p.match_id = ? AND p.participant_type != 'human'`,
      [matchId]
    );
    const opponent = opponentResult.rows[0];
    if (!opponent)
      throw Object.assign(new Error('Opponent snapshot is unavailable'), {
        code: 'opponent_unavailable',
      });
    const humanScore = {
      correctCount: humanAnswers.filter(({ is_correct }) => Boolean(is_correct)).length,
      qualifyingResponseMs: humanAnswers
        .filter(({ is_correct }) => Boolean(is_correct))
        .reduce((sum, { response_ms }) => sum + response_ms, 0),
    };
    let opponentScore;
    if (opponent.participant_type === 'ghost') {
      const ghostAnswers = await this.execute(
        `SELECT is_correct, response_ms FROM war_answers
         WHERE attempt_id = ? AND content_version_id IN (${snapshot.questionIds.map(() => '?').join(',')})`,
        [opponent.ghost_attempt_id, ...snapshot.questionIds]
      );
      opponentScore = {
        correctCount: ghostAnswers.rows.filter(({ is_correct }) => Boolean(is_correct)).length,
        qualifyingResponseMs: ghostAnswers.rows
          .filter(({ is_correct }) => Boolean(is_correct))
          .reduce((sum, { response_ms }) => sum + response_ms, 0),
      };
    } else {
      const benchmarkAnswers = aiAnswers.filter(
        ({ aiOpponentId, questionId }) =>
          aiOpponentId === opponent.opponent_id && snapshot.questionIds.includes(questionId)
      );
      opponentScore = {
        correctCount: benchmarkAnswers.filter((answer) => {
          const question = blitzQuestions.find(({ id }) => id === answer.questionId);
          return answer.selectedOptionId === question.correctOptionId;
        }).length,
        qualifyingResponseMs: 0,
        excludeResponseTime: true,
      };
    }
    const result = compareBlitzScores(humanScore, opponentScore);
    const finalizedAt = this.now().toISOString();
    await this.execute(
      `UPDATE war_participants SET status = 'complete', correct_count = ?,
        qualifying_response_ms = ?, score = ?, completed_at = ? WHERE id = ?`,
      [
        humanScore.correctCount,
        humanScore.qualifyingResponseMs,
        result === 'side_a' ? 1 : result === 'draw' ? 0.5 : 0,
        finalizedAt,
        attempt.participant_id,
      ]
    );
    await this.execute(
      `UPDATE war_participants SET correct_count = ?, score = ?, completed_at = ? WHERE id = ?`,
      [
        opponentScore.correctCount,
        result === 'side_b' ? 1 : result === 'draw' ? 0.5 : 0,
        finalizedAt,
        opponent.id,
      ]
    );
    await this.execute(
      `UPDATE war_attempts SET status = 'complete', completed_at = ?, updated_at = ?,
        is_ranked_ghost = CASE WHEN ? = 1 THEN 1 ELSE is_ranked_ghost END WHERE id = ?`,
      [finalizedAt, finalizedAt, attempt.ranked ? 1 : 0, attempt.id]
    );
    await this.execute(
      `UPDATE war_matches SET status = 'complete', result = ?, winner_participant_id = ?,
        finalized_at = ?, updated_at = ? WHERE id = ? AND status != 'complete'`,
      [
        result === 'draw' ? 'draw' : result,
        result === 'side_a' ? attempt.participant_id : result === 'side_b' ? opponent.id : null,
        finalizedAt,
        finalizedAt,
        matchId,
      ]
    );
    const completedChallenge = await this.execute(
      `UPDATE war_challenges SET status = 'completed', completed_at = ?
       WHERE accepted_match_id = ? AND status = 'accepted'`,
      [finalizedAt, matchId]
    );
    if (completedChallenge.rowsAffected > 0) {
      this.observe('challenge_complete', { matchId, mode: 'blitz' });
    }
    this.observe('match_complete', {
      matchId,
      mode: 'blitz',
      ranked: Boolean(attempt.ranked),
      outcome: result,
      opponentType: opponent.participant_type,
    });
    await this.applyRemediation(userId, matchId, humanAnswers);

    if (attempt.ranked) {
      const current = await this.ratingFor(userId, 'blitz');
      const rated = rateAiMatch({
        human: { rating: current.rating, rankedMatches: current.rankedMatches },
        aiRating: opponent.rating_snapshot ?? opponent.published_rating,
        result: result === 'side_a' ? 'human' : result === 'side_b' ? 'ai' : 'draw',
      });
      const outcomeColumn = result === 'side_a' ? 'wins' : result === 'side_b' ? 'losses' : 'draws';
      await this.execute(
        `INSERT INTO war_ratings (
          id, user_id, mode, rating, ranked_matches, wins, draws, losses, version
        ) VALUES (?, ?, 'blitz', ?, 1, ?, ?, ?, 1)
        ON CONFLICT(user_id, mode) DO UPDATE SET
          rating = excluded.rating,
          ranked_matches = war_ratings.ranked_matches + 1,
          ${outcomeColumn} = war_ratings.${outcomeColumn} + 1,
          version = war_ratings.version + 1,
          updated_at = datetime('now')`,
        [
          this.id(),
          userId,
          rated.human.afterRating,
          outcomeColumn === 'wins' ? 1 : 0,
          outcomeColumn === 'draws' ? 1 : 0,
          outcomeColumn === 'losses' ? 1 : 0,
        ]
      );
      const event = buildRatingEvent({
        id: this.id(),
        userId,
        matchId,
        mode: 'blitz',
        opponentType: opponent.participant_type === 'ghost' ? 'ghost' : 'ai',
        opponentRating: opponent.rating_snapshot ?? opponent.published_rating,
        calculation: rated.human,
        createdAt: finalizedAt,
      });
      await this.execute(
        `INSERT INTO war_rating_events (
          id, user_id, mode, match_id, event_type, before_rating, after_rating,
          score, opponent_type, opponent_rating_snapshot, algorithm_version, operation_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(operation_id) DO NOTHING`,
        [
          event.id,
          event.userId,
          event.mode,
          event.matchId,
          event.eventType,
          event.beforeRating,
          event.afterRating,
          event.score,
          event.opponentType,
          event.opponentRatingSnapshot,
          event.algorithmVersion,
          event.operationId,
          event.createdAt,
        ]
      );
    }
    return this.privateResult(userId, matchId);
  }

  async privateResult(userId, matchId) {
    const matchRows = await this.execute(
      `SELECT m.*, p.id AS participant_id, p.correct_count,
              p.qualifying_response_ms, p.score
       FROM war_matches m JOIN war_participants p ON p.match_id = m.id
       WHERE m.id = ? AND p.user_id = ?`,
      [matchId, userId]
    );
    const match = matchRows.rows[0];
    if (!match) throw Object.assign(new Error('Match not found'), { code: 'not_found' });
    const attemptRows = await this.execute('SELECT id FROM war_attempts WHERE participant_id = ?', [
      match.participant_id,
    ]);
    const answers = await this.execute(
      'SELECT * FROM war_answers WHERE attempt_id = ? ORDER BY received_at ASC',
      [attemptRows.rows[0]?.id]
    );
    const opponentRows = await this.execute(
      `SELECT display_name_snapshot, participant_type, correct_count, qualifying_response_ms
       FROM war_participants WHERE match_id = ? AND id != ? LIMIT 1`,
      [matchId, match.participant_id]
    );
    const ratingRows = await this.execute(
      `SELECT before_rating, after_rating FROM war_rating_events
       WHERE user_id = ? AND match_id = ? AND event_type = 'result'`,
      [userId, matchId]
    );
    const mistakes = answers.rows
      .filter(({ is_correct }) => !is_correct)
      .map((answer) => {
        const question = blitzQuestions.find(({ id }) => id === answer.content_version_id);
        return {
          questionId: question.id,
          question: question.stem,
          stem: question.stem,
          selectedOptionId: answer.selected_option_id,
          selectedAnswer: question.options.find(({ id }) => id === answer.selected_option_id)
            ?.label,
          correctOptionId: question.correctOptionId,
          correctAnswer: question.options.find(({ id }) => id === question.correctOptionId)?.label,
          explanation: question.explanation,
          options: question.options.map(({ id, label, explanation }) => ({
            id,
            label,
            explanation,
            isCorrect: id === question.correctOptionId,
            wasSelected: id === answer.selected_option_id,
          })),
          concepts: question.conceptIds,
          sources: question.sources,
        };
      });
    const weakness = new Map();
    for (const mistake of mistakes) {
      for (const conceptId of mistake.concepts)
        weakness.set(conceptId, (weakness.get(conceptId) ?? 0) + 1);
    }
    const ratingEvent = ratingRows.rows[0];
    return {
      matchId,
      mode: match.mode,
      ranked: Boolean(match.ranked),
      status: match.status,
      outcome: match.result === 'side_a' ? 'win' : match.result === 'side_b' ? 'loss' : 'draw',
      score: {
        correct: match.correct_count,
        total: match.question_count,
        responseMs: match.qualifying_response_ms,
      },
      opponent: {
        ...publicIdentity(opponentRows.rows[0]),
        correct: opponentRows.rows[0]?.correct_count ?? 0,
      },
      rating: ratingEvent
        ? {
            before: ratingEvent.before_rating,
            after: ratingEvent.after_rating,
            delta: ratingEvent.after_rating - ratingEvent.before_rating,
          }
        : null,
      mistakes,
      weaknesses: [...weakness.entries()].map(([conceptId, misses]) => ({
        conceptId,
        misses,
        learnPath: `/concepts/${encodeURIComponent(conceptId)}`,
        drillPath: `/practice?concept=${encodeURIComponent(conceptId)}`,
        reviewScheduled: true,
      })),
      shareSlug: match.public_slug,
      completedAt: match.finalized_at,
    };
  }

  async publicResult(publicSlug) {
    const result = await this.execute(
      `SELECT id, mode, ranked, status, result, question_count, finalized_at
       FROM war_matches WHERE public_slug = ? AND public_visibility != 'private'`,
      [publicSlug]
    );
    const match = result.rows[0];
    if (!match) return null;
    const participants = await this.execute(
      `SELECT side, display_name_snapshot, participant_type, correct_count, score
       FROM war_participants WHERE match_id = ? ORDER BY side`,
      [match.id]
    );
    return {
      mode: match.mode,
      ranked: Boolean(match.ranked),
      status: match.status,
      result: match.result,
      questionCount: match.question_count,
      participants: participants.rows.map((row) => ({
        side: row.side,
        displayName: row.display_name_snapshot,
        participantType: row.participant_type,
        correct: row.correct_count,
        score: row.score,
      })),
      finalizedAt: match.finalized_at,
    };
  }

  async setResultVisibility(userId, matchId, visibility = 'result') {
    const allowed = ['private', 'result', 'excerpt'].includes(visibility) ? visibility : 'result';
    const result = await this.execute(
      `UPDATE war_matches SET public_visibility = ?, updated_at = ?
       WHERE id = ? AND status = 'complete' AND EXISTS (
         SELECT 1 FROM war_participants p WHERE p.match_id = war_matches.id AND p.user_id = ?
       )`,
      [allowed, this.now().toISOString(), matchId, userId]
    );
    if (result.rowsAffected === 0)
      throw Object.assign(new Error('Match not found'), { code: 'not_found' });
    const row = await this.execute('SELECT public_slug FROM war_matches WHERE id = ?', [matchId]);
    if (allowed !== 'private') this.observe('rating_share', { matchId, visibility: allowed });
    return { visibility: allowed, shareSlug: row.rows[0].public_slug };
  }

  async history(userId, limit = 30) {
    const result = await this.execute(
      `SELECT m.id, m.mode, m.ranked, m.status, m.result, m.started_at, m.finalized_at,
              p.side, o.display_name_snapshot AS opponent_name,
              o.participant_type AS opponent_type,
              e.before_rating, e.after_rating
       FROM war_matches m
       JOIN war_participants p ON p.match_id = m.id AND p.user_id = ?
       JOIN war_participants o ON o.match_id = m.id AND o.id != p.id
       LEFT JOIN war_rating_events e ON e.match_id = m.id AND e.user_id = ? AND e.event_type = 'result'
       ORDER BY m.created_at DESC LIMIT ?`,
      [userId, userId, Math.max(1, Math.min(100, Number(limit) || 30))]
    );
    return result.rows.map((row) => ({
      id: row.id,
      mode: row.mode,
      ranked: Boolean(row.ranked),
      status: row.status,
      outcome:
        row.result === 'draw'
          ? 'draw'
          : row.result === row.side
            ? 'win'
            : row.result
              ? 'loss'
              : undefined,
      opponent: { displayName: row.opponent_name, participantType: row.opponent_type },
      startedAt: row.started_at,
      completedAt: row.finalized_at,
      ratingDelta: row.after_rating === null ? undefined : row.after_rating - row.before_rating,
    }));
  }

  async createChallenge(userId, input) {
    const idempotencyKey = String(input.idempotencyKey || '').slice(0, 128);
    if (!idempotencyKey)
      throw Object.assign(new Error('idempotencyKey is required'), { code: 'bad_request' });
    const token = await challengeToken(userId, idempotencyKey, this.env.JWT_SECRET);
    const existing = await this.execute(
      'SELECT id, token_hash, mode, status, expires_at FROM war_challenges WHERE creator_user_id = ? AND create_idempotency_key = ?',
      [userId, idempotencyKey]
    );
    if (existing.rows[0]) {
      const row = existing.rows[0];
      return {
        id: row.id,
        token,
        mode: row.mode,
        status: row.status,
        expiresAt: row.expires_at,
      };
    }
    const id = this.id();
    const tokenHash = await challengeTokenHash(token);
    const expiresAt = new Date(this.now().getTime() + 7 * 86_400_000).toISOString();
    await this.execute(
      `INSERT INTO war_challenges (
        id, token_hash, mode, creator_user_id, source_match_id, status,
        rules_json, expires_at, create_idempotency_key
      ) VALUES (?, ?, ?, ?, ?, 'open', ?, ?, ?)`,
      [
        id,
        tokenHash,
        input.mode ?? 'blitz',
        userId,
        input.sourceMatchId ?? null,
        JSON.stringify(input.rules ?? {}),
        expiresAt,
        idempotencyKey,
      ]
    );
    return { id, token, mode: input.mode ?? 'blitz', status: 'open', expiresAt };
  }

  async challengePreview(token) {
    const tokenHash = await challengeTokenHash(token);
    const result = await this.execute(
      `SELECT c.id, c.mode, c.status, c.expires_at, c.rules_json, u.name
       FROM war_challenges c JOIN users u ON u.id = c.creator_user_id
       WHERE c.token_hash = ?`,
      [tokenHash]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      mode: row.mode,
      status: row.status,
      expiresAt: row.expires_at,
      challenger: { displayName: row.name },
      rules: parseJson(row.rules_json, {}),
    };
  }

  async acceptChallenge(user, token, input = {}) {
    const tokenHash = await challengeTokenHash(token);
    const challengeRows = await this.execute(
      `SELECT * FROM war_challenges WHERE token_hash = ? AND expires_at > ?`,
      [tokenHash, this.now().toISOString()]
    );
    const challenge = challengeRows.rows[0];
    if (!challenge)
      throw Object.assign(new Error('Challenge not found or expired'), { code: 'not_found' });
    if (challenge.creator_user_id === user.id) {
      throw Object.assign(new Error('You cannot accept your own challenge'), {
        code: 'bad_request',
      });
    }
    if (challenge.status !== 'open') {
      if (challenge.recipient_user_id === user.id && challenge.accepted_match_id) {
        return challenge.mode === 'tradeoff'
          ? this.tradeoffRoom(user.id, challenge.accepted_match_id)
          : this.resumeBlitzMatch(user.id, challenge.accepted_match_id);
      }
      throw Object.assign(new Error('Challenge has already been accepted'), {
        code: 'bad_request',
      });
    }
    if (challenge.mode === 'tradeoff') {
      const acceptedAt = this.now().toISOString();
      const reserved = await this.execute(
        `UPDATE war_challenges SET recipient_user_id = ?, status = 'accepted', accepted_at = ?
         WHERE id = ? AND status = 'open'`,
        [user.id, acceptedAt, challenge.id]
      );
      if (reserved.rowsAffected === 0) {
        throw Object.assign(new Error('Challenge was accepted concurrently'), {
          code: 'opponent_unavailable',
        });
      }
      try {
        const rules = parseJson(challenge.rules_json, {});
        const room = await this.scheduleTradeoff(user, {
          opponentUserId: challenge.creator_user_id,
          ranked: Boolean(rules.ranked),
          problemVersionId: rules.problemVersionId,
          scheduledFor: rules.scheduledFor,
          idempotencyKey: `challenge:${challenge.id}`,
        });
        await this.execute(
          `UPDATE war_challenges SET accepted_match_id = ?
           WHERE id = ? AND recipient_user_id = ? AND status = 'accepted'`,
          [room.matchId, challenge.id, user.id]
        );
        this.observe('challenge_accept', {
          challengeId: challenge.id,
          matchId: room.matchId,
          mode: 'tradeoff',
        });
        return room;
      } catch (error) {
        await this.execute(
          `UPDATE war_challenges SET recipient_user_id = NULL, status = 'open', accepted_at = NULL
           WHERE id = ? AND recipient_user_id = ? AND accepted_match_id IS NULL`,
          [challenge.id, user.id]
        );
        throw error;
      }
    }
    if (challenge.mode !== 'blitz' || !challenge.source_match_id) {
      throw Object.assign(new Error('This challenge type is not yet acceptable'), {
        code: 'bad_request',
      });
    }
    const sourceRows = await this.execute(
      `SELECT m.*, a.id AS source_attempt_id, p.user_id AS source_user_id,
              p.display_name_snapshot, p.rating_snapshot
       FROM war_matches m
       JOIN war_participants p ON p.match_id = m.id AND p.user_id = m.created_by_user_id
       JOIN war_attempts a ON a.participant_id = p.id
       WHERE m.id = ? AND m.mode = 'blitz' AND m.status = 'complete'`,
      [challenge.source_match_id]
    );
    const source = sourceRows.rows[0];
    if (!source)
      throw Object.assign(new Error('The source battle is unavailable'), { code: 'not_found' });
    const snapshot = parseJson(source.content_snapshot_json, { questionIds: [] });
    const questions = snapshot.questionIds
      .map((id) => blitzQuestions.find((question) => question.id === id))
      .filter(Boolean);
    if (questions.length !== snapshot.questionIds.length) {
      throw Object.assign(new Error('The challenge content is no longer available'), {
        code: 'opponent_unavailable',
      });
    }
    const rules = parseJson(challenge.rules_json, {});
    const durationSeconds = Math.max(
      60,
      Math.min(120, Number(rules.durationSeconds) || source.duration_seconds)
    );
    const startedAt = this.now();
    const deadlineAt = new Date(startedAt.getTime() + durationSeconds * 1_000);
    const matchId = this.id();
    const participantId = this.id();
    const ghostParticipantId = this.id();
    const attemptId = this.id();
    const rating = await this.ratingFor(user.id, 'blitz');
    await this.execute(
      `INSERT INTO war_matches (
        id, mode, queue_type, ranked, status, rules_version, content_snapshot_json,
        duration_seconds, question_count, public_slug, created_by_user_id,
        create_idempotency_key, started_at, deadline_at
      ) VALUES (?, 'blitz', 'challenge', 0, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matchId,
        source.rules_version,
        source.content_snapshot_json,
        durationSeconds,
        questions.length,
        this.id(),
        user.id,
        String(input.idempotencyKey || `challenge:${challenge.id}`).slice(0, 128),
        startedAt.toISOString(),
        deadlineAt.toISOString(),
      ]
    );
    await this.execute(
      `INSERT INTO war_participants (
        id, match_id, side, participant_type, user_id, display_name_snapshot,
        rating_snapshot, status, joined_at
      ) VALUES (?, ?, 'side_a', 'human', ?, ?, ?, 'active', ?)`,
      [participantId, matchId, user.id, user.name, rating.rating, startedAt.toISOString()]
    );
    await this.execute(
      `INSERT INTO war_participants (
        id, match_id, side, participant_type, user_id, ghost_attempt_id,
        display_name_snapshot, rating_snapshot, status, joined_at
      ) VALUES (?, ?, 'side_b', 'ghost', ?, ?, ?, ?, 'complete', ?)`,
      [
        ghostParticipantId,
        matchId,
        source.source_user_id,
        source.source_attempt_id,
        source.display_name_snapshot,
        source.rating_snapshot,
        startedAt.toISOString(),
      ]
    );
    await this.execute(
      `INSERT INTO war_attempts (
        id, match_id, participant_id, status, question_order_json, started_at, deadline_at
      ) VALUES (?, ?, ?, 'active', ?, ?, ?)`,
      [
        attemptId,
        matchId,
        participantId,
        JSON.stringify(snapshot.questionIds),
        startedAt.toISOString(),
        deadlineAt.toISOString(),
      ]
    );
    const accepted = await this.execute(
      `UPDATE war_challenges SET recipient_user_id = ?, accepted_match_id = ?,
        status = 'accepted', accepted_at = ? WHERE id = ? AND status = 'open'`,
      [user.id, matchId, startedAt.toISOString(), challenge.id]
    );
    if (accepted.rowsAffected === 0) {
      throw Object.assign(new Error('Challenge was accepted concurrently'), {
        code: 'opponent_unavailable',
      });
    }
    this.observe('challenge_accept', {
      challengeId: challenge.id,
      matchId,
      mode: 'blitz',
    });
    return this.resumeBlitzMatch(user.id, matchId);
  }

  async submitReport(userId, matchId, input) {
    const content =
      blitzQuestions.find(({ id }) => id === input.contentVersionId) ??
      tradeoffProblems.find(({ id }) => id === input.contentVersionId);
    if (!content)
      throw Object.assign(new Error('Unknown content version'), { code: 'bad_request' });
    const participant = await this.execute(
      'SELECT id FROM war_participants WHERE match_id = ? AND user_id = ?',
      [matchId, userId]
    );
    if (!participant.rows[0])
      throw Object.assign(new Error('Match not found'), { code: 'not_found' });
    const operationId = String(input.idempotencyKey || '').slice(0, 128);
    await this.execute(
      `INSERT INTO war_content_reports (
        id, content_version_id, match_id, reporter_user_id, reason_code,
        details, operation_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(reporter_user_id, operation_id) DO NOTHING`,
      [
        this.id(),
        content.id,
        matchId,
        userId,
        input.reasonCode ?? 'other',
        String(input.details ?? '').slice(0, 2000),
        operationId,
      ]
    );
    return { accepted: true };
  }

  async scheduleTradeoff(user, input) {
    const launch = this.launchStatus();
    if (!launch.tradeoffPreviewEnabled) {
      throw Object.assign(new Error('Tradeoff preview is disabled'), { code: 'disabled' });
    }
    const ranked = Boolean(input.ranked);
    if (ranked && !launch.tradeoffRankedEnabled) {
      throw Object.assign(new Error('Ranked Tradeoff is not enabled by the operator'), {
        code: 'ranked_disabled',
      });
    }
    const idempotencyKey = String(input.idempotencyKey || '').slice(0, 128);
    if (!idempotencyKey)
      throw Object.assign(new Error('idempotencyKey is required'), { code: 'bad_request' });
    if (!input.opponentUserId || input.opponentUserId === user.id) {
      throw Object.assign(new Error('A different authenticated opponent is required'), {
        code: 'bad_request',
      });
    }
    const existing = await this.execute(
      'SELECT id FROM war_matches WHERE created_by_user_id = ? AND create_idempotency_key = ?',
      [user.id, idempotencyKey]
    );
    if (existing.rows[0]) return this.tradeoffRoom(user.id, existing.rows[0].id);
    const opponentRows = await this.execute('SELECT id, name FROM users WHERE id = ?', [
      input.opponentUserId,
    ]);
    const opponent = opponentRows.rows[0];
    if (!opponent) throw Object.assign(new Error('Opponent not found'), { code: 'not_found' });
    const activeProblems = loadActiveTradeoffProblems();
    const problem =
      activeProblems.find(({ id }) => id === input.problemVersionId) ??
      activeProblems[(Number(input.seed) || this.now().getUTCDate()) % activeProblems.length];
    await this.ensureTradeoffContentVersion(problem);

    const scheduledFor = input.scheduledFor
      ? new Date(input.scheduledFor)
      : new Date(this.now().getTime() + 5 * 60_000);
    if (
      !Number.isFinite(scheduledFor.getTime()) ||
      scheduledFor.getTime() < this.now().getTime() - 60_000
    ) {
      throw Object.assign(new Error('scheduledFor must be a valid future time'), {
        code: 'bad_request',
      });
    }
    const matchId = this.id();
    const sideAId = this.id();
    const sideBId = this.id();
    const sideARating = await this.ratingFor(user.id, 'tradeoff');
    const sideBRating = await this.ratingFor(opponent.id, 'tradeoff');
    await this.execute(
      `INSERT INTO war_matches (
        id, mode, queue_type, ranked, status, rules_version, content_snapshot_json,
        problem_version_id, duration_seconds, question_count, phase, phase_ends_at,
        public_slug, scheduled_for, created_by_user_id, create_idempotency_key
      ) VALUES (?, 'tradeoff', 'challenge', ?, 'scheduled', ?, ?, ?, 1800, 0,
        'scheduled', ?, ?, ?, ?, ?)`,
      [
        matchId,
        ranked ? 1 : 0,
        WAR_RULES_VERSION,
        JSON.stringify({
          problemVersionId: problem.id,
          phasePlanVersion: problem.phasePlanVersion,
        }),
        problem.id,
        scheduledFor.toISOString(),
        this.id(),
        scheduledFor.toISOString(),
        user.id,
        idempotencyKey,
      ]
    );
    await this.execute(
      `INSERT INTO war_participants (
        id, match_id, side, participant_type, user_id, display_name_snapshot,
        rating_snapshot, status
      ) VALUES (?, ?, 'side_a', 'human', ?, ?, ?, 'invited')`,
      [sideAId, matchId, user.id, user.name, sideARating.rating]
    );
    await this.execute(
      `INSERT INTO war_participants (
        id, match_id, side, participant_type, user_id, display_name_snapshot,
        rating_snapshot, status
      ) VALUES (?, ?, 'side_b', 'human', ?, ?, ?, 'invited')`,
      [sideBId, matchId, opponent.id, opponent.name, sideBRating.rating]
    );
    await this.execute(
      `INSERT INTO war_media_sessions (id, match_id, provider, status)
       VALUES (?, ?, ?, ?)`,
      [
        this.id(),
        matchId,
        launch.mediaConfigured ? 'realtimekit' : 'disabled',
        launch.mediaConfigured ? 'pending' : 'disabled',
      ]
    );
    return this.tradeoffRoom(user.id, matchId);
  }

  async tradeoffMembership(userId, matchId) {
    const result = await this.execute(
      `SELECT m.*, p.id AS participant_id, p.side, p.status AS participant_status,
              p.display_name_snapshot, o.display_name_snapshot AS opponent_name,
              ms.provider AS media_provider, ms.status AS media_status,
              ms.transcript_consent_a, ms.transcript_consent_b,
              ms.transcript_status, ms.transcript_retention_until
       FROM war_matches m
       JOIN war_participants p ON p.match_id = m.id AND p.user_id = ?
       JOIN war_participants o ON o.match_id = m.id AND o.id != p.id
       LEFT JOIN war_media_sessions ms ON ms.match_id = m.id
       WHERE m.id = ? AND m.mode = 'tradeoff'`,
      [userId, matchId]
    );
    return result.rows[0] ?? null;
  }

  async tradeoffRoom(userId, matchId) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    const snapshot = parseJson(membership.content_snapshot_json, {});
    const problem = tradeoffProblems.find(({ id }) => id === snapshot.problemVersionId);
    const promptVisible = !['scheduled', 'check_in'].includes(membership.phase);
    const twistVisible = !['scheduled', 'check_in', 'initial_solution'].includes(membership.phase);
    return {
      matchId,
      status: membership.status,
      phase: membership.phase,
      phaseEndsAt: membership.phase_ends_at,
      stateVersion: membership.state_version,
      ranked: Boolean(membership.ranked),
      scheduledFor: membership.scheduled_for,
      durationSeconds: membership.duration_seconds,
      participant: {
        id: membership.participant_id,
        side: membership.side,
        status: membership.participant_status,
      },
      opponent: { displayName: membership.opponent_name, participantType: 'human' },
      problem: {
        id: problem.id,
        title: problem.title,
        prompt: promptVisible ? problem.prompt : null,
        hiddenTwist: twistVisible ? problem.hiddenTwist : null,
        allowedTools: problem.allowedTools,
        allowedArtifacts: problem.allowedArtifacts,
      },
      media: {
        provider: membership.media_provider ?? 'disabled',
        status: membership.media_status ?? 'disabled',
        transcriptConsent: {
          sideA: Boolean(membership.transcript_consent_a),
          sideB: Boolean(membership.transcript_consent_b),
        },
      },
      serverNow: this.now().toISOString(),
    };
  }

  async checkInTradeoff(userId, matchId) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    if (!this.env.WARS_REALTIME_SIGNING_SECRET || !this.env.WARS_REALTIME) {
      throw Object.assign(new Error('Realtime control plane is not configured'), {
        code: 'disabled',
      });
    }
    const problem = tradeoffProblems.find(({ id }) => id === membership.problem_version_id);
    const now = this.now().toISOString();
    await this.execute(
      `UPDATE war_participants SET status = 'ready', joined_at = COALESCE(joined_at, ?)
       WHERE id = ?`,
      [now, membership.participant_id]
    );
    await this.execute(
      `UPDATE war_matches SET status = 'check_in', phase = 'check_in', updated_at = ?
       WHERE id = ? AND status = 'scheduled'`,
      [now, matchId]
    );
    const controlToken = await mintRealtimeToken(
      {
        matchId,
        userId,
        participantId: membership.participant_id,
        side: membership.side,
        scope: 'control',
      },
      this.env.WARS_REALTIME_SIGNING_SECRET,
      this.now()
    );
    const bootstrapResponse = await this.env.WARS_REALTIME.fetch(
      new Request(`https://software-wars.internal/internal/matches/${matchId}/bootstrap`, {
        method: 'POST',
        headers: { authorization: `Bearer ${controlToken}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt: problem.prompt,
          hiddenTwist: problem.hiddenTwist,
          scheduledFor: Date.parse(membership.scheduled_for),
        }),
      })
    );
    if (!bootstrapResponse.ok) {
      throw Object.assign(new Error('Realtime match bootstrap failed'), {
        code: 'realtime_unavailable',
      });
    }
    const participantToken = await mintRealtimeToken(
      {
        matchId,
        userId,
        participantId: membership.participant_id,
        side: membership.side,
        scope: 'participant',
      },
      this.env.WARS_REALTIME_SIGNING_SECRET,
      this.now()
    );
    return {
      room: await this.tradeoffRoom(userId, matchId),
      realtime: {
        token: participantToken,
        url: `${String(this.env.WARS_REALTIME_PUBLIC_URL ?? '').replace(/\/$/, '')}/matches/${matchId}/connect`,
        expiresInSeconds: 300,
      },
    };
  }

  async mediaAccess(userId, matchId) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    const provider = createMediaProvider(this.env);
    if (!provider.configured) {
      return { available: false, provider: 'disabled', reason: 'RealtimeKit is not configured' };
    }
    let sessionRows = await this.execute('SELECT * FROM war_media_sessions WHERE match_id = ?', [
      matchId,
    ]);
    let session = sessionRows.rows[0];
    if (!session) throw Object.assign(new Error('Media session not found'), { code: 'not_found' });
    if (!session.provider_meeting_id) {
      const claimed = await this.execute(
        `UPDATE war_media_sessions SET status = 'creating', updated_at = ?
         WHERE id = ? AND status = 'pending' AND provider_meeting_id IS NULL`,
        [this.now().toISOString(), session.id]
      );
      if (claimed.rowsAffected === 0) {
        throw Object.assign(new Error('Media room is being prepared; retry shortly'), {
          code: 'realtime_unavailable',
        });
      }
      try {
        const meeting = await provider.createMeeting({ matchId, transcriptionEnabled: false });
        await this.execute(
          `UPDATE war_media_sessions SET provider_meeting_id = ?, status = 'active', updated_at = ?
           WHERE id = ?`,
          [meeting.meetingId, this.now().toISOString(), session.id]
        );
      } catch (error) {
        await this.execute(
          `UPDATE war_media_sessions SET status = 'failed', updated_at = ? WHERE id = ?`,
          [this.now().toISOString(), session.id]
        );
        this.observe('media_failure', { matchId, stage: 'meeting_create', code: error?.code });
        throw error;
      }
      sessionRows = await this.execute('SELECT * FROM war_media_sessions WHERE id = ?', [
        session.id,
      ]);
      session = sessionRows.rows[0];
    }
    const enrolledRows = await this.execute(
      `SELECT * FROM war_media_participants WHERE media_session_id = ? AND participant_id = ?`,
      [session.id, membership.participant_id]
    );
    const enrolled = enrolledRows.rows[0];
    let participant;
    if (enrolled) {
      participant = await provider.refreshParticipantToken({
        meetingId: session.provider_meeting_id,
        providerParticipantId: enrolled.provider_participant_id,
      });
    } else {
      participant = await provider.addParticipant({
        meetingId: session.provider_meeting_id,
        participantId: membership.participant_id,
        displayName: membership.display_name_snapshot,
      });
      await this.execute(
        `INSERT INTO war_media_participants (
          id, media_session_id, participant_id, provider_participant_id, status
        ) VALUES (?, ?, ?, ?, 'enrolled')
        ON CONFLICT(media_session_id, participant_id) DO NOTHING`,
        [this.id(), session.id, membership.participant_id, participant.participantId]
      );
    }
    if (!participant.authToken)
      throw Object.assign(new Error('Provider returned no participant token'), {
        code: 'realtime_unavailable',
      });
    return {
      available: true,
      provider: 'realtimekit',
      authToken: participant.authToken,
      meetingId: session.provider_meeting_id,
      participantId: enrolled?.provider_participant_id ?? participant.participantId,
    };
  }

  async setTranscriptConsent(userId, matchId, consent) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    const sideColumn =
      membership.side === 'side_a' ? 'transcript_consent_a' : 'transcript_consent_b';
    await this.execute(
      `UPDATE war_media_sessions SET ${sideColumn} = ?, transcript_status = ?, updated_at = ?
       WHERE match_id = ?`,
      [consent ? 1 : 0, consent ? 'not_requested' : 'declined', this.now().toISOString(), matchId]
    );
    const rows = await this.execute('SELECT * FROM war_media_sessions WHERE match_id = ?', [
      matchId,
    ]);
    const session = rows.rows[0];
    const bothConsent =
      Boolean(session.transcript_consent_a) && Boolean(session.transcript_consent_b);
    if (bothConsent && session.provider === 'realtimekit' && session.provider_meeting_id) {
      await createMediaProvider(this.env).configureTranscription({
        meetingId: session.provider_meeting_id,
        enabled: true,
      });
      await this.execute(
        `UPDATE war_media_sessions SET transcript_status = 'requested', updated_at = ? WHERE id = ?`,
        [this.now().toISOString(), session.id]
      );
    }
    return {
      consent: {
        sideA: Boolean(session.transcript_consent_a),
        sideB: Boolean(session.transcript_consent_b),
      },
      transcriptionEnabled: bothConsent,
      videoRecordingEnabled: false,
    };
  }

  async ingestRealtimeKitWebhook(request) {
    const signature = request.headers.get('rtk-signature');
    const providerEventId = request.headers.get('rtk-uuid');
    if (!signature || !providerEventId) {
      throw Object.assign(new Error('Missing RealtimeKit webhook headers'), {
        code: 'bad_request',
      });
    }
    const rawBody = await request.arrayBuffer();
    const verified = await verifyRealtimeKitWebhook({ rawBody, signature });
    if (!verified)
      throw Object.assign(new Error('Invalid RealtimeKit signature'), { code: 'unauthorized' });
    const payloadText = new TextDecoder().decode(rawBody);
    const payloadHashBytes = await crypto.subtle.digest('SHA-256', rawBody);
    const payloadHash = [...new Uint8Array(payloadHashBytes)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    const event = JSON.parse(payloadText);
    const inserted = await this.execute(
      `INSERT INTO war_provider_events (
        id, provider, provider_event_id, event_type, payload_hash, status
      ) VALUES (?, 'realtimekit', ?, ?, ?, 'received')
      ON CONFLICT(provider, provider_event_id) DO NOTHING`,
      [this.id(), providerEventId, event.event ?? 'unknown', payloadHash]
    );
    if (inserted.rowsAffected === 0) return { accepted: true, duplicate: true };
    const meetingId = event.data?.meeting_id ?? event.data?.meetingId ?? event.meeting_id;
    const sessionRows = meetingId
      ? await this.execute('SELECT * FROM war_media_sessions WHERE provider_meeting_id = ?', [
          meetingId,
        ])
      : { rows: [] };
    const session = sessionRows.rows[0];
    const eventType = String(event.event ?? '').toLowerCase();
    const transcriptUrl = event.data?.download_url ?? event.data?.transcript_url ?? event.data?.url;
    if (session && eventType.includes('transcript') && transcriptUrl) {
      const consented =
        Boolean(session.transcript_consent_a) && Boolean(session.transcript_consent_b);
      if (consented && this.env.WAR_JOBS) {
        const operationId = `${providerEventId}:transcript-copy`;
        await this.env.WAR_JOBS.send({
          type: 'transcript_copy',
          matchId: session.match_id,
          mediaSessionId: session.id,
          sourceUrl: transcriptUrl,
          operationId,
        });
        await this.execute(
          `UPDATE war_media_sessions SET transcript_status = 'processing', updated_at = ? WHERE id = ?`,
          [this.now().toISOString(), session.id]
        );
      }
    }
    await this.execute(
      `UPDATE war_provider_events SET status = 'queued', processed_at = ?
       WHERE provider = 'realtimekit' AND provider_event_id = ?`,
      [this.now().toISOString(), providerEventId]
    );
    this.observe('provider_webhook', {
      provider: 'realtimekit',
      eventType,
      queuedTranscript: Boolean(session && eventType.includes('transcript') && transcriptUrl),
    });
    return { accepted: true, duplicate: false };
  }

  async saveTradeoffArtifact(userId, matchId, input) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    if (!['initial_solution', 'revision'].includes(membership.phase)) {
      throw Object.assign(new Error('Artifacts are frozen in the current phase'), { code: 'late' });
    }
    if (!['text', 'code', 'schema', 'pseudocode', 'diagram'].includes(input.artifactType)) {
      throw Object.assign(new Error('Unsupported artifact type'), { code: 'bad_request' });
    }
    const content =
      typeof input.content === 'string' ? input.content : JSON.stringify(input.content ?? '');
    const contentBytes = new TextEncoder().encode(content);
    if (contentBytes.byteLength > 2 * 1024 * 1024) {
      throw Object.assign(new Error('Artifact exceeds the 2 MiB limit'), { code: 'bad_request' });
    }
    const operationId = String(input.idempotencyKey || '').slice(0, 128);
    if (!operationId)
      throw Object.assign(new Error('idempotencyKey is required'), { code: 'bad_request' });
    const existing = await this.execute(
      `SELECT id, version, content_hash, size_bytes FROM war_artifacts
       WHERE participant_id = ? AND save_idempotency_key = ?`,
      [membership.participant_id, operationId]
    );
    if (existing.rows[0]) return { ...existing.rows[0], duplicate: true };
    const hashBytes = await crypto.subtle.digest('SHA-256', contentBytes);
    const contentHash = [...new Uint8Array(hashBytes)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    const versionRows = await this.execute(
      `SELECT COALESCE(MAX(version), 0) AS version FROM war_artifacts
       WHERE match_id = ? AND participant_id = ? AND artifact_type = ? AND phase = ?`,
      [matchId, membership.participant_id, input.artifactType, membership.phase]
    );
    const version = Number(versionRows.rows[0]?.version ?? 0) + 1;
    let inlineContent = content;
    let r2Key = null;
    if (contentBytes.byteLength > 64 * 1024) {
      if (!this.env.WAR_ARTIFACTS) {
        throw Object.assign(new Error('Large artifact storage is not configured'), {
          code: 'disabled',
        });
      }
      r2Key = `matches/${matchId}/participants/${membership.participant_id}/${membership.phase}/${input.artifactType}/v${version}-${contentHash}`;
      await this.env.WAR_ARTIFACTS.put(r2Key, contentBytes, {
        httpMetadata: {
          contentType:
            input.artifactType === 'diagram' ? 'application/json' : 'text/plain; charset=utf-8',
        },
        customMetadata: { matchId, participantId: membership.participant_id, contentHash },
      });
      inlineContent = null;
    }
    const artifactId = this.id();
    await this.execute(
      `INSERT INTO war_artifacts (
        id, match_id, participant_id, artifact_type, phase, version, status,
        inline_content, r2_key, content_hash, size_bytes, visibility, save_idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, 'owner', ?)`,
      [
        artifactId,
        matchId,
        membership.participant_id,
        input.artifactType,
        membership.phase,
        version,
        inlineContent,
        r2Key,
        contentHash,
        contentBytes.byteLength,
        operationId,
      ]
    );
    return {
      id: artifactId,
      version,
      contentHash,
      sizeBytes: contentBytes.byteLength,
      duplicate: false,
    };
  }

  async tradeoffArtifacts(userId, matchId) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    const revealed = [
      'reveal',
      'debate',
      'voting',
      'adjudicating',
      'complete',
      'review_required',
    ].includes(membership.phase);
    const rows = await this.execute(
      `SELECT a.*, p.side FROM war_artifacts a
       JOIN war_participants p ON p.id = a.participant_id
       WHERE a.match_id = ? AND (
         a.participant_id = ? OR (? = 1 AND a.status IN ('frozen', 'revealed'))
       )
       ORDER BY p.side, a.artifact_type, a.phase, a.version DESC`,
      [matchId, membership.participant_id, revealed ? 1 : 0]
    );
    const latest = new Map();
    for (const row of rows.rows) {
      const key = `${row.side}:${row.artifact_type}:${row.phase}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    const artifacts = [];
    for (const row of latest.values()) {
      let content = row.inline_content;
      if (!content && row.r2_key && this.env.WAR_ARTIFACTS) {
        const object = await this.env.WAR_ARTIFACTS.get(row.r2_key);
        content = object ? await object.text() : null;
      }
      artifacts.push({
        id: row.id,
        side: row.side,
        artifactType: row.artifact_type,
        phase: row.phase,
        version: row.version,
        status: row.status,
        content,
        contentHash: row.content_hash,
        sizeBytes: row.size_bytes,
        editable: row.participant_id === membership.participant_id && row.status === 'draft',
      });
    }
    return { revealed, artifacts };
  }

  async tradeoffResult(userId, matchId) {
    const membership = await this.tradeoffMembership(userId, matchId);
    if (!membership)
      throw Object.assign(new Error('Tradeoff match not found'), { code: 'not_found' });
    const [evaluationRows, ratingRows, remediationRows, artifacts] = await Promise.all([
      this.execute(
        `SELECT evaluation_type, status, evaluator_version, result_json, last_error_code
         FROM war_evaluations WHERE match_id = ? AND status IN ('valid', 'review_required')
         ORDER BY completed_at DESC LIMIT 1`,
        [matchId]
      ),
      this.execute(
        `SELECT before_rating, after_rating FROM war_rating_events
         WHERE user_id = ? AND match_id = ? AND event_type = 'result'`,
        [userId, matchId]
      ),
      this.execute(
        `SELECT concept_id, fsrs_rating, evidence_json FROM war_remediation_events
         WHERE user_id = ? AND match_id = ? ORDER BY created_at`,
        [userId, matchId]
      ),
      this.tradeoffArtifacts(userId, matchId),
    ]);
    const evaluationRow = evaluationRows.rows[0];
    const rawEvaluation = parseJson(evaluationRow?.result_json, {});
    const rating = ratingRows.rows[0];
    const result = membership.result;
    return {
      matchId,
      status: membership.status,
      phase: membership.phase,
      ranked: Boolean(membership.ranked),
      result,
      outcome:
        result === 'draw' ? 'draw' : result === membership.side ? 'win' : result ? 'loss' : null,
      opponent: { displayName: membership.opponent_name, participantType: 'human' },
      evaluation: evaluationRow
        ? {
            type: evaluationRow.evaluation_type,
            status: evaluationRow.status,
            evaluatorVersion: evaluationRow.evaluator_version,
            winner: rawEvaluation.winner ?? result ?? null,
            reasoning:
              evaluationRow.evaluation_type === 'ai_adjudication'
                ? (rawEvaluation.reasoning ?? null)
                : null,
            rubricScores:
              evaluationRow.evaluation_type === 'ai_adjudication'
                ? (rawEvaluation.rubricScores ?? [])
                : [],
            lastErrorCode: evaluationRow.last_error_code,
          }
        : null,
      rating: rating
        ? {
            before: rating.before_rating,
            after: rating.after_rating,
            delta: rating.after_rating - rating.before_rating,
          }
        : null,
      weaknesses: remediationRows.rows.map((row) => ({
        conceptId: row.concept_id,
        reviewRating: row.fsrs_rating,
        evidence: parseJson(row.evidence_json, {}),
        learnPath: `/concepts/${encodeURIComponent(row.concept_id)}`,
        drillPath: `/practice?concept=${encodeURIComponent(row.concept_id)}`,
      })),
      artifacts,
      transcript: {
        status: membership.transcript_status ?? 'not_requested',
        retainedUntil: membership.transcript_retention_until ?? null,
      },
      shareSlug: membership.public_slug,
      completedAt: membership.finalized_at,
    };
  }
}
