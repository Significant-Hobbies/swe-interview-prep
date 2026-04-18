import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Code2, LogOut, LogIn, Network, FlaskConical, Brain, Sun, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SettingsModal from './SettingsModal';

export default function Layout() {
  const { user, isGuest, signInWithGoogle, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
            <NavLink to="/concepts" className={navClass}><Network className="h-4 w-4" /> Concepts</NavLink>
            <NavLink to="/review" className={navClass}><Brain className="h-4 w-4" /> Review</NavLink>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
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
                <button onClick={signOut} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-900 hover:text-gray-200" title="Sign out">
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
        <NavLink to="/concepts" className={tabClass}><Network className="h-5 w-5" /><span>Concepts</span></NavLink>
        <NavLink to="/review" className={tabClass}><Brain className="h-5 w-5" /><span>Review</span></NavLink>
      </div>
    </div>
  );
}
