import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import './App.css'

const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
}

function App() {
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(console.error)
  }

  const handleLogout = () => {
    instance.logoutPopup().catch(console.error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight">
        Entra ID Insights Dashboard
      </h1>

      {isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">You are signed in.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">
            Sign in with your Microsoft 365 account to continue.
          </p>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Sign In with Microsoft
          </button>
        </div>
      )}
    </div>
  )
}

export default App
