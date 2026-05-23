import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { doctorsApi, appointmentsApi } from '../api'
import { StatusBadge, Avatar, EmptyState, Spinner, ErrorAlert, StatCard } from '../components/ui'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// ── Doctor Dashboard ──────────────────────────────────────────
export function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentsApi.myAppointments()
      .then(r => setAppointments(r.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await appointmentsApi.update(id, { status })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (err) {
      alert(err.response?.data?.detail || 'Update failed')
    }
  }

  const pending = appointments.filter(a => a.status === 'pending')
  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appointment_date === today)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Doctor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total appointments" value={appointments.length} color="blue" />
        <StatCard label="Pending requests" value={pending.length} color="amber" />
        <StatCard label="Today's appointments" value={todayAppts.length} color="teal" />
      </div>

      {pending.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-lg mb-4">Pending requests</h2>
          <div className="space-y-3">
            {pending.map(appt => (
              <div key={appt.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar name={appt.patient?.full_name} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{appt.patient?.full_name}</p>
                    <p className="text-xs text-gray-500">{appt.appointment_date} at {appt.appointment_time}</p>
                    {appt.reason && <p className="text-xs text-gray-400">{appt.reason}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(appt.id, 'confirmed')}
                    className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Confirm
                  </button>
                  <button onClick={() => updateStatus(appt.id, 'cancelled')}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-lg mb-4">All appointments</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : appointments.length === 0 ? (
          <EmptyState icon="📋" title="No appointments yet" />
        ) : (
          <div className="space-y-3">
            {appointments.map(appt => (
              <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Avatar name={appt.patient?.full_name} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{appt.patient?.full_name}</p>
                    <p className="text-xs text-gray-500">{appt.patient?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="font-medium">{appt.appointment_date}</p>
                    <p className="text-gray-500 text-xs">{appt.appointment_time}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                  {appt.status === 'confirmed' && (
                    <button onClick={() => updateStatus(appt.id, 'completed')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                      Mark done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Doctor Profile ────────────────────────────────────────────
export function DoctorProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ specialization: '', qualification: '', experience_years: 0, bio: '', consultation_fee: 500 })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isNew, setIsNew] = useState(true)

  useEffect(() => {
    if (!user) return
    doctorsApi.list()
      .then(r => {
        const mine = r.data.find(d => d.user?.id === user.id)
        if (mine) {
          setIsNew(false)
          setForm({
            specialization: mine.specialization,
            qualification: mine.qualification,
            experience_years: mine.experience_years,
            bio: mine.bio || '',
            consultation_fee: mine.consultation_fee,
          })
        }
      })
      .catch(() => {})
  }, [user])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        experience_years: parseInt(form.experience_years),
        consultation_fee: parseInt(form.consultation_fee),
      }
      if (isNew) {
        await doctorsApi.createProfile(payload)
        setIsNew(false)
      } else {
        await doctorsApi.updateProfile(payload)
      }
      setSuccess('Profile saved successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{isNew ? 'Create' : 'Update'} Doctor Profile</h1>
      <div className="card">
        <ErrorAlert message={error} />
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm mb-4">
            {success}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4 mt-2">
          {[
            ['Specialization', 'specialization', 'text', 'e.g. Cardiologist'],
            ['Qualification', 'qualification', 'text', 'e.g. MBBS, MD'],
            ['Experience (years)', 'experience_years', 'number', '0'],
            ['Consultation fee (₹)', 'consultation_fee', 'number', '500'],
          ].map(([label, name, type, placeholder]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                name={name} type={type} value={form[name]} onChange={handle}
                className="input" placeholder={placeholder} required
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio" value={form.bio} onChange={handle}
              className="input resize-none" rows={3} placeholder="Brief professional bio..."
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : null}
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Doctor Schedule ───────────────────────────────────────────
export function DoctorSchedulePage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [form, setForm] = useState({ day_of_week: 'monday', start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    doctorsApi.list()
      .then(r => {
        const mine = r.data.find(d => d.user?.id === user.id)
        if (mine) setSchedules(mine.schedules || [])
      })
      .catch(() => {})
  }, [user])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const add = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await doctorsApi.addSchedule({
        ...form,
        slot_duration_minutes: parseInt(form.slot_duration_minutes),
      })
      setSchedules(prev => [...prev, data])
      setForm({ day_of_week: 'monday', start_time: '09:00', end_time: '17:00', slot_duration_minutes: 30 })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add schedule')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    try {
      await doctorsApi.deleteSchedule(id)
      setSchedules(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to remove')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Manage Schedule</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Add availability</h2>
        <ErrorAlert message={error} />
        <form onSubmit={add} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select name="day_of_week" value={form.day_of_week} onChange={handle} className="input">
                {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slot duration</label>
              <select name="slot_duration_minutes" value={form.slot_duration_minutes} onChange={handle} className="input">
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
              <input type="time" name="start_time" value={form.start_time} onChange={handle} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
              <input type="time" name="end_time" value={form.end_time} onChange={handle} className="input" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : null} Add schedule
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Current schedules</h2>
        {schedules.length === 0 ? (
          <EmptyState icon="📅" title="No schedules yet" message="Add your availability above" />
        ) : (
          <div className="space-y-2">
            {DAYS.filter(d => schedules.some(s => s.day_of_week === d)).flatMap(day =>
              schedules
                .filter(s => s.day_of_week === day)
                .map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <span className="font-medium text-sm capitalize">{s.day_of_week}</span>
                      <span className="text-gray-500 text-sm ml-3">{s.start_time} – {s.end_time}</span>
                      <span className="text-gray-400 text-xs ml-2">({s.slot_duration_minutes} min slots)</span>
                    </div>
                    <button onClick={() => remove(s.id)} className="text-red-400 hover:text-red-600 text-xs">
                      Remove
                    </button>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
