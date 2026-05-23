import { useState, useEffect } from 'react'
import { adminApi } from '../api'
import { StatusBadge, RoleBadge, Avatar, EmptyState, Spinner, StatCard } from '../components/ui'

export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.appointments(),
    ]).then(([s, a]) => {
      setStats(s.data)
      setAppointments(a.data.slice(0, 10))
    }).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    await adminApi.updateAppointment(id, { status })
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-8">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total users" value={stats.total_users} color="blue" />
          <StatCard label="Doctors" value={stats.total_doctors} color="teal" />
          <StatCard label="Patients" value={stats.total_patients} color="purple" />
          <StatCard label="Total appointments" value={stats.total_appointments} color="amber" />
          <StatCard label="Pending" value={stats.pending_appointments} color="red" />
          <StatCard label="Confirmed" value={stats.confirmed_appointments} color="green" />
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Recent appointments</h2>
        <div className="space-y-3">
          {appointments.map(appt => (
            <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Avatar name={appt.patient?.full_name} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{appt.patient?.full_name}</p>
                    <p className="text-xs text-gray-500">→ {appt.doctor?.user?.full_name} ({appt.doctor?.specialization})</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">{appt.appointment_date} {appt.appointment_time}</span>
                <StatusBadge status={appt.status} />
                {appt.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => updateStatus(appt.id, 'confirmed')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">Confirm</button>
                    <button onClick={() => updateStatus(appt.id, 'cancelled')}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.users().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const toggle = async (id) => {
    const { data } = await adminApi.toggleUser(id)
    setUsers(prev => prev.map(u => u.id === id ? data : u))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Users ({users.length})</h1>
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card">
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={user.full_name} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={user.role} />
                  <span className={`badge ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => toggle(user.id)}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      user.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}>
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    adminApi.appointments().then(r => setAppointments(r.data)).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    await adminApi.updateAppointment(id, { status })
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">All Appointments</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              filter === s ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No appointments" />
      ) : (
        <div className="card">
          <div className="space-y-3">
            {filtered.map(appt => (
              <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar name={appt.patient?.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{appt.patient?.full_name}</p>
                      <p className="text-xs text-gray-400">patient</p>
                    </div>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div className="flex items-center gap-2">
                    <Avatar name={appt.doctor?.user?.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{appt.doctor?.user?.full_name}</p>
                      <p className="text-xs text-primary-600">{appt.doctor?.specialization}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="text-right">
                    <p className="font-medium">{appt.appointment_date}</p>
                    <p className="text-xs text-gray-500">{appt.appointment_time}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                  {appt.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(appt.id, 'confirmed')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg">✓</button>
                      <button onClick={() => updateStatus(appt.id, 'cancelled')}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg">✗</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
