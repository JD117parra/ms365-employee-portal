import { Calendar, Loader2, CalendarX } from 'lucide-react'
import type { CalendarEvent } from '../hooks/useGraphData'

interface EventsListProps {
  events: CalendarEvent[] | null
  loading: boolean
  error: string | null
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateTime: string): string {
  const date = new Date(dateTime)
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function EventsList({ events, loading, error }: EventsListProps) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-6">
      <h2 className="text-base font-semibold mb-4">Upcoming Events</h2>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive py-4">{error}</p>
      )}

      {!loading && !error && events && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <CalendarX className="w-8 h-8 mb-2" />
          <p className="text-sm">No upcoming events</p>
        </div>
      )}

      {!loading && !error && events && events.length > 0 && (
        <ul className="divide-y divide-border">
          {events.slice(0, 10).map((event) => (
            <li key={event.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{event.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(event.start.dateTime)} · {formatTime(event.start.dateTime)} – {formatTime(event.end.dateTime)}
                  </p>
                  {event.location?.displayName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📍 {event.location.displayName}
                    </p>
                  )}
                  {event.organizer?.emailAddress?.name && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Organized by {event.organizer.emailAddress.name}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
