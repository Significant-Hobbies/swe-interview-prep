import { describe, expect, it, vi } from 'vitest';
import { tradeoffProblems } from '../../../shared/data/software-wars/index.mjs';
import {
  buildAdjudicationPrompt,
  copyTranscriptJob,
  finalizeCompatibleVotesJob,
  validateAdjudication,
} from './jobs.mjs';

function transcriptEnv({ consent = true } = {}) {
  const jobs = new Map();
  const media = {
    id: 'media-1',
    match_id: 'match-1',
    transcript_consent_a: consent ? 1 : 0,
    transcript_consent_b: consent ? 1 : 0,
  };
  const put = vi.fn(async () => {});
  const DB = {
    prepare(sql) {
      let args = [];
      return {
        bind(...values) {
          args = values;
          return this;
        },
        async run() {
          if (sql.includes('INSERT INTO war_queue_jobs')) {
            const [, , jobType, operationId] = args;
            if (!jobs.has(operationId)) jobs.set(operationId, { status: 'pending', jobType });
            return { meta: { changes: 1 } };
          }
          if (sql.includes("SET status = 'running'")) {
            const job = jobs.get(args[0]);
            const changed = job && ['pending', 'failed'].includes(job.status);
            if (changed) job.status = 'running';
            return { meta: { changes: changed ? 1 : 0 } };
          }
          if (sql.includes("SET status = 'complete'")) {
            jobs.get(args[0]).status = 'complete';
            return { meta: { changes: 1 } };
          }
          if (sql.includes("SET status = 'failed'")) {
            jobs.get(args[1]).status = 'failed';
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE war_media_sessions')) {
            media.transcript_status = 'ready';
            media.transcript_r2_key = args[0];
            return { meta: { changes: 1 } };
          }
          throw new Error(`Unhandled transcript test query: ${sql}`);
        },
        async first() {
          if (sql.includes('FROM war_media_sessions')) {
            return args[0] === media.id && args[1] === media.match_id ? media : null;
          }
          return null;
        },
      };
    },
  };
  return { env: { DB, WAR_ARTIFACTS: { put } }, jobs, media, put };
}

function compatibleVoteEnv() {
  const jobs = new Map();
  const match = { id: 'match-votes', ranked: 0, status: 'voting', result: null };
  const challenge = { status: 'accepted' };
  const evaluations = [];
  const DB = {
    prepare(sql) {
      let args = [];
      const statement = {
        sql,
        bind(...values) {
          args = values;
          return this;
        },
        async run() {
          if (sql.includes('INSERT INTO war_queue_jobs')) {
            const operationId = args[3];
            if (!jobs.has(operationId)) jobs.set(operationId, { status: 'pending' });
            return { meta: { changes: 1 } };
          }
          if (sql.includes("SET status = 'running'")) {
            const job = jobs.get(args[0]);
            const changed = job && ['pending', 'failed'].includes(job.status);
            if (changed) job.status = 'running';
            return { meta: { changes: changed ? 1 : 0 } };
          }
          if (sql.includes('INSERT INTO war_evaluations')) {
            evaluations.push(args[3]);
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE war_matches')) {
            match.status = 'complete';
            match.result = args[0];
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE war_challenges')) {
            challenge.status = 'completed';
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE war_queue_jobs')) {
            jobs.get(args[0]).status = 'complete';
            return { meta: { changes: 1 } };
          }
          throw new Error(`Unhandled compatible-vote query: ${sql}`);
        },
        async first() {
          return sql.includes('FROM war_matches') ? match : null;
        },
        async all() {
          if (sql.includes('FROM war_votes')) {
            return {
              results: [
                { side: 'side_a', vote: 'win' },
                { side: 'side_b', vote: 'loss' },
              ],
            };
          }
          return { results: [] };
        },
      };
      return statement;
    },
    async batch(statements) {
      return Promise.all(statements.map((statement) => statement.run()));
    },
  };
  return { env: { DB }, jobs, match, challenge, evaluations };
}

