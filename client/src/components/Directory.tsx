import { useState, useEffect, useCallback } from 'react'
import { useMsal } from '@azure/msal-react'
import { Search, Loader2, Users, Building2, Mail, X } from 'lucide-react'
import { MSAL_SCOPES } from '../lib/constants'

interface DirectoryUser {
  id: string
  displayName: string | null
  jobTitle: string | null
  department: string | null
  mail: string | null
  userPrincipalName: string | null
}

interface UserDetail extends DirectoryUser {
  officeLocation: string | null
  mobilePhone: string | null
}

export default function Directory() {
  const { instance, accounts } = useMsal()
  const [users, setUsers] = useState<DirectoryUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const getToken = useCallback(async () => {
    if (accounts.length === 0) return null
    try {
      const response = await instance.acquireTokenSilent({
        scopes: MSAL_SCOPES.API,
        account: accounts[0],
      })
      return response.accessToken
    } catch {
      return null
    }
  }, [instance, accounts])

  const fetchUsers = useCallback(async (query?: string) => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('No token')
      const url = query
        ? `/api/graph/users?search=${encodeURIComponent(query)}`
        : '/api/graph/users'
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setUsers(data.value ?? [])
    } catch {
      setError('Failed to load directory')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(search || undefined)
  }

  const handleClearSearch = () => {
    setSearch('')
    fetchUsers()
  }

  const handleSelectUser = async (userId: string) => {
    setDetailLoading(true)
    setSelectedUser(null)
    setSelectedPhoto(null)
    try {
      const token = await getToken()
      if (!token) return
      const [profileRes, photoRes] = await Promise.all([
        fetch(`/api/graph/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/graph/users/${userId}/photo`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (profileRes.ok) {
        setSelectedUser(await profileRes.json())
      }
      if (photoRes.ok) {
        const photoData = await photoRes.json()
        setSelectedPhoto(photoData.photo)
      }
    } catch {
      // silently fail detail load
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col ml-64 p-6 overflow-hidden">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Directory</h1>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* User list */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-9 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>

          {/* List */}
          <div className="rounded-lg border border-border bg-card text-card-foreground flex-1 overflow-y-auto min-h-0">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive p-4">{error}</p>
            )}

            {!loading && !error && users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-sm">No users found</p>
              </div>
            )}

            {!loading && !error && users.length > 0 && (
              <ul className="divide-y divide-border">
                {users.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors ${
                      selectedUser?.id === user.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                      {user.displayName?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{user.displayName ?? '—'}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.jobTitle ?? user.mail ?? user.userPrincipalName ?? '—'}
                      </p>
                    </div>
                    {user.department && (
                      <span className="text-xs text-muted-foreground hidden lg:block">{user.department}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* User detail panel */}
        <div className="w-80 shrink-0 rounded-lg border border-border bg-card text-card-foreground p-6 overflow-y-auto">
          {!selectedUser && !detailLoading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-sm text-center">Select a user to view their profile</p>
            </div>
          )}

          {detailLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {selectedUser && !detailLoading && (
            <div className="flex flex-col items-center">
              {selectedPhoto ? (
                <img src={selectedPhoto} alt="Avatar" className="w-20 h-20 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-medium text-muted-foreground mb-4">
                  {selectedUser.displayName?.[0] ?? '?'}
                </div>
              )}
              <h2 className="text-lg font-semibold text-center">{selectedUser.displayName ?? '—'}</h2>
              <p className="text-sm text-muted-foreground mb-6">{selectedUser.jobTitle ?? '—'}</p>

              <div className="w-full space-y-4">
                <DetailField icon={Building2} label="Department" value={selectedUser.department} />
                <DetailField icon={Building2} label="Office" value={selectedUser.officeLocation} />
                <DetailField icon={Mail} label="Email" value={selectedUser.mail ?? selectedUser.userPrincipalName} />
                <DetailField icon={Users} label="Phone" value={selectedUser.mobilePhone} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailField({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? '—'}</p>
      </div>
    </div>
  )
}
