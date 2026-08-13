import { LogOut, Settings } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { focusedRoute } from '../lib/focusedRoute';
import { recordRecentVisit } from '../lib/recentVisits';
import { STORE_KEYS, loadLocal } from '../lib/userStore';
import { SiteHeader } from './SiteHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// SettingsModal imports ImportAndNotifySettings + LearningProfileSettings,
// which read the full learning catalogue. Defer it from the initial shell.
const SettingsModal = lazy(() => import('./SettingsModal'));

export default function Layout() {
  const location = useLocation();
  const { user, isGuest, signOut } = useAuth();
  const focus = focusedRoute(location.pathname);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    recordRecentVisit(location.pathname, location.search);
  }, [location.pathname, location.search]);
  /**
   * Warn about local-only storage once there is something to lose.
   *
   * Shown to a blank first visit it is noise stacked on two other strips, and
   * it is not even true yet — nothing is at risk. Once a guest has rated
   * concepts, it is the most useful thing on the page.
   */
  const guestHasProgress =
    isGuest &&
    (Object.keys(loadLocal<Record<string, unknown>>(STORE_KEYS.mastery, {})).length > 0 ||
      Object.keys(loadLocal<Record<string, unknown>>(STORE_KEYS.sweep, {})).length > 0);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-black">
        <SiteHeader
          focus={focus ?? undefined}
          actions={
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    aria-label="Settings"
                    className="flex h-11 w-11 items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Settings</TooltipContent>
              </Tooltip>
              {user ? (
                <>
                  {(user as any).picture ? (
                    <img
                      src={(user as any).picture}
                      alt=""
                      className="ml-1 h-8 w-8 rounded-full ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white/80 ring-1 ring-white/10">
                      {((user as any).email?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={signOut}
                        aria-label="Sign out"
                        className="flex h-11 w-11 items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Sign out</TooltipContent>
                  </Tooltip>
                </>
              ) : isGuest ? (
                <Link
                  to="/login#sign-in"
                  className="ml-1 inline-flex h-11 items-center rounded-md border border-white/10 px-3 text-xs font-medium text-white/65 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                >
                  Sign in
                </Link>
              ) : null}
            </>
          }
        />

        {/* Nothing here requires an account. The one thing signing in buys is
            progress that outlives the browser — say that plainly, because a
            guest who sweeps 250 concepts and then clears their storage loses
            all of it silently. */}
        {!focus && guestHasProgress && (
          <div className="border-b border-white/[0.06] bg-white/[0.02]">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
              <p className="text-xs text-white/55">
                Your progress is saved in this browser only — clearing it loses everything.
              </p>
              <span className="font-mono text-[11px] text-white/50">
                Sign in from the header to keep it.
              </span>
            </div>
          </div>
        )}

        <main id="main-content">
          <Outlet />
        </main>

        <Suspense fallback={null}>
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </Suspense>
      </div>
    </TooltipProvider>
  );
}
