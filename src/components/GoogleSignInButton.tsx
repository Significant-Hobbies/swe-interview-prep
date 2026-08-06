import { useEffect, useRef } from 'react';

import { useAuth } from '../contexts/AuthContext';
import {
  type GoogleButtonSize,
  type GoogleButtonText,
  loadGoogleIdentity,
  renderGoogleIdentityButton,
} from '../lib/googleIdentity';

function reportGoogleAuthFailure(reason: string) {
  void import('../lib/foundry-monitoring').then((module) =>
    module.captureAuthFailure({
      provider: 'google',
      stage: 'signin',
      reason,
      source: 'google-sign-in-button',
    })
  );
}

export function GoogleSignInButton({
  className,
  size = 'medium',
  text = 'signin_with',
}: {
  className?: string;
  size?: GoogleButtonSize;
  text?: GoogleButtonText;
}) {
  const { signInWithGoogleCredential } = useAuth();
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!parent || !clientId) {
      if (!clientId) reportGoogleAuthFailure('Missing VITE_GOOGLE_CLIENT_ID');
      return;
    }

    let cancelled = false;
    void loadGoogleIdentity()
      .then((api) => {
        if (cancelled) return;
        renderGoogleIdentityButton({
          api,
          parent,
          clientId,
          size,
          text,
          onCredential: async (credential) => {
            try {
              await signInWithGoogleCredential(credential);
            } catch (error) {
              const reason = error instanceof Error ? error.message : 'Login failed';
              reportGoogleAuthFailure(reason);
              window.alert('Sign-in failed. Please try again.');
            }
          },
        });
      })
      .catch((error) => {
        const reason = error instanceof Error ? error.message : 'Google Sign-In failed to load';
        reportGoogleAuthFailure(reason);
      });

    return () => {
      cancelled = true;
    };
  }, [signInWithGoogleCredential, size, text]);

  return <div ref={parentRef} className={className} />;
}
