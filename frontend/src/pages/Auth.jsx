import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ErrorAlert, Spinner } from '../components/ui'

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form.email, form.password)
      navigate(`/${user.role === 'admin' ? 'admin' : user.role === 'doctor' ? 'doctor' : 'patient'}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  // Quick-fill demo credentials
  const demoLogin = (role) => {
    const creds = {
      admin: { email: 'admin@hospital.com', password: 'admin123' },
      doctor: { email: 'drrao@hospital.com', password: 'doctor123' },
      patient: { email: 'patient1@example.com', password: 'patient123' },
    }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to MediBook</p>
        </div>

        <div className="card">
          <ErrorAlert message={error} />

          <form onSubmit={submit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2"></p>
            <div className="flex gap-2 justify-center">
              {['patient', 'doctor', 'admin'].map(role => (
                <button key={role} onClick={() => demoLogin(role)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 capitalize transition-colors">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', phone: '', role: 'patient' })
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await register(form)
      navigate(`/${user.role === 'admin' ? 'admin' : user.role === 'doctor' ? 'doctor' : 'patient'}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-2">Join MediBook today</p>
        </div>

        <div className="card">
          <ErrorAlert message={error} />
          <form onSubmit={submit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input name="full_name" value={form.full_name} onChange={handle}
                className="input" placeholder="Dr. / Mr. / Ms." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                className="input" placeholder="Min 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handle}
                className="input" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
              <select name="role" value={form.role} onChange={handle} className="input">
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
