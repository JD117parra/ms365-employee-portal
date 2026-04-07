import { useState, useEffect, useCallback } from 'react'
import { useMsal } from '@azure/msal-react'

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

  const getToken = useCallback(async () => {
    if (accounts.length === 0) return null
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: accounts[0],
      })
      return response.accessToken
    } catch {
      return null
    }
  }, [instance, accounts])

  useEffect(() => {
    if (accounts.length === 0) return

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
        const blob = await res.blob()
        setPhoto({ data: URL.createObjectURL(blob), loading: false, error: null })
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

    fetchProfile()
    fetchPhoto()
    fetchEvents()
  }, [accounts, getToken])

  return { profile, photo, events }
}
