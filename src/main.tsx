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

// Remove LCP shell after first paint so the shell h1 registers as the LCP
// element, not the later React-rendered h1. Double rAF guarantees the browser
// paints at least one frame with the shell visible before removal.
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
