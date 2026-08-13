import { describe, expect, it } from 'vitest';

import { focusedRoute } from './focusedRoute';

describe('focusedRoute', () => {
  it.each([
    ['/practice', '/dashboard'],
    ['/playground', '/dashboard'],
    ['/drills/idempotency-drill', '/dashboard'],
    ['/labs/gitops-drift', '/labs'],
    ['/wars/blitz', '/wars'],
    ['/wars/blitz/match-1', '/wars'],
    ['/wars/tradeoff/match-2', '/wars'],
  ])('classifies %s as a focused workspace', (pathname, exitTo) => {
    expect(focusedRoute(pathname)?.exitTo).toBe(exitTo);
  });

  it.each(['/dashboard', '/today', '/learn', '/progress', '/wars', '/labs'])(
    'keeps %s in the standard shell',
    (pathname) => {
      expect(focusedRoute(pathname)).toBeNull();
    }
  );
});
