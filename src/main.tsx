import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { installBrowserMonitoring } from './lib/foundry-monitoring'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary scope="root">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

const scheduleMonitoring = () => installBrowserMonitoring()
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleMonitoring, { timeout: 3000 })
} else {
  setTimeout(scheduleMonitoring, 1)
}
