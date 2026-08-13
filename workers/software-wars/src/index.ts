import { DurableObject } from 'cloudflare:workers';
import { verifyRealtimeToken } from '../../../shared/software-wars/realtime-token.mjs';
import {
  advanceTradeoffState,
  applyTradeoffCommand,
  initialTradeoffState,
  visibleTradeoffState,
} from './tradeoff-state.mjs';
import {
  adjudicateJob,
  copyTranscriptJob,
  finalizeCompatibleVotesJob,
  markReviewRequired,
} from './jobs.mjs';

type TradeoffSide = 'side_a' | 'side_b';

function structuredLog(
  level: 'info' | 'error',
  message: string,
  data: Record<string, unknown> = {}
) {
  const payload = { level, message, timestamp: new Date().toISOString(), ...data };
  if (level === 'error') console.error(JSON.stringify(payload));
  else console.log(JSON.stringify(payload));
}

function resolveVotes(votes: Partial<Record<TradeoffSide, string>>) {
  if (votes.side_a === 'draw' && votes.side_b === 'draw') return 'draw';
  if (votes.side_a === 'win' && votes.side_b === 'loss') return 'side_a';
  if (votes.side_a === 'loss' && votes.side_b === 'win') return 'side_b';
  return null;
}

export class TradeoffMatch extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS _sql_schema_migrations (
          id INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS match_state (
          singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
          state_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS match_events (
          cursor INTEGER PRIMARY KEY,
          type TEXT NOT NULL,
          side TEXT,
          payload_json TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS processed_operations (
          operation_id TEXT PRIMARY KEY,
          side TEXT NOT NULL,
          command_type TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        INSERT OR IGNORE INTO _sql_schema_migrations (id) VALUES (1);
      `);
    });
    // Cloudflare runtime global; generated Worker types provide the declaration.
    // biome-ignore lint/correctness/noUndeclaredVariables: runtime WebSocket hibernation primitive
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  private loadState(): any | null {
    const rows = this.ctx.storage.sql
      .exec<{ state_json: string }>('SELECT state_json FROM match_state WHERE singleton = 1')
      .toArray();
    return rows[0] ? JSON.parse(rows[0].state_json) : null;
  }

  private saveState(state: any, eventType: string, side: TradeoffSide | null, payload: unknown) {
    const nowMs = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO match_state (singleton, state_json, updated_at) VALUES (1, ?, ?)
       ON CONFLICT(singleton) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`,
      JSON.stringify(state),
      nowMs
    );
    this.ctx.storage.sql.exec(
      `INSERT OR REPLACE INTO match_events (cursor, type, side, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      state.eventCursor,
      eventType,
      side,
      JSON.stringify(payload ?? {}),
      nowMs
    );
  }

  private async scheduleDeadline(state: any) {
    if (typeof state.phaseEndsAt === 'number') await this.ctx.storage.setAlarm(state.phaseEndsAt);
    else await this.ctx.storage.deleteAlarm();
  }

  private snapshotFor(side: TradeoffSide) {
    const state = this.loadState();
    return state ? visibleTradeoffState(state, side, Date.now()) : null;
  }

  private sendSnapshot(webSocket: WebSocket, type = 'state') {
    const attachment = webSocket.deserializeAttachment() as { side: TradeoffSide } | null;
    if (!attachment) return;
    webSocket.send(JSON.stringify({ type, state: this.snapshotFor(attachment.side) }));
  }

  private broadcast(type = 'state') {
    for (const webSocket of this.ctx.getWebSockets()) this.sendSnapshot(webSocket, type);
  }

  async bootstrap(input: {
    matchId: string;
    prompt: string;
    hiddenTwist: string;
    scheduledFor?: number;
  }) {
    const existing = this.loadState();
    if (existing) return visibleTradeoffState(existing, 'side_a', Date.now());
    const nowMs =
      input.scheduledFor && input.scheduledFor > Date.now() ? input.scheduledFor : Date.now();
    const state = initialTradeoffState({
      matchId: input.matchId,
      prompt: input.prompt,
      hiddenTwist: input.hiddenTwist,
      nowMs,
    });
    this.saveState(state, 'bootstrapped', null, { scheduledFor: input.scheduledFor ?? null });
    await this.scheduleDeadline(state);
    return visibleTradeoffState(state, 'side_a', Date.now());
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return Response.json({ error: 'WebSocket upgrade required' }, { status: 426 });
    }
    const userId = request.headers.get('x-wars-user-id');
    const participantId = request.headers.get('x-wars-participant-id');
    const side = request.headers.get('x-wars-side') as TradeoffSide | null;
    if (!userId || !participantId || !['side_a', 'side_b'].includes(side ?? '')) {
      return Response.json({ error: 'Invalid participant scope' }, { status: 403 });
    }
    if (!this.loadState())
      return Response.json({ error: 'Match has not been bootstrapped' }, { status: 409 });

    // Cloudflare runtime global; generated Worker types provide the declaration.
    // biome-ignore lint/correctness/noUndeclaredVariables: runtime WebSocket upgrade primitive
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.serializeAttachment({ userId, participantId, side });
    this.ctx.acceptWebSocket(server, [`side:${side}`, `participant:${participantId}`]);
    this.sendSnapshot(server, 'connected');
    this.broadcast('presence');
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(webSocket: WebSocket, message: ArrayBuffer | string) {
    if (typeof message !== 'string' || message.length > 16_384) {
      webSocket.send(JSON.stringify({ type: 'error', code: 'invalid_message' }));
      return;
    }
    const attachment = webSocket.deserializeAttachment() as {
      userId: string;
      participantId: string;
      side: TradeoffSide;
    } | null;
    if (!attachment) return;
    let command: any;
    try {
      command = JSON.parse(message);
    } catch {
      webSocket.send(JSON.stringify({ type: 'error', code: 'invalid_json' }));
      return;
    }
    if (!command.operationId || typeof command.expectedStateVersion !== 'number') {
      webSocket.send(JSON.stringify({ type: 'error', code: 'invalid_command' }));
      return;
    }
    const duplicate = this.ctx.storage.sql
      .exec<{ operation_id: string }>(
        'SELECT operation_id FROM processed_operations WHERE operation_id = ?',
        command.operationId
      )
      .toArray()[0];
    if (duplicate) {
      this.sendSnapshot(webSocket, 'duplicate_ack');
      return;
    }
    let state = this.loadState();
    if (!state) return;
    const advanced = advanceTradeoffState(state, Date.now());
    if (advanced.stateVersion !== state.stateVersion) {
      state = advanced;
      this.saveState(state, 'phase_advanced', null, { phase: state.phase });
      await this.scheduleDeadline(state);
    }
    const result = applyTradeoffCommand(state, command, {
      side: attachment.side,
      nowMs: Date.now(),
    });
    if (!result.accepted) {
      webSocket.send(
        JSON.stringify({
          type: 'error',
          code: result.code,
          state: this.snapshotFor(attachment.side),
        })
      );
      return;
    }
    this.ctx.storage.sql.exec(
      `INSERT INTO processed_operations (operation_id, side, command_type, created_at)
       VALUES (?, ?, ?, ?)`,
      command.operationId,
      attachment.side,
      command.type,
      Date.now()
    );
    state = result.state;
    if (command.type === 'vote') {
      await this.env.DB.prepare(
        `INSERT INTO war_votes (id, match_id, participant_id, vote, operation_id)
         VALUES (?, ?, ?, ?, ?) ON CONFLICT(match_id, participant_id) DO NOTHING`
      )
        .bind(
          crypto.randomUUID(),
          state.matchId,
          attachment.participantId,
          command.vote,
          command.operationId
        )
        .run();
    }
    if (state.phase === 'voting' && state.votes.side_a && state.votes.side_b) {
      const outcome = resolveVotes(state.votes);
      state = {
        ...state,
        phase: outcome ? 'complete' : 'adjudicating',
        phaseEndsAt: null,
        result: outcome,
        stateVersion: state.stateVersion + 1,
        eventCursor: state.eventCursor + 1,
      };
    }
    this.saveState(state, command.type, attachment.side, { operationId: command.operationId });
    await this.scheduleDeadline(state);
    if (state.phase !== 'complete') await this.projectLiveState(state);
    this.broadcast(command.type);
    if (state.phase === 'adjudicating') {
      await this.env.WAR_JOBS.send({
        type: 'adjudication',
        matchId: state.matchId,
        operationId: `${state.matchId}:adjudication:v1`,
      });
    }
    if (state.phase === 'complete') {
      await this.env.WAR_JOBS.send({
        type: 'finalize_tradeoff',
        matchId: state.matchId,
        operationId: `${state.matchId}:private-votes:v1`,
      });
    }
  }

  async webSocketClose(_webSocket: WebSocket, _code: number, _reason: string, _wasClean: boolean) {
    this.broadcast('presence');
  }

  async alarm() {
    const current = this.loadState();
    if (!current) return;
    const advanced = advanceTradeoffState(current, Date.now());
    if (advanced.stateVersion === current.stateVersion) {
      await this.scheduleDeadline(current);
      return;
    }
    this.saveState(advanced, 'phase_advanced', null, { phase: advanced.phase });
    await this.scheduleDeadline(advanced);
    if (advanced.phase !== 'complete') await this.projectLiveState(advanced);
    this.broadcast('phase_advanced');
    if (advanced.phase === 'adjudicating') {
      await this.env.WAR_JOBS.send({
        type: 'adjudication',
        matchId: advanced.matchId,
        operationId: `${advanced.matchId}:adjudication:v1`,
      });
    }
  }

  private async projectLiveState(state: any) {
    await this.env.DB.prepare(
      `UPDATE war_matches SET status = ?, phase = ?, phase_ends_at = ?,
       state_version = ?, updated_at = datetime('now') WHERE id = ?`
    )
      .bind(
        state.phase === 'initial_solution' ? 'active' : state.phase,
        state.phase,
        typeof state.phaseEndsAt === 'number' ? new Date(state.phaseEndsAt).toISOString() : null,
        state.stateVersion,
        state.matchId
      )
      .run();
    if (state.phase === 'twist') {
      await this.env.DB.prepare(
        `UPDATE war_artifacts SET status = 'frozen', frozen_at = datetime('now')
         WHERE match_id = ? AND phase = 'initial_solution' AND status = 'draft'`
      )
        .bind(state.matchId)
        .run();
    }
    if (state.phase === 'reveal') {
      await this.env.DB.prepare(
        `UPDATE war_artifacts SET status = 'revealed', visibility = 'participants',
         frozen_at = COALESCE(frozen_at, datetime('now')), revealed_at = datetime('now')
         WHERE match_id = ? AND phase = 'revision' AND status IN ('draft', 'frozen')`
      )
        .bind(state.matchId)
        .run();
    }
  }
}

async function workerFetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const connect = url.pathname.match(/^\/matches\/([^/]+)\/connect$/);
  if (connect) {
    const token =
      url.searchParams.get('token') ??
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const claims = await verifyRealtimeToken(token, env.WARS_REALTIME_SIGNING_SECRET);
    if (!claims || claims.matchId !== connect[1]) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const stub = env.TRADEOFF_MATCH.getByName(claims.matchId);
    const headers = new Headers(request.headers);
    headers.set('x-wars-user-id', claims.userId);
    headers.set('x-wars-participant-id', claims.participantId);
    headers.set('x-wars-side', claims.side);
    return stub.fetch(new Request(request, { headers }));
  }

  const bootstrap = url.pathname.match(/^\/internal\/matches\/([^/]+)\/bootstrap$/);
  if (bootstrap && request.method === 'POST') {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const claims = await verifyRealtimeToken(token, env.WARS_REALTIME_SIGNING_SECRET);
    if (!claims || claims.matchId !== bootstrap[1] || claims.scope !== 'control') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json<{
      prompt: string;
      hiddenTwist: string;
      scheduledFor?: number;
    }>();
    if (!body.prompt || !body.hiddenTwist)
      return Response.json({ error: 'Invalid bootstrap' }, { status: 400 });
    const state = await env.TRADEOFF_MATCH.getByName(claims.matchId).bootstrap({
      matchId: claims.matchId,
      prompt: body.prompt,
      hiddenTwist: body.hiddenTwist,
      scheduledFor: body.scheduledFor,
    });
    return Response.json({ ok: true, state });
  }

  if (url.pathname === '/health')
    return Response.json({ ok: true, service: 'software-wars-realtime' });
  return Response.json({ error: 'Not found' }, { status: 404 });
}

export default {
  async fetch(request, env): Promise<Response> {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();
    try {
      const response = await workerFetch(request, env);
      structuredLog('info', 'wars_worker_request', {
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
      return response;
    } catch (error) {
      structuredLog('error', 'wars_worker_failure', {
        requestId,
        path: new URL(request.url).pathname,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      });
      return Response.json({ error: 'Service unavailable' }, { status: 503 });
    }
  },
  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const job = message.body as { type: string; matchId: string; operationId: string };
        let result: any;
        if (job.type === 'transcript_copy') result = await copyTranscriptJob(env, job);
        else if (job.type === 'adjudication') result = await adjudicateJob(env, job);
        else if (job.type === 'finalize_tradeoff')
          result = await finalizeCompatibleVotesJob(env, job);
        else throw new Error(`Unknown Wars job type: ${job.type}`);
        structuredLog('info', 'wars_queue_complete', {
          messageId: message.id,
          matchId: job.matchId,
          jobType: job.type,
          duplicate: Boolean(result?.duplicate),
          outcome: result?.winner ?? result?.result?.winner ?? null,
        });
        message.ack();
      } catch (error) {
        structuredLog('error', 'wars_queue_failure', {
          messageId: message.id,
          error: error instanceof Error ? error.message : String(error),
        });
        if (message.attempts >= 5) {
          await markReviewRequired(env, message.body, 'retries_exhausted');
          message.ack();
        } else {
          message.retry();
        }
      }
    }
  },
} satisfies ExportedHandler<Env>;
