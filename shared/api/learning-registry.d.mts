/**
 * Types for the JS registry beside this file. A sibling declaration is picked
 * up automatically, unlike an ambient `declare module` with a relative
 * specifier, which resolves against the declaring file rather than the
 * importer and so breaks depending on where the import lives.
 */

/** Learning actions that require a signed-in session. */
export const AUTH_ACTIONS: string[];

/** Every valid `?action=` value, public and auth-required. */
export const LEARNING_ACTIONS: string[];

export const HANDLER_MODULES: Record<string, () => Promise<unknown>>;
