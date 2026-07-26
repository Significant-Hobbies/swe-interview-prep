import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const tree = (
  <ErrorBoundary scope="root">
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

createRoot(root).render(import.meta.env.PROD ? tree : <StrictMode>{tree}</StrictMode>);

// Remove the LCP shell once the browser has painted a frame, so the handoff to
// React is not a flash of empty black.
//
// This used to exist to make the shell's own <h1> register as the LCP element
// instead of React's — but that h1 was the Login hero, and Login stopped being
// what a visitor lands on. Optimising the metric meant every cold load showed a
// page that no longer exists. The shell is now an app-shaped skeleton with no
// competing headline, so LCP is whatever the app actually paints.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('lcp-shell')?.remove();
  });
});

const scheduleMonitoring = () => {
  void import('./lib/foundry-monitoring').then((m) => m.installBrowserMonitoring());
};
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleMonitoring, { timeout: 3000 });
} else {
  setTimeout(scheduleMonitoring, 1);
}

const scheduleVitals = () => {
  void import('./lib/vitals').then((m) => m.initVitals()).catch(() => {});
};
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleVitals, { timeout: 3000 });
} else {
  setTimeout(scheduleVitals, 1);
}

const scheduleApiTiming = () => {
  void import('./lib/api-timing').then((m) => m.initApiTiming()).catch(() => {});
};
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleApiTiming, { timeout: 3000 });
} else {
  setTimeout(scheduleApiTiming, 1);
}
