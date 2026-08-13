export interface FocusedRoute {
  exitTo: string;
  exitLabel: string;
}

export function focusedRoute(pathname: string): FocusedRoute | null {
  if (pathname === '/practice' || pathname === '/playground' || pathname.startsWith('/drills/')) {
    return { exitTo: '/dashboard', exitLabel: 'Back to Dashboard' };
  }
  if (/^\/labs\/[^/]+$/.test(pathname)) {
    return { exitTo: '/labs', exitLabel: 'Back to Systems Labs' };
  }
  if (pathname === '/wars/blitz' || pathname.startsWith('/wars/blitz/')) {
    return { exitTo: '/wars', exitLabel: 'Exit Blitz' };
  }
  if (pathname === '/wars/tradeoff' || pathname.startsWith('/wars/tradeoff/')) {
    return { exitTo: '/wars', exitLabel: 'Exit Tradeoff' };
  }
  return null;
}
