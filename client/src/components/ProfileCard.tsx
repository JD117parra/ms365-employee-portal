import { User, Briefcase, Building2, MapPin, Phone, Loader2 } from 'lucide-react'
import type { UserProfile } from '../hooks/useGraphData'

interface ProfileCardProps {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

function Field({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) {
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

export default function ProfileCard({ profile, loading, error }: ProfileCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-6">
      <h2 className="text-base font-semibold mb-4">Profile</h2>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive py-4">{error}</p>
      )}

      {!loading && !error && profile && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field icon={User} label="Display Name" value={profile.displayName} />
          <Field icon={Briefcase} label="Job Title" value={profile.jobTitle} />
          <Field icon={Building2} label="Department" value={profile.department} />
          <Field icon={MapPin} label="Office Location" value={profile.officeLocation} />
          <Field icon={Phone} label="Phone" value={profile.mobilePhone} />
        </div>
      )}
    </div>
  )
}
