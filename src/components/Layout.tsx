import {
  BarChart3,
  Bell,
  BookOpen,
  Code2,
  Dumbbell,
  FolderKanban,
  Hammer,
  LayoutGrid,
  LogIn,
  LogOut,
  Mic,
  Network,
  NotebookPen,
  RotateCcw,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { BROWSE_DESTINATIONS } from '../lib/browseLinks';
import { STORE_KEYS, loadLocal } from '../lib/userStore';
import { SaaSMakerChangelog } from './saasmaker-feedback';
import { DigestBanner } from './DigestBanner';
import SettingsModal from './SettingsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Network;
}

const BROWSE_ICONS: Record<string, LucideIcon> = {
  explore: LayoutGrid,
  concepts: Network,
  drills: Dumbbell,
  reviews: RotateCcw,
  docs: BookOpen,
  build: Hammer,
  playground: Code2,
  projects: FolderKanban,
  notes: NotebookPen,
  mock: Mic,
};

// Six primary tabs + Docs. Full catalog lives under Browse.
const PRIMARY_NAV: NavItem[] = [
  { to: '/today', label: 'Today', icon: Network },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/mock', label: 'Mock', icon: Mic },
  { to: '/playground', label: 'Playground', icon: Code2 },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/learning', label: 'Docs', icon: BookOpen },
];

const BROWSE_NAV: NavItem[] = BROWSE_DESTINATIONS.map((d) => ({
  to: d.to,
  label: d.label,
  icon: BROWSE_ICONS[d.id] ?? LayoutGrid,
}));

// Mobile bottom bar — five highest-traffic + browse overflow.
const MOBILE_PRIMARY: NavItem[] = [
  { to: '/today', label: 'Today', icon: Network },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/mock', label: 'Mock', icon: Mic },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
];

function navActive(pathname: string, to: string) {
  const base = to.split('?')[0];
  if (base === '/today') return pathname === '/today' || pathname === '/';
  if (base === '/learning') return pathname === '/learning' || pathname.startsWith('/learning/');
  return pathname === base || pathname.startsWith(`${base}/`);
}

export default function Layout() {
  const location = useLocation();
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const changelogRef = useRef<HTMLDivElement>(null);
  const browseDesktopRef = useRef<HTMLDivElement>(null);
  const browseMobileRef = useRef<HTMLDivElement>(null);
  const onboardingDone = loadLocal<{ done?: boolean }>(STORE_KEYS.onboarding, {}).done;
  const showSetupHint = !onboardingDone && location.pathname !== '/onboarding';

  useEffect(() => {
    if (!changelogOpen && !browseOpen) return;
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (changelogOpen && changelogRef.current && !changelogRef.current.contains(t)) {
        setChangelogOpen(false);
      }
      if (
        browseOpen &&
        !browseDesktopRef.current?.contains(t) &&
        !browseMobileRef.current?.contains(t)
      ) {
        setBrowseOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [changelogOpen, browseOpen]);

  useEffect(() => {
    setBrowseOpen(false);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex h-16 items-center px-1 text-sm transition-colors duration-150 ${
      isActive ? 'text-white' : 'text-white/50 hover:text-white'
    }`;

  const tabClass = (to: string) => {
    const active = navActive(location.pathname, to);
    return `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] transition-colors duration-150 ${
      active ? 'text-white' : 'text-white/40'
    }`;
  };

  const browseActive = BROWSE_NAV.some((item) => navActive(location.pathname, item.to));

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-screen bg-black pb-16 md:pb-0">
        <nav className="sticky top-0 z-50 isolate border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
            <NavLink
              to="/"
              className="relative z-10 flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <span className="text-base font-bold tracking-tight text-white">SWE Prep</span>
              <span className="hidden text-xs text-white/30 sm:inline">/ Learning OS</span>
            </NavLink>

            <div className="relative z-10 hidden flex-1 items-center justify-center gap-5 lg:gap-6 md:flex">
              {PRIMARY_NAV.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navClass}>
                  <span>{label}</span>
                </NavLink>
              ))}
              <div ref={browseDesktopRef} className="relative">
                <button
                  type="button"
                  onClick={() => setBrowseOpen((o) => !o)}
                  className={`inline-flex h-16 items-center gap-1 px-1 text-sm transition-colors duration-150 ${
                    browseOpen || browseActive ? 'text-white' : 'text-white/50 hover:text-white'
                  }`}
                  aria-expanded={browseOpen}
                  aria-haspopup="menu"
                >
                  Browse
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                {browseOpen && (
                  <div
                    role="menu"
                    className="absolute left-1/2 top-full z-50 mt-1 min-w-[12rem] -translate-x-1/2 rounded-xl border border-white/10 bg-black py-1 shadow-2xl shadow-black/50"
                  >
                    {BROWSE_NAV.map(({ to, label, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-white/40" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <div ref={changelogRef} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setChangelogOpen((o) => !o)}
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
            </div>
          </div>
        </nav>

        <DigestBanner />

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

        <main>
          <Outlet />
        </main>

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/[0.08] bg-black/95 backdrop-blur-xl md:hidden">
          {MOBILE_PRIMARY.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={tabClass(to)}>
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
          <div ref={browseMobileRef} className="relative flex flex-1 flex-col">
            <button
              type="button"
              onClick={() => setBrowseOpen((o) => !o)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] transition-colors ${
                browseOpen || browseActive ? 'text-white' : 'text-white/40'
              }`}
              aria-expanded={browseOpen}
              aria-label="Browse catalog"
            >
              <LayoutGrid className="h-5 w-5" />
              <span>Browse</span>
            </button>
            {browseOpen && (
              <div className="absolute bottom-full right-0 mb-2 max-h-[70vh] min-w-[11rem] overflow-y-auto rounded-xl border border-white/10 bg-black py-1 shadow-2xl shadow-black/50">
                {BROWSE_NAV.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-white/40" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
