import { createContext, useCallback,useContext, useEffect, useState } from 'react';

const GUEST_KEY = 'dsa-prep-guest';
// Profile cache only — the JWT now lives in an httpOnly cookie (XSS hardening).
const PROFILE_KEY = 'dsa-prep-profile';
// Legacy key (used to store the JWT in localStorage). Purged on load.
const LEGACY_KEY = 'dsa-prep-auth';
// Same-origin in dev (Vite proxies /api → :3456) and in prod (Vercel).
// Empty base means cookies attach automatically.
const API_URL = '';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  /** @deprecated Token is now in an httpOnly cookie; this always returns null. */
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1');
  const [loading, setLoading] = useState(true);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load profile from localStorage (just non-sensitive metadata) and validate
  // the cookie session against the server. The token itself is no longer in
  // localStorage — it's in an httpOnly cookie.
  useEffect(() => {
    let cancelled = false;
    let hasCachedProfile = false;
    // Drop any legacy entry that contained the JWT in localStorage.
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        hasCachedProfile = true;
        setUser(JSON.parse(raw) as User);
        setIsGuest(false);
      }
    } catch (error) {
      console.error('Failed to load profile from localStorage:', error);
      localStorage.removeItem(PROFILE_KEY);
    }

    if (isGuest || !hasCachedProfile) {
      setLoading(false);
    }

    if (isGuest) {
      return () => {
        cancelled = true;
      };
    }

    // Hydrate from cookie session — confirms the cookie is still valid.
    // eslint-disable-next-line promise/catch-or-return
    fetch('/api/auth/verify', { credentials: 'include' })
      .then(async (res) => {
        if (cancelled) return undefined;
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            setIsGuest(false);
            localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
          }
        } else if (res.status === 401) {
          // Cookie missing/invalid — drop any cached profile.
          setUser(null);
          localStorage.removeItem(PROFILE_KEY);
        }
        return undefined;
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled && hasCachedProfile) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isGuest]);

  // Load Google Sign-In script
  useEffect(() => {
    if (googleLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [googleLoaded]);

  const login = useCallback(async (credential: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // server sets the auth cookie
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const data = await res.json();
      setUser(data.user);
      setIsGuest(false);
      // Cache profile only — the JWT lives in an httpOnly cookie now.
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data.user));
      localStorage.removeItem(GUEST_KEY);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  // Initialize Google One Tap when loaded
  useEffect(() => {
    if (!googleLoaded || user || isGuest) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID not configured');
      return;
    }

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          login(response.credential);
        }
      },
    });

    // Show One Tap prompt
    window.google?.accounts.id.prompt();
  }, [googleLoaded, user, isGuest, login]);

  const signInWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID not configured');
      alert('Google Sign-In not configured. Please check environment variables.');
      return;
    }

    if (!googleLoaded) {
      console.error('Google Sign-In script not loaded yet');
      alert('Google Sign-In is loading, please try again in a moment.');
      return;
    }

    const google = window.google;
    if (!google?.accounts?.id) {
      console.error('Google Sign-In API not available');
      alert('Google Sign-In is not available. Please check your connection.');
      return;
    }

    // Initialize and show One Tap prompt
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          login(response.credential).catch(err => {
            console.error('Login failed:', err);
            alert('Sign-in failed. Please try again.');
          });
        }
      },
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.error('One Tap not displayed:', notification.getNotDisplayedReason());
        // Fallback: try to render a button instead
        const buttonDiv = document.createElement('div');
        buttonDiv.id = 'google-signin-button-temp';
        document.body.appendChild(buttonDiv);

        google.accounts.id.renderButton(buttonDiv, {
          theme: 'filled_blue',
          size: 'large',
          width: 250,
        });

        // Click it automatically
        setTimeout(() => {
          const btn = buttonDiv.querySelector('div[role="button"]') as HTMLElement;
          if (btn) btn.click();
        }, 100);
      }
    });
  };

  const signOut = async () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem(GUEST_KEY);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // best-effort
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem(GUEST_KEY, '1');
  };

  return (
    <AuthContext.Provider value={{ user, token: null, isGuest, loading, signInWithGoogle, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

/**
 * @deprecated The auth token is now in an httpOnly cookie and unreadable from
 * JS. Always returns null. Existing call sites that spread this into an
 * Authorization header will simply send no header — the server reads the
 * cookie automatically. Keep using `credentials: 'include'` (or rely on
 * default same-origin) so the cookie attaches.
 */
export function getAuthToken(): string | null {
  return null;
}
