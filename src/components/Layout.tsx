import { LogIn, LogOut, Settings } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { STORE_KEYS, loadLocal } from '../lib/userStore';
import { SiteHeader } from './SiteHeader';
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
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const onboardingDone = loadLocal<{ done?: boolean }>(STORE_KEYS.onboarding, {}).done;
  const showSetupHint = !onboardingDone && location.pathname !== '/onboarding';

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
                    className="flex h-9 w-9 items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white"
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
                        className="flex h-9 w-9 items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Sign out</TooltipContent>
                  </Tooltip>
                </>
              ) : isGuest ? (
                <button
                  onClick={signInWithGoogle}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:border-white/30 hover:bg-white/5"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              ) : null}
            </>
          }
        />

        <Suspense fallback={null}>
          <DigestBanner />
        </Suspense>

        {showSetupHint && (
          <div className="border-b border-white/[0.06] bg-white/[0.02]">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-2 md:px-6">
              <p className="text-xs text-white/55">
                Optional: personalize Today&apos;s session mix and active path.
              </p>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <Link to="/explore" className="text-white/45 transition-colors hover:text-white/70">
                  Explore catalog
                </Link>
                <Link to="/onboarding" className="text-white/70 transition-colors hover:text-white">
                  Quick setup →
                </Link>
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
