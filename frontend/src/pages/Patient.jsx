import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { appointmentsApi, doctorsApi } from '../api'
import { StatusBadge, Avatar, EmptyState, Spinner, ErrorAlert, StatCard } from '../components/ui'

// ── Patient Dashboard ─────────────────────────────────────────
export function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    appointmentsApi.myAppointments()
      .then(r => setAppointments(r.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const past = appointments.filter(a => ['cancelled', 'completed'].includes(a.status))

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentsApi.cancel(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Good day, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your health appointments</p>
        </div>
        <Link to="/doctors" className="btn-primary">Book appointment</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total appointments" value={appointments.length} color="blue" />
        <StatCard label="Upcoming" value={upcoming.length} color="green" />
        <StatCard label="Past" value={past.length} color="purple" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Upcoming appointments</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : upcoming.length === 0 ? (
          <EmptyState icon="📅" title="No upcoming appointments" message="Book a doctor visit to get started" />
        ) : (
          <div className="space-y-3">
            {upcoming.map(appt => (
              <AppointmentRow key={appt.id} appt={appt} onCancel={() => cancel(appt.id)} showDoctor />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="card mt-4">
          <h2 className="font-semibold text-lg mb-4">Past appointments</h2>
          <div className="space-y-3">
            {past.map(appt => (
              <AppointmentRow key={appt.id} appt={appt} showDoctor />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Appointment Row ───────────────────────────────────────────
function AppointmentRow({ appt, onCancel, showDoctor }) {
  const name = showDoctor ? appt.doctor?.user?.full_name : appt.patient?.full_name
  const sub = showDoctor ? appt.doctor?.specialization : appt.patient?.email
  const canCancel = ['pending', 'confirmed'].includes(appt.status) && onCancel

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-gray-500">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-right">
          <p className="font-medium">{appt.appointment_date}</p>
          <p className="text-gray-500 text-xs">{appt.appointment_time}</p>
        </div>
        <StatusBadge status={appt.status} />
        {canCancel && (
          <button onClick={onCancel} className="text-red-400 hover:text-red-600 text-xs transition-colors">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ── Find Doctors ──────────────────────────────────────────────
export function FindDoctors() {
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      doctorsApi.list(search)
        .then(r => setDoctors(r.data))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-2">Find a Doctor</h1>
      <p className="text-gray-500 text-sm mb-6">Browse available specialists and book an appointment</p>

      <input
        className="input max-w-md mb-6"
        placeholder="Search by specialization (e.g. Cardiologist)..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : doctors.length === 0 ? (
        <EmptyState icon="🔍" title="No doctors found" message="Try a different search term" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  )
}

function DoctorCard({ doctor }) {
  const navigate = useNavigate()
  const days = [...new Set(doctor.schedules?.map(s => s.day_of_week.slice(0, 3)) || [])]

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar name={doctor.user?.full_name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{doctor.user?.full_name}</h3>
          <p className="text-primary-600 text-sm font-medium">{doctor.specialization}</p>
          <p className="text-gray-500 text-xs mt-0.5">{doctor.qualification}</p>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-gray-600">⏱ {doctor.experience_years} yrs exp</span>
            <span className="text-green-600 font-medium">₹{doctor.consultation_fee}</span>
          </div>
          {days.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {days.map(d => (
                <span key={d} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded capitalize">{d}</span>
              ))}
            </div>
          )}
          {doctor.bio && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.bio}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => navigate(`/book/${doctor.id}`)}
        className="btn-primary w-full mt-4 text-sm"
      >
        Book appointment
      </button>
    </div>
  )
}

// ── Book Appointment ──────────────────────────────────────────
export function BookAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    doctorsApi.get(id)
      .then(r => setDoctor(r.data))
      .catch(() => setError('Failed to load doctor info'))
  }, [id])

  useEffect(() => {
    if (!date) return
    setSlotsLoading(true)
    setSelectedSlot('')
    doctorsApi.getSlots(id, date)
      .then(r => setSlots(r.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [date, id])

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedSlot) return setError('Please select a time slot')
    setError('')
    setLoading(true)
    try {
      await appointmentsApi.book({
        doctor_id: parseInt(id),
        appointment_date: date,
        appointment_time: selectedSlot,
        reason,
      })
      navigate('/patient')
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  if (!doctor) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1">
        ← Back
      </button>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={doctor.user?.full_name} size="lg" />
          <div>
            <h2 className="font-semibold text-xl">{doctor.user?.full_name}</h2>
            <p className="text-primary-600">{doctor.specialization}</p>
            <p className="text-gray-500 text-sm">{doctor.qualification} · {doctor.experience_years} yrs experience</p>
            <p className="text-green-600 font-medium mt-1">₹{doctor.consultation_fee} consultation fee</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-lg mb-4">Book appointment</h2>
        <ErrorAlert message={error} />

        <form onSubmit={submit} className="space-y-5 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select date</label>
            <input
              type="date" className="input" min={today} value={date}
              onChange={e => setDate(e.target.value)} required
            />
          </div>

          {date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available time slots</label>
              {slotsLoading ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : slots.length === 0 ? (
                <p className="text-gray-400 text-sm py-2">No slots available for this date. Try another day.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      type="button" key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSlot === slot
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for visit (optional)</label>
            <textarea
              className="input resize-none" rows={3} value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Brief description of your concern..."
            />
          </div>

          <button
            type="submit" disabled={loading || !selectedSlot}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : null}
            {loading ? 'Booking...' : selectedSlot ? `Confirm at ${selectedSlot}` : 'Select a slot first'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── My Appointments ───────────────────────────────────────────
export function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    appointmentsApi.myAppointments()
      .then(r => setAppointments(r.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentsApi.cancel(id)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel')
    }
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">My Appointments</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === s ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No appointments found" message="Try a different filter or book a visit" />
      ) : (
        <div className="space-y-3">
          {filtered.map(appt => (
            <div key={appt.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={appt.doctor?.user?.full_name} />
                  <div>
                    <p className="font-medium">{appt.doctor?.user?.full_name}</p>
                    <p className="text-sm text-primary-600">{appt.doctor?.specialization}</p>
                    {appt.reason && <p className="text-xs text-gray-500 mt-0.5">{appt.reason}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{appt.appointment_date} at {appt.appointment_time}</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <StatusBadge status={appt.status} />
                    {['pending', 'confirmed'].includes(appt.status) && (
                      <button onClick={() => cancel(appt.id)} className="text-xs text-red-400 hover:text-red-600">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {appt.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                  <span className="font-medium">Doctor notes:</span> {appt.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
