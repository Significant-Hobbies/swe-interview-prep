import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

// ─────────────────────────────────────────────────────────────────────────
// Dev-only local AI bridge (replaces the former `local-ai` git submodule).
//
// A browser SPA can't spawn a CLI, so dev needs a local HTTP→process bridge.
// Rather than depend on a separate server/submodule, we mount it directly on
// Vite's dev server (`apply: 'serve'`), so it boots/dies with `vite`, adds no
// proxy hop, and ships nothing to production (prod uses functions/api/[[path]].js).
//
// Routes (all under /api):
//   POST /chat                       stream a CLI tool over SSE (claude|codex|gemini).
//                                    codex only: send `threadId` (null→new session,
//                                    string→resume) for multi-turn; bridge echoes
//                                    back `{threadId}` so the client can resume.
//   GET  /health                     liveness + provider list
//   GET/PUT  /progress               in-memory dev store (single local user)
//   GET/POST /notes                  in-memory dev store
//   GET/POST/DELETE /chats           in-memory dev store
//   GET  /auth/verify                always 401 (guest in dev)
//   POST /auth/logout                no-op
// ─────────────────────────────────────────────────────────────────────────

// ── CLI tool registry ──────────────────────────────────────────────────────
const CLI_TOOLS = {
  claude: {
    command: 'claude',
    buildArgs: (model, systemPrompt) => {
      const args = ['-p', '--output-format', 'stream-json', '--verbose'];
      if (model) args.push('--model', model);
      if (systemPrompt) args.push('--system-prompt', systemPrompt);
      return args;
    },
    inputMode: 'stdin',
    embedSystemPrompt: false,
    supportsImages: false,
    parseStream: (line, emit) => {
      const json = JSON.parse(line);
      if (json.type === 'assistant' && json.message?.content) {
        for (const block of json.message.content) {
          if (block.type === 'text' && block.text) emit(block.text);
        }
        return;
      }
      if (json.type === 'content_block_delta' && json.delta?.text) emit(json.delta.text);
    },
  },

  codex: {
    command: 'codex',
    // Run as a fast, read-only chat assistant — not an agent loose in the repo:
    //   -s read-only                  hard safety contract (no writes / shell exec)
    //   --skip-git-repo-check + cwd   neutral dir so it doesn't pull the host repo in as context
    //   --ephemeral                   don't persist session files to disk
    //   model_reasoning_effort=low    snappier replies (exec is batch, so latency is the lever)
    cwd: tmpdir(),
    buildArgs: (model) => {
      const args = [
        'exec',
        '--json',
        '--skip-git-repo-check',
        '--ephemeral',
        '-s',
        'read-only',
        '-c',
        'model_reasoning_effort=low',
      ];
      // The frontend selects codex via `tool`; the provider key 'codex' is not a model.
      if (model && model !== 'codex') args.push('--model', model);
      return args;
    },
    inputMode: 'stdin',
    embedSystemPrompt: true,
    supportsImages: true,
    appendImageArgs: (args, imagePaths) => {
      for (const p of imagePaths) args.push('-i', p);
    },
    parseStream: (line, emit) => {
      const json = JSON.parse(line);
      if (json.type === 'item.completed' && json.item?.type === 'agent_message' && json.item.text) {
        emit(json.item.text);
      }
    },
  },

  gemini: {
    command: 'gemini',
    buildArgs: (model) => {
      const args = [];
      if (model) args.push('--model', model);
      return args;
    },
    inputMode: 'arg',
    embedSystemPrompt: true,
    supportsImages: false,
    parseStream: null, // plain text mode
  },
};

// ── helpers ─────────────────────────────────────────────────────────────────
function normalizeContent(content) {
  if (typeof content === 'string') return { text: content, imagePaths: [] };
  if (!Array.isArray(content)) return { text: String(content ?? ''), imagePaths: [] };
  const textParts = [];
  const imagePaths = [];
  for (const part of content) {
    if (!part || typeof part !== 'object') continue;
    if (part.type === 'text' && typeof part.text === 'string') textParts.push(part.text);
    else if (part.type === 'image' && typeof part.image_path === 'string')
      imagePaths.push(part.image_path);
  }
  return { text: textParts.join('\n'), imagePaths };
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD') return resolve({});
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(obj));
}

