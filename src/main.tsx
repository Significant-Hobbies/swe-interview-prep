import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

const tree = (
  <ErrorBoundary scope="root">
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
)

createRoot(root).render(import.meta.env.PROD ? tree : <StrictMode>{tree}</StrictMode>)

const scheduleMonitoring = () => {
  void import('./lib/foundry-monitoring').then((m) => m.installBrowserMonitoring())
}
if ('requestIdleCallback' in window) {
  requestIdleCallback(scheduleMonitoring, { timeout: 3000 })
} else {
  setTimeout(scheduleMonitoring, 1)
}
