import { Brain, Code2, FlaskConical, LogIn, LogOut, Network, Settings, Sparkles, Sun, Timer } from 'lucide-react';
import { useEffect,useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { SaaSMakerChangelog } from './saasmaker-feedback';
import SettingsModal from './SettingsModal';

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

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
    }`;

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
      isActive ? 'text-purple-400' : 'text-gray-500'
    }`;

  return (
    <div className="min-h-screen bg-gray-950 pb-16 md:pb-0">
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
              <Code2 className="h-4 w-4 text-purple-400" />
            </div>
            <span className="hidden text-base font-bold text-white sm:inline">Loop</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navClass}><Sun className="h-4 w-4" /> Today</NavLink>
            <NavLink to="/playground" className={navClass}><FlaskConical className="h-4 w-4" /> Playground</NavLink>
            <NavLink to="/mock" className={navClass}><Timer className="h-4 w-4" /> Mock</NavLink>
            <NavLink to="/concepts" className={navClass}><Network className="h-4 w-4" /> Concepts</NavLink>
            <NavLink to="/review" className={navClass}><Brain className="h-4 w-4" /> Review</NavLink>
          </div>

          <div className="flex items-center gap-2">
            {/* What's new changelog dropdown */}
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
                <div className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                    <span className="text-sm font-semibold text-white">What's new</span>
                    <button
                      onClick={() => setChangelogOpen(false)}
                      aria-label="Close changelog"
                      className="text-gray-500 hover:text-gray-300 text-xs"
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

      {/* Bottom tab bar — mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl md:hidden">
        <NavLink to="/" end className={tabClass}><Sun className="h-5 w-5" /><span>Today</span></NavLink>
        <NavLink to="/playground" className={tabClass}><FlaskConical className="h-5 w-5" /><span>Play</span></NavLink>
        <NavLink to="/mock" className={tabClass}><Timer className="h-5 w-5" /><span>Mock</span></NavLink>
        <NavLink to="/concepts" className={tabClass}><Network className="h-5 w-5" /><span>Concepts</span></NavLink>
        <NavLink to="/review" className={tabClass}><Brain className="h-5 w-5" /><span>Review</span></NavLink>
      </div>
    </div>
  );
}