// In-memory dev stores (single local user — mirrors the old submodule behavior).
const USER = 'local-dev-user';
const store = { progress: new Map(), notes: new Map(), chats: new Map() };
const key = (id) => `${USER}:${id}`;

function streamChat(_req, res, body) {
  const providerName = body.provider || body.tool || 'claude';
  const { model, messages, systemPrompt } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return sendJson(res, 400, { error: 'messages array required' });
  }
  const cliTool = CLI_TOOLS[providerName];
  if (!cliTool) {
    return sendJson(res, 400, {
      error: `Unknown provider: ${providerName}`,
      available: Object.keys(CLI_TOOLS),
    });
  }

  const allImagePaths = [];
  const normalized = messages.map((m) => {
    const { text, imagePaths } = normalizeContent(m.content);
    if (imagePaths.length && cliTool.supportsImages) allImagePaths.push(...imagePaths);
    return { role: m.role, text };
  });

  // Codex multi-turn sessions (opt-in): when the client sends a `threadId` field,
  // the conversation lives in a codex thread on disk, so follow-ups resume it
  // instead of re-flattening the whole history. The caller still sends fresh
  // context (e.g. current code) each turn — the thread only spares the transcript.
  // claude/gemini have no equivalent, so they stay on the one-shot path below.
  const codexSession = providerName === 'codex' && 'threadId' in body;
  const resuming = codexSession && typeof body.threadId === 'string' && body.threadId.length > 0;
  const captureThread = codexSession; // echo thread.started id back to the client

  let prompt;
  let args;
  if (resuming) {
    // `resume` rejects -s, so sandbox goes via -c. Prompt = fresh context + the
    // newest user turn only (prior turns already live in the thread), via stdin '-'.
    const lastUser = [...normalized].reverse().find((m) => m.role === 'user');
    prompt = `${systemPrompt ? `${systemPrompt}\n\n` : ''}${lastUser ? lastUser.text : ''}`;
    args = [
      'exec',
      'resume',
      '--json',
      '--skip-git-repo-check',
      '-c',
      'model_reasoning_effort=low',
      '-c',
      'sandbox_mode=read-only',
    ];
    if (model && model !== 'codex') args.push('--model', model);
    args.push(body.threadId, '-');
  } else {
    prompt = normalized
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n\n');
    if (cliTool.embedSystemPrompt && systemPrompt) {
      prompt = `System instructions: ${systemPrompt}\n\n${prompt}`;
    }
    if (codexSession) {
      // New persistent session: same codex flags as one-shot but WITHOUT
      // --ephemeral, since ephemeral skips the session file (nothing to resume).
      args = [
        'exec',
        '--json',
        '--skip-git-repo-check',
        '-s',
        'read-only',
        '-c',
        'model_reasoning_effort=low',
      ];
      if (model && model !== 'codex') args.push('--model', model);
    } else {
      args = cliTool.buildArgs(model, systemPrompt);
      if (cliTool.appendImageArgs && allImagePaths.length)
        cliTool.appendImageArgs(args, allImagePaths);
      if (cliTool.inputMode === 'arg') args.push('-p', prompt);
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const proc = spawn(cliTool.command, args, {
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe'],
    ...(cliTool.cwd ? { cwd: cliTool.cwd } : {}),
  });

  if (cliTool.inputMode === 'stdin') {
    proc.stdin.write(prompt);
    proc.stdin.end();
  }

  let buffer = '';
  let textSent = false;
  const isPlainText = !cliTool.parseStream;
  const emit = (text) => {
    textSent = true;
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  };

  proc.stdout.on('data', (data) => {
    if (isPlainText) {
      const text = data.toString();
      if (text) emit(text);
      return;
    }
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      if (captureThread) {
        try {
          const j = JSON.parse(line);
          if (j.type === 'thread.started' && j.thread_id) {
            res.write(`data: ${JSON.stringify({ threadId: j.thread_id })}\n\n`);
          }
        } catch {
          /* not the thread event */
        }
      }
      try {
        cliTool.parseStream(line, emit);
      } catch {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('{') && !trimmed.startsWith('[')) emit(`${trimmed}\n`);
      }
    }
  });

  proc.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[${providerName} stderr]`, msg);
  });

  proc.on('close', (code) => {
    if (buffer.trim()) {
      if (isPlainText) emit(buffer.trim());
      else {
        try {
          cliTool.parseStream(buffer, emit);
        } catch {
          if (!textSent) emit(buffer.trim());
        }
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
    if (code !== 0) console.error(`[${providerName}] exited with code ${code}`);
  });

  proc.on('error', (err) => {
    console.error(`[${providerName} spawn error]`, err.message);
    res.write(
      `data: ${JSON.stringify({ error: `Failed to start ${providerName} CLI. Is it installed?` })}\n\n`
    );
    res.write('data: [DONE]\n\n');
    res.end();
  });

  res.on('close', () => {
    if (!proc.killed) proc.kill('SIGTERM');
  });
}

export function localAi() {
  return {
    name: 'local-ai-dev-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api')) return next();
        const url = new URL(req.url, 'http://localhost');
        const path = url.pathname.replace(/^\/api/, '');

        const q = Object.fromEntries(url.searchParams.entries());
        const body = await readJsonBody(req);
        const m = req.method;

        // ── AI ──
        if (m === 'POST' && path === '/chat') return streamChat(req, res, body);

        // ── health / auth ──
        if (m === 'GET' && path === '/health') {
          return sendJson(res, 200, { status: 'ok', providers: Object.keys(CLI_TOOLS) });
        }
        if (m === 'GET' && path === '/auth/verify') {
          return sendJson(res, 401, { error: 'Unauthorized' });
        }
        if (m === 'POST' && path === '/auth/logout') return sendJson(res, 200, { success: true });

        // ── progress ──
        if (m === 'GET' && path === '/progress') {
          const prefix = `${USER}:`;
          const progress = {};
          for (const [k, v] of store.progress.entries()) {
            if (k.startsWith(prefix)) progress[k.slice(prefix.length)] = v;
          }
          return sendJson(res, 200, { progress });
        }
        if (m === 'PUT' && path === '/progress') {
          const { problemId, data } = body;
          if (!problemId || !data)
            return sendJson(res, 400, { error: 'problemId and data required' });
          store.progress.set(key(problemId), {
            status: data.status || 'unseen',
            code: data.code || undefined,
            language: data.language || 'typescript',
            bookmarked: Boolean(data.bookmarked),
            lastAttempted: data.lastAttempted || undefined,
            ease: data.ease ?? 2.5,
            interval: data.interval ?? 0,
            repetitions: data.repetitions ?? 0,
            nextReview: data.nextReview || undefined,
            lastReview: data.lastReview || undefined,
          });
          return sendJson(res, 200, { success: true });
        }

        // ── notes ──
        if (m === 'GET' && path === '/notes') {
          if (!q.problemId) return sendJson(res, 400, { error: 'problemId required' });
          return sendJson(res, 200, { notes: store.notes.get(key(q.problemId)) ?? '' });
        }
        if (m === 'POST' && path === '/notes') {
          const { problemId, notes } = body;
          if (!problemId || notes === undefined)
            return sendJson(res, 400, { error: 'problemId and notes required' });
          store.notes.set(key(problemId), String(notes));
          return sendJson(res, 200, { success: true });
        }

        // ── chats ──
        if (m === 'GET' && path === '/chats') {
          if (!q.problemId) return sendJson(res, 400, { error: 'problemId required' });
          return sendJson(res, 200, { messages: store.chats.get(key(q.problemId)) ?? [] });
        }
        if (m === 'POST' && path === '/chats') {
          const { problemId, messages } = body;
          if (!problemId || !Array.isArray(messages))
            return sendJson(res, 400, { error: 'problemId and messages required' });
          store.chats.set(key(problemId), messages);
          return sendJson(res, 200, { success: true });
        }
        if (m === 'DELETE' && path === '/chats') {
          if (!q.problemId) return sendJson(res, 400, { error: 'problemId required' });
          store.chats.delete(key(q.problemId));
          return sendJson(res, 200, { success: true });
        }

        return sendJson(res, 404, { error: 'Not found' });
      });
    },
  };
}
