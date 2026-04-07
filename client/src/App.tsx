import { useState } from 'react'
import { useIsAuthenticated, useMsal } from '@azure/msal-react'
import Sidebar, { type Page } from './components/Sidebar'
import ProfileCard from './components/ProfileCard'
import EventsList from './components/EventsList'
import Directory from './components/Directory'
import SettingsPage from './components/SettingsPage'
import { useGraphData } from './hooks/useGraphData'
import './App.css'

const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
}

function DashboardPage({ profile, events }: ReturnType<typeof useGraphData>) {
  return (
    <main className="ml-64 h-screen flex flex-col p-6 overflow-hidden">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        <ProfileCard
          profile={profile.data}
          loading={profile.loading}
          error={profile.error}
        />
        <EventsList
          events={events.data}
          loading={events.loading}
          error={events.error}
        />
      </div>
    </main>
  )
}

function AuthenticatedApp() {
  const { instance } = useMsal()
  const [page, setPage] = useState<Page>('dashboard')
  const graphData = useGraphData()
  const { profile, photo } = graphData

  const handleLogout = () => {
    instance.logoutPopup().catch(console.error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        displayName={profile.data?.displayName ?? null}
        email={profile.data?.mail ?? profile.data?.userPrincipalName ?? null}
        photoUrl={photo.data}
        currentPage={page}
        onNavigate={setPage}
        onSignOut={handleLogout}
      />
      {page === 'dashboard' && <DashboardPage {...graphData} />}
      {page === 'directory' && <Directory />}
      {page === 'settings' && <SettingsPage />}
    </div>
  )
}

function LoginScreen() {
  const { instance } = useMsal()

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Entra ID Insights</h1>
      <p className="text-muted-foreground max-w-md text-center">
        View your Microsoft 365 profile, directory information, and upcoming
        calendar events — all in one place.
      </p>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        Sign in with Microsoft
      </button>
    </div>
  )
}

function App() {
  const isAuthenticated = useIsAuthenticated()
  return isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />
}

export default App
