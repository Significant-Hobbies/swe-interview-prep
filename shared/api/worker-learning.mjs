import { HANDLER_MODULES, LEARNING_ACTIONS } from './learning-registry.mjs';
import { runExpressHandler } from './express-bridge.mjs';

const PUBLIC_NO_AUTH = new Set(['gaps', 'critique', 'understanding', 'tag']);

export async function dispatchLearningAction(ctx) {
  const { request, client, user, json } = ctx;
  const action = new URL(request.url).searchParams.get('action');

  if (!action || !LEARNING_ACTIONS.includes(action)) {
    return json(
      { error: `Unknown action. Expected one of: ${LEARNING_ACTIONS.join(', ')}` },
      { status: 400 }
    );
  }

  if (!PUBLIC_NO_AUTH.has(action) && !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loader = HANDLER_MODULES[action];
  if (!loader) {
    return json({ error: `No handler module for action: ${action}` }, { status: 500 });
  }

  const mod = await loader();
  const handler = mod.default;
  const { status, body } = await runExpressHandler(handler, { request, client, user });
  return json(body ?? {}, { status });
}
