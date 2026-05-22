import {
  BarChart3,
  Dumbbell,
  FolderKanban,
  Hammer,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map as MapIcon,
  Network,
  NotebookPen,
  RotateCcw,
  Settings,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { SaaSMakerChangelog } from './saasmaker-feedback';
import SettingsModal from './SettingsModal';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

// The 9-page Learning OS information architecture.
const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/roadmaps', label: 'Roadmaps', icon: MapIcon },
  { to: '/concepts', label: 'Concepts', icon: Network },
  { to: '/drills', label: 'Drills', icon: Dumbbell },
  { to: '/build', label: 'Build Lab', icon: Hammer },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/reviews', label: 'Reviews', icon: RotateCcw },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
];

// Mobile bottom bar shows the five highest-traffic destinations.
const MOBILE_PRIMARY = ['/', '/roadmaps', '/concepts', '/drills', '/reviews'];

export default function Layout() {
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
      isActive ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
    }`;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${
      isActive ? 'text-purple-400' : 'text-gray-500'
    }`;

  const mobileSecondary = PRIMARY_NAV.filter(n => !MOBILE_PRIMARY.includes(n.to));

  return (
    <div className="min-h-screen bg-gray-950 pb-16 md:pb-0">
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 px-4">
          <NavLink to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <span className="hidden text-base font-bold text-white lg:inline">Learning OS</span>
          </NavLink>

          <div className="hidden flex-1 items-center justify-center gap-0.5 overflow-x-auto md:flex">
            {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={navClass}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xl:inline">{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div ref={changelogRef} className="relative">
              <button
                onClick={() => setChangelogOpen(o => !o)}
                aria-label="What's new"
                className={`rounded-lg p-1.5 transition-colors ${changelogOpen ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
                title="What's new"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              {changelogOpen && (
                <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-96 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-xl">
                  <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                    <span className="text-sm font-semibold text-white">What's new</span>
                    <button onClick={() => setChangelogOpen(false)} aria-label="Close" className="text-xs text-gray-500 hover:text-gray-300">✕</button>
                  </div>
                  <div className="p-4"><SaaSMakerChangelog /></div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="AI settings"
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-900 hover:text-gray-200"
              title="AI Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            {user ? (
              <>
                {(user as any).picture ? (
                  <img src={(user as any).picture} alt="" className="h-7 w-7 rounded-full" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-xs font-medium text-purple-400">
                    {((user as any).email?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <button onClick={signOut} aria-label="Sign out" className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-900 hover:text-gray-200" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : isGuest ? (
              <button onClick={signInWithGoogle} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-900 hover:text-gray-200">
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

      {/* Mobile "More" sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="rounded-t-2xl border-t border-gray-800 bg-gray-900 p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">More</span>
              <button onClick={() => setMoreOpen(false)} aria-label="Close"><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {mobileSecondary.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-950 py-3 text-[11px] font-medium text-gray-300"
                >
                  <Icon className="h-5 w-5 text-purple-400" />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/mock"
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-950 py-3 text-[11px] font-medium text-gray-300"
              >
                <Timer className="h-5 w-5 text-purple-400" />
                Mock
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar — mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl md:hidden">
        {PRIMARY_NAV.filter(n => MOBILE_PRIMARY.includes(n.to)).map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={tabClass}>
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button onClick={() => setMoreOpen(true)} className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-gray-500">
          <FolderKanban className="h-5 w-5" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
}
