import { LogOut, Settings, X } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { STORE_KEYS, loadLocal, saveLocal } from '../lib/userStore';
import { SiteHeader } from './SiteHeader';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// Lazy-loaded: DigestBanner pulls in learning-os.ts (722 KB / 179 KB gzip of
// JSON data) via useConcepts/planner. SettingsModal imports
// ImportAndNotifySettings + LearningProfileSettings which also read learning-os.
// Deferring both keeps the data chunk off the initial page load.
const DigestBanner = lazy(() =>
  import('./DigestBanner').then((m) => ({ default: m.DigestBanner }))
);
const SettingsModal = lazy(() => import('./SettingsModal'));

export default function Layout() {
  const location = useLocation();
  const { user, isGuest, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const onboardingDone = loadLocal<{ done?: boolean }>(STORE_KEYS.onboarding, {}).done;

  /**
   * The setup hint is labelled "Optional" but had no way to decline it, so it
   * sat under the digest banner forever — two rows of chrome above the fold on
   * every page. Dismissing is remembered.
   */
  const [setupDismissed, setSetupDismissed] = useState(
    () => loadLocal<{ dismissed?: boolean }>(STORE_KEYS.setupHint, {}).dismissed === true
  );
  /**
   * Scoped to Today so no page ever carries two strips.
   *
   * DigestBanner now suppresses itself on the page it links to — usually Today
   * — so confining the hint to Today yields header + at most one strip
   * everywhere, instead of the three stacked bars that read as three separate
   * navbars. Today is also the only page where "personalize Today's session
   * mix" is actionable in context.
   */
  const showSetupHint = !onboardingDone && !setupDismissed && location.pathname === '/today';

  function dismissSetupHint() {
    saveLocal(STORE_KEYS.setupHint, { dismissed: true });
    setSetupDismissed(true);
  }

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
                <GoogleSignInButton className="ml-1" />
              ) : null}
            </>
          }
        />

        <Suspense fallback={null}>
          <DigestBanner />
        </Suspense>

        {/* Nothing here requires an account. The one thing signing in buys is
            progress that outlives the browser — say that plainly, because a
            guest who sweeps 250 concepts and then clears their storage loses
            all of it silently. */}
        {guestHasProgress && (
          <div className="border-b border-white/[0.06] bg-white/[0.02]">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
              <p className="text-xs text-white/55">
                Your progress is saved in this browser only — clearing it loses everything.
              </p>
              <GoogleSignInButton />
            </div>
          </div>
        )}

        {showSetupHint && (
          <div className="border-b border-white/[0.06] bg-white/[0.02]">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
              <p className="text-xs text-white/55">
                Optional: personalize Today&apos;s session mix and active path.
              </p>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <Link
                  to="/explore"
                  className="inline-flex min-h-11 items-center text-white/60 transition-colors hover:text-white/80"
                >
                  Explore catalog
                </Link>
                <Link
                  to="/onboarding"
                  className="inline-flex min-h-11 items-center text-white/70 transition-colors hover:text-white"
                >
                  Quick setup →
                </Link>
                <button
                  type="button"
                  onClick={dismissSetupHint}
                  aria-label="Dismiss setup hint"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
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
