import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export type Page = 'dashboard' | 'directory' | 'settings'

interface SidebarProps {
  displayName: string | null
  email: string | null
  photoUrl: string | null
  currentPage: Page
  onNavigate: (page: Page) => void
  onSignOut: () => void
}

function getInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const navItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'directory', label: 'Directory', icon: FolderOpen },
  { page: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ displayName, email, photoUrl, currentPage, onNavigate, onSignOut }: SidebarProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col border-r border-border bg-card text-card-foreground">
      {/* App name */}
      <div className="px-6 py-5">
        <h1 className="text-lg font-semibold tracking-tight">Entra ID Insights</h1>
      </div>

      {/* User info */}
      <div className="px-6 pb-5 flex items-center gap-3">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            {displayName?.[0] ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{displayName ?? '—'}</p>
          <p className="text-xs text-muted-foreground truncate">{email ?? '—'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition-colors ${
              currentPage === page
                ? 'font-medium bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 pb-4 flex flex-col gap-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
