import { useState, useEffect, useCallback, useRef } from 'react'
import { useMsal } from '@azure/msal-react'
import { MSAL_SCOPES } from '../lib/constants'

export interface UserProfile {
  displayName: string | null
  jobTitle: string | null
  department: string | null
  officeLocation: string | null
  mobilePhone: string | null
  mail: string | null
  userPrincipalName: string | null
}

export interface CalendarEvent {
  id: string
  subject: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  location?: { displayName?: string }
  organizer?: { emailAddress?: { name?: string } }
}

export interface TodoTask {
  id: string
  title: string
  status: string
  importance: string
  dueDateTime?: { dateTime: string; timeZone: string }
  createdDateTime: string
  source: 'todo' | 'planner'
  listName?: string
  percentComplete?: number
}

interface GraphDataState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useGraphData() {
  const { instance, accounts } = useMsal()

  const [profile, setProfile] = useState<GraphDataState<UserProfile>>({
    data: null,
    loading: true,
    error: null,
  })
  const [photo, setPhoto] = useState<GraphDataState<string>>({
    data: null,
    loading: true,
    error: null,
  })
  const [events, setEvents] = useState<GraphDataState<CalendarEvent[]>>({
    data: null,
    loading: true,
    error: null,
  })
  const [tasks, setTasks] = useState<GraphDataState<TodoTask[]>>({
    data: null,
    loading: true,
    error: null,
  })

  // Store the account in a ref so getToken never changes reference,
  // avoiding infinite re-fetches when useMsal returns a new accounts array.
  const accountRef = useRef(accounts[0])
  useEffect(() => { accountRef.current = accounts[0] }, [accounts])

  const getToken = useCallback(async () => {
    const account = accountRef.current
    if (!account) return null
    try {
      const response = await instance.acquireTokenSilent({
        scopes: MSAL_SCOPES.API,
        account,
      })
      return response.accessToken
    } catch {
      return null
    }
  }, [instance])

  // Use a stable primitive (homeAccountId) as the effect trigger
  // so data is fetched once after login, not on every render.
  const accountId = accounts[0]?.homeAccountId ?? null

  useEffect(() => {
    if (!accountId) return

    const fetchProfile = async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('No token')
        const res = await fetch('/api/graph/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        setProfile({ data, loading: false, error: null })
      } catch (err) {
        setProfile({ data: null, loading: false, error: 'Failed to load profile' })
      }
    }

    const fetchPhoto = async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('No token')
        const res = await fetch('/api/graph/me/photo', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        setPhoto({ data: data.photo, loading: false, error: null })
      } catch {
        setPhoto({ data: null, loading: false, error: 'No photo available' })
      }
    }

    const fetchEvents = async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('No token')
        const res = await fetch('/api/graph/me/events', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        setEvents({ data: data.value ?? data, loading: false, error: null })
      } catch {
        setEvents({ data: null, loading: false, error: 'Failed to load events' })
      }
    }

    const fetchTasks = async () => {
      try {
        const token = await getToken()
        if (!token) throw new Error('No token')
        const res = await fetch('/api/graph/me/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`${res.status}`)
        const data = await res.json()
        setTasks({ data: data.value ?? data, loading: false, error: null })
      } catch {
        setTasks({ data: null, loading: false, error: 'Failed to load tasks' })
      }
    }

    fetchProfile()
    fetchPhoto()
    fetchEvents()
    fetchTasks()
  }, [accountId, getToken])

  return { profile, photo, events, tasks }
}
