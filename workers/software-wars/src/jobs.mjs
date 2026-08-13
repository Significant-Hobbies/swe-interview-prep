import { tradeoffProblems } from '../../../shared/data/software-wars/index.mjs';
import { generate, parseJSON } from '../../../shared/lib/ai.mjs';
import { reviewConcept } from '../../../shared/lib/fsrs.mjs';
import {
  buildRatingEvent,
  rateHumanMatch,
} from '../../../shared/software-wars/competitive-elo.mjs';
import {
  mapTradeoffRemediation,
  resolveCompatibleVotes,
} from '../../../shared/software-wars/logic.mjs';

function uuid() {
  return crypto.randomUUID();
}

async function first(statement) {
  return statement.first();
}

export function validateAdjudication(value, rubric, conceptIds = []) {
  if (!value || !['side_a', 'side_b', 'draw'].includes(value.winner)) return null;
  if (typeof value.reasoning !== 'string' || value.reasoning.length < 20) return null;
  if (!Array.isArray(value.rubricScores) || value.rubricScores.length !== rubric.length)
    return null;
  const rubricIds = new Set(rubric.map(({ id }) => id));
  for (const score of value.rubricScores) {
    if (!rubricIds.has(score.criterionId)) return null;
    if (
      ![score.sideAScore, score.sideBScore].every(
        (entry) => Number.isFinite(entry) && entry >= 0 && entry <= 10
      )
    ) {
      return null;
    }
    if (typeof score.evidence !== 'string' || score.evidence.length < 5) return null;
  }
  if (!Array.isArray(value.conceptEvidence)) value.conceptEvidence = [];
  const allowedConcepts = new Set(conceptIds);
  for (const evidence of value.conceptEvidence) {
    if (!['side_a', 'side_b'].includes(evidence.side)) return null;
    if (!['strong', 'partial', 'missing', 'incorrect'].includes(evidence.strength)) return null;
    if (allowedConcepts.size > 0 && !allowedConcepts.has(evidence.conceptId)) return null;
  }
  return value;
}

export function buildAdjudicationPrompt({ problem, artifacts, votes, transcript }) {
  return JSON.stringify({
    problem: { title: problem.title, prompt: problem.prompt, hiddenTwist: problem.hiddenTwist },
    rubric: problem.rubric,
    artifacts,
    privateVotes: votes,
    transcript: transcript || null,
    requiredOutput: {
      winner: 'side_a | side_b | draw',
      reasoning: 'Evidence-based explanation',
      rubricScores: [
        {
          criterionId: 'rubric id',
          sideAScore: '0-10',
          sideBScore: '0-10',
          evidence: 'specific evidence',
        },
      ],
      conceptEvidence: [
        {
          side: 'side_a | side_b',
          conceptId: 'mapped concept',
          strength: 'strong | partial | missing | incorrect',
        },
      ],
    },
  });
}

async function ensureJob(env, job) {
  await env.DB.prepare(
    `INSERT INTO war_queue_jobs (id, match_id, job_type, operation_id, status, payload_json)
     VALUES (?, ?, ?, ?, 'pending', ?)
     ON CONFLICT(operation_id) DO NOTHING`
  )
    .bind(uuid(), job.matchId, job.type, job.operationId, JSON.stringify(job))
    .run();
  const claim = await env.DB.prepare(
    `UPDATE war_queue_jobs SET status = 'running', attempt_count = attempt_count + 1,
     updated_at = datetime('now') WHERE operation_id = ? AND status IN ('pending', 'failed')`
  )
    .bind(job.operationId)
    .run();
  return claim.meta.changes > 0;
}

async function completeJob(env, operationId) {
  await env.DB.prepare(
    `UPDATE war_queue_jobs SET status = 'complete', updated_at = datetime('now') WHERE operation_id = ?`
  )
    .bind(operationId)
    .run();
}

