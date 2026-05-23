// ── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'
  return (
    <div className={`${s} animate-spin rounded-full border-2 border-primary-500 border-t-transparent`} />
  )
}

// ── Status Badge ─────────────────────────────────────────────
const statusColors = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
}
export function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

// ── Role Badge ────────────────────────────────────────────────
const roleColors = {
  patient: 'bg-purple-100 text-purple-700',
  doctor:  'bg-teal-100 text-teal-700',
  admin:   'bg-orange-100 text-orange-700',
}
export function RoleBadge({ role }) {
  return (
    <span className={`badge ${roleColors[role] || 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const s = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-xl' : 'h-10 w-10 text-sm'
  return (
    <div className={`${s} rounded-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon = '📋', title, message }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {message && <p className="text-gray-500 mt-1 text-sm">{message}</p>}
    </div>
  )
}

// ── Error Alert ───────────────────────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
      {message}
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    teal:   'bg-teal-50 text-teal-600',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1 font-display">{value}</p>
    </div>
  )
}
