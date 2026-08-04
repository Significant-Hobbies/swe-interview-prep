import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type AuthFailureStage = 'signin' | 'signup' | 'callback' | 'session' | 'unknown';

function reportAuthFailure(options: {
  provider?: string;
  stage?: AuthFailureStage;
  reason?: string;
  source?: string;
}) {
  void import('../lib/foundry-monitoring').then((m) => m.captureAuthFailure(options));
}

const GUEST_KEY = 'dsa-prep-guest';
// Profile cache only — the JWT now lives in an httpOnly cookie (XSS hardening).
const PROFILE_KEY = 'dsa-prep-profile';
// Legacy key (used to store the JWT in localStorage). Purged on load.
const LEGACY_KEY = 'dsa-prep-auth';
// Same-origin in dev (the Vite AI bridge mounts /api in-process) and in prod.
// Empty base means cookies attach automatically.
const API_URL = '';

let googleIdentityPromise: Promise<void> | null = null;

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleIdentityPromise) return googleIdentityPromise;

  googleIdentityPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener(
      'error',
      () => {
        googleIdentityPromise = null;
        reject(new Error('Google Sign-In script failed to load'));
      },
      { once: true }
    );
    document.body.appendChild(script);
  });

  return googleIdentityPromise;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

function loadCachedProfile(): User | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch (error) {
    console.error('Failed to load profile from localStorage:', error);
    localStorage.removeItem(PROFILE_KEY);
    return null;
  }
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
  const [user, setUser] = useState<User | null>(loadCachedProfile);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1');
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage (just non-sensitive metadata) and validate
  // the cookie session against the server. The token itself is no longer in
  // localStorage — it's in an httpOnly cookie.
  useEffect(() => {
    let cancelled = false;
    const hasCachedProfile = user !== null;
    // Drop any legacy entry that contained the JWT in localStorage.
    if (localStorage.getItem(LEGACY_KEY)) {
      localStorage.removeItem(LEGACY_KEY);
    }
    if (hasCachedProfile) {
      setIsGuest(false);
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

  const signInWithGoogle = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID not configured');
      reportAuthFailure({
        provider: 'google',
        stage: 'signin',
        reason: 'Missing VITE_GOOGLE_CLIENT_ID',
        source: 'auth-context',
      });
      alert('Google Sign-In not configured. Please check environment variables.');
      return;
    }

    try {
      await loadGoogleIdentity();
    } catch (error) {
      console.error('Google Sign-In script failed to load:', error);
      reportAuthFailure({
        provider: 'google',
        stage: 'signin',
        reason: 'Google Sign-In script failed to load',
        source: 'auth-context',
      });
      alert('Google Sign-In could not load. Please check your connection and try again.');
      return;
    }

    const google = window.google;
    if (!google?.accounts?.id) {
      console.error('Google Sign-In API not available');
      reportAuthFailure({
        provider: 'google',
        stage: 'signin',
        reason: 'Google Sign-In API not available',
        source: 'auth-context',
      });
      alert('Google Sign-In is not available. Please check your connection.');
      return;
    }

    // Initialize and show One Tap prompt
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          login(response.credential).catch((err) => {
            console.error('Login failed:', err);
            reportAuthFailure({
              provider: 'google',
              stage: 'signin',
              reason: err instanceof Error ? err.message : 'Login failed',
              source: 'auth-context',
            });
            alert('Sign-in failed. Please try again.');
          });
        }
      },
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.warn('One Tap not displayed:', notification.getNotDisplayedReason());
        reportAuthFailure({
          provider: 'google',
          stage: 'signin',
          reason: notification.getNotDisplayedReason(),
          source: 'auth-context',
        });
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
    <AuthContext.Provider
      value={{ user, token: null, isGuest, loading, signInWithGoogle, signOut, continueAsGuest }}
    >
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
// `getAuthToken()` used to live here. It was stubbed to return null when the
// JWT moved into an httpOnly cookie for XSS hardening, but four call sites kept
// using it as their "am I signed in?" check — so activity logging, the
// companion turn log, and the auto-tagger were all silently dead for signed-in
// users, not just guests. Auth now rides the cookie via `credentials:
// 'include'`, and `src/lib/learningApi.ts` is the single place that asks
// whether a session exists.