async function failJob(env, operationId, code) {
  await env.DB.prepare(
    `UPDATE war_queue_jobs SET status = 'failed', last_error_code = ?, updated_at = datetime('now')
     WHERE operation_id = ?`
  )
    .bind(code, operationId)
    .run();
}

export async function copyTranscriptJob(env, job, fetchImpl = fetch) {
  if (!(await ensureJob(env, job))) return { duplicate: true };
  try {
    const media = await first(
      env.DB.prepare('SELECT * FROM war_media_sessions WHERE id = ? AND match_id = ?').bind(
        job.mediaSessionId,
        job.matchId
      )
    );
    if (!media || !media.transcript_consent_a || !media.transcript_consent_b) {
      await failJob(env, job.operationId, 'consent_missing');
      return { skipped: true, reason: 'consent_missing' };
    }
    const source = new URL(job.sourceUrl);
    if (source.protocol !== 'https:') throw new Error('Transcript source must use HTTPS');
    const response = await fetchImpl(source, {
      headers: { accept: 'application/json, text/plain' },
    });
    if (!response.ok || !response.body)
      throw new Error(`Transcript download failed: ${response.status}`);
    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > 8 * 1024 * 1024)
      throw new Error('Transcript exceeds the 8 MiB retention limit');
    const r2Key = `matches/${job.matchId}/transcripts/${job.operationId}.json`;
    await env.WAR_ARTIFACTS.put(r2Key, response.body, {
      httpMetadata: { contentType: response.headers.get('content-type') || 'application/json' },
      customMetadata: { matchId: job.matchId, source: 'realtimekit' },
    });
    const retentionUntil = new Date(Date.now() + 30 * 86_400_000).toISOString();
    await env.DB.prepare(
      `UPDATE war_media_sessions SET transcript_status = 'ready', transcript_r2_key = ?,
       transcript_hash = ?, transcript_retention_until = ?, updated_at = datetime('now') WHERE id = ?`
    )
      .bind(r2Key, response.headers.get('etag') ?? job.operationId, retentionUntil, media.id)
      .run();
    await completeJob(env, job.operationId);
    return { copied: true, r2Key, retentionUntil };
  } catch (error) {
    await failJob(env, job.operationId, 'transcript_copy_failed');
    throw error;
  }
}

async function artifactEvidence(env, matchId) {
  const results = await env.DB.prepare(
    `SELECT p.side, a.artifact_type, a.inline_content, a.r2_key, a.content_hash
     FROM war_artifacts a JOIN war_participants p ON p.id = a.participant_id
     WHERE a.match_id = ? AND a.status IN ('frozen', 'revealed')
     ORDER BY p.side, a.phase, a.version DESC`
  )
    .bind(matchId)
    .all();
  const artifacts = [];
  for (const row of results.results) {
    let content = row.inline_content;
    if (!content && row.r2_key) {
      const object = await env.WAR_ARTIFACTS.get(row.r2_key);
      content = object ? await object.text() : null;
    }
    artifacts.push({
      side: row.side,
      artifactType: row.artifact_type,
      content: String(content ?? '').slice(0, 30_000),
      contentHash: row.content_hash,
    });
  }
  return artifacts;
}

async function transcriptEvidence(env, matchId) {
  const media = await first(
    env.DB.prepare(
      `SELECT transcript_r2_key FROM war_media_sessions
       WHERE match_id = ? AND transcript_status = 'ready'
       AND transcript_consent_a = 1 AND transcript_consent_b = 1`
    ).bind(matchId)
  );
  if (!media?.transcript_r2_key) return null;
  const object = await env.WAR_ARTIFACTS.get(media.transcript_r2_key);
  return object ? (await object.text()).slice(0, 40_000) : null;
}

