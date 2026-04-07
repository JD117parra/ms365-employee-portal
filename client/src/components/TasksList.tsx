import { CheckSquare, Loader2, ClipboardList, AlertTriangle, LayoutGrid, ListTodo } from 'lucide-react'
import type { TodoTask } from '../hooks/useGraphData'

interface TasksListProps {
  tasks: TodoTask[] | null
  loading: boolean
  error: string | null
}

function formatDueDate(dueDateTime: { dateTime: string; timeZone: string }): string {
  const date = new Date(dueDateTime.dateTime)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const taskDate = new Date(date)
  taskDate.setHours(0, 0, 0, 0)

  if (taskDate.getTime() === today.getTime()) return 'Today'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
  if (taskDate < today) return 'Overdue'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function ImportanceBadge({ importance }: { importance: string }) {
  if (importance === 'high') {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-red-500 font-medium">
        <AlertTriangle className="w-3 h-3" />
        High
      </span>
    )
  }
  return null
}

function SourceBadge({ source }: { source: 'todo' | 'planner' }) {
  if (source === 'planner') {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
        <LayoutGrid className="w-3 h-3" />
        Planner
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
      <ListTodo className="w-3 h-3" />
      To Do
    </span>
  )
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percent}%</span>
    </div>
  )
}

export default function TasksList({ tasks, loading, error }: TasksListProps) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-6 flex flex-col overflow-hidden">
      <h2 className="text-base font-semibold mb-4 shrink-0">My Tasks</h2>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive py-4">{error}</p>
      )}

      {!loading && !error && tasks && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ClipboardList className="w-8 h-8 mb-2" />
          <p className="text-sm">No pending tasks</p>
        </div>
      )}

      {!loading && !error && tasks && tasks.length > 0 && (
        <ul className="divide-y divide-border overflow-y-auto flex-1 min-h-0">
          {tasks.map((task) => (
            <li key={task.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <CheckSquare className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <SourceBadge source={task.source} />
                    {task.dueDateTime && (
                      <span className={`text-xs ${
                        formatDueDate(task.dueDateTime) === 'Overdue'
                          ? 'text-red-500 font-medium'
                          : 'text-muted-foreground'
                      }`}>
                        {formatDueDate(task.dueDateTime)}
                      </span>
                    )}
                    <ImportanceBadge importance={task.importance} />
                    {task.listName && (
                      <span className="text-xs text-muted-foreground">
                        {task.listName}
                      </span>
                    )}
                  </div>
                  {task.source === 'planner' && task.percentComplete != null && task.percentComplete > 0 && (
                    <ProgressBar percent={task.percentComplete} />
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
