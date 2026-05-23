import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import { Component } from 'react'

import { LoginPage, RegisterPage } from './pages/Auth'
import { PatientDashboard, FindDoctors, BookAppointment, MyAppointments } from './pages/Patient'
import { DoctorDashboard, DoctorProfilePage, DoctorSchedulePage } from './pages/Doctor'
import { AdminDashboard, AdminUsers, AdminAppointments } from './pages/Admin'

// ── Error Boundary ────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="max-w-lg mx-auto mt-20 p-8 bg-red-50 rounded-2xl border border-red-200">
          <h2 className="text-red-700 font-semibold text-lg mb-2">Something went wrong</h2>
          <pre className="text-red-600 text-xs whitespace-pre-wrap">{this.state.error.message}</pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/login' }}
            className="mt-4 btn-primary"
          >
            Go back to login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Protected Route ───────────────────────────────────────────
function Protected({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

// ── Home redirect ─────────────────────────────────────────────
function Home() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />
  return <Navigate to="/patient" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Patient routes */}
                <Route path="/patient" element={<Protected roles={['patient']}><PatientDashboard /></Protected>} />
                <Route path="/doctors" element={<Protected roles={['patient']}><FindDoctors /></Protected>} />
                <Route path="/book/:id" element={<Protected roles={['patient']}><BookAppointment /></Protected>} />
                <Route path="/my-appointments" element={<Protected roles={['patient']}><MyAppointments /></Protected>} />

                {/* Doctor routes */}
                <Route path="/doctor" element={<Protected roles={['doctor']}><DoctorDashboard /></Protected>} />
                <Route path="/doctor/profile" element={<Protected roles={['doctor']}><DoctorProfilePage /></Protected>} />
                <Route path="/doctor/schedule" element={<Protected roles={['doctor']}><DoctorSchedulePage /></Protected>} />

                {/* Admin routes */}
                <Route path="/admin" element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
                <Route path="/admin/users" element={<Protected roles={['admin']}><AdminUsers /></Protected>} />
                <Route path="/admin/appointments" element={<Protected roles={['admin']}><AdminAppointments /></Protected>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