export async function finalizeHumanRatings(env, match, winner) {
  if (!match.ranked) return;
  const participantsResult = await env.DB.prepare(
    `SELECT p.*, COALESCE(r.rating, 1500) AS current_rating,
            COALESCE(r.ranked_matches, 0) AS current_matches
     FROM war_participants p
     LEFT JOIN war_ratings r ON r.user_id = p.user_id AND r.mode = 'tradeoff'
     WHERE p.match_id = ? AND p.participant_type = 'human' ORDER BY p.side`
  )
    .bind(match.id)
    .all();
  const sideA = participantsResult.results.find(({ side }) => side === 'side_a');
  const sideB = participantsResult.results.find(({ side }) => side === 'side_b');
  const ratings = rateHumanMatch({
    sideA: { rating: sideA.current_rating, rankedMatches: sideA.current_matches },
    sideB: { rating: sideB.current_rating, rankedMatches: sideB.current_matches },
    result: winner,
  });
  for (const [participant, calculation, opponent] of [
    [sideA, ratings.sideA, sideB],
    [sideB, ratings.sideB, sideA],
  ]) {
    const event = buildRatingEvent({
      id: uuid(),
      userId: participant.user_id,
      matchId: match.id,
      mode: 'tradeoff',
      opponentType: 'human',
      opponentRating: opponent.current_rating,
      calculation,
      createdAt: new Date().toISOString(),
    });
    const outcome = calculation.score === 1 ? 'wins' : calculation.score === 0 ? 'losses' : 'draws';
    const eventExists = await first(
      env.DB.prepare('SELECT id FROM war_rating_events WHERE operation_id = ?').bind(
        event.operationId
      )
    );
    if (eventExists) continue;
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO war_rating_events (
          id, user_id, mode, match_id, event_type, before_rating, after_rating, score,
          opponent_type, opponent_rating_snapshot, algorithm_version, operation_id, created_at
        ) VALUES (?, ?, ?, ?, 'result', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        event.id,
        event.userId,
        event.mode,
        event.matchId,
        event.beforeRating,
        event.afterRating,
        event.score,
        event.opponentType,
        event.opponentRatingSnapshot,
        event.algorithmVersion,
        event.operationId,
        event.createdAt
      ),
      env.DB.prepare(
        `INSERT INTO war_ratings (id, user_id, mode, rating, ranked_matches, wins, draws, losses)
         VALUES (?, ?, 'tradeoff', ?, 1, ?, ?, ?)
         ON CONFLICT(user_id, mode) DO UPDATE SET rating = excluded.rating,
           ranked_matches = war_ratings.ranked_matches + 1,
           ${outcome} = war_ratings.${outcome} + 1,
           version = war_ratings.version + 1, updated_at = datetime('now')`
      ).bind(
        uuid(),
        participant.user_id,
        calculation.afterRating,
        outcome === 'wins' ? 1 : 0,
        outcome === 'draws' ? 1 : 0,
        outcome === 'losses' ? 1 : 0
      ),
    ]);
  }
}

