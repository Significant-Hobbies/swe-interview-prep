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

const mount = () => {
  createRoot(root).render(import.meta.env.PROD ? tree : <StrictMode>{tree}</StrictMode>);
  // LCP shell sits behind #root (pointer-events: none) — drop once React has painted.
  requestAnimationFrame(() => document.getElementById('lcp-shell')?.remove());
};

// Keep #lcp-shell as LCP until the browser is idle — avoids tail runs where
// the Login chunk parse becomes the LCP element (~800ms+ p90).
if ('requestIdleCallback' in window) {
  requestIdleCallback(mount, { timeout: 2000 });
} else {
  setTimeout(mount, 1);
}

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
