import {
  BarChart3,
  Bell,
  BookOpen,
  Code2,
  Dumbbell,
  LogIn,
  LogOut,
  Mic,
  Network,
  Settings,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { SaaSMakerChangelog } from './saasmaker-feedback';
import { DigestBanner } from './DigestBanner';
import SettingsModal from './SettingsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Network;
}

// Primary IA. Learn = roadmaps + concept library. Practice = drills + spaced
// reviews. Playground = free coding canvas. Progress = mastery + notes.
// Docs = long-form reference (system design, interview prep, ML case studies).
const PRIMARY_NAV: NavItem[] = [
  { to: '/today', label: 'Today', icon: Network },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/mock', label: 'Mock', icon: Mic },
  { to: '/playground', label: 'Playground', icon: Code2 },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
];

export default function Layout() {
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const changelogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!changelogOpen) return;
    function handleClick(e: MouseEvent) {
      if (changelogRef.current && !changelogRef.current.contains(e.target as Node)) {
        setChangelogOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [changelogOpen]);

  // Top-nav: full white on active, dim white on hover. No icons — Vercel-style word marks.
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex h-16 items-center px-1 text-sm transition-colors duration-150 ${
      isActive
        ? 'text-white'
        : 'text-white/50 hover:text-white'
    }`;

  // Mobile bottom-bar: text only.
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] transition-colors duration-150 ${
      isActive ? 'text-white' : 'text-white/40'
    }`;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-black pb-16 md:pb-0">
        <nav className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
            <NavLink to="/" className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40">
              <span className="text-base font-bold tracking-tight text-white">SWE Prep</span>
              <span className="hidden text-xs text-white/30 sm:inline">/ Learning OS</span>
            </NavLink>

            <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
              {PRIMARY_NAV.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navClass}>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <div ref={changelogRef} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setChangelogOpen(o => !o)}
                      aria-label="Updates"
                      className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 ${
                        changelogOpen
                          ? 'bg-white/10 text-white'
                          : 'text-white/50 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Updates</TooltipContent>
                </Tooltip>
                {changelogOpen && (
                  <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-96 overflow-y-auto rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/50">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <span className="text-sm font-semibold text-white">Updates</span>
                      <button
                        onClick={() => setChangelogOpen(false)}
                        aria-label="Close"
                        className="text-xs text-white/40 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-4">
                      <SaaSMakerChangelog />
                    </div>
                  </div>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    aria-label="AI settings"
                    className="flex h-9 w-9 items-center justify-center rounded-md text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">AI settings</TooltipContent>
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
            </div>
          </div>
        </nav>

        <DigestBanner />

        <main>
          <Outlet />
        </main>

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/[0.08] bg-black/95 backdrop-blur-xl md:hidden">
          {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={tabClass}>
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
