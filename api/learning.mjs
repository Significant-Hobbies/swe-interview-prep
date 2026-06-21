// Consolidated handler — routes via ?action= (see shared/api/learning-registry.mjs).
import { HANDLER_MODULES, LEARNING_ACTIONS } from '../shared/api/learning-registry.mjs';

export default async function handler(req, res) {
  const action = req.query?.action;
  if (!action || !LEARNING_ACTIONS.includes(action)) {
    return res.status(400).json({
      error: `Unknown action. Expected one of: ${LEARNING_ACTIONS.join(', ')}`,
    });
  }

  const loader = HANDLER_MODULES[action];
  if (!loader) {
    return res.status(500).json({ error: `No handler module for action: ${action}` });
  }

  const mod = await loader();
  return mod.default(req, res);
}