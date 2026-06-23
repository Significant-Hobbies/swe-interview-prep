import { requireAuth } from './auth/verify.mjs';

// Hard wall-clock budget for the remote Go playground round-trip. The
// upstream service can hang or stream slowly; without a deadline a stuck
// request would tie up a serverless invocation and leave the browser
// waiting indefinitely.
const REMOTE_COMPILE_TIMEOUT_MS = 8000;
// Cap how much stdout/stderr we ship back to the client. A runaway print
// loop on the remote runner can produce megabytes of text — enough to
// crash the tab when rendered. 64 KiB is plenty for interview snippets.
const MAX_OUTPUT_BYTES = 64 * 1024;

function truncate(text) {
  if (typeof text !== 'string' || text.length <= MAX_OUTPUT_BYTES) return text;
  return `${text.slice(0, MAX_OUTPUT_BYTES)}\n…[output truncated]`;
}

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'code is required' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REMOTE_COMPILE_TIMEOUT_MS);

  try {
    const response = await fetch('https://go.dev/_/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ version: '2', body: code, withVet: 'true' }),
      signal: controller.signal,
    });

    const data = await response.json();

    // data.Errors contains compilation errors
    // data.Events is an array of { Message, Kind, Delay }
    let output = '';
    let errors = null;

    if (data.Errors) {
      errors = data.Errors;
    }

    if (data.Events) {
      output = data.Events.filter((e) => e.Kind === 'stdout')
        .map((e) => e.Message)
        .join('');

      const stderr = data.Events.filter((e) => e.Kind === 'stderr')
        .map((e) => e.Message)
        .join('');

      if (stderr) {
        errors = errors ? `${errors}\n${stderr}` : stderr;
      }
    }

    res.json({ output: truncate(output), errors: truncate(errors) });
  } catch (err) {
    if (err?.name === 'AbortError') {
      return res.status(504).json({
        error: `Execution timed out (${REMOTE_COMPILE_TIMEOUT_MS / 1000}s limit) — your code may contain an infinite loop.`,
      });
    }
    res.status(500).json({ error: `Failed to compile: ${err.message}` });
  } finally {
    clearTimeout(timer);
  }
}
