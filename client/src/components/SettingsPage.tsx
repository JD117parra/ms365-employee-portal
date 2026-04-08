import { useMsal } from '@azure/msal-react'
import { Monitor, User, Info } from 'lucide-react'

export default function SettingsPage() {
  const { accounts } = useMsal()
  const account = accounts.length > 0 ? accounts[0] : null

  return (
    <div className="h-screen flex flex-col ml-64 p-6 overflow-hidden">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Settings</h1>

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Session info */}
        <div className="rounded-lg border border-border bg-card text-card-foreground p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Session</h2>
          </div>
          <div className="space-y-4">
            <Field label="Account" value={account?.username ?? '—'} />
            <Field label="Name" value={account?.name ?? '—'} />
            <Field label="Tenant ID" value={account?.tenantId ?? '—'} />
          </div>
        </div>

        {/* About */}
        <div className="rounded-lg border border-border bg-card text-card-foreground p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">About</h2>
          </div>
          <div className="space-y-4">
            <Field label="Application" value="Entra ID Insights" />
            <Field label="Version" value="0.1.0" />
            <div className="flex items-start gap-3">
              <Monitor className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Theme</p>
                <p className="text-sm font-medium">Use the toggle in the sidebar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  )
}