describe('versioned Tradeoff adjudication schema', () => {
  const problem = tradeoffProblems[0];

  it('accepts a complete rubric-grounded result', () => {
    const result = {
      winner: 'side_a',
      reasoning: 'Side A addresses the partition invariant with bounded overshoot.',
      rubricScores: problem.rubric.map(({ id }) => ({
        criterionId: id,
        sideAScore: 8,
        sideBScore: 6,
        evidence: 'The frozen artifact states a concrete invariant.',
      })),
      conceptEvidence: [{ side: 'side_a', conceptId: 'rate-limiting', strength: 'strong' }],
    };
    expect(validateAdjudication(result, problem.rubric)).toEqual(result);
  });

  it('rejects invented winners and incomplete rubric evidence', () => {
    expect(
      validateAdjudication(
        { winner: 'both', reasoning: 'not valid', rubricScores: [] },
        problem.rubric
      )
    ).toBeNull();
  });

  it('freezes the exact prompt, twist, artifacts, votes, and output contract', () => {
    const prompt = JSON.parse(
      buildAdjudicationPrompt({
        problem,
        artifacts: [{ side: 'side_a', contentHash: 'hash', content: 'design' }],
        votes: [{ side: 'side_a', vote: 'win' }],
        transcript: null,
      })
    );
    expect(prompt.problem.hiddenTwist).toBe(problem.hiddenTwist);
    expect(prompt.artifacts[0].contentHash).toBe('hash');
    expect(prompt.requiredOutput.winner).toContain('draw');
  });

  it('copies a consented transcript exactly once across duplicate queue delivery', async () => {
    const { env, jobs, put } = transcriptEnv();
    const job = {
      type: 'transcript_copy',
      matchId: 'match-1',
      mediaSessionId: 'media-1',
      sourceUrl: 'https://media.example.test/transcript.json',
      operationId: 'copy-1',
    };
    const fetchImpl = vi.fn(
      async () =>
        new Response('{"turns":[]}', {
          headers: { 'content-type': 'application/json', 'content-length': '12', etag: 'hash' },
        })
    );
    await expect(copyTranscriptJob(env, job, fetchImpl)).resolves.toMatchObject({ copied: true });
    await expect(copyTranscriptJob(env, job, fetchImpl)).resolves.toEqual({ duplicate: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledTimes(1);
    expect(jobs.get('copy-1').status).toBe('complete');
  });

  it('fails closed without bilateral consent and permits a later retry', async () => {
    const { env, jobs, media, put } = transcriptEnv({ consent: false });
    const job = {
      type: 'transcript_copy',
      matchId: 'match-1',
      mediaSessionId: 'media-1',
      sourceUrl: 'https://media.example.test/transcript.json',
      operationId: 'copy-consent',
    };
    const fetchImpl = vi.fn(async () => new Response('{}'));
    await expect(copyTranscriptJob(env, job, fetchImpl)).resolves.toEqual({
      skipped: true,
      reason: 'consent_missing',
    });
    expect(put).not.toHaveBeenCalled();
    expect(jobs.get('copy-consent').status).toBe('failed');

    media.transcript_consent_a = 1;
    media.transcript_consent_b = 1;
    await expect(copyTranscriptJob(env, job, fetchImpl)).resolves.toMatchObject({ copied: true });
    expect(put).toHaveBeenCalledTimes(1);
  });

  it('finalizes compatible private votes exactly once', async () => {
    const { env, match, challenge, evaluations } = compatibleVoteEnv();
    const job = {
      type: 'finalize_tradeoff',
      matchId: match.id,
      operationId: 'votes-finalize-1',
    };
    await expect(finalizeCompatibleVotesJob(env, job)).resolves.toEqual({
      finalized: true,
      winner: 'side_a',
    });
    await expect(finalizeCompatibleVotesJob(env, job)).resolves.toEqual({ duplicate: true });
    expect(match).toMatchObject({ status: 'complete', result: 'side_a' });
    expect(challenge.status).toBe('completed');
    expect(evaluations).toHaveLength(1);
  });
});
