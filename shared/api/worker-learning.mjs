import { setRequestDb } from '../db/client.mjs';
import { HANDLER_MODULES, LEARNING_ACTIONS } from './learning-registry.mjs';

const PUBLIC_NO_AUTH = new Set(['gaps', 'critique', 'role-fit', 'understanding', 'tag']);

export async function dispatchLearningAction(ctx) {
  const { request, client, user, env, json } = ctx;
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
  setRequestDb(client);
  const response = await handler({ request, user, env, json });
  if (!(response instanceof Response)) {
    return json({ error: 'Handler did not respond' }, { status: 500 });
  }
  return response;
}
