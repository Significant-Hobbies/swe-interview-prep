import {
  BarChart3,
  Bell,
  BookOpen,
  Code2,
  Dumbbell,
  LogIn,
  LogOut,
  Network,
  Settings,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { SaaSMakerChangelog } from './saasmaker-feedback';
import SettingsModal from './SettingsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Network;
}

// Four-tab IA. Learn = roadmaps + concept library. Practice = drills + spaced
// reviews. Playground = free coding canvas. Progress = mastery + notes.
const PRIMARY_NAV: NavItem[] = [
  { to: '/learn', label: 'Learn', icon: Network },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
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

  // Top-nav pill: underline indicator on active, no chip background.
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex h-16 items-center gap-1.5 border-b-2 px-1 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'border-sky-400 text-slate-50'
        : 'border-transparent text-slate-400 hover:text-slate-200'
    }`;

  // Mobile bottom-bar: text only, sky on active.
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors duration-150 ${
      isActive ? 'text-sky-300' : 'text-slate-500'
    }`;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-slate-950 pb-16 md:pb-0">
        <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
            <NavLink to="/" className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-md">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                <BookOpen className="h-4 w-4 text-sky-400" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-100 sm:inline">SWE Prep</span>
            </NavLink>

            <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
              {PRIMARY_NAV.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={navClass}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
                          ? 'bg-slate-900 text-slate-100'
                          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Updates</TooltipContent>
                </Tooltip>
                {changelogOpen && (
                  <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-96 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-100">Updates</span>
                      <button
                        onClick={() => setChangelogOpen(false)}
                        aria-label="Close"
                        className="text-xs text-slate-500 hover:text-slate-300"
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
                    className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-900 hover:text-slate-200"
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
                      className="ml-1 h-8 w-8 rounded-full ring-1 ring-slate-800"
                    />
                  ) : (
                    <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-slate-300 ring-1 ring-slate-800">
                      {((user as any).email?.[0] || '?').toUpperCase()}
                    </div>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={signOut}
                        aria-label="Sign out"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors duration-150 hover:bg-slate-900 hover:text-slate-200"
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
                  className="ml-1 inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors duration-150 hover:border-slate-600 hover:bg-slate-900"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              ) : null}
            </div>
          </div>
        </nav>

        <main>
          <Outlet />
        </main>

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl md:hidden">
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
