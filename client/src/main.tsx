import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID ?? 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
}

// MSAL v5 requires async initialization before rendering
const msalInstance = new PublicClientApplication(msalConfig)

msalInstance.initialize().then(async () => {
  // Process any pending redirect auth response (e.g. after loginRedirect completes).
  await msalInstance.handleRedirectPromise()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}).catch((error: unknown) => {
  console.error('MSAL initialization failed:', error)
  document.getElementById('root')!.innerHTML =
    '<div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:sans-serif;color:#ef4444">' +
    '<p>Authentication service failed to load. Please refresh the page.</p>' +
    '</div>'
})