async function applyTradeoffRemediation(env, matchId, conceptEvidence) {
  for (const evidence of conceptEvidence ?? []) {
    if (!['side_a', 'side_b'].includes(evidence.side)) continue;
    const rating = mapTradeoffRemediation(evidence.strength);
    if (!rating) continue;
    const participant = await first(
      env.DB.prepare('SELECT user_id FROM war_participants WHERE match_id = ? AND side = ?').bind(
        matchId,
        evidence.side
      )
    );
    if (!participant?.user_id) continue;
    const operationId = `${matchId}:${participant.user_id}:${evidence.conceptId}:tradeoff_rubric`;
    const inserted = await env.DB.prepare(
      `INSERT INTO war_remediation_events (
        id, user_id, match_id, concept_id, evidence_type, fsrs_rating, evidence_json, operation_id
      ) VALUES (?, ?, ?, ?, 'tradeoff_rubric', ?, ?, ?)
      ON CONFLICT(user_id, match_id, concept_id, evidence_type) DO NOTHING`
    )
      .bind(
        uuid(),
        participant.user_id,
        matchId,
        evidence.conceptId,
        rating,
        JSON.stringify(evidence),
        operationId
      )
      .run();
    if (inserted.meta.changes === 0) continue;
    const current = await first(
      env.DB.prepare('SELECT * FROM concept_mastery WHERE user_id = ? AND concept_id = ?').bind(
        participant.user_id,
        evidence.conceptId
      )
    );
    const next = reviewConcept(current ?? null, rating, new Date());
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO concept_mastery (
          id, user_id, concept_id, stability, difficulty, elapsed_days, scheduled_days,
          reps, lapses, state, last_review, due, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, concept_id) DO UPDATE SET
          stability = excluded.stability, difficulty = excluded.difficulty,
          elapsed_days = excluded.elapsed_days, scheduled_days = excluded.scheduled_days,
          reps = excluded.reps, lapses = excluded.lapses, state = excluded.state,
          last_review = excluded.last_review, due = excluded.due,
          confidence = excluded.confidence, updated_at = datetime('now')`
      ).bind(
        uuid(),
        participant.user_id,
        evidence.conceptId,
        next.stability,
        next.difficulty,
        next.elapsed_days,
        next.scheduled_days,
        next.reps,
        next.lapses,
        next.state,
        next.last_review,
        next.due,
        next.confidence
      ),
      env.DB.prepare(
        `UPDATE war_remediation_events SET applied_at = datetime('now') WHERE operation_id = ?`
      ).bind(operationId),
    ]);
  }
}

export async function adjudicateJob(env, job) {
  const claimed = await ensureJob(env, job);
  const existingEvaluation = await first(
    env.DB.prepare(
      `SELECT * FROM war_evaluations WHERE match_id = ? AND evaluation_type = 'ai_adjudication'
       AND evaluator_version = 'tradeoff-adjudicator-v1'`
    ).bind(job.matchId)
  );
  if (!claimed && existingEvaluation?.status === 'valid')
    return { duplicate: true, result: JSON.parse(existingEvaluation.result_json) };
  const match = await first(
    env.DB.prepare('SELECT * FROM war_matches WHERE id = ?').bind(job.matchId)
  );
  if (!match) throw new Error('Adjudication match not found');
  const problem = tradeoffProblems.find(({ id }) => id === match.problem_version_id);
  if (!problem) throw new Error('Adjudication problem snapshot not found');
  let evaluation = existingEvaluation;
  if (!evaluation) {
    const evidenceHash = `${match.id}:${match.state_version}:${problem.id}`;
    await env.DB.prepare(
      `INSERT INTO war_evaluations (
        id, match_id, evaluation_type, status, evaluator_version, rubric_version,
        evidence_hash, attempt_count, operation_id
      ) VALUES (?, ?, 'ai_adjudication', 'running', 'tradeoff-adjudicator-v1', ?, ?, 1, ?)`
    )
      .bind(uuid(), match.id, `${problem.id}:rubric-v1`, evidenceHash, job.operationId)
      .run();
    evaluation = await first(
      env.DB.prepare('SELECT * FROM war_evaluations WHERE operation_id = ?').bind(job.operationId)
    );
  }
  if (evaluation.status === 'valid') {
    const result = JSON.parse(evaluation.result_json);
    await finalizeHumanRatings(env, match, result.winner);
    return { duplicate: true, result };
  }
  const [artifacts, votesResult, transcript] = await Promise.all([
    artifactEvidence(env, match.id),
    env.DB.prepare(
      `SELECT p.side, v.vote FROM war_votes v JOIN war_participants p ON p.id = v.participant_id
       WHERE v.match_id = ? ORDER BY p.side`
    )
      .bind(match.id)
      .all(),
    transcriptEvidence(env, match.id),
  ]);
  const text = await generate({
    env,
    system:
      'You are a neutral engineering competition adjudicator. Evaluate only frozen evidence against the supplied rubric. Return strict JSON, cite specific artifact evidence, do not infer unstated implementation details, and choose draw when evidence is genuinely tied.',
    prompt: buildAdjudicationPrompt({ problem, artifacts, votes: votesResult.results, transcript }),
    maxTokens: 2_000,
  });
  const result = validateAdjudication(parseJSON(text), problem.rubric, problem.conceptIds);
  if (!result) throw new Error('Adjudicator returned an invalid rubric result');
  await env.DB.prepare(
    `UPDATE war_evaluations SET status = 'valid', result_json = ?, completed_at = datetime('now')
     WHERE id = ?`
  )
    .bind(JSON.stringify(result), evaluation.id)
    .run();
  await finalizeHumanRatings(env, match, result.winner);
  await applyTradeoffRemediation(env, match.id, result.conceptEvidence);
  await env.DB.prepare(
    `UPDATE war_matches SET status = 'complete', phase = 'complete', result = ?,
     finalized_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND status != 'complete'`
  )
    .bind(result.winner, match.id)
    .run();
  await env.DB.prepare(
    `UPDATE war_challenges SET status = 'completed', completed_at = datetime('now')
     WHERE accepted_match_id = ? AND status = 'accepted'`
  )
    .bind(match.id)
    .run();
  await completeJob(env, job.operationId);
  return { adjudicated: true, result };
}

export async function finalizeCompatibleVotesJob(env, job) {
  if (!(await ensureJob(env, job))) return { duplicate: true };
  const match = await first(
    env.DB.prepare('SELECT * FROM war_matches WHERE id = ?').bind(job.matchId)
  );
  if (!match) throw new Error('Tradeoff match not found');
  const votes = await env.DB.prepare(
    `SELECT p.side, v.vote FROM war_votes v JOIN war_participants p ON p.id = v.participant_id
     WHERE v.match_id = ? ORDER BY p.side`
  )
    .bind(job.matchId)
    .all();
  const sideA = votes.results.find(({ side }) => side === 'side_a')?.vote;
  const sideB = votes.results.find(({ side }) => side === 'side_b')?.vote;
  const winner = resolveCompatibleVotes(sideA, sideB);
  if (!winner) throw new Error('Votes require adjudication');
  await finalizeHumanRatings(env, match, winner);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO war_evaluations (
        id, match_id, evaluation_type, status, evaluator_version, rubric_version,
        evidence_hash, result_json, attempt_count, operation_id, completed_at
      ) VALUES (?, ?, 'player_votes', 'valid', 'private-votes-v1', 'private-votes-v1',
        ?, ?, 1, ?, datetime('now'))
      ON CONFLICT(operation_id) DO NOTHING`
    ).bind(
      uuid(),
      match.id,
      `${sideA}:${sideB}`,
      JSON.stringify({ winner, sideA, sideB }),
      job.operationId
    ),
    env.DB.prepare(
      `UPDATE war_matches SET status = 'complete', phase = 'complete', result = ?,
       finalized_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND status != 'complete'`
    ).bind(winner, match.id),
    env.DB.prepare(
      `UPDATE war_challenges SET status = 'completed', completed_at = datetime('now')
       WHERE accepted_match_id = ? AND status = 'accepted'`
    ).bind(match.id),
    env.DB.prepare(
      `UPDATE war_queue_jobs SET status = 'complete', updated_at = datetime('now') WHERE operation_id = ?`
    ).bind(job.operationId),
  ]);
  return { finalized: true, winner };
}

export async function markReviewRequired(env, job, errorCode = 'retries_exhausted') {
  await env.DB.batch([
    env.DB.prepare(
      `UPDATE war_evaluations SET status = 'review_required', last_error_code = ?
       WHERE match_id = ? AND evaluation_type = 'ai_adjudication'`
    ).bind(errorCode, job.matchId),
    env.DB.prepare(
      `UPDATE war_matches SET status = 'review_required', phase = 'review_required', updated_at = datetime('now')
       WHERE id = ? AND status != 'complete'`
    ).bind(job.matchId),
    env.DB.prepare(
      `UPDATE war_queue_jobs SET status = 'dead_letter', last_error_code = ?, updated_at = datetime('now')
       WHERE operation_id = ?`
    ).bind(errorCode, job.operationId),
  ]);
}
