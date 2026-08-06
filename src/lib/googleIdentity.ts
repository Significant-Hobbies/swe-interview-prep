export type GoogleButtonSize = 'small' | 'medium' | 'large';
export type GoogleButtonText = 'signin_with' | 'continue_with';

export interface GoogleIdentityApi {
  initialize(config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode: 'popup';
    itp_support: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline';
      size: GoogleButtonSize;
      shape: 'rectangular';
      text: GoogleButtonText;
      logo_alignment: 'left';
    }
  ): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityApi } };
  }
}

let googleIdentityPromise: Promise<GoogleIdentityApi> | null = null;
let initializedIdentityApi: GoogleIdentityApi | null = null;
let activeCredentialHandler: ((credential: string) => Promise<void>) | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (googleIdentityPromise) return googleIdentityPromise;

  googleIdentityPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    const script = existing ?? document.createElement('script');
    const onLoad = () => {
      if (window.google?.accounts?.id) resolve(window.google.accounts.id);
      else reject(new Error('Google Sign-In API not available'));
    };
    const onError = () => {
      googleIdentityPromise = null;
      reject(new Error('Google Sign-In script failed to load'));
    };

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = 'true';
      document.head.appendChild(script);
    }
  });

  return googleIdentityPromise;
}

export function renderGoogleIdentityButton(options: {
  api: GoogleIdentityApi;
  parent: HTMLElement;
  clientId: string;
  size: GoogleButtonSize;
  text: GoogleButtonText;
  onCredential: (credential: string) => Promise<void>;
}): void {
  activeCredentialHandler = options.onCredential;
  if (initializedIdentityApi !== options.api) {
    options.api.initialize({
      client_id: options.clientId,
      ux_mode: 'popup',
      itp_support: true,
      callback: (response) => {
        if (response.credential) void activeCredentialHandler?.(response.credential);
      },
    });
    initializedIdentityApi = options.api;
  }

  options.api.renderButton(options.parent, {
    type: 'standard',
    theme: 'outline',
    size: options.size,
    shape: 'rectangular',
    text: options.text,
    logo_alignment: 'left',
  });
}
